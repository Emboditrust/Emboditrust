
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { clientId } = await params;
    
    // Find client
    const client = await Client.findOne({ clientId });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run all queries in parallel
    const [
      totalCodes,
      verifiedCodes,
      activeCodes,
      totalBatches,
      todayVerifications,
      todaySuspicious,
      monthlyVerifications,
    ] = await Promise.all([
      // Total codes for this client
      ProductCode.countDocuments({ manufacturerId: client.manufacturerId }),
      
      // Verified codes
      ProductCode.countDocuments({ 
        manufacturerId: client.manufacturerId,
        status: 'verified'
      }),
      
      // Active codes
      ProductCode.countDocuments({ 
        manufacturerId: client.manufacturerId,
        status: 'active'
      }),
      
      // Total batches
      Batch.countDocuments({ manufacturerId: client.manufacturerId }),
      
      // Today's verifications
      VerificationAttempt.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow },
        scannedCode: { $regex: client.brandPrefix, $options: 'i' }
      }),
      
      // Today's suspicious activity
      VerificationAttempt.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow },
        result: { $in: ['suspected_counterfeit', 'invalid', 'already_used'] },
        scannedCode: { $regex: client.brandPrefix, $options: 'i' }
      }),
      
      // Last 30 days verifications
      VerificationAttempt.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        scannedCode: { $regex: client.brandPrefix, $options: 'i' }
      }),
    ]);

    // Calculate rates
    const verificationRate = totalCodes ? Math.round((verifiedCodes / totalCodes) * 100) : 0;
    const suspiciousRate = todayVerifications ? Math.round((todaySuspicious / todayVerifications) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalCodes,
        verifiedCodes,
        activeCodes,
        verificationRate,
        suspiciousRate,
        batches: totalBatches,
        todayVerifications,
        todaySuspicious,
        monthlyVerifications,
        monthlyGrowth: 12.5, // This would be calculated from historical data
      },
    });

  } catch (error) {
    console.error('Client stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}