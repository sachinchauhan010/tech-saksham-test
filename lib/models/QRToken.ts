import mongoose, { Schema, Document } from 'mongoose';

export interface IQRToken extends Document {
  token: string;
  userId: string;
  status: 'pending' | 'used';
  createdAt: Date;
}

const QRTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  email: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'used'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const QRToken = mongoose.models.QRToken || mongoose.model<IQRToken>('QRToken', QRTokenSchema);
