// app/api/admin/dashboard/clients/top/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get top 10 clients by product count and verification count
    const topClients = await Client.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $lookup: {
          from: 'productcodes',
          localField: 'manufacturerId',
          foreignField: 'manufacturerId',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'verificationattempts',
          let: { clientProducts: '$products.qrCodeId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$scannedCode', '$$clientProducts']
                },
                result: { $in: ['valid', 'already_used'] }
              }
            }
          ],
          as: 'verifications'
        }
      },
      {
        $project: {
          companyName: 1,
          manufacturerId: 1,
          brandPrefix: 1,
          productCount: { $size: '$products' },
          totalVerifications: { $size: '$verifications' },
          monthlyLimit: 1,
          codesGenerated: 1,
          status: 1,
          createdAt: 1
        }
      },
      {
        $sort: {
          totalVerifications: -1
        }
      },
      {
        $limit: 10
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: topClients,
      count: topClients.length
    });
    
  } catch (error: any) {
    console.error('Error fetching top clients:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch top clients',
        error: error.message 
      },
      { status: 500 }
    );
  }
}