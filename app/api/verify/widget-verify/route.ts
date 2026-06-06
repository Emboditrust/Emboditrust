import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function POST(request: NextRequest) {
  try {
    const { qrCodeId, scratchCode } = await request.json();

    if (!qrCodeId || !scratchCode) {
      return NextResponse.json(
        { success: false, error: 'qrCodeId and scratchCode are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const productCode = await ProductCode.findOne({ qrCodeId }).lean();
    if (!productCode) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const sanitizedInput = scratchCode.trim().toUpperCase().replace(/\s/g, '');
    const isMatch = sanitizedInput === (productCode as any).scratchCode.toUpperCase();

    if (!isMatch) {
      try {
        await VerificationAttempt.create({
          timestamp: new Date(),
          scannedCode: qrCodeId,
          scratchCode: sanitizedInput,
          result: 'invalid',
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
          userAgent: request.headers.get('user-agent') || 'widget',
        });
      } catch {}
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'Scratch code does not match',
      });
    }

    const updated = await ProductCode.findOneAndUpdate(
      { qrCodeId },
      {
        $inc: { verificationCount: 1 },
        $set: { lastVerifiedAt: new Date(), status: 'verified' },
        $setOnInsert: { firstVerifiedAt: new Date() },
      },
      { new: true }
    );

    try {
      await VerificationAttempt.create({
        timestamp: new Date(),
        scannedCode: qrCodeId,
        scratchCode: 'verified',
        result: 'valid',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        userAgent: request.headers.get('user-agent') || 'widget',
      });
    } catch {}

    return NextResponse.json({
      success: true,
      verified: true,
      isFirstVerification: (updated as any).verificationCount === 1,
      verificationCount: (updated as any).verificationCount,
    });
  } catch (error) {
    console.error('Widget verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
