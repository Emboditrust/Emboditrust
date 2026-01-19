import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SMSService } from '@/lib/services/sms.service';

export async function GET(request: NextRequest) {
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

    // Check environment variables
    const apiKey = process.env.TERMII_API_KEY;
    const senderId = process.env.TERMII_SENDER_ID;
    
    if (!apiKey || !senderId) {
      return NextResponse.json({
        success: false,
        message: 'Termii configuration missing',
        missing: {
          apiKey: !apiKey,
          senderId: !senderId
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasApiKey: !!apiKey,
          hasSenderId: !!senderId,
          apiKeyLength: apiKey?.length || 0,
          senderIdValue: senderId
        }
      }, { status: 500 });
    }

    try {
      // Get balance using SMSService
      const smsService = SMSService.getInstance();
      const balance = await smsService.getBalance();

      return NextResponse.json({
        success: true,
        balance: {
          balance: balance.balance,
          currency: balance.currency,
          lastUpdated: balance.lastUpdated
        },
        config: {
          hasApiKey: !!apiKey,
          hasSenderId: !!senderId,
          senderId: senderId,
          baseUrl: 'https://v3.api.termii.com'
        },
        rateLimitStats: smsService.getRateLimitStats(),
        timestamp: new Date().toISOString()
      });
    } catch (serviceError: any) {
      console.error('SMSService error:', serviceError);
      
      // Fallback to direct API call
      const baseUrl = 'https://v3.api.termii.com';
      
      try {
        const response = await fetch(`${baseUrl}/api/get-balance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            api_key: apiKey
          })
        });

        const data = await response.json();

        if (response.ok) {
          return NextResponse.json({
            success: true,
            balance: {
              balance: data.balance || 0,
              currency: data.currency || 'NGN',
              lastUpdated: new Date().toISOString(),
              note: 'Retrieved via direct API call (fallback)'
            },
            config: {
              hasApiKey: true,
              hasSenderId: true,
              senderId: senderId,
              baseUrl: baseUrl
            },
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error(`Direct API failed: ${response.status} - ${JSON.stringify(data)}`);
        }
      } catch (directApiError: any) {
        console.error('Direct API fallback also failed:', directApiError);
        
        // Return minimal response with configuration info
        return NextResponse.json({
          success: false,
          message: 'Both SMSService and direct API failed',
          errors: {
            serviceError: serviceError.message,
            directApiError: directApiError.message
          },
          configuration: {
            apiKeyConfigured: !!apiKey,
            senderIdConfigured: !!senderId,
            apiKeyFormat: apiKey?.startsWith('TL_') ? 'Valid (TL_ prefix)' : 'Invalid format',
            senderId: senderId,
            expectedBaseUrl: 'https://v3.api.termii.com'
          },
          troubleshooting: [
            'Check if TERMII_API_KEY is valid in Termii dashboard',
            'Verify sender ID is approved in Termii',
            'Check network connectivity to v3.api.termii.com',
            'Ensure API key has not expired'
          ],
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('Error in balance route:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch balance',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Support POST for clearing rate limits
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'clearRateLimits') {
      const smsService = SMSService.getInstance();
      smsService.clearRateLimits();
      
      return NextResponse.json({
        success: true,
        message: 'Rate limits cleared successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action',
      supportedActions: ['clearRateLimits']
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error in balance POST:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    }, { status: 500 });
  }
}