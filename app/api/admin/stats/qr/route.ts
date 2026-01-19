import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
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

    // Get yesterday for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Run all queries in parallel
    const [
      totalProducts,
      activeProducts,
      verifiedProducts,
      verifiedToday,
      verificationAttemptsToday,
      suspiciousToday,
      uniqueLocationsToday,
      recentActivity,
      totalBatches,
    ] = await Promise.all([
      // Total products with QR codes
      ProductCode.countDocuments(),
      
      // Active products (not verified)
      ProductCode.countDocuments({ status: 'active' }),
      
      // Verified products
      ProductCode.countDocuments({ status: 'verified' }),
      
      // Verified today
      ProductCode.countDocuments({
        status: 'verified',
        firstVerifiedAt: { $gte: today, $lt: tomorrow }
      }),
      
      // Verification attempts today
      VerificationAttempt.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow }
      }),
      
      // Suspicious activity today
      VerificationAttempt.countDocuments({
        timestamp: { $gte: today, $lt: tomorrow },
        result: { $in: ['suspected_fake', 'scratch_invalid', 'qr_not_found'] }
      }),
      
      // Unique locations today
      VerificationAttempt.distinct('location.country', {
        timestamp: { $gte: today, $lt: tomorrow }
      }),
      
      // Recent activity (last 5)
      VerificationAttempt.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .lean(),
      
      // Count distinct batches
      ProductCode.distinct('batchId'),
    ]);

    // Calculate rates
    const verificationRate = totalProducts ? Math.round((verifiedProducts / totalProducts) * 100) : 0;
    const suspiciousRate = verificationAttemptsToday ? Math.round((suspiciousToday / verificationAttemptsToday) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        verifiedProducts,
        verifiedToday,
        verificationAttemptsToday,
        suspiciousActivity: suspiciousToday,
        suspiciousRate,
        verificationRate,
        uniqueLocations: uniqueLocationsToday.length,
        liveVerifications: Math.floor(verificationAttemptsToday / 24), // Per hour estimate
        activeBatches: totalBatches.length,
        recentActivity,
      },
    });

  } catch (error) {
    console.error('QR stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}