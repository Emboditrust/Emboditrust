import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import { z } from 'zod';

// Validation schema for client creation
const createClientSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactPerson: z.string().min(1, 'Contact person is required').max(100),
  email: z.string().email('Invalid email address').max(100),
  phone: z.string().min(1, 'Phone number is required').max(20),
  address: z.string().min(1, 'Address is required').max(500),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required').max(50),
  brandPrefix: z.string()
    .length(3, 'Brand prefix must be exactly 3 characters')
    .regex(/^[A-Z]+$/, 'Brand prefix must be uppercase letters only'),
  registrationNumber: z.string().min(1, 'Registration number is required').max(50),
  registrationDate: z.string().min(1, 'Registration date is required'),
  contractStartDate: z.string().min(1, 'Contract start date is required'),
  contractEndDate: z.string().min(1, 'Contract end date is required'),
  monthlyLimit: z.number()
    .min(100, 'Minimum monthly limit is 100')
    .max(1000000, 'Maximum monthly limit is 1,000,000'),
  logoUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  additionalInfo: z.string().optional(),
});

// GET: Fetch clients with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login as admin' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || '-createdAt';

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { manufacturerId: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Client.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Clients fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to fetch clients'
      },
      { status: 500 }
    );
  }
}

// POST: Create new client
export async function POST(request: NextRequest) {
  try {
    console.log('=== Starting client creation ===');
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'Please login as admin to create clients'
        },
        { status: 401 }
      );
    }

    console.log('Admin authenticated:', session.user.email);

    await connectDB();
    console.log('Database connected');

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    // Parse dates from string to Date objects
    const parsedBody = {
      ...body,
      monthlyLimit: parseInt(body.monthlyLimit),
    };

    console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));

    // Validate input
    let validatedData;
    try {
      validatedData = createClientSchema.parse(parsedBody);
      console.log('Validation passed:', validatedData);
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

    // Check if manufacturer ID already exists
    const existingManufacturer = await Client.findOne({ 
      manufacturerId: validatedData.manufacturerId 
    });

    if (existingManufacturer) {
      console.log('Manufacturer ID already exists:', validatedData.manufacturerId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          message: `Manufacturer ID "${validatedData.manufacturerId}" is already registered for ${existingManufacturer.companyName}`
        },
        { status: 400 }
      );
    }

    // Check if brand prefix is already in use
    const existingBrand = await Client.findOne({ 
      brandPrefix: validatedData.brandPrefix 
    });

    if (existingBrand) {
      console.log('Brand prefix already in use:', validatedData.brandPrefix);
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          message: `Brand prefix "${validatedData.brandPrefix}" is already used by ${existingBrand.companyName}`
        },
        { status: 400 }
      );
    }

    // Generate unique client ID
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const clientId = `CLIENT${timestamp}${random}`;

    console.log('Generated client ID:', clientId);

    // Create client with all required fields
    const clientData = {
      clientId,
      companyName: validatedData.companyName.trim(),
      contactPerson: validatedData.contactPerson.trim(),
      email: validatedData.email.toLowerCase().trim(),
      phone: validatedData.phone.trim(),
      address: validatedData.address.trim(),
      manufacturerId: validatedData.manufacturerId.trim(),
      brandPrefix: validatedData.brandPrefix.toUpperCase().trim(),
      registrationNumber: validatedData.registrationNumber.trim(),
      registrationDate: new Date(validatedData.registrationDate),
      contractStartDate: new Date(validatedData.contractStartDate),
      contractEndDate: new Date(validatedData.contractEndDate),
      monthlyLimit: validatedData.monthlyLimit,
      status: 'active' as const,
      codesGenerated: 0,
      logoUrl: validatedData.logoUrl?.trim() || undefined,
      website: validatedData.website?.trim() || undefined,
      additionalInfo: validatedData.additionalInfo 
        ? JSON.parse(validatedData.additionalInfo)
        : {},
      createdBy: session.user.id,
    };

    console.log('Creating client with data:', JSON.stringify(clientData, null, 2));

    // Create client
    const client = new Client(clientData);
    await client.save();

    console.log('Client created successfully:', client._id);

    // Return the created client (excluding sensitive fields)
    const responseData = {
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
    };

    console.log('Returning response:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      client: responseData,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Client creation error:', error);
    
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

    // Handle other MongoDB errors
    if (error.name === 'MongoError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error',
          message: error.message || 'Failed to save client to database'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to create client'
      },
      { status: 500 }
    );
  }
}