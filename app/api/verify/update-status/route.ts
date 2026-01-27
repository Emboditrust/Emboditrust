import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { qrCodeId } = await request.json();

    if (!qrCodeId) {
      return NextResponse.json(
        { success: false, message: 'QR Code ID is required' },
        { status: 400 }
      );
    }

    // 🔐 Server owns truth
    const productCode = await ProductCode.findOneAndUpdate(
      { qrCodeId },
      {
        $inc: { verificationCount: 1 },
        $set: {
          lastVerifiedAt: new Date(),
          status: 'verified'
        },
        $setOnInsert: {
          firstVerifiedAt: new Date()
        }
      },
      { new: true }
    );

    if (!productCode) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const isFirstVerification = productCode.verificationCount === 1;

    return NextResponse.json({
      success: true,
      isFirstVerification,
      verificationCount: productCode.verificationCount,
      status: isFirstVerification ? 'valid' : 'already_used'
    });

  } catch (error: any) {
    console.error('Verification update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Verification failed',
        error: error.message
      },
      { status: 500 }
    );
  }
}
