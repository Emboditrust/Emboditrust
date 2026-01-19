// app/verify/[qrCodeId]/page.tsx - Updated to include location
import { notFound } from 'next/navigation';
import VerificationClientPage from './VerificationClientPage';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import VerificationAttempt from '@/models/VerificationAttempt';
import Batch from '@/models/Batch';
import Client from '@/models/Client';
import { headers } from 'next/headers';

// Function to get geolocation (same as above)
async function getGeolocationFromIP(ipAddress: string) {
  if (ipAddress === 'unknown' || 
      ipAddress === '127.0.0.1' || 
      ipAddress.startsWith('192.168.') || 
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('172.') ||
      ipAddress === '::1') {
    return null;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)'
      },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
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
    
    return null;
  } catch (error) {
    console.warn(`Geolocation fetch failed for IP ${ipAddress}:`, error);
    return null;
  }
}

export default async function VerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ qrCodeId: string }>;
  searchParams: Promise<{ scratch?: string }>;
}) {
  const { qrCodeId } = await params;
  const { scratch } = await searchParams;
  
  // Get client IP and user agent
  const headersList = await headers();
  
  const forwardedFor = headersList.get('x-forwarded-for');
  let ipAddress = 'unknown';
  
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim();
  } else {
    ipAddress = headersList.get('x-real-ip') || 
               headersList.get('cf-connecting-ip') ||
               'unknown';
  }
  
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  await connectDB();
  
  // Find the product code
  const productCode = await ProductCode.findOne({ qrCodeId }).lean();
  
  if (!productCode) {
    // Log invalid attempt with QR code and location
    const locationData = await getGeolocationFromIP(ipAddress);
    
    await VerificationAttempt.create({
      timestamp: new Date(),
      scannedCode: qrCodeId,
      scratchCode: 'N/A',
      result: 'invalid',
      ipAddress: ipAddress,
      userAgent: userAgent,
      location: locationData
    });
    notFound();
  }

  // Get batch and client info
  const [batch, client] = await Promise.all([
    Batch.findOne({ batchId: productCode.batchId }).lean(),
    Client.findOne({ manufacturerId: productCode.manufacturerId }).lean()
  ]);

  // Log the QR scan attempt with location
  const locationData = await getGeolocationFromIP(ipAddress);
  
  await VerificationAttempt.create({
    timestamp: new Date(),
    scannedCode: qrCodeId,
    scratchCode: 'pending',
    result: 'scanned',
    ipAddress: ipAddress,
    userAgent: userAgent,
    location: locationData
  });

  // Prepare data for client component
  const verificationData = {
    productCode: {
      qrCodeId: productCode.qrCodeId,
      scratchCode: productCode.scratchCode || '',
      productName: productCode.productName,
      companyName: productCode.companyName,
      manufacturerId: productCode.manufacturerId,
      batchId: productCode.batchId,
      status: productCode.status,
      verificationCount: productCode.verificationCount || 0,
      firstVerifiedAt: productCode.firstVerifiedAt,
      lastVerifiedAt: productCode.lastVerifiedAt,
      isFirstVerification: !productCode.firstVerifiedAt
    },
    batch: batch ? {
      batchId: batch.batchId,
      productName: batch.productName,
      generationDate: batch.generationDate,
      quantity: batch.quantity
    } : null,
    client: client ? {
      companyName: client.companyName,
      registrationNumber: client.registrationNumber,
      website: client.website
    } : null
  };

  return (
    <VerificationClientPage 
      verificationData={verificationData} 
      qrCodeId={qrCodeId}
      scratchCodeParam={scratch}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ qrCodeId: string }> }) {
  const { qrCodeId } = await params;
  
  await connectDB();
  const productCode = await ProductCode.findOne({ qrCodeId }).lean();
  
  if (!productCode) {
    return {
      title: 'Product Not Found - EmbodiTrust',
      description: 'The product verification code could not be found.',
    };
  }

  const statusText = productCode.status === 'verified' ? 'Verified Product' : 
                    productCode.status === 'active' ? 'Authentic Product' : 
                    productCode.status === 'suspected_counterfeit' ? 'Suspected Counterfeit Product' : 
                    'Product Verification';
  
  const title = `${statusText}: ${productCode.productName} - EmbodiTrust`;
  const description = `Verify the authenticity of ${productCode.productName} manufactured by ${productCode.companyName}.`;

  return {
    title,
    description
  };
}