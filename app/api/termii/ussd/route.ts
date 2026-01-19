import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import SMSVerification from '@/models/SMSVerification';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const sessionId = crypto.randomUUID();
  
  try {
    // Parse form data from Termii USSD
    const formData = await request.formData();
    
    const sessionIdFromTermii = formData.get('session_id') as string;
    const phoneNumber = formData.get('phone_number') as string;
    const serviceCode = formData.get('service_code') as string;
    const text = formData.get('text') as string;
    const network = formData.get('network_code') as string;
    
    // Validate Termii signature
    const apiKey = request.headers.get('x-termii-api-key');
    const expectedApiKey = process.env.TERMII_API_KEY;
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return new NextResponse('END Invalid access', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('234') ? phoneNumber : `234${phoneNumber.substring(1)}`;

    if (!text) {
      // Welcome screen - first interaction
      return new NextResponse(
        `CON Welcome to Emboditrust\n` +
        `Product Authentication Service\n\n` +
        `Enter 12-digit scratch code:\n` +
        `(From silver panel on product)\n\n` +
        `Example: ABCD1234EFGH`,
        {
          headers: { 
            'Content-Type': 'text/plain',
            'X-Session-ID': sessionId 
          }
        }
      );
    }

    const steps = text.split('*');
    const currentStep = steps.length;
    const scratchCode = steps[0].toUpperCase().replace(/-/g, '').trim();

    if (currentStep === 1) {
      // User entered scratch code
      if (scratchCode.length !== 12) {
        return new NextResponse(
          `CON Invalid code length.\n` +
          `Must be exactly 12 characters.\n\n` +
          `Enter scratch code again:\n` +
          `(Example: ABCD1234EFGH)`,
          {
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }

      if (!/^[A-Z0-9]{12}$/.test(scratchCode)) {
        return new NextResponse(
          `CON Invalid characters.\n` +
          `Use only letters A-Z and numbers 0-9.\n\n` +
          `Enter scratch code again:`,
          {
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }

      await connectDB();

      // Create hash
      const scratchHash = crypto.createHash('sha256')
        .update(scratchCode)
        .digest('hex');

      // Check recent verification
      const recentVerification = await SMSVerification.findOne({
        scratchCodeHash: scratchHash,
        phoneNumber: formattedPhone,
        createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
      });

      if (recentVerification) {
        return new NextResponse(
          `END Recent verification found:\n\n` +
          `Code: ${scratchCode}\n` +
          `Result: ${recentVerification.getStatusText()}\n` +
          `Time: ${recentVerification.time}\n\n` +
          `If suspicious, call 0800-EMBODI`,
          {
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }

      // Search product
      const productCode = await ProductCode.findOne({
        scratchCodeHash: scratchHash,
        status: { $in: ['active', 'verified'] }
      }).lean();

      // Create verification record
      const verification = new SMSVerification({
        sessionId,
        phoneNumber: formattedPhone,
        formattedPhone: `+${formattedPhone}`,
        countryCode: 'NG',
        carrier: network,
        network,
        scratchCode: scratchCode,
        scratchCodeHash: scratchHash,
        productCodeId: productCode?._id,
        verificationResult: 'pending',
        smsStatus: 'pending',
        ipAddress: 'ussd-gateway',
        userAgent: `TERMII-USSD:${network}`,
        location: { country: 'NG' },
        attempts: 1,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      if (productCode) {
        const isFirstVerification = !productCode.firstVerifiedAt;
        const verificationResult = isFirstVerification ? 'valid' : 'already_used';

        // Update product
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

        verification.verificationResult = verificationResult;
        verification.metadata = {
          productName: productCode.productName,
          companyName: productCode.companyName,
          batchId: productCode.batchId,
          verificationCount: updateData.verificationCount,
          isFirstVerification
        };

        await verification.save();

        if (verificationResult === 'valid') {
          return new NextResponse(
            `END ✅ AUTHENTIC PRODUCT\n\n` +
            `${productCode.productName}\n` +
            `by ${productCode.companyName}\n` +
            `Batch: ${productCode.batchId}\n\n` +
            `✓ First verification\n` +
            `✓ Genuine pharmaceutical\n\n` +
            `Keep this confirmation.\n` +
            `Report issues: 0800-EMBODI`,
            {
              headers: { 'Content-Type': 'text/plain' }
            }
          );
        } else {
          return new NextResponse(
            `END ⚠️ PREVIOUSLY VERIFIED\n\n` +
            `${productCode.productName}\n` +
            `Batch: ${productCode.batchId}\n\n` +
            `First verified: ${new Date(productCode.firstVerifiedAt).toLocaleDateString()}\n` +
            `Total verifications: ${updateData.verificationCount}\n\n` +
            `If unexpected, may be counterfeit.\n` +
            `Report: 0800-EMBODI`,
            {
              headers: { 'Content-Type': 'text/plain' }
            }
          );
        }

      } else {
        // Invalid code
        verification.verificationResult = 'invalid';
        await verification.save();

        return new NextResponse(
          `END ❌ PRODUCT NOT FOUND\n\n` +
          `Code: ${scratchCode}\n\n` +
          `Not in genuine products database.\n` +
          `Possible counterfeit.\n\n` +
          `DO NOT USE THIS PRODUCT\n\n` +
          `REPORT IMMEDIATELY:\n` +
          `0800-EMBODI (362634)\n\n` +
          `Your safety is important.`,
          {
            headers: { 'Content-Type': 'text/plain' }
          }
        );
      }

    } else if (currentStep === 2 && steps[1] === '1') {
      // Help option
      return new NextResponse(
        `END Emboditrust Verification Help\n\n` +
        `Scratch code is 12 characters\n` +
        `under silver panel on product.\n\n` +
        `Format: ABCD1234EFGH\n\n` +
        `Send SMS: SCRATCH CODE to 34568\n` +
        `Or dial *347*758#\n\n` +
        `Support: 0800-EMBODI`,
        {
          headers: { 'Content-Type': 'text/plain' }
        }
      );
    }

    // Default error
    return new NextResponse(
      `END Session expired.\n\n` +
      `Please restart:\n` +
      `Dial *347*758#\n\n` +
      `Or send SMS to 34568`,
      {
        headers: { 'Content-Type': 'text/plain' }
      }
    );

  } catch (error: any) {
    console.error('USSD processing error:', {
      sessionId,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(
      `END System error.\n\n` +
      `Please try again later.\n` +
      `For help: 0800-EMBODI`,
      {
        headers: { 'Content-Type': 'text/plain' }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  return new NextResponse(
    `Termii USSD Webhook Endpoint\n\n` +
    `Status: ✅ Active\n` +
    `USSD Code: ${process.env.TERMII_USSD_CODE || '*347*758#'}\n` +
    `Time: ${new Date().toISOString()}`,
    {
      headers: { 'Content-Type': 'text/plain' }
    }
  );
}