// app/api/messages/route.ts - Updated with report data
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import FakeProductReport from '@/models/FakeProductReport';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const filter = searchParams.get('filter') || 'all'; // all, sent, received, reports
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query: any = {};
    
    // Filter by message type
    if (filter === 'sent') {
      query.senderRole = 'admin';
    } else if (filter === 'received') {
      query.senderRole = { $in: ['user', 'system'] };
    } else if (filter === 'reports') {
      query.relatedReport = { $exists: true, $ne: null };
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { senderEmail: { $regex: search, $options: 'i' } },
        { receiverEmail: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Get messages with pagination
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Message.countDocuments(query);
    
    // Get report details for messages that have relatedReport
    const messagesWithReports = await Promise.all(
      messages.map(async (message) => {
        if (message.relatedReport) {
          const report = await FakeProductReport.findById(message.relatedReport)
            .select('productName purchaseLocation status priority createdAt')
            .lean();
          
          return {
            ...message,
            report,
          };
        }
        return message;
      })
    );
    
    // Get statistics
    const stats = {
      total: await Message.countDocuments({}),
      sent: await Message.countDocuments({ senderRole: 'admin' }),
      received: await Message.countDocuments({ senderRole: { $in: ['user', 'system'] } }),
      reports: await Message.countDocuments({ relatedReport: { $exists: true, $ne: null } }),
      unread: await Message.countDocuments({ 
        status: 'sent', 
        senderRole: { $in: ['user', 'system'] } 
      }),
    };
    
    return NextResponse.json({
      success: true,
      data: {
        messages: messagesWithReports,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch messages',
        error: error.message 
      },
      { status: 500 }
    );
  }
}