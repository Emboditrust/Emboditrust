import bcrypt from 'bcryptjs';

export class Security {
  static async hashCode(code: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(code, saltRounds);
  }

  static async verifyCode(rawCode: string, hashedCode: string): Promise<boolean> {
    return await bcrypt.compare(rawCode, hashedCode);
  }

  static sanitizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  }

  static generateBatchId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `BATCH_${timestamp}_${random}`.toUpperCase();
  }

  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static hashIP(ip: string): string {
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}