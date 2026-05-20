import mongoose, { Schema, Document, Types } from 'mongoose';
import { ROLE } from '../enum';

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  password: string;
  role: string;
  eventApplied?: Array<{
    eventCode: string;
    eventId?: Types.ObjectId;
    appliedDate: Date;
  }>;
  managedEvents?: Array<{
    eventCode: string;
    title: string;
  }>;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    default: ROLE.USER
  },
  // Conditional fields based on user role
  eventApplied: {
    type: [{
      eventCode: {
        type: String,
        required: true,
      },
      eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
      appliedDate: {
        type: Date,
        default: Date.now
      }
    }],
    // Only include for regular users, not admins
    required: function() {
      return this.role && !this.role.includes(ROLE.ADMIN) && !this.role.includes(ROLE.SUPER_ADMIN);
    }
  },
  managedEvents: {
    type: [{
      eventCode: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      }
    }],
    // Only include for admin users, not regular users
    required: function() {
      return this.role && (this.role.includes(ROLE.ADMIN) || this.role.includes(ROLE.SUPER_ADMIN));
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
