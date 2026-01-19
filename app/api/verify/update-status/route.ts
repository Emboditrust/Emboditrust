// app/api/verify/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { qrCodeId, status, verificationCount, isFirstVerification } = body;
    
    if (!qrCodeId) {
      return NextResponse.json(
        { success: false, message: 'QR Code ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {
      lastVerifiedAt: new Date(),
      updatedAt: new Date()
    };
    
    if (status) {
      updateData.status = status;
    }
    
    if (verificationCount !== undefined) {
      updateData.verificationCount = verificationCount;
    }
    
    if (isFirstVerification) {
      updateData.firstVerifiedAt = new Date();
      if (updateData.verificationCount === undefined) {
        updateData.verificationCount = 1;
      }
    }
    
    const productCode = await ProductCode.findOneAndUpdate(
      { qrCodeId },
      { $set: updateData },
      { new: true }
    );
    
    if (!productCode) {
      return NextResponse.json(
        { success: false, message: 'Product code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification status updated',
      productCode: {
        qrCodeId: productCode.qrCodeId,
        status: productCode.status,
        verificationCount: productCode.verificationCount,
        firstVerifiedAt: productCode.firstVerifiedAt,
        lastVerifiedAt: productCode.lastVerifiedAt
      }
    });
    
  } catch (error: any) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update status',
        error: error.message 
      },
      { status: 500 }
    );
  }
}