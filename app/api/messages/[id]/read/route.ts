// app/api/messages/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id: messageId } = await context.params;

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        status: 'read',
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as read',
      data: message,
    });

  } catch (error: any) {
    console.error('Error marking message as read:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to mark message as read',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
