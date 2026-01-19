import mongoose from 'mongoose';

export interface IClient extends mongoose.Document {
  clientId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  manufacturerId: string;
  brandPrefix: string;
  registrationNumber: string;
  registrationDate: Date;
  contractStartDate: Date;
  contractEndDate: Date;
  monthlyLimit: number;
  status: 'active' | 'suspended' | 'inactive';
  codesGenerated: number;
  lastBatchDate?: Date;
  logoUrl?: string;
  website?: string;
  additionalInfo?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: [true, 'Client ID is required'],
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [1, 'Company name cannot be empty'],
    maxlength: [200, 'Company name cannot exceed 200 characters'],
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
    minlength: [1, 'Contact person name cannot be empty'],
    maxlength: [100, 'Contact person name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    maxlength: [100, 'Email cannot exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    minlength: [1, 'Phone number cannot be empty'],
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [1, 'Address cannot be empty'],
    maxlength: [500, 'Address cannot exceed 500 characters'],
  },
  manufacturerId: {
    type: String,
    required: [true, 'Manufacturer ID is required'],
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
    minlength: [1, 'Manufacturer ID cannot be empty'],
    maxlength: [50, 'Manufacturer ID cannot exceed 50 characters'],
  },
  brandPrefix: {
    type: String,
    required: [true, 'Brand prefix is required'],
    uppercase: true,
    trim: true,
    minlength: [3, 'Brand prefix must be exactly 3 characters'],
    maxlength: [3, 'Brand prefix must be exactly 3 characters'],
    match: [/^[A-Z]+$/, 'Brand prefix must contain only uppercase letters'],
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    trim: true,
    minlength: [1, 'Registration number cannot be empty'],
    maxlength: [50, 'Registration number cannot exceed 50 characters'],
  },
  registrationDate: {
    type: Date,
    required: [true, 'Registration date is required'],
  },
  contractStartDate: {
    type: Date,
    required: [true, 'Contract start date is required'],
  },
  contractEndDate: {
    type: Date,
    required: [true, 'Contract end date is required'],
    validate: {
      validator: function(this: IClient, value: Date) {
        return value > this.contractStartDate;
      },
      message: 'Contract end date must be after contract start date',
    },
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Monthly limit is required'],
    min: [100, 'Minimum monthly limit is 100'],
    max: [1000000, 'Maximum monthly limit is 1,000,000'],
    default: 10000,
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'suspended', 'inactive'],
      message: '{VALUE} is not a valid status',
    },
    default: 'active',
    index: true,
  },
  codesGenerated: {
    type: Number,
    default: 0,
    min: [0, 'Codes generated cannot be negative'],
  },
  lastBatchDate: {
    type: Date,
  },
  logoUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL'],
    default: '',
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL'],
    default: '',
  },
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required'],
    index: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete (ret as any).__v;
      delete (ret as any)._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete (ret as any).__v;
      delete (ret as any)._id;
      return ret;
    },
  },
});

// Indexes for efficient querying
ClientSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });
ClientSchema.index({ status: 1, contractEndDate: 1 });
ClientSchema.index({ createdAt: -1 });
ClientSchema.index({ manufacturerId: 1, brandPrefix: 1 }, { unique: true });

// Virtual for contract days remaining
ClientSchema.virtual('contractDaysRemaining').get(function(this: IClient) {
  const now = new Date();
  const end = this.contractEndDate;
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for monthly usage percentage
ClientSchema.virtual('monthlyUsagePercentage').get(function(this: IClient) {
  return this.monthlyLimit > 0 ? (this.codesGenerated / this.monthlyLimit) * 100 : 0;
});

// Virtual for codes remaining this month
ClientSchema.virtual('codesRemaining').get(function(this: IClient) {
  return Math.max(0, this.monthlyLimit - this.codesGenerated);
});

// Pre-save middleware to validate data
ClientSchema.pre<IClient>('save', async function(this: IClient) {
  // Ensure brand prefix is uppercase
  if (this.brandPrefix) {
    this.brandPrefix = this.brandPrefix.toUpperCase();
  }
  
  // Ensure manufacturer ID is uppercase
  if (this.manufacturerId) {
    this.manufacturerId = this.manufacturerId.toUpperCase();
  }
});

// Method to check if client can generate more codes
ClientSchema.methods.canGenerateCodes = function(quantity: number): boolean {
  return this.codesGenerated + quantity <= this.monthlyLimit && this.status === 'active';
};

// Method to update codes generated
ClientSchema.methods.updateCodesGenerated = async function(quantity: number) {
  this.codesGenerated += quantity;
  this.lastBatchDate = new Date();
  await this.save();
};

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);