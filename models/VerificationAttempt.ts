// models/VerificationAttempt.ts - Updated with full location
import mongoose from 'mongoose';

export interface IVerificationAttempt extends mongoose.Document {
  timestamp: Date;
  scannedCode: string;
  scratchCode: string;
  result: 'scanned' | 'valid' | 'invalid' | 'already_used' | 'suspected_counterfeit';
  ipAddress: string;
  userAgent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isp?: string;
    organization?: string;
  };
}

const VerificationAttemptSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  scannedCode: {
    type: String,
    index: true,
  },
  scratchCode: {
    type: String,
    index: true,
  },
  result: {
    type: String,
    enum: ['scanned', 'valid', 'invalid', 'already_used', 'suspected_counterfeit'],
    index: true,
  },
  ipAddress: {
    type: String,
    index: true,
  },
  userAgent: String,
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    isp: String,
    organization: String
  },
}, {
  timestamps: false,
});

VerificationAttemptSchema.index({ scannedCode: 1, timestamp: -1 });
VerificationAttemptSchema.index({ scratchCode: 1, timestamp: -1 });
VerificationAttemptSchema.index({ result: 1, timestamp: -1 });
VerificationAttemptSchema.index({ ipAddress: 1, timestamp: -1 });
VerificationAttemptSchema.index({ 'location.country': 1, timestamp: -1 });
VerificationAttemptSchema.index({ 'location.city': 1, timestamp: -1 });

export default mongoose.models.VerificationAttempt || 
  mongoose.model<IVerificationAttempt>('VerificationAttempt', VerificationAttemptSchema);