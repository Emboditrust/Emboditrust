import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SMSVerification from '@/models/SMSVerification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'today';

    const query: any = {};
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt = { $gte: startDate, $lt: endDate };
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        // No date filter
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    if (dateRange !== 'yesterday' && dateRange !== 'all') {
      query.createdAt = { $gte: startDate };
    }

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayQuery = { ...query, createdAt: { $gte: todayStart } };

    const [
      total,
      today,
      valid,
      invalid,
      alreadyUsed,
      failed,
      byCarrierResult,
      byCountryResult,
      byHourResult,
      byResultResult,
      costResult,
      costTodayResult
    ] = await Promise.all([
      SMSVerification.countDocuments(query),
      SMSVerification.countDocuments(todayQuery),
      SMSVerification.countDocuments({ ...query, verificationResult: 'valid' }),
      SMSVerification.countDocuments({ ...query, verificationResult: 'invalid' }),
      SMSVerification.countDocuments({ ...query, verificationResult: 'already_used' }),
      SMSVerification.countDocuments({ ...query, verificationResult: 'failed' }),
      SMSVerification.aggregate([
        { $match: query },
        { $group: { _id: '$carrier', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SMSVerification.aggregate([
        { $match: query },
        { $group: { _id: '$countryCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SMSVerification.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      SMSVerification.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$verificationResult',
            count: { $sum: 1 }
          }
        }
      ]),
      SMSVerification.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$smsCost' }
          }
        }
      ]),
      SMSVerification.aggregate([
        { $match: todayQuery },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$smsCost' }
          }
        }
      ])
    ]);

    const byCarrier: Record<string, number> = {};
    byCarrierResult.forEach((item: any) => {
      byCarrier[item._id || 'Unknown'] = item.count;
    });

    const byCountry: Record<string, number> = {};
    byCountryResult.forEach((item: any) => {
      byCountry[item._id] = item.count;
    });

    const byHour: Record<string, number> = {};
    byHourResult.forEach((item: any) => {
      byHour[item._id] = item.count;
    });

    const byResult: Record<string, number> = {};
    byResultResult.forEach((item: any) => {
      byResult[item._id] = item.count;
    });

    const totalCost = costResult[0]?.totalCost || 0;
    const costToday = costTodayResult[0]?.totalCost || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        today,
        valid,
        invalid,
        already_used: alreadyUsed,
        failed,
        totalCost,
        costToday,
        byCarrier,
        byCountry,
        byHour,
        byResult
      }
    });

  } catch (error: any) {
    console.error('Error fetching SMS stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch stats',
        error: error.message 
      },
      { status: 500 }
    );
  }
}