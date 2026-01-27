// app/api/messages/send/route.ts - Simplified
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { sendEmail, createEmailTemplate } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      receiverEmail, 
      subject, 
      content, 
      replyTo,
      relatedReport
    } = body;
    
    if (!receiverEmail || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For admin sending messages, we use these defaults
    const adminInfo = {
      _id: 'admin_system',
      email: 'support@emboditrust.com',
      name: 'Emboditrust Admin',
    };
    
    // Save message to database
    const messageData: any = {
      senderId: adminInfo._id,
      senderEmail: adminInfo.email,
      senderName: adminInfo.name,
      senderRole: 'admin',
      receiverEmail,
      subject,
      content,
      status: 'sent',
      sentVia: 'manual',
    };
    
    if (replyTo) {
      messageData.replyTo = replyTo;
    }
    
    if (relatedReport) {
      messageData.relatedReport = relatedReport;
    }
    
    const savedMessage = await Message.create(messageData);

    // If Message.create returns an array, get the first element
    const savedMsg = Array.isArray(savedMessage) ? savedMessage[0] : savedMessage;
    
    // Try to send email via Resend
    let emailSent = false;
    
    try {
      if (process.env.RESEND_API_KEY) {
        const emailHtml = createEmailTemplate({
          title: subject,
          content: content.replace(/\n/g, '<br>'),
        });
        
        const emailResult = await sendEmail({
          to: receiverEmail,
          subject: subject,
          html: emailHtml,
          from: `Emboditrust <${adminInfo.email}>`,
        });
        
        if (emailResult.success) {
          emailSent = true;
          await Message.findByIdAndUpdate(savedMsg._id, {
            emailMessageId: emailResult.messageId,
            status: 'delivered',
          });
        }
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: savedMsg._id,
        emailSent,
      },
    });
    
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message',
        error: error.message 
      },
      { status: 500 }
    );
  }
}