// app/api/clients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!email || email.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
    
    // Search for clients by email or company name
    const clients = await Client.find({
      $or: [
        { email: { $regex: email, $options: 'i' } },
        { companyName: { $regex: email, $options: 'i' } },
        { contactPerson: { $regex: email, $options: 'i' } },
      ],
      status: 'active',
    })
      .select('email companyName contactPerson')
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: clients,
    });
    
  } catch (error: any) {
    console.error('Error searching clients:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to search clients',
        error: error.message 
      },
      { status: 500 }
    );
  }
}