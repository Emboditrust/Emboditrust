import mongoose from 'mongoose';

export interface IBatch extends mongoose.Document {
  batchId: string;
  manufacturerId: string;
  productName: string;
  companyName: string;
  quantity: number;
  generationDate: Date;
  codesGenerated: number;
  createdBy: string;
  customSuccessConfig?: {
    logoUrl?: string;
    companyName?: string;
    productName?: string;
    batchNumber?: string;
    additionalFields?: Record<string, string>;
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
    batchNumber: String,
    additionalFields: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: false,
});

BatchSchema.index({ generationDate: -1 });
BatchSchema.index({ manufacturerId: 1, generationDate: -1 });
BatchSchema.index({ createdBy: 1, generationDate: -1 });

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);