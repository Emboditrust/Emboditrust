import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SMSVerification from '@/models/SMSVerification';
import ProductCode from '@/models/ProductCode';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const dateRange = searchParams.get('dateRange') || 'today';
    const status = searchParams.get('status');
    const result = searchParams.get('result');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = {};

    // Date range filter
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt = { $gte: startDate, $lt: endDate };
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        // No date filter
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    if (dateRange !== 'yesterday' && dateRange !== 'all') {
      query.createdAt = { $gte: startDate };
    }

    // Status filter
    if (status && status !== 'all') {
      query.smsStatus = status;
    }

    // Result filter
    if (result && result !== 'all') {
      query.verificationResult = result;
    }

    // Search filter
    if (search) {
      query.$or = [
        { phoneNumber: { $regex: search, $options: 'i' } },
        { formattedPhone: { $regex: search, $options: 'i' } },
        { sessionId: { $regex: search, $options: 'i' } },
        { scratchCode: { $regex: search, $options: 'i' } },
        { 'metadata.productName': { $regex: search, $options: 'i' } },
        { 'metadata.companyName': { $regex: search, $options: 'i' } },
        { 'metadata.batchId': { $regex: search, $options: 'i' } },
        { 'metadata.manufacturerId': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [verifications, total] = await Promise.all([
      SMSVerification.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      SMSVerification.countDocuments(query)
    ]);

    // Enhance verifications with product info
    const enhancedVerifications = await Promise.all(
      verifications.map(async (verification: any) => {
        let productInfo = {};
        
        if (verification.productCodeId) {
          const productCode = await ProductCode.findById(verification.productCodeId)
            .select('productName companyName batchId manufacturerId verificationCount firstVerifiedAt')
            .lean();
            
          if (productCode) {
            productInfo = {
              productName: productCode.productName,
              companyName: productCode.companyName,
              batchId: productCode.batchId,
              manufacturerId: productCode.manufacturerId,
              verificationCount: productCode.verificationCount,
              isFirstVerification: !productCode.firstVerifiedAt
            };
          }
        }

        return {
          id: verification._id.toString(),
          sessionId: verification.sessionId,
          phoneNumber: verification.phoneNumber,
          formattedPhone: verification.formattedPhone,
          countryCode: verification.countryCode,
          carrier: verification.carrier,
          network: verification.network,
          verificationResult: verification.verificationResult,
          smsStatus: verification.smsStatus,
          messageId: verification.messageId,
          smsCost: verification.smsCost || 0,
          ipAddress: verification.ipAddress,
          createdAt: verification.createdAt,
          completedAt: verification.completedAt,
          attempts: verification.attempts,
          ...productInfo
        };
      })
    );

    return NextResponse.json({
      success: true,
      verifications: enhancedVerifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Error fetching SMS verifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch verifications',
        error: error.message 
      },
      { status: 500 }
    );
  }
}