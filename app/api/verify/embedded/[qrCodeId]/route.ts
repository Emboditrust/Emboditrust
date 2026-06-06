import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import Client from '@/models/Client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params;
    await connectDB();

    const productCode = await ProductCode.findOne({ qrCodeId }).lean();
    if (!productCode) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }

    const [batch, client] = await Promise.all([
      Batch.findOne({ batchId: productCode.batchId }).lean(),
      Client.findOne({ manufacturerId: productCode.manufacturerId }).lean(),
    ]);

    const customConfig = (batch as any)?.customSuccessConfig || {};
    const additional = customConfig.additionalFields || {};

    const productMetadata: Record<string, string> = {};
    if (productCode.productName) productMetadata['Product Name'] = productCode.productName;
    if ((batch as any)?.sku) productMetadata['SKU'] = (batch as any).sku;
    if (productCode.batchId) productMetadata['Batch'] = productCode.batchId;
    if ((batch as any)?.serialNumber) productMetadata['Serial'] = (batch as any).serialNumber;
    if ((batch as any)?.manufacturingDate) productMetadata['Manufacturing Date'] = new Date((batch as any).manufacturingDate).toLocaleDateString();
    if ((batch as any)?.expiryDate) productMetadata['Expiry Date'] = new Date((batch as any).expiryDate).toLocaleDateString();
    if ((batch as any)?.category) productMetadata['Category'] = (batch as any).category;
    if ((batch as any)?.marketRegion) productMetadata['Market Region'] = (batch as any).marketRegion;
    for (const [key, value] of Object.entries(additional)) {
      if (value && !productMetadata[key]) {
        productMetadata[key] = String(value);
      }
    }

    const displayLogoUrl = customConfig.logoUrl || client?.logoUrl || '';
    const displayCompanyName = customConfig.companyName || client?.companyName || productCode.companyName;
    const displayProductName = customConfig.productName || productCode.productName;

    return NextResponse.json({
      success: true,
      data: {
        qrCodeId: productCode.qrCodeId,
        productName: displayProductName,
        companyName: displayCompanyName,
        logoUrl: displayLogoUrl,
        productImageUrl: customConfig.productImageUrl || '',
        description: customConfig.productDescription || '',
        status: productCode.status,
        verificationCount: productCode.verificationCount || 0,
        firstVerifiedAt: productCode.firstVerifiedAt,
        lastVerifiedAt: productCode.lastVerifiedAt,
        productMetadata: Object.keys(productMetadata).length > 0 ? productMetadata : null,
        hasReward: (batch as any)?.rewardConfig?.enabled || false,
        rewardAmount: (batch as any)?.rewardConfig?.amount || 0,
        manufacturerId: productCode.manufacturerId,
        brandPrefix: productCode.brandPrefix,
      },
    });
  } catch (error) {
    console.error('Embedded verify API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
