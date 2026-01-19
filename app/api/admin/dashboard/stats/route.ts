// app/api/admin/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all stats in parallel
    const [
      totalClients,
      activeClients,
      suspendedClients,
      totalProducts,
      activeProducts,
      verifiedProducts,
      suspectedCounterfeit,
      totalBatches,
      totalScans,
      uniqueQRCodesScanned,
      validVerifications,
      invalidVerifications,
      pendingApprovals
    ] = await Promise.all([
      // Client stats
      Client.countDocuments(),
      Client.countDocuments({ status: 'active' }),
      Client.countDocuments({ status: 'suspended' }),
      
      // Product stats
      ProductCode.countDocuments(),
      ProductCode.countDocuments({ status: 'active' }),
      ProductCode.countDocuments({ status: 'verified' }),
      ProductCode.countDocuments({ status: 'suspected_counterfeit' }),
      
      // Batch stats
      Batch.countDocuments(),
      
      // Verification stats
      VerificationAttempt.countDocuments(),
      VerificationAttempt.distinct('scannedCode').then(codes => codes.length),
      VerificationAttempt.countDocuments({ result: 'valid' }),
      VerificationAttempt.countDocuments({ result: 'invalid' }),
      
      // Pending approvals
      Client.countDocuments({ 
        status: 'active',
        codesGenerated: 0 
      })
    ]);
    
    // Calculate metrics based on your data
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [weeklyScans, monthlyScans] = await Promise.all([
      VerificationAttempt.countDocuments({
        timestamp: { $gte: oneWeekAgo }
      }),
      VerificationAttempt.countDocuments({
        timestamp: { $gte: oneMonthAgo }
      })
    ]);
    
    // Revenue calculation (example: ₦50 per active product)
    const revenue = activeProducts * 50;
    
    // Active campaigns (batches in last 30 days)
    const activeCampaigns = await Batch.countDocuments({
      generationDate: { $gte: oneMonthAgo }
    });
    
    // Conversion rate (scans to valid verifications)
    const conversionRate = totalScans > 0 ? 
      Math.round((validVerifications / totalScans) * 100) : 0;
    
    // Get verification counts by day for the last 7 days
    const dailyVerifications = await getDailyVerifications(7);
    
    const stats = {
      // Client metrics
      totalClients,
      activeClients,
      suspendedClients,
      
      // Product metrics
      totalProducts,
      activeProducts,
      verifiedProducts,
      suspectedCounterfeit,
      
      // Batch metrics
      totalBatches,
      activeCampaigns,
      
      // Verification metrics
      totalVerifications: totalScans,
      uniqueQRCodesScanned,
      validVerifications,
      invalidVerifications,
      weeklyScans,
      monthlyScans,
      conversionRate,
      
      // Financial metrics
      revenue,
      
      // System metrics
      pendingApprovals,
      
      // Growth metrics (calculated below)
      weeklyGrowth: await calculateGrowth(oneWeekAgo, today, 'weekly'),
      monthlyGrowth: await calculateGrowth(oneMonthAgo, today, 'monthly'),
      
      // Daily data for charts
      dailyVerifications
    };
    
    return NextResponse.json({
      success: true,
      stats,
      lastUpdated: new Date()
    });
    
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard stats',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

async function getDailyVerifications(days: number) {
  const dailyData = await VerificationAttempt.aggregate([
    {
      $match: {
        timestamp: { 
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        scans: { $sum: 1 },
        valid: {
          $sum: { $cond: [{ $eq: ['$result', 'valid'] }, 1, 0] }
        },
        invalid: {
          $sum: { $cond: [{ $eq: ['$result', 'invalid'] }, 1, 0] }
        },
        scanned: {
          $sum: { $cond: [{ $eq: ['$result', 'scanned'] }, 1, 0] }
        }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1
      }
    }
  ]);
  
  return dailyData.map(day => ({
    date: `${day._id.day}/${day._id.month}`,
    scans: day.scans,
    valid: day.valid,
    invalid: day.invalid,
    scanned: day.scanned
  }));
}

async function calculateGrowth(startDate: Date, endDate: Date, period: 'weekly' | 'monthly') {
  const previousPeriodStart = new Date(startDate);
  const previousPeriodEnd = new Date(startDate);
  
  if (period === 'weekly') {
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
  } else {
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
  }
  
  const [currentPeriodCount, previousPeriodCount] = await Promise.all([
    VerificationAttempt.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate }
    }),
    VerificationAttempt.countDocuments({
      timestamp: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
    })
  ]);
  
  if (previousPeriodCount === 0) return 100; // 100% growth if no previous data
  
  const growth = ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
  return Math.round(growth * 100) / 100; // Round to 2 decimal places
}