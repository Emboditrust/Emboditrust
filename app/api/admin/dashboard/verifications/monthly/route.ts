// app/api/admin/dashboard/verifications/monthly/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get monthly verification data (all types) for the last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const monthlyData = await VerificationAttempt.aggregate([
      {
        $match: {
          timestamp: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' }
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
          '_id.month': 1
        }
      },
      {
        $limit: 12
      }
    ]);
    
    // Format the data
    const formattedData = monthlyData.map(item => {
      const date = new Date(item._id.year, item._id.month - 1, 1);
      return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        year: item._id.year,
        total: item.scans,
        valid: item.valid,
        invalid: item.invalid,
        scanned: item.scanned
      };
    });
    
    // Fill in missing months
    const completeData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      const existing = formattedData.find(item => 
        item.month === monthLabel && item.year === year
      );
      
      completeData.push({
        month: monthLabel,
        total: existing ? existing.total : 0,
        valid: existing ? existing.valid : 0,
        invalid: existing ? existing.invalid : 0,
        scanned: existing ? existing.scanned : 0
      });
    }
    
    return NextResponse.json({
      success: true,
      data: completeData,
      summary: {
        totalScans: completeData.reduce((sum, item) => sum + item.total, 0),
        totalValid: completeData.reduce((sum, item) => sum + item.valid, 0),
        totalInvalid: completeData.reduce((sum, item) => sum + item.invalid, 0),
        totalScannedOnly: completeData.reduce((sum, item) => sum + item.scanned, 0)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching monthly verification data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch verification data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}