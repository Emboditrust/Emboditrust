import mongoose from 'mongoose';

export interface IBatch extends mongoose.Document {
  batchId: string;
  manufacturerId: string;
  productName: string;
  companyName: string;
  sku?: string;
  serialNumber?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  category?: string;
  marketRegion?: string;
  quantity: number;
  generationDate: Date;
  codesGenerated: number;
  createdBy: string;
  customSuccessConfig?: {
    logoUrl?: string;
    companyName?: string;
    productName?: string;
    productDescription?: string;
    productImageUrl?: string;
    batchNumber?: string;
    additionalFields?: Record<string, string>;
  };
  rewardConfig?: {
    enabled: boolean;
    amount: number;
  };
}

const BatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  manufacturerId: {
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
  sku: {
    type: String,
    trim: true,
    default: '',
  },
  serialNumber: {
    type: String,
    trim: true,
    default: '',
  },
  manufacturingDate: {
    type: Date,
    default: null,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  category: {
    type: String,
    trim: true,
    default: '',
  },
  marketRegion: {
    type: String,
    trim: true,
    default: '',
  },
  quantity: {
    type: Number,
    required: true,
  },
  generationDate: {
    type: Date,
    default: Date.now,
  },
  codesGenerated: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    required: true,
  },
  customSuccessConfig: {
    logoUrl: String,
    companyName: String,
    productName: String,
    productDescription: String,
    productImageUrl: String,
    batchNumber: String,
    additionalFields: mongoose.Schema.Types.Mixed,
  },
  rewardConfig: {
    enabled: { type: Boolean, default: false },
    amount: { type: Number, default: 50 },
  },
}, {
  timestamps: false,
});

BatchSchema.index({ generationDate: -1 });
BatchSchema.index({ manufacturerId: 1, generationDate: -1 });
BatchSchema.index({ createdBy: 1, generationDate: -1 });

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);