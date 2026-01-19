import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';
import Batch from '@/models/Batch';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication using NextAuth session
    const authResult = await verifySession(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access this resource' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run all queries in parallel
    const [
      totalCodes,
      activeCodes,
      verifiedCodes,
      verifiedToday,
      totalBatches,
      verificationAttemptsToday,
      suspiciousActivity,
      recentActivity,
    ] = await Promise.all([
      // Total codes
      Code.countDocuments(),
      
      // Active codes
      Code.countDocuments({ status: 'active' }),
      
      // Verified codes
      Code.countDocuments({ status: 'used' }),
      
      // Verified today
      Code.countDocuments({
        status: 'used',
        firstVerifiedAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Total batches
      Batch.countDocuments(),
      
      // Verification attempts today
      VerificationAttempt.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow }
      }),
      
      // Suspicious activity (multiple verifications from same IP for same code)
      VerificationAttempt.aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { scannedCode: "$scannedCode", ipAddress: "$ipAddress" },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 3 }
          }
        },
        {
          $count: "suspiciousCount"
        }
      ]),
      
      // Recent activity (last 10 verification attempts)
      VerificationAttempt.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('scannedCode result timestamp location')
        .lean()
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalCodes,
        activeCodes,
        verifiedCodes,
        verifiedToday,
        totalBatches,
        verificationAttemptsToday,
        suspiciousActivity: suspiciousActivity[0]?.suspiciousCount || 0,
        recentActivity,
        activeBatches: await Batch.countDocuments({
          generationDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }),
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}