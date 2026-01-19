import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import QRCode from 'qrcode';
import crypto from 'crypto';
import Client from '@/models/Client';
import Batch from '@/models/Batch';
import ProductCode from '@/models/ProductCode';

// Validation schema
const generateSchema = z.object({
  clientId: z.string().min(1),
  quantity: z.coerce.number().min(1).max(10000),
  productName: z.string().min(1).max(200),
  companyName: z.string().min(1),
  manufacturerId: z.string().min(1),
  brandPrefix: z.string().min(1),
  customBatchNumber: z.string().optional(),
  enableCustomPage: z.boolean().optional(),
  customLogoUrl: z.string().url().optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
  includeImages: z.boolean().optional().default(true),
});

// Helper function to generate scratch code WITHOUT HYPHENS
function generateScratchCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters
  const totalLength = 12; // 12 characters without hyphens
  
  let code = '';
  for (let i = 0; i < totalLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

// Helper function to generate secure hash
function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 12);
}

// Helper function to generate unique batch ID
async function generateUniqueBatchId(
  brandPrefix: string, 
  customBatchNumber?: string
): Promise<string> {
  if (customBatchNumber && customBatchNumber.trim()) {
    // Check if custom batch number already exists
    const existingBatch = await Batch.findOne({ batchId: customBatchNumber });
    if (existingBatch) {
      // Append a random suffix if custom batch number already exists
      const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `${customBatchNumber}-${suffix}`;
    }
    return customBatchNumber;
  }
  
  // Generate unique batch ID
  let batchId;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 6).toUpperCase();
    batchId = `BATCH-${brandPrefix}-${timestamp}-${randomSuffix}`;
    
    const existingBatch = await Batch.findOne({ batchId });
    attempts++;
    
    if (!existingBatch || attempts >= maxAttempts) {
      break;
    }
  } while (true);
  
  return batchId;
}

// Generate QR code as base64 image
async function generateQRCodeImage(verificationUrl: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H' // High error correction for durability
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback: create a simple SVG
    return `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#fff"/>
        <rect x="10" y="10" width="80" height="80" fill="#000"/>
        <rect x="20" y="20" width="60" height="60" fill="#fff"/>
        <rect x="30" y="30" width="40" height="40" fill="#000"/>
        <text x="50" y="85" font-family="Arial" font-size="6" text-anchor="middle" fill="#666">QR Code</text>
      </svg>
    `).toString('base64')}`;
  }
}

// Function to generate unique QR Code ID
function generateQRCodeId(batchId: string, index: number, brandPrefix: string): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
  const paddedIndex = index.toString().padStart(6, '0');
  return `QR-${brandPrefix}-${timestamp}-${paddedIndex}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = generateSchema.parse(body);
    
    const {
      clientId,
      quantity,
      productName,
      companyName,
      manufacturerId,
      brandPrefix,
      customBatchNumber,
      enableCustomPage,
      customLogoUrl,
      additionalInfo,
      includeImages,
    } = validatedData;

    // Check if client exists and is active
    const client = await Client.findOne({ clientId: clientId });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    if (client.status !== 'active') {
      return NextResponse.json(
        { success: false, error: `Client is ${client.status}. Please activate the client first.` },
        { status: 400 }
      );
    }

    // Check monthly limit
    if (client.codesGenerated + quantity > client.monthlyLimit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Monthly limit exceeded. Available: ${client.monthlyLimit - client.codesGenerated} codes` 
        },
        { status: 400 }
      );
    }

    // Generate unique batch ID
    const batchId = await generateUniqueBatchId(brandPrefix, customBatchNumber);
    
    const generatedCodes = [];
    const csvRows = [['Index', 'QR Code ID', 'Scratch Code', 'Product Name', 'Company', 'Manufacturer ID', 'Batch ID', 'Verification URL']];
    
    // Parse additional info if provided
    let parsedAdditionalInfo = {};
    if (additionalInfo && additionalInfo.trim()) {
      try {
        parsedAdditionalInfo = JSON.parse(additionalInfo);
      } catch (e) {
        console.error('Error parsing additional info:', e);
        return NextResponse.json(
          { success: false, error: 'Invalid JSON in additional info field' },
          { status: 400 }
        );
      }
    }

    // Generate codes first to validate everything works
    const productCodesToCreate = [];
    const qrCodeIds = new Set(); // To ensure no duplicate QR Code IDs
    
    for (let i = 1; i <= quantity; i++) {
      // Generate unique QR Code ID
      let qrCodeId;
      let qrCodeAttempts = 0;
      const maxQrCodeAttempts = 10;
      
      do {
        qrCodeId = generateQRCodeId(batchId, i, brandPrefix);
        qrCodeAttempts++;
        
        // Check if this QR Code ID already exists in this batch
        if (!qrCodeIds.has(qrCodeId)) {
          break;
        }
        
        if (qrCodeAttempts >= maxQrCodeAttempts) {
          throw new Error('Failed to generate unique QR Code ID after multiple attempts');
        }
      } while (true);
      
      qrCodeIds.add(qrCodeId);
      
      // Generate scratch code WITHOUT HYPHENS
      const scratchCode = generateScratchCode();
      const scratchHash = generateHash(scratchCode);
      const qrCodeHash = generateHash(qrCodeId);
      
      // Generate verification URL - Your model requires this field
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify/${qrCodeId}`;
      
      // Generate QR code image
      const qrCodeImageData = includeImages ? await generateQRCodeImage(verificationUrl) : '';
      
      const codeData = {
        qrCodeId,
        qrCodeImage: qrCodeImageData,
        scratchCode,
        verificationUrl,
        productName,
        companyName,
        manufacturerId,
        batchId,
        index: i,
      };
      
      generatedCodes.push(codeData);
      
      csvRows.push([
        i.toString(),
        qrCodeId,
        scratchCode,
        productName,
        companyName,
        manufacturerId,
        batchId,
        verificationUrl
      ]);

      // Prepare product code for bulk insert - MATCH YOUR MODEL EXACTLY
      productCodesToCreate.push({
        qrCodeId,
        qrCodeHash,
        qrCodeImageData: qrCodeImageData,
        scratchCode: scratchCode, // Use scratchCode (required by your model)
        scratchCodeHash: scratchHash,
        batchId,
        productName,
        companyName,
        manufacturerId,
        brandPrefix,
        verificationUrl: verificationUrl, // REQUIRED by your model
        status: 'active',
        verificationCount: 0,
        firstVerifiedAt: null,
        lastVerifiedAt: null,
        customSuccessConfig: enableCustomPage ? {
          logoUrl: customLogoUrl || client.logoUrl || '',
          companyName,
          productName,
          batchNumber: batchId,
          additionalInfo: parsedAdditionalInfo,
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Start transaction - create batch first
    await Batch.create({
      batchId,
      manufacturerId,
      productName,
      companyName,
      quantity,
      generationDate: new Date(),
      codesGenerated: quantity,
      createdBy: 'admin', // You should get this from session
      customSuccessConfig: enableCustomPage ? {
        logoUrl: customLogoUrl || client.logoUrl || '',
        companyName,
        productName,
        batchNumber: batchId,
        additionalFields: parsedAdditionalInfo,
      } : undefined,
    });

    // Bulk insert all product codes - use ProductCode.create for validation
    if (productCodesToCreate.length > 0) {
      // Use Promise.all with create for better error handling
      const createPromises = productCodesToCreate.map(codeData => 
        ProductCode.create(codeData)
      );
      await Promise.all(createPromises);
    }

    // Update client's codes generated count
    await Client.findOneAndUpdate(
      { clientId: clientId },
      { 
        $inc: { codesGenerated: quantity },
        $set: { lastBatchDate: new Date() }
      }
    );

    // Generate CSV content
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    return NextResponse.json({
      success: true,
      codes: generatedCodes,
      totalGenerated: quantity,
      batchId,
      csvContent,
      message: `${quantity} QR codes generated successfully for ${companyName}`,
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    // Check for specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: any = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate QR codes', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}