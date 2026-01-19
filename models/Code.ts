import mongoose from 'mongoose';

export interface ICode extends mongoose.Document {
  hashedCode: string;
  status: 'active' | 'used' | 'suspected_fake';
  batchId: string;
  brandPrefix: string;
  productName: string;
  companyName: string;
  manufacturerId: string;
  createdBy: string;
  createdAt: Date;
  firstVerifiedAt?: Date;
  firstVerifiedFromIP?: string;
  firstVerifiedLocation?: {
    country?: string;
    city?: string;
    region?: string;
  };
  customSuccessPage?: {
    enabled: boolean;
    logoUrl?: string;
    companyName?: string;
    productName?: string;
    batchNumber?: string;
    additionalFields?: Record<string, string>;
  };
}

const CodeSchema = new mongoose.Schema({
  hashedCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'suspected_fake'],
    default: 'active',
    index: true,
  },
  batchId: {
    type: String,
    required: true,
    index: true,
  },
  brandPrefix: {
    type: String,
    required: true,
    index: true,
  },
  productName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  manufacturerId: {
    type: String,
    required: true,
    index: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  firstVerifiedAt: {
    type: Date,
  },
  firstVerifiedFromIP: {
    type: String,
  },
  firstVerifiedLocation: {
    country: String,
    city: String,
    region: String,
  },
  customSuccessPage: {
    enabled: {
      type: Boolean,
      default: false,
    },
    logoUrl: String,
    companyName: String,
    productName: String,
    batchNumber: String,
    additionalFields: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: false,
});

CodeSchema.index({ batchId: 1, status: 1 });
CodeSchema.index({ manufacturerId: 1, createdAt: -1 });
CodeSchema.index({ createdAt: -1 });

export default mongoose.models.Code || mongoose.model<ICode>('Code', CodeSchema);