import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationAttempt from '@/models/VerificationAttempt';
import ProductCode from '@/models/ProductCode';

interface RouteParams {
  params: Promise<{ manufacturerId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { manufacturerId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    await connectDB();
    
    // Get all product codes for this manufacturer
    const productCodes = await ProductCode.find({ 
      manufacturerId: decodeURIComponent(manufacturerId) 
    }).select('qrCodeId').lean();
    
    const qrCodeIds = productCodes.map(p => p.qrCodeId);
    
    if (qrCodeIds.length === 0) {
      return NextResponse.json({
        success: true,
        attempts: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      });
    }
    
    const skip = (page - 1) * limit;
    
    // Get verification attempts for these products
    const [attempts, total] = await Promise.all([
      VerificationAttempt.find({
        scannedCode: { $in: qrCodeIds }
      })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
      VerificationAttempt.countDocuments({
        scannedCode: { $in: qrCodeIds }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id.toString(),
        timestamp: attempt.timestamp,
        scannedCode: attempt.scannedCode,
        scratchCode: attempt.scratchCode,
        result: attempt.result,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent, 
        location: attempt.location
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching client verification attempts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch verification attempts',
        error: error.message 
      },
      { status: 500 }
    );
  }
}