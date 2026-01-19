// app/api/admin/recent-activities/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';
import VerificationAttempt from '@/models/VerificationAttempt';

export async function GET() {
  try {
    await connectDB();

    // Get recent client registrations
    const recentClients = await Client.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName createdAt')
      .lean();

    // Get recent verification attempts
    const recentVerifications = await VerificationAttempt.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('scannedCode result timestamp')
      .lean();

    // Format activities
    const activities = [
      ...recentClients.map(client => ({
        id: client._id.toString(),
        type: 'new_client',
        title: 'New client registered',
        clientName: client.companyName,
        timeAgo: getTimeAgo(client.createdAt),
      })),
      ...recentVerifications.map(attempt => ({
        id: attempt._id.toString(),
        type: attempt.result === 'valid' ? 'verification' : 'failed_verification',
        title: attempt.result === 'valid' ? 'Product verification successful' : 'Failed verification attempt',
        clientName: getClientFromCode(attempt.scannedCode), // You'll need to implement this
        timeAgo: getTimeAgo(attempt.timestamp),
      })),
    ].sort((a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime())
     .slice(0, 5);

    return NextResponse.json(activities);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json([], { status: 500 });
  }
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getClientFromCode(code: string) {
  // This is a placeholder - you'll need to implement logic to get client from code
  return "Client Name";
}