import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import SMSVerification from '@/models/SMSVerification';
import crypto from 'crypto';
import { SMSService } from '@/lib/services/sms.service';

export async function POST(request: NextRequest) {
  const sessionId = crypto.randomBytes(16).toString('hex');
  
  try {
    // Parse form data from Termii
    const formData = await request.formData();
    
    const from = formData.get('from') as string;
    const to = formData.get('to') as string;
    const text = (formData.get('text') as string || '').trim();
    const messageId = formData.get('message_id') as string;
    const timestamp = formData.get('timestamp') as string;
    const network = formData.get('network') as string;
    const networkCode = formData.get('network_code') as string;

    console.log('Termii SMS received:', {
      sessionId,
      from,
      to,
      text,
      messageId,
      timestamp,
      network,
      networkCode,
      receivedAt: new Date().toISOString()
    });

    // Validate required fields
    if (!from || !text) {
      return termiiResponse(
        `Invalid request. Missing required fields.`,
        sessionId
      );
    }

    // Validate Termii signature (optional but recommended)
    const apiKey = request.headers.get('x-termii-api-key');
    const expectedApiKey = process.env.TERMII_API_KEY;
    
    if (apiKey && expectedApiKey && apiKey !== expectedApiKey) {
      console.warn('Invalid Termii API key:', {
        sessionId,
        received: apiKey?.substring(0, 10),
        expected: expectedApiKey?.substring(0, 10)
      });
      // Continue anyway, but log the warning
    }

    // Parse message
    const message = text.toUpperCase();
    
    // HELP command
    if (message === 'HELP' || message === '?') {
      return termiiResponse(
        `EMBODITRUST PRODUCT VERIFICATION\n\n` +
        `To verify:\n` +
        `Send: SCRATCH <12-DIGIT-CODE>\n` +
        `Example: SCRATCH ABCD1234EFGH\n\n` +
        `Code under scratch panel.\n` +
        `Free service. SMS rates apply.\n\n` +
        `Report fakes: 0800-EMBODI`,
        sessionId
      );
    }

    // Check for SCRATCH command
    if (!message.startsWith('SCRATCH ')) {
      return termiiResponse(
        `Invalid format.\n\n` +
        `Send: SCRATCH <12-digit-code>\n` +
        `Example: SCRATCH ABCD1234EFGH\n\n` +
        `Send HELP for help.`,
        sessionId
      );
    }

    // Extract scratch code
    const scratchCode = message.replace('SCRATCH ', '')
      .replace(/-/g, '')
      .replace(/\s/g, '')
      .substring(0, 12);

    if (scratchCode.length !== 12) {
      return termiiResponse(
        `Invalid code length.\n` +
        `Must be 12 characters.\n\n` +
        `Example: SCRATCH ABCD1234EFGH\n` +
        `Your code: ${scratchCode} (${scratchCode.length} chars)`,
        sessionId
      );
    }

    await connectDB();

    // Create hash for security
    const scratchHash = crypto.createHash('sha256')
      .update(scratchCode)
      .digest('hex');

    // Check for duplicate recent verification
    const recentVerification = await SMSVerification.findOne({
      scratchCodeHash: scratchHash,
      phoneNumber: from,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (recentVerification) {
      return termiiResponse(
        `Recently verified.\n\n` +
        `Code: ${scratchCode}\n` +
        `Result: ${recentVerification.verificationResult}\n` +
        `Time: ${recentVerification.createdAt.toLocaleTimeString()}\n\n` +
        `If suspicious, call 0800-EMBODI`,
        sessionId
      );
    }

    // Search for product code
    const productCode = await ProductCode.findOne({
      scratchCodeHash: scratchHash,
      status: { $in: ['active', 'verified'] }
    }).lean();

    // Create verification record
    const verification = new SMSVerification({
      sessionId,
      phoneNumber: from,
      formattedPhone: from,
      countryCode: 'NG',
      carrier: network,
      network: networkCode,
      scratchCode: scratchCode,
      scratchCodeHash: scratchHash,
      productCodeId: productCode?._id,
      verificationResult: 'pending',
      smsStatus: 'pending',
      ipAddress: 'sms-gateway',
      userAgent: `TERMII-SMS:${network}`,
      location: { country: 'NG' },
      attempts: 1,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    let verificationResult: 'valid' | 'invalid' | 'already_used' = 'invalid';
    let responseMessage = '';

    if (productCode) {
      const isFirstVerification = !productCode.firstVerifiedAt;
      verificationResult = isFirstVerification ? 'valid' : 'already_used';

      // Update product code
      const updateData: any = {
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
        verificationCount: (productCode.verificationCount || 0) + 1
      };

      if (isFirstVerification) {
        updateData.firstVerifiedAt = new Date();
        updateData.status = 'verified';
      }

      await ProductCode.findByIdAndUpdate(productCode._id, { $set: updateData });

      verification.metadata = {
        productName: productCode.productName,
        companyName: productCode.companyName,
        batchId: productCode.batchId,
        verificationCount: updateData.verificationCount,
        isFirstVerification
      };

      if (verificationResult === 'valid') {
        responseMessage = `✅ GENUINE PRODUCT\n\n` +
          `${productCode.productName}\n` +
          `Manufacturer: ${productCode.companyName}\n` +
          `Batch: ${productCode.batchId}\n\n` +
          `✓ First verification\n` +
          `Keep as proof.\n` +
          `Report issues: 0800-EMBODI`;
      } else {
        responseMessage = `⚠️ PREVIOUSLY VERIFIED\n\n` +
          `${productCode.productName}\n` +
          `Batch: ${productCode.batchId}\n\n` +
          `First verified: ${new Date(productCode.firstVerifiedAt).toLocaleDateString()}\n` +
          `Total verifications: ${updateData.verificationCount}\n\n` +
          `If unexpected, may be counterfeit.\n` +
          `Report: 0800-EMBODI`;
      }
    } else {
      // Invalid code
      verificationResult = 'invalid';
      
      responseMessage = `❌ PRODUCT NOT FOUND\n\n` +
        `Code: ${scratchCode}\n\n` +
        `Not in genuine products database.\n` +
        `Possible counterfeit.\n\n` +
        `DO NOT USE\n\n` +
        `REPORT: 0800-EMBODI`;
    }

    // Update verification record
    verification.verificationResult = verificationResult;
    verification.smsStatus = 'sent';
    verification.messageId = messageId;
    verification.completedAt = new Date();
    verification.smsCost = 4.50; // Estimated cost

    await verification.save();

    console.log('SMS verification completed:', {
      sessionId,
      phone: from,
      code: scratchCode,
      result: verificationResult,
      product: productCode?.productName || 'none',
      timestamp: new Date().toISOString()
    });

    return termiiResponse(responseMessage, sessionId);

  } catch (error: any) {
    console.error('Termii SMS processing error:', {
      sessionId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Try to save failed attempt
    try {
      await connectDB();
      
      const failedVerification = new SMSVerification({
        sessionId,
        phoneNumber: 'unknown',
        formattedPhone: 'unknown',
        countryCode: 'NG',
        scratchCode: 'unknown',
        scratchCodeHash: crypto.createHash('sha256').update('unknown').digest('hex'),
        verificationResult: 'failed',
        smsStatus: 'failed',
        ipAddress: 'unknown',
        userAgent: 'Termii-Error',
        attempts: 1,
        completedAt: new Date()
      });
      
      await failedVerification.save();
    } catch (dbError) {
      console.error('Failed to save error record:', dbError);
    }

    return termiiResponse(
      `System error. Please try again.\n\n` +
      `For help: 0800-EMBODI`,
      sessionId
    );
  }
}

function termiiResponse(message: string, sessionId?: string): NextResponse {
  // Truncate if too long (SMS limit)
  const maxLength = 160;
  const truncatedMessage = message.length > maxLength 
    ? message.substring(0, maxLength - 3) + '...'
    : message;

  return new NextResponse(truncatedMessage, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': Buffer.byteLength(truncatedMessage).toString(),
      'X-Session-ID': sessionId || 'unknown',
      'X-Timestamp': new Date().toISOString()
    }
  });
}

export async function GET(request: NextRequest) {
  return new NextResponse(
    `Termii SMS Webhook Endpoint\n\n` +
    `Status: ✅ Active\n` +
    `Service: Product Authentication\n` +
    `Instructions: Send "SCRATCH <CODE>" to verify\n` +
    `Time: ${new Date().toISOString()}`,
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  );
}