// app/api/reports/fake-product/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FakeProductReport from '@/models/FakeProductReport';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CloudinaryService } from '@/utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    // Extract form data - use correct field names
    const reporterEmail = formData.get('email') as string;
    const reporterPhone = formData.get('phone') as string;
    const productName = formData.get('productName') as string;
    const purchaseLocation = formData.get('purchaseLocation') as string;
    const additionalInfo = formData.get('additionalInfo') as string;
    const qrCodeId = formData.get('qrCodeId') as string;
    const scratchCode = formData.get('scratchCode') as string;
    const productPhoto = formData.get('productPhoto') as File | null;

    // Debug logging
    console.log('Received form data:', {
      reporterEmail,
      reporterPhone,
      productName,
      purchaseLocation,
      qrCodeId,
      scratchCode,
      hasPhoto: !!productPhoto
    });

    // Validate required fields
    if (!productName?.trim() || !purchaseLocation?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product name and purchase location are required' },
        { status: 400 }
      );
    }

    // Validate at least one contact method
    if (!reporterEmail?.trim() && !reporterPhone?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Either email or phone number is required' },
        { status: 400 }
      );
    }

    let productPhotoUrl = '';
    
    // Handle image upload if present
    if (productPhoto && productPhoto.size > 0) {
      try {
        const bytes = await productPhoto.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${productPhoto.type};base64,${buffer.toString('base64')}`;
        
        const publicId = `emboditrust/fake-reports/${uuidv4()}`;
        
        const uploadResult = await CloudinaryService.uploadQRCode(
          base64Image,
          publicId,
          'emboditrust/fake-reports'
        );
        
        productPhotoUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Continue without photo if upload fails
      }
    }

    // Get IP address from headers
    const headersList = request.headers;
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Update product code status if qrCodeId exists
    if (qrCodeId) {
      await ProductCode.findOneAndUpdate(
        { qrCodeId: qrCodeId },
        { 
          $set: { 
            status: 'suspected_counterfeit',
            lastVerifiedAt: new Date()
          },
          $inc: { verificationCount: 1 }
        }
      );

      await VerificationAttempt.create({
        timestamp: new Date(),
        scannedCode: qrCodeId,
        scratchCode: scratchCode || 'N/A',
        result: 'suspected_counterfeit',
        ipAddress,
        userAgent
      });
    }

    // Create the fake product report
    const report = new FakeProductReport({
      reporterEmail: reporterEmail?.trim() || undefined,
      reporterPhone: reporterPhone?.trim() || undefined,
      productName: productName.trim(),
      purchaseLocation: purchaseLocation.trim(),
      additionalInfo: additionalInfo?.trim() || undefined,
      qrCodeId: qrCodeId?.trim() || undefined,
      scratchCode: scratchCode?.trim() || undefined,
      productPhotoUrl: productPhotoUrl || undefined,
      status: 'pending',
      priority: 'high',
    });

    await report.save();
    console.log('Report saved successfully:', report._id);

    // Create a message from this report
    let message = null;
    const contactEmail = reporterEmail?.trim() || 'anonymous@emboditrust.com';
    
    const messageContent = `
      New counterfeit product report submitted:
      
      Product Name: ${productName}
      Purchase Location: ${purchaseLocation}
      
      Reporter Contact:
      ${reporterEmail ? `Email: ${reporterEmail}` : ''}
      ${reporterPhone ? `Phone: ${reporterPhone}` : ''}
      
      ${additionalInfo ? `Additional Information:\n${additionalInfo}` : ''}
      
      ${qrCodeId ? `QR Code ID: ${qrCodeId}` : ''}
      ${scratchCode ? `Scratch Code: ${scratchCode}` : ''}
      
      Report ID: ${report._id}
      Submitted via public verification form.
    `;

    message = new Message({
      senderId: `report_${report._id}`,
      senderEmail: contactEmail,
      senderName: reporterEmail ? 'Product Reporter' : 'Anonymous Reporter',
      senderRole: 'user',
      receiverEmail: 'admin@emboditrust.com',
      subject: `🚨 Counterfeit Report: ${productName}`,
      content: messageContent.trim(),
      relatedReport: report._id,
      status: 'sent',
      sentVia: 'system',
    });

    await message.save();

    // Update report with message ID
    report.messageId = message._id;
    await report.save();

    return NextResponse.json({
      success: true,
      message: 'Counterfeit product report submitted successfully',
      reportId: report._id,
      messageId: message?._id
    });

  } catch (error: any) {
    console.error('Error submitting fake product report:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to submit report';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed: ' + Object.values(error.errors).map((e: any) => e.message).join(', ');
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.message 
      },
      { status: 500 }
    );
  }
}