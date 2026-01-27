// models/Message.ts - Updated
import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'admin' | 'user' | 'system';
  receiverEmail: string;
  receiverName?: string;
  subject: string;
  content: string;
  replyTo?: mongoose.Types.ObjectId;
  relatedReport?: mongoose.Types.ObjectId; // Link to FakeProductReport
  status: 'sent' | 'delivered' | 'failed' | 'read';
  emailMessageId?: string;
  sentVia: 'system' | 'manual';
  attachments?: string[];
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  senderEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  senderName: {
    type: String,
    required: true,
    trim: true,
  },
  senderRole: {
    type: String,
    enum: ['admin', 'user', 'system'],
    required: true,
    default: 'user',
  },
  receiverEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  receiverName: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FakeProductReport',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed', 'read'],
    default: 'sent',
  },
  emailMessageId: {
    type: String,
  },
  sentVia: {
    type: String,
    enum: ['system', 'manual'],
    default: 'manual',
  },
  attachments: [{
    type: String,
  }],
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
MessageSchema.index({ senderEmail: 1, createdAt: -1 });
MessageSchema.index({ receiverEmail: 1, createdAt: -1 });
MessageSchema.index({ senderRole: 1, createdAt: -1 });
MessageSchema.index({ relatedReport: 1 });
MessageSchema.index({ status: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);