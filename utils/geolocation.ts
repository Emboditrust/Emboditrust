import { NextRequest } from 'next/server';

export interface GeolocationData {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

export class GeolocationService {
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    return ip === '::1' ? '127.0.0.1' : ip;
  }

  static async getLocationFromIP(ip: string): Promise<GeolocationData> {
    try {
      if (ip === '127.0.0.1' || ip === 'unknown') {
        return { country: 'Local', city: 'Local', region: 'Local' };
      }

      // Use ip-api.com (free tier, 45 requests per minute)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,timezone`, {
        headers: {
          'User-Agent': 'EmbodiTrust-Pharma-System/1.0'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          country: data.country,
          region: data.regionName,
          city: data.city,
          timezone: data.timezone,
        };
      }
      
      console.warn('IP geolocation failed:', data.message);
      return {};
    } catch (error) {
      console.error('Geolocation error:', error);
      return {};
    }
  }

  static getApproximateLocation(request: NextRequest): GeolocationData {
    const ip = this.getClientIP(request);
    
    // Simple heuristic for common Nigerian IP ranges
    if (ip.startsWith('197.210')) {
      return { country: 'Nigeria', region: 'Lagos', city: 'Lagos' };
    } else if (ip.startsWith('197.211')) {
      return { country: 'Nigeria', region: 'Abuja', city: 'Abuja' };
    } else if (ip.startsWith('197.157')) {
      return { country: 'Nigeria', region: 'Port Harcourt', city: 'Port Harcourt' };
    }
    
    return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
  }
}