import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import ProductCode from '@/models/ProductCode';
import Batch from '@/models/Batch';
import Client from '@/models/Client';
import WidgetClientPage from './WidgetClientPage';

export default async function WidgetVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ qrCodeId: string }>;
  searchParams: Promise<{
    companyName?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    supportEmail?: string;
    supportPhone?: string;
    verificationHeadline?: string;
    verificationDescription?: string;
  }>;
}) {
  const { qrCodeId } = await params;
  const branding = await searchParams;

  await connectDB();

  const productCode = await ProductCode.findOne({ qrCodeId }).lean();
  if (!productCode) {
    notFound();
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

  const widgetData = {
    qrCodeId: productCode.qrCodeId,
    scratchCode: (productCode as any).scratchCode || '',
    productName: customConfig.productName || productCode.productName,
    companyName: branding.companyName || customConfig.companyName || client?.companyName || productCode.companyName,
    logoUrl: branding.logoUrl || customConfig.logoUrl || client?.logoUrl || '',
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
    branding: {
      primaryColor: branding.primaryColor || '#2957FF',
      secondaryColor: branding.secondaryColor || '#0B0F19',
      accentColor: branding.accentColor || '#19a35b',
      supportEmail: branding.supportEmail || '',
      supportPhone: branding.supportPhone || '',
      verificationHeadline: branding.verificationHeadline || 'Product Verification',
      verificationDescription: branding.verificationDescription || 'Verify the authenticity of this product',
    },
  };

  return <WidgetClientPage widgetData={widgetData} />;
}
