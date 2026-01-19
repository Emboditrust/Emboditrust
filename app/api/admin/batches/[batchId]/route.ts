import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import ProductCode from '@/models/ProductCode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { batchId } = await params;
    
    await connectDB();
    
    // Find the batch
    const batch = await Batch.findOne({ batchId }).lean();
    
    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Get all codes for this batch
    const codes = await ProductCode.find({ batchId })
      .sort('createdAt')
      .lean();

    // Format codes for response
    const formattedCodes = codes.map((code, index) => ({
      qrCodeId: code.qrCodeId,
      scratchCode: code.scratchCode,
      productName: code.productName,
      companyName: code.companyName,
      batchId: code.batchId,
      manufacturerId: code.manufacturerId,
      verificationUrl: code.verificationUrl,
      qrCodeImage: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code.verificationUrl)}`,
      index: index + 1,
      status: code.status,
      verificationCount: code.verificationCount || 0,
      firstVerifiedAt: code.firstVerifiedAt,
      lastVerifiedAt: code.lastVerifiedAt
    }));

    return NextResponse.json({
      success: true,
      batch: {
        _id: batch._id.toString(),
        batchId: batch.batchId,
        productName: batch.productName,
        companyName: batch.companyName,
        manufacturerId: batch.manufacturerId,
        quantity: batch.quantity,
        generationDate: batch.generationDate
      },
      codes: formattedCodes,
      total: formattedCodes.length
    });

  } catch (error: any) {
    console.error('Error fetching batch codes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}