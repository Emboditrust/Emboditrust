import { NextRequest, NextResponse } from 'next/server';
import { SMSService } from '@/lib/services/sms.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized. Admin access required.' 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { phoneNumber, message, type = 'plain', channel = 'generic' } = body;

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number and message are required',
          received: {
            phoneNumber: !!phoneNumber,
            message: !!message,
            body: body
          }
        },
        { status: 400 }
      );
    }

    // Initialize SMS service
    const smsService = SMSService.getInstance();
    
    // Validate phone number
    const validation = await smsService.validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number',
        details: validation,
        receivedPhone: phoneNumber
      }, { status: 400 });
    }

    console.log('Sending test SMS:', {
      phoneNumber,
      formattedPhone: validation.formattedNumber,
      messageLength: message.length,
      type,
      channel,
      adminUser: session.user.email,
      timestamp: new Date().toISOString()
    });

    // Send test message
    const result = await smsService.sendMessage({
      to: phoneNumber,
      message: message,
      type: type as any,
      channel: channel as any
    });

    if (!result.success) {
      console.error('Test SMS failed:', result);
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send SMS',
        details: {
          formattedPhone: validation.formattedNumber,
          messageLength: message.length,
          rateLimitStats: smsService.getRateLimitStats()
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Get updated balance
    const balance = await smsService.getBalance();

    return NextResponse.json({
      success: true,
      message: 'Test SMS sent successfully',
      details: {
        messageId: result.messageId,
        cost: result.cost,
        initialBalance: result.balance,
        currentBalance: balance.balance,
        formattedPhone: validation.formattedNumber,
        messagePreview: message.length > 50 ? message.substring(0, 50) + '...' : message,
        messageLength: message.length,
        rateLimitStats: smsService.getRateLimitStats()
      },
      admin: {
        email: session.user.email,
        name: session.user.name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error sending test SMS:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send test SMS',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const smsService = SMSService.getInstance();
    const balance = await smsService.getBalance();

    return NextResponse.json({
      success: true,
      message: 'SMS Test Endpoint',
      configuration: {
        termiiApiKey: process.env.TERMII_API_KEY ? 'Configured' : 'Missing',
        termiiSenderId: process.env.TERMII_SENDER_ID || 'Not set',
        baseUrl: 'https://v3.api.termii.com',
        environment: process.env.NODE_ENV
      },
      balance: {
        current: balance.balance,
        currency: balance.currency,
        lastUpdated: balance.lastUpdated
      },
      rateLimitStats: smsService.getRateLimitStats(),
      endpoints: {
        sendTest: 'POST /api/admin/sms/test',
        getBalance: 'GET /api/admin/sms/balance',
        clearRateLimits: 'POST /api/admin/sms/balance {action: "clearRateLimits"}'
      },
      exampleRequest: {
        method: 'POST',
        url: '/api/admin/sms/test',
        body: {
          phoneNumber: '08031234567',
          message: 'Test SMS from Emboditrust',
          type: 'plain',
          channel: 'generic'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in test GET:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Configuration check failed',
      error: error.message,
      configuration: {
        termiiApiKey: process.env.TERMII_API_KEY ? 'Configured' : 'Missing',
        termiiSenderId: process.env.TERMII_SENDER_ID || 'Not set',
        baseUrl: 'https://v3.api.termii.com'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}