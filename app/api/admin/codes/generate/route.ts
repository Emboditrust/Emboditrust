import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { CodeGenerator } from '@/utils/codeGenerator';
import { Security } from '@/utils/security';
import connectDB from '@/lib/mongodb';
import Code from '@/models/Code';
import Batch from '@/models/Batch';
import { codeGenerationSchema } from '@/schemas/code-generation';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using NextAuth session
    const authResult = await verifySession(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to access this resource' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = codeGenerationSchema.parse(body);

    // Generate batch ID
    const batchId = Security.generateBatchId();

    const codes = [];
    const hashedCodes = [];

    // Generate codes in batches to avoid memory issues
    const batchSize = 1000;
    const totalBatches = Math.ceil(validatedData.quantity / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, validatedData.quantity);
      const batchCount = batchEnd - batchStart;

      // Generate codes for this batch
      const rawCodes = CodeGenerator.generateBatch(batchCount, validatedData.brandPrefix);
      
      for (const rawCode of rawCodes) {
        const hashedCode = await Security.hashCode(rawCode);
        
        codes.push(rawCode);
        
        const codeDoc = new Code({
          hashedCode,
          status: 'active',
          batchId,
          brandPrefix: validatedData.brandPrefix,
          productName: validatedData.productName,
          companyName: validatedData.companyName,
          manufacturerId: validatedData.manufacturerId,
          createdBy: authResult.user.id,
          customSuccessPage: validatedData.enableCustomSuccess && validatedData.customSuccessConfig ? {
            enabled: true,
            ...validatedData.customSuccessConfig,
          } : { enabled: false },
        });

        hashedCodes.push(codeDoc);
      }

      // Save this batch to avoid memory issues
      if (hashedCodes.length >= 500) {
        await Code.insertMany(hashedCodes);
        hashedCodes.length = 0; // Clear array
      }
    }

    // Save any remaining codes
    if (hashedCodes.length > 0) {
      await Code.insertMany(hashedCodes);
    }

    // Create batch record
    const batch = new Batch({
      batchId,
      manufacturerId: validatedData.manufacturerId,
      productName: validatedData.productName,
      companyName: validatedData.companyName,
      quantity: validatedData.quantity,
      codesGenerated: validatedData.quantity,
      createdBy: authResult.user.id,
      customSuccessConfig: validatedData.enableCustomSuccess ? validatedData.customSuccessConfig : undefined,
    });

    await batch.save();

    // Return CSV data for printing
    const csvHeader = 'Verification Code\n';
    const csvContent = csvHeader + codes.join('\n');
    
    return NextResponse.json({
      success: true,
      batchId,
      codesGenerated: validatedData.quantity,
      csvContent,
      downloadUrl: `/api/admin/codes/download/${batchId}`,
      batchDetails: {
        productName: validatedData.productName,
        companyName: validatedData.companyName,
        manufacturerId: validatedData.manufacturerId,
        generationDate: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Code generation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors,
          message: 'Please check your input values'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to generate codes'
      },
      { status: 500 }
    );
  }
}