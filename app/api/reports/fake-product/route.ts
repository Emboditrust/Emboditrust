// app/api/reports/fake-product/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FakeProductReport from '@/models/FakeProductReport';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CloudinaryService } from '@/utils/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    
    const reportData = {
      reporterEmail: formData.get('email') as string,
      reporterPhone: formData.get('phone') as string,
      productName: formData.get('productName') as string,
      purchaseLocation: formData.get('purchaseLocation') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      additionalInfo: formData.get('additionalInfo') as string,
      qrCodeId: formData.get('qrCodeId') as string,
      scratchCode: formData.get('scratchCode') as string,
      productPhoto: formData.get('productPhoto') as File | null,
    };

    if (!reportData.productName?.trim() || !reportData.purchaseLocation?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Product name and purchase location are required' },
        { status: 400 }
      );
    }

    let productPhotoUrl = '';
    
    if (reportData.productPhoto) {
      try {
        const bytes = await reportData.productPhoto.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${reportData.productPhoto.type};base64,${buffer.toString('base64')}`;
        
        const publicId = `emboditrust/fake-reports/${uuidv4()}`;
        
        const uploadResult = await CloudinaryService.uploadQRCode(
          base64Image,
          publicId,
          'emboditrust/fake-reports'
        );
        
        productPhotoUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    // Get IP address from headers
    const headersList = request.headers;
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    if (reportData.qrCodeId) {
      await ProductCode.findOneAndUpdate(
        { qrCodeId: reportData.qrCodeId },
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
        scannedCode: reportData.qrCodeId,
        scratchCode: reportData.scratchCode || 'N/A',
        result: 'suspected_counterfeit',
        ipAddress,
        userAgent
      });
    }

    const report = new FakeProductReport({
      reporterEmail: reportData.reporterEmail?.trim() || undefined,
      reporterPhone: reportData.reporterPhone?.trim() || undefined,
      productName: reportData.productName.trim(),
      purchaseLocation: reportData.purchaseLocation.trim(),
      purchaseDate: reportData.purchaseDate ? new Date(reportData.purchaseDate) : undefined,
      additionalInfo: reportData.additionalInfo?.trim() || undefined,
      qrCodeId: reportData.qrCodeId?.trim() || undefined,
      scratchCode: reportData.scratchCode?.trim() || undefined,
      productPhotoUrl: productPhotoUrl || undefined,
      status: 'pending',
      priority: 'high',
    });

    await report.save();

    return NextResponse.json({
      success: true,
      message: 'Counterfeit product report submitted successfully',
      reportId: report._id
    });

  } catch (error: any) {
    console.error('Error submitting fake product report:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit report',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};
    if (status) query.status = status;

    const reports = await FakeProductReport.find(query)
      .sort({ createdAt: -1, priority: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await FakeProductReport.countDocuments(query);

    return NextResponse.json({
      success: true,
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error('Error fetching fake product reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch reports',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { reportId, status, priority, adminNotes, assignedTo } = body;

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const report = await FakeProductReport.findByIdAndUpdate(
      reportId,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully',
      report
    });

  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update report',
        error: error.message 
      },
      { status: 500 }
    );
  }
}