import crypto from 'crypto';

export type VTPassNetwork = 'mtn' | 'glo' | 'airtel' | 'etisalat';

export interface AirtimePurchaseParams {
  phone: string;
  amount: number;
  network: VTPassNetwork;
  requestId: string;
}

export interface AirtimePurchaseResult {
  success: boolean;
  transactionId?: string;
  requestId?: string;
  status?: string;
  amount?: number;
  commission?: number;
  totalAmount?: number;
  error?: string;
  code?: string;
  rawResponse?: any;
}

export interface VTPassWalletBalance {
  balance: number;
  currency: string;
}

interface VTPassPayResponse {
  code?: string;
  response_description?: string;
  requestId?: string;
  amount?: number;
  transaction_date?: string;
  purchased_code?: string;
  content?: {
    transactions?: {
      status?: string;
      product_name?: string;
      unique_element?: string;
      unit_price?: string | number;
      quantity?: number;
      commission?: number;
      total_amount?: number;
      transactionId?: string;
      amount?: string | number;
      phone?: string;
      email?: string;
      name?: string;
      channel?: string;
      type?: string;
      platform?: string;
      method?: string;
      commission_details?: {
        amount?: number;
        rate?: string;
        rate_type?: string;
        computation_type?: string;
      };
    };
  };
}

const VTPASS_LIVE_BASE = 'https://vtpass.com/api';
const VTPASS_SANDBOX_BASE = 'https://sandbox.vtpass.com/api';

const NIGERIAN_NETWORK_PREFIXES: Record<VTPassNetwork, string[]> = {
  mtn: ['0803', '0806', '0703', '0706', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916', '0801'],
  glo: ['0805', '0807', '0811', '0815', '0705', '0905', '0915'],
  airtel: ['0802', '0808', '0701', '0708', '0812', '0901', '0902', '0907', '0912'],
  etisalat: ['0809', '0817', '0818', '0909', '0908'],
};

export class VTPassService {
  private static instance: VTPassService;
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = process.env.VTPASS_API_KEY || '';
    this.secretKey = process.env.VTPASS_SECRET_KEY || '';

    if (!this.apiKey || !this.secretKey) {
      throw new Error('VTPASS_API_KEY and VTPASS_SECRET_KEY must be set in environment variables');
    }

    this.baseUrl = process.env.VTPASS_SANDBOX === 'true'
      ? VTPASS_SANDBOX_BASE
      : VTPASS_LIVE_BASE;
  }

  public static getInstance(): VTPassService {
    if (!VTPassService.instance) {
      VTPassService.instance = new VTPassService();
    }
    return VTPassService.instance;
  }

  static generateRequestId(): string {
    const now = new Date();
    const lagosOffset = 60 * 60 * 1000;
    const lagosTime = new Date(now.getTime() + lagosOffset);
    const y = lagosTime.getUTCFullYear();
    const M = String(lagosTime.getUTCMonth() + 1).padStart(2, '0');
    const d = String(lagosTime.getUTCDate()).padStart(2, '0');
    const h = String(lagosTime.getUTCHours()).padStart(2, '0');
    const m = String(lagosTime.getUTCMinutes()).padStart(2, '0');
    const datePart = `${y}${M}${d}${h}${m}`;
    const random = crypto.randomBytes(8).toString('hex');
    return `${datePart}${random}`;
  }

  static detectNetwork(phone: string): VTPassNetwork | null {
    const cleaned = phone.replace(/\D/g, '');
    let prefix = cleaned;
    if (cleaned.startsWith('234')) {
      prefix = '0' + cleaned.substring(3);
    }
    const first4 = prefix.substring(0, 4);
    for (const [network, prefixes] of Object.entries(NIGERIAN_NETWORK_PREFIXES)) {
      if (prefixes.includes(first4)) {
        return network as VTPassNetwork;
      }
    }
    return null;
  }

  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('234')) {
      return '0' + cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
      return cleaned;
    }
    return '0' + cleaned;
  }

  async purchaseAirtime(params: AirtimePurchaseParams): Promise<AirtimePurchaseResult> {
    try {
      const formattedPhone = VTPassService.formatPhone(params.phone);

      const payload = {
        request_id: params.requestId,
        serviceID: params.network,
        amount: params.amount,
        phone: formattedPhone,
      };

      const response = await fetch(`${this.baseUrl}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'secret-key': this.secretKey,
        },
        body: JSON.stringify(payload),
      });

      const data: VTPassPayResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.response_description || `HTTP ${response.status}: ${JSON.stringify(data)}`,
          rawResponse: data,
        };
      }

      if (data.code === '000') {
        return {
          success: true,
          transactionId: data.content?.transactions?.transactionId,
          requestId: data.requestId,
          status: data.content?.transactions?.status || 'delivered',
          amount: data.amount || params.amount,
          commission: data.content?.transactions?.commission,
          totalAmount: data.content?.transactions?.total_amount,
          rawResponse: data,
        };
      }

      return {
        success: false,
        error: data.response_description || `VTPass code: ${data.code}`,
        code: data.code,
        requestId: data.requestId,
        rawResponse: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to purchase airtime via VTPass',
      };
    }
  }

  async requery(requestId: string): Promise<AirtimePurchaseResult> {
    try {
      const response = await fetch(`${this.baseUrl}/requery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'secret-key': this.secretKey,
        },
        body: JSON.stringify({ request_id: requestId }),
      });

      const data: VTPassPayResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.response_description || `HTTP ${response.status}: ${JSON.stringify(data)}`,
          rawResponse: data,
        };
      }

      if (data.code === '000') {
        return {
          success: true,
          transactionId: data.content?.transactions?.transactionId,
          requestId: data.requestId,
          status: data.content?.transactions?.status || 'delivered',
          amount: data.amount,
          commission: data.content?.transactions?.commission,
          totalAmount: data.content?.transactions?.total_amount,
          rawResponse: data,
        };
      }

      return {
        success: false,
        error: data.response_description || `VTPass requery code: ${data.code}`,
        code: data.code,
        requestId: data.requestId,
        rawResponse: data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to requery VTPass transaction',
      };
    }
  }
}
