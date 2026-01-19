// app/api/admin/batches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get('manufacturerId');
    
    if (!manufacturerId) {
      return NextResponse.json(
        { success: false, error: 'Manufacturer ID is required' },
        { status: 400 }
      );
    }

    // Fetch batches
    const batches = await Batch.find({ manufacturerId })
      .sort('-generationDate')
      .lean();

    // Enrich batches with verification data
    const enrichedBatches = await Promise.all(
      batches.map(async (batch) => {
        try {
          // Get all product codes for this batch
          const productCodes = await ProductCode.find({ batchId: batch.batchId }).lean();
          
          // Count verified codes by status
          const verifiedCount = productCodes.filter(p => p.status === 'verified').length;
          const suspectedCounterfeit = productCodes.filter(p => p.status === 'suspected_counterfeit').length;
          
          // Get verification attempts for these codes
          const qrCodeIds = productCodes.map(p => p.qrCodeId);
          const verificationAttempts = await VerificationAttempt.find({
            scannedCode: { $in: qrCodeIds }
          }).lean();
          
          // Count successful verifications (valid or already_used)
          const successfulVerifications = verificationAttempts.filter(v => 
            v.result === 'valid' || v.result === 'already_used'
          ).length;
          
          // Calculate verification rate based on PRODUCT STATUS, not attempts
          const verificationRate = productCodes.length > 0 
            ? Math.round((verifiedCount / productCodes.length) * 100) 
            : 0;
          
          // For batches, we should also show attempts-based verification rate
          const attemptBasedRate = verificationAttempts.length > 0
            ? Math.round((successfulVerifications / verificationAttempts.length) * 100)
            : 0;

          return {
            _id: batch._id.toString(),
            batchId: batch.batchId,
            productName: batch.productName,
            companyName: batch.companyName,
            manufacturerId: batch.manufacturerId,
            quantity: batch.quantity,
            generationDate: batch.generationDate,
            createdAt: batch.generationDate,
            codesGenerated: productCodes.length,
            verifiedCount,
            suspectedCounterfeit,
            verificationRate,
            attemptBasedRate,
            totalVerificationAttempts: verificationAttempts.length,
            successfulVerifications
          };
        } catch (error) {
          console.error(`Error processing batch ${batch.batchId}:`, error);
          return {
            _id: batch._id.toString(),
            batchId: batch.batchId,
            productName: batch.productName,
            companyName: batch.companyName,
            manufacturerId: batch.manufacturerId,
            quantity: batch.quantity,
            generationDate: batch.generationDate,
            createdAt: batch.generationDate,
            codesGenerated: 0,
            verifiedCount: 0,
            suspectedCounterfeit: 0,
            verificationRate: 0,
            attemptBasedRate: 0,
            totalVerificationAttempts: 0,
            successfulVerifications: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      batches: enrichedBatches,
    });

  } catch (error: any) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}