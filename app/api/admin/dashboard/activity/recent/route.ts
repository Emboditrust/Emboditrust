// app/api/admin/dashboard/activity/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationAttempt from '@/models/VerificationAttempt';
import Client from '@/models/Client';
import Batch from '@/models/Batch';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get recent verification attempts
    const recentVerifications = await VerificationAttempt.find({
      result: { $in: ['valid', 'invalid', 'suspected_counterfeit'] }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();
    
    // Get recent client registrations
    const recentClients = await Client.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName createdAt')
      .lean();
    
    // Get recent batch creations
    const recentBatches = await Batch.find({})
      .sort({ generationDate: -1 })
      .limit(5)
      .select('batchId productName companyName generationDate')
      .lean();
    
    // Combine all activities
    const activities = [
      ...recentVerifications.map(v => ({
        type: getVerificationType(v.result),
        companyName: 'Verification Activity',
        details: `QR: ${v.scannedCode?.substring(0, 10)}... - ${v.result}`,
        timestamp: v.timestamp,
        icon: getVerificationIcon(v.result)
      })),
      ...recentClients.map(c => ({
        type: 'New Client Registered',
        companyName: c.companyName,
        details: 'New client account created',
        timestamp: c.createdAt,
        icon: '👤'
      })),
      ...recentBatches.map(b => ({
        type: 'Batch Generated',
        companyName: b.companyName,
        details: `${b.productName} - ${b.quantity} codes`,
        timestamp: b.generationDate,
        icon: '📦'
      }))
    ];
    
    // Sort by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Take only the 10 most recent
    const recentActivity = activities.slice(0, 10);
    
    return NextResponse.json({
      success: true,
      data: recentActivity,
      count: recentActivity.length
    });
    
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch recent activity',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

function getVerificationType(result: string): string {
  switch (result) {
    case 'valid': return 'Product Verified';
    case 'invalid': return 'Failed Verification';
    case 'suspected_counterfeit': return 'Counterfeit Reported';
    default: return 'Verification Attempt';
  }
}

function getVerificationIcon(result: string): string {
  switch (result) {
    case 'valid': return '✅';
    case 'invalid': return '❌';
    case 'suspected_counterfeit': return '⚠️';
    default: return '📱';
  }
}