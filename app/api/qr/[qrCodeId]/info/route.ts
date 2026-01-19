import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    // Extract params first
    const { qrCodeId } = await params;
    
    await connectDB();
    
    // Find product by QR code ID
    const product = await ProductCode.findOne({ qrCodeId }).lean();
    
    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'QR code not found',
      }, { status: 404 });
    }

    // Return basic product info (no sensitive data)
    return NextResponse.json({
      success: true,
      productInfo: {
        productName: product.productName,
        companyName: product.companyName,
        manufacturerId: product.manufacturerId,
        brandPrefix: product.brandPrefix,
      },
    });

  } catch (error) {
    console.error('QR info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}