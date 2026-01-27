// models/FakeProductReport.ts - Updated
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
  messageId?: mongoose.Types.ObjectId; // Link to Message collection
  createdAt: Date;
  updatedAt: Date;
}

const FakeProductReportSchema = new mongoose.Schema({
  reporterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    required: function(this: IFakeProductReport) {
      return !this.reporterPhone; // Email required if no phone
    },
  },
  reporterPhone: {
    type: String,
    trim: true,
    required: function(this: IFakeProductReport) {
      return !this.reporterEmail; // Phone required if no email
    },
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  originalProductName: {
    type: String,
    trim: true,
  },
  purchaseLocation: {
    type: String,
    required: [true, 'Purchase location is required'],
    trim: true,
  },
  purchaseDate: {
    type: Date,
  },
  productPhotoUrl: {
    type: String,
    trim: true,
  },
  additionalInfo: {
    type: String,
    trim: true,
  },
  qrCodeId: {
    type: String,
    trim: true,
    index: true,
  },
  scratchCode: {
    type: String,
    trim: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, {
  timestamps: true,
});

export default mongoose.models.FakeProductReport || 
  mongoose.model<IFakeProductReport>('FakeProductReport', FakeProductReportSchema);