import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import Batch from '@/models/Batch';
import ProductCode from '@/models/ProductCode';
import { z } from 'zod';

// Validation schema for client update
const updateClientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200).optional(),
  contactPerson: z.string().min(1, 'Contact person is required').max(100).optional(),
  email: z.string().email('Invalid email address').max(100).optional(),
  phone: z.string().min(1, 'Phone number is required').max(20).optional(),
  address: z.string().min(1, 'Address is required').max(500).optional(),
  brandPrefix: z.string()
    .length(3, 'Brand prefix must be exactly 3 characters')
    .regex(/^[A-Z]+$/, 'Brand prefix must be uppercase letters only')
    .optional(),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  monthlyLimit: z.number()
    .min(100, 'Minimum monthly limit is 100')
    .max(1000000, 'Maximum monthly limit is 1,000,000')
    .optional(),
  logoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
}).refine(data => {
  if (data.contractStartDate && data.contractEndDate) {
    return new Date(data.contractEndDate) > new Date(data.contractStartDate);
  }
  return true;
}, {
  message: "Contract end date must be after start date",
  path: ["contractEndDate"],
});

// GET: Get client by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get client details
    const client = await Client.findOne({ clientId }).lean();
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get client's batches count
    const batchCount = await Batch.countDocuments({ manufacturerId: client.manufacturerId });
    
    // Get total codes generated for this client
    const totalCodes = await ProductCode.countDocuments({ manufacturerId: client.manufacturerId });
    
    // Get verified codes count
    const verifiedCodes = await ProductCode.countDocuments({ 
      manufacturerId: client.manufacturerId,
      status: 'verified'
    });
    
    // Get active codes count
    const activeCodes = await ProductCode.countDocuments({ 
      manufacturerId: client.manufacturerId,
      status: 'active'
    });
    
    // Calculate verification rate
    const verificationRate = totalCodes > 0 ? Math.round((verifiedCodes / totalCodes) * 100) : 0;
    
    // Get today's verification attempts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVerifications = await ProductCode.countDocuments({
      manufacturerId: client.manufacturerId,
      lastVerifiedAt: { $gte: today }
    });

    return NextResponse.json({
      success: true,
      client: {
        id: client._id.toString(),
        clientId: client.clientId,
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        address: client.address,
        manufacturerId: client.manufacturerId,
        brandPrefix: client.brandPrefix,
        registrationNumber: client.registrationNumber,
        registrationDate: client.registrationDate,
        status: client.status,
        contractStartDate: client.contractStartDate,
        contractEndDate: client.contractEndDate,
        monthlyLimit: client.monthlyLimit,
        codesGenerated: totalCodes, // Update with real count
        lastBatchDate: client.lastBatchDate,
        logoUrl: client.logoUrl || '',
        website: client.website || '',
        additionalInfo: client.additionalInfo || {},
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      statistics: {
        totalCodes,
        verifiedCodes,
        activeCodes,
        verificationRate,
        batches: batchCount,
        todayVerifications
      }
    });

  } catch (error: any) {
    console.error('Client fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
// PUT: Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Extract params inline (remove helper function)
    const { clientId } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    
    // Find client
    const client = await Client.findOne({ clientId });
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Validate input
    let validatedData;
    try {
      validatedData = updateClientSchema.parse(body);
    } catch (validationError: any) {
      console.error('Validation error:', validationError.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validationError.errors,
          message: 'Please check your input values'
        },
        { status: 400 }
      );
    }

    // Check if brand prefix is already in use (if changing)
    if (validatedData.brandPrefix && validatedData.brandPrefix !== client.brandPrefix) {
      const existingBrand = await Client.findOne({ 
        brandPrefix: validatedData.brandPrefix,
        _id: { $ne: client._id }
      });

      if (existingBrand) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Validation failed',
            message: `Brand prefix "${validatedData.brandPrefix}" is already used by ${existingBrand.companyName}`
          },
          { status: 400 }
        );
      }
    }

    // Update client fields
    if (validatedData.companyName !== undefined) client.companyName = validatedData.companyName.trim();
    if (validatedData.contactPerson !== undefined) client.contactPerson = validatedData.contactPerson.trim();
    if (validatedData.email !== undefined) client.email = validatedData.email.toLowerCase().trim();
    if (validatedData.phone !== undefined) client.phone = validatedData.phone.trim();
    if (validatedData.address !== undefined) client.address = validatedData.address.trim();
    if (validatedData.brandPrefix !== undefined) client.brandPrefix = validatedData.brandPrefix.toUpperCase().trim();
    if (validatedData.registrationNumber !== undefined) client.registrationNumber = validatedData.registrationNumber.trim();
    if (validatedData.status !== undefined) client.status = validatedData.status;
    if (validatedData.monthlyLimit !== undefined) client.monthlyLimit = validatedData.monthlyLimit;
    if (validatedData.logoUrl !== undefined) client.logoUrl = validatedData.logoUrl?.trim() || undefined;
    if (validatedData.website !== undefined) client.website = validatedData.website?.trim() || undefined;
    
    // Handle dates
    if (validatedData.contractStartDate !== undefined) {
      client.contractStartDate = new Date(validatedData.contractStartDate);
    }
    if (validatedData.contractEndDate !== undefined) {
      client.contractEndDate = new Date(validatedData.contractEndDate);
    }
    
    // Handle additional info
    if (validatedData.additionalInfo !== undefined) {
      try {
        client.additionalInfo = validatedData.additionalInfo.trim() 
          ? JSON.parse(validatedData.additionalInfo)
          : {};
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON in additional info field' },
          { status: 400 }
        );
      }
    }

    await client.save();

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully',
      client: {
        id: client._id.toString(),
        clientId: client.clientId,
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone,
        manufacturerId: client.manufacturerId,
        brandPrefix: client.brandPrefix,
        registrationNumber: client.registrationNumber,
        status: client.status,
        monthlyLimit: client.monthlyLimit,
        codesGenerated: client.codesGenerated,
        contractStartDate: client.contractStartDate,
        contractEndDate: client.contractEndDate,
        logoUrl: client.logoUrl,
        website: client.website,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
    });

  } catch (error: any) {
    console.error('Client update error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return NextResponse.json(
        { 
          success: false,
          error: 'Duplicate entry',
          message: `${field} "${value}" already exists in the system`
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to update client'
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete client and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Extract params inline (remove helper function)
    const { clientId } = await params;
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find client
    const client = await Client.findOne({ clientId });
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get manufacturer ID for cascading delete
    const manufacturerId = client.manufacturerId;

    // Delete all associated data
    await Promise.all([
      Client.deleteOne({ clientId }),
      Batch.deleteMany({ manufacturerId }),
      ProductCode.deleteMany({ manufacturerId }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Client and all associated data deleted successfully',
    });

  } catch (error: any) {
    console.error('Client deletion error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to delete client'
      },
      { status: 500 }
    );
  }
}


