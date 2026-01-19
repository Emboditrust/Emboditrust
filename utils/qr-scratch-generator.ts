import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

export class QRScratchGenerator {
  // Generate a printable QR code with embedded data
  static async generateQRCodeImage(
    data: string,
    qrCodeId: string
  ): Promise<{ dataURL: string; filePath: string }> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${qrCodeId}`;
      
      // Generate QR code as data URL
      const dataURL = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 500,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // For production, you'd save to file system or cloud storage
      const fileName = `qr_${qrCodeId}_${Date.now()}.png`;
      const filePath = `/tmp/${fileName}`; // Adjust for your storage

      return {
        dataURL,
        filePath,
      };
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate a 12-character scratch code
  static generateScratchCode(): string {
    const characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    
    // Format: XXX-XXX-XXX-XXX
    return `${result.substring(0, 3)}-${result.substring(3, 6)}-${result.substring(6, 9)}-${result.substring(9, 12)}`;
  }

  // Hash the scratch code
  static async hashScratchCode(code: string): Promise<string> {
    const cleanCode = code.replace(/-/g, '');
    return await bcrypt.hash(cleanCode, 12);
  }

  // Verify scratch code
  static async verifyScratchCode(code: string, hash: string): Promise<boolean> {
    const cleanCode = code.replace(/-/g, '');
    return await bcrypt.compare(cleanCode, hash);
  }

  // Generate batch of QR + Scratch pairs
  static async generateBatch(
    quantity: number,
    productInfo: {
      productName: string;
      companyName: string;
      manufacturerId: string;
      brandPrefix: string;
      batchId: string;
    },
    customConfig?: {
      logoUrl?: string;
      batchNumber?: string;
      additionalInfo?: Record<string, string>;
    }
  ): Promise<{
    pairs: Array<{
      qrCodeId: string;
      qrCodeImage: string; // Base64 data URL
      scratchCode: string;
      verificationUrl: string;
    }>;
    batchId: string;
  }> {
    const pairs = [];
    const batchId = productInfo.batchId;

    for (let i = 0; i < quantity; i++) {
      // Generate unique QR code ID
      const qrCodeId = `QR${Date.now()}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
      
      // Generate QR code image
      const qrCodeImage = await this.generateQRCodeImage(
        JSON.stringify({
          qrCodeId,
          productName: productInfo.productName,
          companyName: productInfo.companyName,
          batchId,
        }),
        qrCodeId
      );

      // Generate scratch code
      const scratchCode = this.generateScratchCode();

      pairs.push({
        qrCodeId,
        qrCodeImage: qrCodeImage.dataURL,
        scratchCode,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${qrCodeId}`,
      });
    }

    return {
      pairs,
      batchId,
    };
  }

  // Generate printable sheet (HTML/CSS for printing)
  static generatePrintableSheet(
    pairs: Array<{
      qrCodeId: string;
      qrCodeImage: string;
      scratchCode: string;
      productName: string;
      companyName: string;
      batchId: string;
    }>,
    perPage: number = 24
  ): string {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>QR Codes for Batch ${pairs[0]?.batchId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          .page {
            page-break-after: always;
            padding: 20px;
          }
          .label {
            display: inline-block;
            width: 2.5in;
            height: 1.5in;
            border: 1px solid #ccc;
            margin: 0.1in;
            padding: 10px;
            text-align: center;
            vertical-align: top;
            overflow: hidden;
          }
          .qr-code {
            width: 80px;
            height: 80px;
            margin: 0 auto 5px;
          }
          .qr-code img {
            width: 100%;
            height: 100%;
          }
          .code {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            margin: 2px 0;
          }
          .product-info {
            font-size: 9px;
            color: #666;
            margin-top: 3px;
          }
          @media print {
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        ${pairs.reduce((acc, pair, index) => {
          if (index % perPage === 0 && index > 0) {
            acc += '</div><div class="page">';
          }
          if (index % perPage === 0) {
            acc += '<div class="page">';
          }
          
          acc += `
            <div class="label">
              <div class="qr-code">
                <img src="${pair.qrCodeImage}" alt="QR Code">
              </div>
              <div class="code">QR: ${pair.qrCodeId}</div>
              <div class="code">Scratch: ${pair.scratchCode}</div>
              <div class="product-info">
                ${pair.productName}<br>
                Batch: ${pair.batchId}
              </div>
            </div>
          `;
          
          return acc;
        }, '')}
        ${pairs.length > 0 ? '</div>' : ''}
      </body>
      </html>
    `;

    return html;
  }
}