// app/verify/[qrCodeId]/page.tsx - Updated to include location
import VerificationClientPage from "./clientPage";
import connectDB from "@/lib/mongodb";
import ProductCode from "@/models/ProductCode";
import VerificationAttempt from "@/models/VerificationAttempt";
import Batch from "@/models/Batch";
import Client from "@/models/Client";
import Reward from "@/models/Reward";
import { headers } from "next/headers";

// Function to get geolocation (same as above)
async function getGeolocationFromIP(ipAddress: string) {
  if (
    ipAddress === "unknown" ||
    ipAddress === "127.0.0.1" ||
    ipAddress.startsWith("192.168.") ||
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("172.") ||
    ipAddress === "::1"
  ) {
    return null;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; YourApp/1.0)",
        },
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        organization: data.org,
      };
    }

    return null;
  } catch (error) {
    console.warn(`Geolocation fetch failed for IP ${ipAddress}:`, error);
    return null;
  }
}

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: qrCodeId } = await searchParams;

  // Get client IP and user agent
  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  let ipAddress = "unknown";

  if (forwardedFor) {
    ipAddress = forwardedFor.split(",")[0].trim();
  } else {
    ipAddress =
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") ||
      "unknown";
  }

  const userAgent = headersList.get("user-agent") || "unknown";

  await connectDB();

  // Find the product code
  const productCode = await ProductCode.findOne({ qrCodeId }).lean();

  if (!productCode) {
    // Log invalid attempt with QR code and location
    const locationData = await getGeolocationFromIP(ipAddress);

    await VerificationAttempt.create({
      timestamp: new Date(),
      scannedCode: qrCodeId,
      scratchCode: "N/A",
      result: "invalid",
      ipAddress: ipAddress,
      userAgent: userAgent,
      location: locationData,
    });
    return (
      <div
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          minHeight: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "16px",
          padding: "32px",
          marginTop: "5rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Verification Code Not Found
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginTop: "8px",
              lineHeight: 1.6,
            }}
          >
            The QR code you scanned does not match any product. Please check
            that the code was entered correctly or contact the manufacturer for
            assistance.
          </p>
        </div>
      </div>
    );
  }

  // Get batch, client, and reward info
  const [batch, client, reward] = await Promise.all([
    Batch.findOne({ batchId: productCode.batchId }).lean(),
    Client.findOne({ manufacturerId: productCode.manufacturerId }).lean(),
    Reward.findOne({ qrCodeId, status: "delivered" }).lean(),
  ]);

  // Log the QR scan attempt with location
  const locationData = await getGeolocationFromIP(ipAddress);

  await VerificationAttempt.create({
    timestamp: new Date(),
    scannedCode: qrCodeId,
    scratchCode: "pending",
    result: "scanned",
    ipAddress: ipAddress,
    userAgent: userAgent,
    location: locationData,
  });

  // Collect product metadata (only non-empty fields)
  const customConfig = (batch as any)?.customSuccessConfig || {};
  const additional = customConfig.additionalFields || {};
  const productMetadata: Record<string, string> = {};
  if (productCode.productName)
    productMetadata["Product Name"] = productCode.productName;
  if ((batch as any)?.sku) productMetadata["SKU"] = (batch as any).sku;
  if (productCode.batchId) productMetadata["Batch"] = productCode.batchId;
  if ((batch as any)?.serialNumber)
    productMetadata["Serial"] = (batch as any).serialNumber;
  if ((batch as any)?.manufacturingDate)
    productMetadata["Manufacturing Date"] = new Date(
      (batch as any).manufacturingDate,
    ).toLocaleDateString();
  if ((batch as any)?.expiryDate)
    productMetadata["Expiry Date"] = new Date(
      (batch as any).expiryDate,
    ).toLocaleDateString();
  if ((batch as any)?.category)
    productMetadata["Category"] = (batch as any).category;
  if ((batch as any)?.marketRegion)
    productMetadata["Market Region"] = (batch as any).marketRegion;
  for (const [key, value] of Object.entries(additional)) {
    if (value && !productMetadata[key]) {
      productMetadata[key] = String(value);
    }
  }

  // Detect embedded mode from query params or headers
  const embedded = true;

  // Prepare data for client component
  const verificationData = {
    productCode: {
      qrCodeId: productCode.qrCodeId,
      scratchCode: productCode.scratchCode || "",
      productName: productCode.productName,
      companyName: productCode.companyName,
      manufacturerId: productCode.manufacturerId,
      batchId: productCode.batchId,
      status: productCode.status,
      verificationCount: productCode.verificationCount || 0,
      firstVerifiedAt: productCode.firstVerifiedAt,
      lastVerifiedAt: productCode.lastVerifiedAt,
      isFirstVerification: !productCode.firstVerifiedAt,
    },
    batch: batch
      ? {
          batchId: batch.batchId,
          productName: batch.productName,
          generationDate: batch.generationDate,
          quantity: batch.quantity,
          sku: (batch as any).sku || "",
          serialNumber: (batch as any).serialNumber || "",
          manufacturingDate: (batch as any).manufacturingDate || null,
          expiryDate: (batch as any).expiryDate || null,
          category: (batch as any).category || "",
          marketRegion: (batch as any).marketRegion || "",
          customSuccessConfig: customConfig,
          rewardConfig: (batch as any).rewardConfig || null,
        }
      : null,
    client: client
      ? {
          companyName: client.companyName,
          registrationNumber: client.registrationNumber,
          website: client.website,
          logoUrl: client.logoUrl || null,
        }
      : null,
    rewardClaimed: reward
      ? {
          amount: (reward as any).amount,
          network: (reward as any).network,
          deliveredAt: (reward as any).deliveredAt,
        }
      : null,
    productMetadata:
      Object.keys(productMetadata).length > 0 ? productMetadata : null,
    embedded,
  };

  return (
    <VerificationClientPage
      verificationData={verificationData}
      qrCodeId={qrCodeId || "boohoo"}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ qrCodeId: string }>;
}) {
  const { qrCodeId } = await params;

  await connectDB();
  const productCode = await ProductCode.findOne({ qrCodeId }).lean();

  if (!productCode) {
    return {
      title: "Product Not Found - EmbodiTrust",
      description: "The product verification code could not be found.",
    };
  }

  const statusText =
    productCode.status === "verified"
      ? "Verified Product"
      : productCode.status === "active"
        ? "Authentic Product"
        : productCode.status === "suspected_counterfeit"
          ? "Suspected Counterfeit Product"
          : "Product Verification";

  const title = `${statusText}: ${productCode.productName} - EmbodiTrust`;
  const description = `Verify the authenticity of ${productCode.productName} manufactured by ${productCode.companyName}.`;

  return {
    title,
    description,
  };
}
