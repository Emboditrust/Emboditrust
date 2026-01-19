// app/api/verify/log-attempt/route.ts - Full updated code
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationAttempt from '@/models/VerificationAttempt';
import { headers } from 'next/headers';

// Function to get geolocation from IP
async function getGeolocationFromIP(ipAddress: string) {
  // Skip localhost or private IPs
  if (ipAddress === 'unknown' || 
      ipAddress === '127.0.0.1' || 
      ipAddress.startsWith('192.168.') || 
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.') ||
      ipAddress === '::1') {
    return null;
  }

  try {
    // Using ip-api.com (free, rate limited: 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
      },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (!response.ok) {
      console.warn(`IP API returned status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        organization: data.org
      };
    }
    
    console.warn(`IP API error for IP ${ipAddress}: ${data.message}`);
    return null;
  } catch (error) {
    console.warn(`Geolocation fetch failed for IP ${ipAddress}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { qrCodeId, scratchCode, result } = body;
    
    if (!qrCodeId) {
      return NextResponse.json(
        { success: false, message: 'QR Code ID is required' },
        { status: 400 }
      );
    }
    
    if (!scratchCode) {
      return NextResponse.json(
        { success: false, message: 'Scratch code is required' },
        { status: 400 }
      );
    }
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Result is required' },
        { status: 400 }
      );
    }
    
    const headersList = await headers();
    
    // Get the real IP address (handling proxies)
    const forwardedFor = headersList.get('x-forwarded-for');
    let ipAddress = 'unknown';
    
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      ipAddress = forwardedFor.split(',')[0].trim();
    } else {
      ipAddress = headersList.get('x-real-ip') || 
                 headersList.get('cf-connecting-ip') ||
                 'unknown';
    }
    
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Validate result value
    const validResults = ['scanned', 'valid', 'invalid', 'already_used', 'suspected_counterfeit'];
    if (!validResults.includes(result)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid result value. Must be one of: scanned, valid, invalid, already_used, suspected_counterfeit' 
        },
        { status: 400 }
      );
    }
    
    // Get geolocation data
    let locationData = null;
    if (ipAddress !== 'unknown') {
      locationData = await getGeolocationFromIP(ipAddress);
    }
    
    // Create the verification attempt
    const attempt = await VerificationAttempt.create({
      timestamp: new Date(),
      scannedCode: qrCodeId,
      scratchCode: scratchCode,
      result: result,
      ipAddress: ipAddress,
      userAgent: userAgent,
      location: locationData
    });
    
    return NextResponse.json({
      success: true,
      message: 'Verification attempt logged successfully',
      attempt: {
        id: attempt._id.toString(),
        timestamp: attempt.timestamp,
        scannedCode: attempt.scannedCode,
        scratchCode: attempt.scratchCode,
        result: attempt.result,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        location: attempt.location
      }
    });
    
  } catch (error: any) {
    console.error('Error logging verification attempt:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          error: error.message 
        },
        { status: 400 }
      );
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Duplicate verification attempt',
          error: 'This verification attempt already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to log verification attempt',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}



export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const isAdmin = authHeader?.startsWith('Bearer ') && 
                   authHeader?.slice(7) === process.env.ADMIN_API_KEY;
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const qrCodeId = searchParams.get('qrCodeId');
    const scratchCode = searchParams.get('scratchCode');
    const result = searchParams.get('result');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const ipAddress = searchParams.get('ipAddress');
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const query: any = {};
    
    if (qrCodeId) {
      query.scannedCode = qrCodeId;
    }
    
    if (scratchCode) {
      query.scratchCode = scratchCode;
    }
    
    if (result) {
      query.result = result;
    }
    
    if (ipAddress) {
      query.ipAddress = ipAddress;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const skip = (page - 1) * limit;
    
    const attempts = await VerificationAttempt.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await VerificationAttempt.countDocuments(query);
    
    const stats = {
      totalAttempts: total,
      valid: await VerificationAttempt.countDocuments({ ...query, result: 'valid' }),
      invalid: await VerificationAttempt.countDocuments({ ...query, result: 'invalid' }),
      already_used: await VerificationAttempt.countDocuments({ ...query, result: 'already_used' }),
      suspected_counterfeit: await VerificationAttempt.countDocuments({ ...query, result: 'suspected_counterfeit' }),
      scanned: await VerificationAttempt.countDocuments({ ...query, result: 'scanned' }),
      uniqueQRCodes: await VerificationAttempt.distinct('scannedCode', query).then(codes => codes.length),
      uniqueScratchCodes: await VerificationAttempt.distinct('scratchCode', query).then(codes => codes.length),
      uniqueIPs: await VerificationAttempt.distinct('ipAddress', query).then(ips => ips.length)
    };
    
    return NextResponse.json({
      success: true,
      attempts: attempts.map(attempt => ({
        id: attempt._id.toString(),
        timestamp: attempt.timestamp,
        scannedCode: attempt.scannedCode,
        scratchCode: attempt.scratchCode,
        result: attempt.result,
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        location: attempt.location
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });
    
  } catch (error: any) {
    console.error('Error fetching verification attempts:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch verification attempts',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    const isAdmin = authHeader?.startsWith('Bearer ') && 
                   authHeader?.slice(7) === process.env.ADMIN_API_KEY;
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Attempt ID is required for deletion' },
        { status: 400 }
      );
    }
    
    const result = await VerificationAttempt.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Verification attempt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification attempt deleted successfully',
      deletedId: id
    });
    
  } catch (error: any) {
    console.error('Error deleting verification attempt:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete verification attempt',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}