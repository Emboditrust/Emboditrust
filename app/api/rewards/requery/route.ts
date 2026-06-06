import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reward from '@/models/Reward';
import { VTPassService } from '@/lib/services/vtpass.service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { rewardId, vtpassRequestId } = await request.json();

    if (!rewardId && !vtpassRequestId) {
      return NextResponse.json(
        { success: false, message: 'rewardId or vtpassRequestId is required' },
        { status: 400 }
      );
    }

    let reward;
    if (rewardId) {
      reward = await Reward.findOne({ rewardId }).lean();
    } else {
      reward = await Reward.findOne({ vtpassRequestId }).lean();
    }

    if (!reward) {
      return NextResponse.json(
        { success: false, message: 'Reward record not found' },
        { status: 404 }
      );
    }

    if (!reward.vtpassRequestId) {
      return NextResponse.json({
        success: false,
        message: 'No VTPass request ID associated with this reward',
        currentStatus: reward.status,
      });
    }

    const vtpass = VTPassService.getInstance();
    const result = await vtpass.requery(reward.vtpassRequestId);

    if (result.success && reward.status !== 'delivered') {
      await Reward.updateOne(
        { _id: reward._id },
        {
          $set: {
            status: 'delivered',
            vtpassTransactionId: result.transactionId,
            vtpassResponse: result.rawResponse,
            deliveredAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      success: result.success,
      vtpassStatus: result.status,
      previousStatus: reward.status,
      updatedStatus: result.success ? 'delivered' : reward.status,
      transactionId: result.transactionId || reward.vtpassTransactionId,
      amount: reward.amount,
      network: reward.network,
      phoneNumber: reward.phoneNumber,
    });

  } catch (error: any) {
    console.error('Reward requery error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to requery reward transaction',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
