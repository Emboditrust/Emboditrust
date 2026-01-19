// models/FakeProductReport.ts
import mongoose from 'mongoose';

export interface IFakeProductReport extends mongoose.Document {
  reporterEmail?: string;
  reporterPhone?: string;
  productName: string;
  originalProductName?: string;
  purchaseLocation: string;
  purchaseDate?: Date;
  productPhotoUrl?: string;
  additionalInfo?: string;
  qrCodeId?: string;
  scratchCode?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FakeProductReportSchema = new mongoose.Schema({
  reporterEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  reporterPhone: {
    type: String,
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  originalProductName: {
    type: String,
    trim: true
  },
  purchaseLocation: {
    type: String,
    required: [true, 'Purchase location is required'],
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  productPhotoUrl: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  },
  qrCodeId: {
    type: String,
    trim: true,
    index: true
  },
  scratchCode: {
    type: String,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
FakeProductReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
FakeProductReportSchema.index({ qrCodeId: 1, scratchCode: 1 });
FakeProductReportSchema.index({ createdAt: -1 });

export default mongoose.models.FakeProductReport || 
  mongoose.model<IFakeProductReport>('FakeProductReport', FakeProductReportSchema);