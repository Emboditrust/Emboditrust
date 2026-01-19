// lib/api/dashboard.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
        ...(options?.headers || {}),
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Dashboard Stats
export async function getDashboardStats() {
  return fetchApi<{
    totalClients: number;
    totalVerifications: number;
    activeProducts: number;
    activeCampaigns: number;
    pendingApprovals: number;
    revenue: string;
    clientGrowth: number;
    verificationTrend: string;
    suspiciousAttempts: number;
  }>('/admin/dashboard/stats');
}

// Recent Activities
export async function getRecentActivities() {
  return fetchApi<Array<{
    _id: string;
    type: string;
    title: string;
    clientName: string;
    timestamp: string;
  }>>('/admin/dashboard/activities');
}

// Top Clients
export async function getTopClients() {
  return fetchApi<Array<{
    _id: string;
    companyName: string;
    activeProducts: number;
    totalVerifications: number;
    verificationRate: number;
  }>>('/admin/dashboard/top-clients');
}

// Verification Trends
export async function getVerificationTrends() {
  return fetchApi<Array<{
    date: string;
    verifications: number;
    valid: number;
    invalid: number;
    suspicious: number;
  }>>('/admin/dashboard/verification-trends');
}