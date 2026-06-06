import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import Reward from '@/models/Reward';
import { VTPassService } from '@/lib/services/vtpass.service';

const DEFAULT_REWARD_AMOUNT = 50;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { qrCodeId, phoneNumber } = await request.json();

    if (!qrCodeId || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'qrCodeId and phoneNumber are required' },
        { status: 400 }
      );
    }

    const productCode = await ProductCode.findOne({ qrCodeId }).lean();

    if (!productCode) {
      return NextResponse.json(
        { success: false, message: 'Product code not found' },
        { status: 404 }
      );
    }

    if (productCode.status !== 'verified') {
      return NextResponse.json(
        { success: false, message: 'Product must be verified before claiming a reward' },
        { status: 400 }
      );
    }

    const existingReward = await Reward.findOne({ qrCodeId, status: { $in: ['pending', 'processing', 'delivered'] } }).lean();

    if (existingReward) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        status: existingReward.status,
        message: existingReward.status === 'delivered'
          ? 'Reward already claimed and delivered'
          : 'Reward claim is already being processed',
      });
    }

    const network = VTPassService.detectNetwork(phoneNumber);
    if (!network) {
      return NextResponse.json(
        { success: false, message: 'Could not detect network from phone number. Please enter a valid Nigerian phone number.' },
        { status: 400 }
      );
    }

    const batch = productCode.batchId
      ? await Batch.findOne({ batchId: productCode.batchId }).lean()
      : null;

    const rewardAmount = batch && (batch as any).rewardConfig?.enabled
      ? ((batch as any).rewardConfig?.amount || DEFAULT_REWARD_AMOUNT)
      : DEFAULT_REWARD_AMOUNT;

    const requestId = VTPassService.generateRequestId();

    const reward = await Reward.create({
      rewardId: `REW-${qrCodeId}-${Date.now()}`,
      productCodeId: productCode._id,
      qrCodeId,
      phoneNumber,
      network,
      amount: rewardAmount,
      status: 'processing',
      vtpassRequestId: requestId,
      grantedAt: new Date(),
    });

    const vtpass = VTPassService.getInstance();
    const result = await vtpass.purchaseAirtime({
      phone: phoneNumber,
      amount: rewardAmount,
      network,
      requestId,
    });

    if (result.success) {
      reward.status = 'delivered';
      reward.vtpassTransactionId = result.transactionId;
      reward.vtpassResponse = result.rawResponse;
      reward.deliveredAt = new Date();
    } else {
      reward.status = 'failed';
      reward.errorMessage = result.error;
      reward.vtpassResponse = result.rawResponse;
    }

    await reward.save();

    return NextResponse.json({
      success: result.success,
      alreadyClaimed: false,
      status: reward.status,
      amount: rewardAmount,
      network,
      transactionId: result.transactionId,
      vtpassRequestId: requestId,
      message: result.success
        ? `₦${rewardAmount} airtime reward sent successfully!`
        : `Reward delivery failed: ${result.error}`,
    });

  } catch (error: any) {
    console.error('Reward claim error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process reward claim',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
