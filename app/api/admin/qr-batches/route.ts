import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import ProductCode from '@/models/ProductCode';

export async function GET(request: NextRequest) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || '-createdAt';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get batches
    const batches = await Batch.find({})
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get statistics for each batch
    const batchesWithStats = await Promise.all(
      batches.map(async (batch) => {
        const [total, verified, active] = await Promise.all([
          ProductCode.countDocuments({ batchId: batch.batchId }),
          ProductCode.countDocuments({ batchId: batch.batchId, status: 'verified' }),
          ProductCode.countDocuments({ batchId: batch.batchId, status: 'active' }),
        ]);

        return {
          ...batch,
          statistics: {
            total,
            verified,
            active,
            verificationRate: total ? Math.round((verified / total) * 100) : 0,
          },
        };
      })
    );

    // Get total count
    const total = await Batch.countDocuments();

    return NextResponse.json({
      success: true,
      batches: batchesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('QR batches fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}