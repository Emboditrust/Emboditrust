import crypto from 'crypto';

/* =====================================================
   TYPES
===================================================== */

export interface SMSMessage {
  to: string;
  message: string;
  type?: 'plain' | 'unicode';
  channel?: 'generic' | 'dnd' | 'whatsapp';
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  cost?: number;
  balance?: number;
  error?: string;
}

export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  error?: string;
}

interface TermiiSendResponse {
  message_id?: string;
  smsUnit?: number;
  balance?: number;
  status?: string;
  message?: string;
}

interface TermiiBalanceResponse {
  balance?: number;
  currency?: string;
  user?: string;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  lastSent: number;
}

/* =====================================================
   CONSTANTS
===================================================== */

const TERMII_BASE_URL = 'https://v3.api.termii.com';
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_SMS_PER_WINDOW = 5;

/* =====================================================
   SERVICE
===================================================== */

export class SMSService {
  private static instance: SMSService;
  private rateLimitMap = new Map<string, RateLimitEntry>();

  private constructor() {
    if (!process.env.TERMII_API_KEY) {
      throw new Error('TERMII_API_KEY is not set in environment variables');
    }
    if (!process.env.TERMII_SENDER_ID) {
      throw new Error('TERMII_SENDER_ID is not set in environment variables');
    }
    
    console.log('SMSService initialized with:', {
      hasApiKey: !!process.env.TERMII_API_KEY,
      senderId: process.env.TERMII_SENDER_ID,
      baseUrl: TERMII_BASE_URL
    });
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /* =====================================================
     PUBLIC METHODS
  ===================================================== */

  async sendMessage(message: SMSMessage): Promise<SMSResponse> {
    try {
      console.log('Sending SMS:', {
        to: message.to,
        messageLength: message.message.length,
        type: message.type,
        channel: message.channel,
        timestamp: new Date().toISOString()
      });

      const validation = await this.validatePhoneNumber(message.to);

      if (!validation.isValid || !validation.formattedNumber) {
        console.error('Phone validation failed:', validation);
        return { success: false, error: validation.error };
      }

      const rateLimit = this.checkRateLimit(validation.formattedNumber);
      if (!rateLimit.allowed) {
        console.warn('Rate limit exceeded for:', validation.formattedNumber);
        return {
          success: false,
          error: 'Rate limit exceeded. Try again later.'
        };
      }

      const payload = {
        to: validation.formattedNumber,
        from: process.env.TERMII_SENDER_ID!,
        sms: message.message,
        type: message.type ?? 'plain',
        channel: message.channel ?? 'generic',
        api_key: process.env.TERMII_API_KEY!
      };

      console.log('Calling Termii API with payload:', {
        ...payload,
        api_key: '***' + payload.api_key.substring(payload.api_key.length - 4)
      });

      const response = await fetch(`${TERMII_BASE_URL}/api/sms/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: TermiiSendResponse = await response.json();

      console.log('Termii API response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${JSON.stringify(data)}`
        };
      }

      this.updateRateLimit(validation.formattedNumber);

      return {
        success: true,
        messageId: data.message_id,
        cost: data.smsUnit ?? 0,
        balance: data.balance ?? 0
      };
    } catch (error: any) {
      console.error('SMS send error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: error?.message || 'Failed to send SMS'
      };
    }
  }

  async getBalance(): Promise<{
    balance: number;
    currency: string;
    lastUpdated: string;
  }> {
    try {
      console.log('Fetching Termii balance...');
      
      const response = await fetch(
        `${TERMII_BASE_URL}/api/get-balance?api_key=${process.env.TERMII_API_KEY}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const data: TermiiBalanceResponse = await response.json();

      console.log('Termii balance response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (!response.ok) {
        console.error('Balance API error:', data);
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        balance: data.balance ?? 0,
        currency: data.currency ?? 'NGN',
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Failed to get SMS balance:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      return {
        balance: 0,
        currency: 'NGN',
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async validatePhoneNumber(phone: string): Promise<PhoneValidationResult> {
    try {
      const cleaned = phone.replace(/\D/g, '');

      if (cleaned.length < 10 || cleaned.length > 15) {
        return {
          isValid: false,
          error: 'Phone number must be 10-15 digits'
        };
      }

      let formatted = cleaned;

      if (cleaned.startsWith('0')) {
        formatted = '234' + cleaned.substring(1);
      }

      if (!formatted.startsWith('234')) {
        formatted = '234' + formatted;
      }

      // Validate Nigerian numbers
      if (formatted.startsWith('234')) {
        const networkCodes = ['70', '80', '81', '90', '91'];
        const firstFour = formatted.substring(3, 5);
        
        if (!networkCodes.includes(firstFour)) {
          return {
            isValid: false,
            error: 'Invalid Nigerian phone number format'
          };
        }
      }

      return {
        isValid: true,
        formattedNumber: formatted
      };
    } catch (error: any) {
      return {
        isValid: false,
        error: error.message || 'Invalid phone number format'
      };
    }
  }

  /* =====================================================
     INTERNAL HELPERS
  ===================================================== */

  private checkRateLimit(phone: string): { allowed: boolean } {
    const now = Date.now();
    const entry = this.rateLimitMap.get(phone);

    if (!entry) {
      return { allowed: true };
    }

    if (now - entry.lastSent > RATE_LIMIT_WINDOW_MS) {
      this.rateLimitMap.delete(phone);
      return { allowed: true };
    }

    return {
      allowed: entry.count < MAX_SMS_PER_WINDOW
    };
  }

  private updateRateLimit(phone: string): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(phone);

    if (!entry) {
      this.rateLimitMap.set(phone, {
        count: 1,
        lastSent: now
      });
      return;
    }

    entry.count += 1;
    entry.lastSent = now;
  }

  /* =====================================================
     UTILITY
  ===================================================== */

  generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  clearRateLimits(): void {
    this.rateLimitMap.clear();
    console.log('Rate limits cleared');
  }

  getRateLimitStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [phone, entry] of this.rateLimitMap.entries()) {
      stats[phone] = {
        count: entry.count,
        lastSent: new Date(entry.lastSent).toISOString(),
        timeSinceLast: Date.now() - entry.lastSent
      };
    }
    
    return stats;
  }
}