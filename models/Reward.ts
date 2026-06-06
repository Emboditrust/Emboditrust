import mongoose from 'mongoose';

export interface IReward extends mongoose.Document {
  rewardId: string;
  productCodeId: mongoose.Types.ObjectId;
  qrCodeId: string;
  phoneNumber: string;
  network: string;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'refunded';
  vtpassTransactionId?: string;
  vtpassRequestId?: string;
  vtpassResponse?: Record<string, any>;
  errorMessage?: string;
  grantedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new mongoose.Schema<IReward>({
  rewardId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  productCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCode',
    required: true,
    index: true,
  },
  qrCodeId: {
    type: String,
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    enum: ['mtn', 'glo', 'airtel', 'etisalat'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'failed', 'refunded'],
    default: 'pending',
  },
  vtpassTransactionId: {
    type: String,
  },
  vtpassRequestId: {
    type: String,
  },
  vtpassResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  errorMessage: {
    type: String,
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

RewardSchema.index({ status: 1 });
RewardSchema.index({ productCodeId: 1, status: 1 });
RewardSchema.index({ createdAt: -1 });

export default mongoose.models.Reward || mongoose.model<IReward>('Reward', RewardSchema);
