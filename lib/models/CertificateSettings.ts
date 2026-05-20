import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificateSettings extends Document {
  enabled: boolean;
  allowDownload: boolean;
  message: string;
  updatedAt: Date;
}

const CertificateSettingsSchema: Schema = new Schema({
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
  allowDownload: {
    type: Boolean,
    required: true,
    default: true
  },
  message: {
    type: String,
    required: true,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp before saving
CertificateSettingsSchema.pre('save', function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const CertificateSettings = mongoose.models.CertificateSettings || mongoose.model<ICertificateSettings>('CertificateSettings', CertificateSettingsSchema);
