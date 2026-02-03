// app/api/contact/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { sendEmail, createEmailTemplate } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      name,
      email,
      subject,
      message: content,
      company,
      phone
    } = body;
    
    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Save message to database (from user to admin)
    const messageData = {
      senderId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderEmail: email.toLowerCase().trim(),
      senderName: name.trim(),
      senderRole: 'user' as const,
      receiverEmail: 'support@emboditrust.com', // Admin email
      receiverName: 'Emboditrust Support Team',
      subject: subject.trim(),
      content: content.trim(),
      status: 'sent' as const,
      sentVia: 'system' as const,
    };
    
    // Add optional fields if provided
    if (company?.trim()) {
      messageData.content = `Company: ${company.trim()}\n\n${messageData.content}`;
    }
    
    if (phone?.trim()) {
      messageData.content = `Phone: ${phone.trim()}\n\n${messageData.content}`;
    }
    
    const savedMessage = await Message.create(messageData);
    
    // Send confirmation email to user
    let userEmailSent = false;
    let adminEmailSent = false;
    
    try {
      if (process.env.RESEND_API_KEY) {
        // Email to user (confirmation)
        const userEmailHtml = createEmailTemplate({
          title: 'Message Received - Emboditrust Healthcare',
          content: `
            <p>Dear ${name},</p>
            <p>Thank you for contacting Emboditrust Healthcare. We have received your message and our support team will get back to you as soon as possible.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your Message:</strong></p>
              <p>${content.replace(/\n/g, '<br>')}</p>
            </div>
            <p><strong>Reference ID:</strong> MSG-${savedMessage._id.toString().slice(-8).toUpperCase()}</p>
            <p>Best regards,<br>Emboditrust Healthcare Team</p>
          `,
        });
        
        const userEmailResult = await sendEmail({
          to: email,
          subject: 'Message Received - Emboditrust Healthcare',
          html: userEmailHtml,
          from: 'Emboditrust Healthcare <support@emboditrust.com>',
          replyTo: 'support@emboditrust.com',
        });
        
        userEmailSent = userEmailResult.success;
        
        // Email to admin (notification)
        const adminEmailHtml = createEmailTemplate({
          title: `New Contact Form Message: ${subject}`,
          content: `
            <p><strong>New message from website contact form:</strong></p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${name} (${email})</p>
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${content.replace(/\n/g, '<br>')}</p>
            </div>
            <p><strong>Message ID:</strong> ${savedMessage._id}</p>
            <p><a href="${process.env.NEXTAUTH_URL}/dashboard/messages" style="color: #059669; text-decoration: none; font-weight: bold;">View in Admin Dashboard →</a></p>
          `,
        });
        
        const adminEmailResult = await sendEmail({
          to: 'support@emboditrust.com',
          subject: `📨 New Contact: ${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`,
          html: adminEmailHtml,
          from: 'Emboditrust Website <noreply@emboditrust.com>',
          replyTo: email,
        });
        
        adminEmailSent = adminEmailResult.success;
        
        if (adminEmailSent) {
          await Message.findByIdAndUpdate(savedMessage._id, {
            status: 'delivered',
            emailMessageId: adminEmailResult.messageId,
          });
        }
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the whole request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon.',
      data: {
        messageId: savedMessage._id,
        userEmailSent,
        adminEmailSent,
        referenceId: `MSG-${savedMessage._id.toString().slice(-8).toUpperCase()}`,
      },
    });
    
  } catch (error: any) {
    console.error('Error sending contact message:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message. Please try again.',
        error: error.message 
      },
      { status: 500 }
    );
  }
}