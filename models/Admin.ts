import mongoose from 'mongoose';

export interface IAdmin extends mongoose.Document {
  email: string;
  password: string; // Changed from passwordHash to password
  name: string;
  role: 'admin';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { // Changed from passwordHash to password
    type: String,
    required: [true, 'Password is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
    required: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);