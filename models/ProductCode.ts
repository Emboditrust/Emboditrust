// models/ProductCode.ts
import mongoose from 'mongoose';

const ProductCodeSchema = new mongoose.Schema({
  qrCodeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCodeHash: {
    type: String,
    required: true
  },
  scratchCode: { // ADD THIS - the actual scratch code (4x3 format)
    type: String,
    required: true
  },
  scratchCodeHash: {
    type: String,
    required: true
  },
  batchId: {
    type: String,
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  manufacturerId: {
    type: String,
    required: true,
    index: true
  },
  brandPrefix: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'verified', 'suspected_counterfeit', 'expired', 'revoked'],
    default: 'active'
  },
  verificationCount: { // ADD THIS
    type: Number,
    default: 0
  },
  firstVerifiedAt: { // ADD THIS
    type: Date,
    default: null
  },
  lastVerifiedAt: { // ADD THIS
    type: Date,
    default: null
  },
  verificationUrl: { // ADD THIS
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.ProductCode || mongoose.model('ProductCode', ProductCodeSchema);