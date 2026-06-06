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

    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    const network = VTPassService.detectNetwork(cleanedPhone);
    if (!network) {
      return NextResponse.json(
        { success: false, message: 'Could not detect network from phone number. Please enter a valid Nigerian phone number.' },
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

    const batch = productCode.batchId
      ? await Batch.findOne({ batchId: productCode.batchId }).lean()
      : null;

    const rewardAmount = batch && (batch as any).rewardConfig?.enabled
      ? ((batch as any).rewardConfig?.amount || DEFAULT_REWARD_AMOUNT)
      : DEFAULT_REWARD_AMOUNT;

    const requestId = VTPassService.generateRequestId();
    const rewardId = `REW-${qrCodeId}-${Date.now()}`;

    // Atomic insert using the partial unique index on qrCodeId (non-failed only).
    // Only one concurrent request will succeed — the rest hit duplicate key (11000).
    // Failed rewards are excluded from the index so retries are allowed.
    let reward;
    try {
      reward = await Reward.create({
        rewardId,
        productCodeId: productCode._id,
        qrCodeId,
        phoneNumber: cleanedPhone,
        network,
        amount: rewardAmount,
        status: 'processing',
        vtpassRequestId: requestId,
        grantedAt: new Date(),
      });
    } catch (err: any) {
      if (err.code === 11000) {
        const existing = await Reward.findOne({ qrCodeId, status: { $ne: 'failed' } }).lean();
        if (existing) {
          return NextResponse.json({
            success: existing.status === 'delivered',
            alreadyClaimed: true,
            status: existing.status,
            message: existing.status === 'delivered'
              ? 'A reward has already been claimed for this product'
              : 'A reward claim is currently being processed for this product',
          });
        }
      }
      throw err;
    }

    const vtpass = VTPassService.getInstance();
    const result = await vtpass.purchaseAirtime({
      phone: cleanedPhone,
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
        ? `${rewardAmount} Naira airtime reward sent successfully`
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
