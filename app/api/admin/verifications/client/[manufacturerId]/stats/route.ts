// app/api/admin/verifications/client/[manufacturerId]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationAttempt from '@/models/VerificationAttempt';
import ProductCode from '@/models/ProductCode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ manufacturerId: string }> }
) {
  try {
    const { manufacturerId } = await params;
    const decodedManufacturerId = decodeURIComponent(manufacturerId);
    
    await connectDB();
    
    // Get all product codes for this manufacturer
    const productCodes = await ProductCode.find({ 
      manufacturerId: decodedManufacturerId 
    }).lean();
    
    if (productCodes.length === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalProducts: 0,
          totalVerifications: 0,
          validVerifications: 0,
          invalidVerifications: 0,
          uniqueProductsScanned: 0,
          conversionRate: 0,
          lastVerificationDate: null
        }
      });
    }
    
    const qrCodeIds = productCodes.map(p => p.qrCodeId);
    
    // Get ALL verification attempts for these codes
    const allVerifications = await VerificationAttempt.find({
      scannedCode: { $in: qrCodeIds }
    }).sort({ timestamp: -1 }).lean();
    
    // Get counts of product codes by status
    const verifiedProducts = productCodes.filter(p => p.status === 'verified').length;
    const activeProducts = productCodes.filter(p => p.status === 'active').length;
    const suspectedCounterfeit = productCodes.filter(p => p.status === 'suspected_counterfeit').length;
    
    // Calculate verification statistics from attempts
    const totalVerifications = allVerifications.length;
    const validVerifications = allVerifications.filter(v => 
      v.result === 'valid' || v.result === 'already_used'
    ).length;
    
    const invalidVerifications = allVerifications.filter(v => 
      v.result === 'invalid'
    ).length;
    
    const scannedOnly = allVerifications.filter(v => 
      v.result === 'scanned'
    ).length;
    
    // Get unique products that have been scanned (regardless of result)
    const uniqueScannedProducts = [...new Set(allVerifications.map(v => v.scannedCode))].length;
    
    // Calculate conversion rate based on PRODUCT STATUS, not verification attempts
    const conversionRate = productCodes.length > 0 
      ? Math.round((verifiedProducts / productCodes.length) * 100) 
      : 0;
    
    // Get last verification date
    const lastVerificationDate = allVerifications.length > 0 
      ? allVerifications[0].timestamp 
      : null;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts: productCodes.length,
        verifiedProducts,
        activeProducts,
        suspectedCounterfeit,
        totalVerifications,
        validVerifications,
        invalidVerifications,
        scannedOnly,
        uniqueProductsScanned: uniqueScannedProducts,
        conversionRate,
        lastVerificationDate
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching client verification stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch verification stats',
        error: error.message 
      },
      { status: 500 }
    );
  }
}