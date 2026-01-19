declare module "termii-nodejs" {
  interface TermiiConfig {
    apiKey: string;
    senderId: string;
    baseURL?: string;
  }

  interface SendMessagePayload {
    to: string;
    from: string;
    sms: string;
    type?: "plain" | "unicode";
    channel?: "dnd" | "whatsapp" | "generic";
  }

  interface SendMessageResponse {
    message_id: string;
    balance: number;
  }

  interface BalanceResponse {
    balance: number;
  }

  export default class Termii {
    constructor(config: TermiiConfig);

    sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse>;
    getBalance(): Promise<BalanceResponse>;
  }
}
