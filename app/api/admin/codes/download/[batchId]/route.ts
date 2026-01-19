import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    // Extract params first
    const { batchId } = await params;
    
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

    const batch = await Batch.findOne({ batchId });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found', message: 'Batch ID does not exist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      batch,
      downloadInstructions: 'Use the generation endpoint to get CSV content',
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch download information' },
      { status: 500 }
    );
  }
}