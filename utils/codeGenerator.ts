// Characters without ambiguous ones: removed 0, O, I, 1, L
const ALPHANUMERIC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export class CodeGenerator {
  private static readonly BRAND_PREFIXES: Record<string, string> = {
    'EMB': 'EMB',
    'GLA': 'GlaxoSmithKline',
    'PZ': 'PZ Cussons',
    'FID': 'Fidson',
    'MAY': 'May & Baker',
    'BIO': 'Biogaran',
    'SAN': 'Sanofi',
    'NOV': 'Novartis',
    'ROC': 'Roche',
    'AST': 'AstraZeneca',
  };

  // Luhn algorithm mod 32
  private static calculateChecksum(codeWithoutChecksum: string): string {
    let sum = 0;
    let isSecond = false;
    
    for (let i = codeWithoutChecksum.length - 1; i >= 0; i--) {
      let digit = this.charToValue(codeWithoutChecksum[i]);
      
      if (isSecond) {
        digit *= 2;
        if (digit >= 32) {
          digit = Math.floor(digit / 32) + (digit % 32);
        }
      }
      
      sum += digit;
      isSecond = !isSecond;
    }
    
    const remainder = sum % 32;
    const checkDigit = (32 - remainder) % 32;
    return this.valueToChar(checkDigit);
  }

  private static charToValue(char: string): number {
    return ALPHANUMERIC.indexOf(char);
  }

  private static valueToChar(value: number): string {
    return ALPHANUMERIC[value];
  }

  private static generateRandomChars(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += ALPHANUMERIC[array[i] % ALPHANUMERIC.length];
    }
    return result;
  }

  static generateCode(brandPrefix: string = 'EMB'): string {
    if (!this.BRAND_PREFIXES[brandPrefix]) {
      throw new Error('Invalid brand prefix');
    }

    if (brandPrefix.length !== 3) {
      throw new Error('Brand prefix must be 3 characters');
    }

    // 6 random characters
    const randomPart = this.generateRandomChars(6);
    
    // Combine prefix + random part
    const codeWithoutChecksum = brandPrefix + randomPart;
    
    // Calculate checksum (3 digits)
    const checksum1 = this.calculateChecksum(codeWithoutChecksum);
    const checksum2 = this.calculateChecksum(codeWithoutChecksum + checksum1);
    const checksum3 = this.generateRandomChars(1);
    
    return codeWithoutChecksum + checksum1 + checksum2 + checksum3;
  }

  static validateCode(code: string): boolean {
    if (code.length !== 12) return false;
    
    const codeWithoutChecksum = code.substring(0, 9);
    const providedChecksum = code.substring(9);
    
    // Validate first two checksum digits
    const expectedFirst = this.calculateChecksum(codeWithoutChecksum);
    const expectedSecond = this.calculateChecksum(codeWithoutChecksum + expectedFirst);
    
    return providedChecksum[0] === expectedFirst && 
           providedChecksum[1] === expectedSecond;
  }

  static getBrandFromCode(code: string): string | null {
    const prefix = code.substring(0, 3);
    return this.BRAND_PREFIXES[prefix] || null;
  }

  static generateBatch(quantity: number, brandPrefix: string = 'EMB'): string[] {
    const codes: string[] = [];
    const seen = new Set<string>();
    
    while (codes.length < quantity) {
      const code = this.generateCode(brandPrefix);
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
    
    return codes;
  }
}