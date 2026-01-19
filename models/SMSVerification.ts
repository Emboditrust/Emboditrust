import mongoose, { Schema, Types } from 'mongoose';

/* =====================================================
   INTERFACE
===================================================== */

export interface ISMSVerification {
  _id: Types.ObjectId;
  sessionId: string;
  phoneNumber: string;
  formattedPhone: string;
  countryCode: string;
  carrier?: string;
  network?: string;
  scratchCode: string;
  scratchCodeHash: string;
  productCodeId?: Types.ObjectId;
  verificationResult: 'valid' | 'invalid' | 'already_used' | 'failed';
  smsStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  messageId?: string;
  smsCost?: number;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  attempts: number;
  lastAttempt: Date;
  expiresAt: Date;
  completedAt?: Date;
  metadata?: {
    productName?: string;
    companyName?: string;
    batchId?: string;
    verificationCount?: number;
    isFirstVerification?: boolean;
    clientWebsite?: string;
    clientLogo?: string;
    manufacturerId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   SCHEMA
===================================================== */

const SMSVerificationSchema = new Schema<ISMSVerification>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    formattedPhone: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    countryCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true
    },
    carrier: {
      type: String,
      index: true,
      trim: true
    },
    network: {
      type: String,
      trim: true
    },
    scratchCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
      uppercase: true
    },
    scratchCodeHash: {
      type: String,
      required: true,
      index: true
    },
    productCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCode',
      index: true
    },
    verificationResult: {
      type: String,
      enum: ['valid', 'invalid', 'already_used', 'failed'],
      required: true,
      index: true
    },
    smsStatus: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending',
      index: true
    },
    messageId: {
      type: String,
      index: true,
      trim: true
    },
    smsCost: {
      type: Number,
      min: 0,
      default: 0
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    userAgent: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: true
    },
    completedAt: {
      type: Date,
      index: true
    },
    metadata: {
      productName: String,
      companyName: String,
      batchId: String,
      verificationCount: Number,
      isFirstVerification: Boolean,
      clientWebsite: String,
      clientLogo: String,
      manufacturerId: String
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret: Partial<Record<string, any>>) {
        delete ret.__v;
        delete ret._id;
        delete ret.scratchCodeHash;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform(doc, ret: Partial<Record<string, any>>) {
        delete ret.__v;
        delete ret._id;
        delete ret.scratchCodeHash;
        return ret;
      }
    }
  }
);

/* =====================================================
   INDEXES
===================================================== */

SMSVerificationSchema.index({ createdAt: -1 });
SMSVerificationSchema.index({ phoneNumber: 1, createdAt: -1 });
SMSVerificationSchema.index({ scratchCode: 1, createdAt: -1 });
SMSVerificationSchema.index({ verificationResult: 1, createdAt: -1 });
SMSVerificationSchema.index({ smsStatus: 1, createdAt: -1 });
SMSVerificationSchema.index({ carrier: 1, createdAt: -1 });
SMSVerificationSchema.index({ countryCode: 1, createdAt: -1 });
SMSVerificationSchema.index({ 'metadata.batchId': 1 });
SMSVerificationSchema.index({ 'metadata.manufacturerId': 1 });

/* TTL cleanup */
SMSVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* =====================================================
   VIRTUALS
===================================================== */

SMSVerificationSchema.virtual('date').get(function (this: ISMSVerification) {
  return this.createdAt.toLocaleDateString();
});

SMSVerificationSchema.virtual('time').get(function (this: ISMSVerification) {
  return this.createdAt.toLocaleTimeString();
});

SMSVerificationSchema.virtual('maskedPhone').get(function (this: ISMSVerification) {
  if (this.phoneNumber.length <= 10) return this.phoneNumber;
  return this.phoneNumber.replace(/(\d{4})\d+(\d{3})/, '$1****$2');
});

/* =====================================================
   MIDDLEWARE
===================================================== */

SMSVerificationSchema.pre('save', async function () {
  if (this.isModified('scratchCode')) {
    const crypto = await import('crypto');
    this.scratchCodeHash = crypto
      .createHash('sha256')
      .update(this.scratchCode)
      .digest('hex');
  }
});

/* =====================================================
   METHODS
===================================================== */

SMSVerificationSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

SMSVerificationSchema.methods.getStatusText = function (
  this: ISMSVerification
): string {
  const statusMap: Record<
    ISMSVerification['verificationResult'],
    string
  > = {
    valid: '✅ Genuine',
    invalid: '❌ Invalid',
    already_used: '⚠️ Already Used',
    failed: '❌ Failed'
  };

  return statusMap[this.verificationResult];
};


/* =====================================================
   MODEL
===================================================== */

export default mongoose.models.SMSVerification ||
  mongoose.model<ISMSVerification>(
    'SMSVerification',
    SMSVerificationSchema
  );
