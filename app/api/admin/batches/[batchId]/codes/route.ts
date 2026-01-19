import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    // Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Await params before using it
    const { batchId } = await params;

    // Check if batch exists
    const batch = await Batch.findOne({ batchId }).lean();
    if (!batch) {
      return NextResponse.json(
        { success: false, message: 'Batch not found' },
        { status: 404 }
      );
    }

    // Fetch ALL codes for this batch without pagination
    const codes = await ProductCode.find({ batchId })
      .select('qrCodeId scratchCode scratchCodeFormatted productName companyName manufacturerId brandPrefix status createdAt firstVerifiedAt qrCodeImageData verificationUrl')
      .sort({ createdAt: 1 }) // Sort by creation date
      .lean();

    console.log(`Found ${codes.length} codes for batch ${batchId}`);

    // Format the response to match your Generate page format
    const formattedCodes = codes.map((code, index) => {
      // Use the actual scratch code from your model
      const scratchCode = code.scratchCode || code.scratchCodeFormatted || '';
      
      // Format scratch code - ensure it's 12 characters with dashes every 3 characters
      let formattedScratchCode = scratchCode;
      
      // If scratch code is 12 characters without dashes, add dashes every 3 chars
      if (scratchCode.length === 12 && !scratchCode.includes('-')) {
        formattedScratchCode = `${scratchCode.substring(0, 3)}-${scratchCode.substring(3, 6)}-${scratchCode.substring(6, 9)}-${scratchCode.substring(9, 12)}`;
      }
      // If scratch code is already formatted but with different format, standardize it
      else if (scratchCode.includes('-')) {
        // Remove existing dashes and re-format
        const cleanCode = scratchCode.replace(/-/g, '');
        if (cleanCode.length === 12) {
          formattedScratchCode = `${cleanCode.substring(0, 3)}-${cleanCode.substring(3, 6)}-${cleanCode.substring(6, 9)}-${cleanCode.substring(9, 12)}`;
        }
      }

      // FIXED: Use the verificationUrl field from the database
      // or generate it if not present
      const verificationUrl = code.verificationUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify/${code.qrCodeId}`;
      
      // FIXED: Generate QR code image URL using the verification URL, not JSON data
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

      return {
        qrCodeId: code.qrCodeId,
        scratchCode: formattedScratchCode,
        productName: code.productName || batch.productName,
        companyName: code.companyName || batch.companyName,
        batchId: batchId,
        manufacturerId: code.manufacturerId || batch.manufacturerId,
        brandPrefix: code.brandPrefix || '',
        verificationUrl: verificationUrl,
        qrCodeImage: qrCodeImageUrl, // FIXED: Use QR code image URL, not the JSON data
        index: index + 1,
        status: code.status || 'active',
        createdAt: code.createdAt,
        firstVerifiedAt: code.firstVerifiedAt,
      };
    });

    return NextResponse.json({
      success: true,
      codes: formattedCodes,
      batch: {
        id: batch._id,
        batchId: batch.batchId,
        productName: batch.productName,
        companyName: batch.companyName,
        manufacturerId: batch.manufacturerId,
        quantity: batch.quantity,
        generationDate: batch.generationDate,
        createdAt: batch.createdAt,
        codesGenerated: formattedCodes.length,
      },
      total: formattedCodes.length,
    });

  } catch (error: any) {
    console.error('Error fetching batch codes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch batch codes',
        error: error.message 
      },
      { status: 500 }
    );
  }
}