import { Schema, model, models, Types } from 'mongoose';
import { IEvent } from '@/types/interface';
import { EVENT_CATEGORY, EVENT_FORMAT, EVENT_STATUS, ID_CARD_TYPE } from '@/lib/enum';

const eventSchema = new Schema<IEvent>({
  eventCode: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxLength: 250 },
  category: { 
    type: String, 
    enum: Object.values(EVENT_CATEGORY), 
    required: true 
  },
  
  bannerImage: { type: String, required: true },
  stateLogo: { type: String },
  gallery: [{ type: String }],

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationOpenDate: { type: Date, required: true },
  registrationCloseDate: { type: Date, required: true },

  format: { 
    type: String, 
    enum: Object.values(EVENT_FORMAT), 
    default: EVENT_FORMAT.IN_PERSON 
  },
  location: {
    venueName: String,
    address: String,
    city: String,
    mapLink: String
  },
  virtualLink: { type: String },

  organizer: [{ type: Types.ObjectId, ref: 'User', required: true }],
  // speakers: [{
  //   name: String,
  //   bio: String,
  //   photo: String
  // }],
  sessions: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    location: {
      room: String,
      venue: String
    },
    virtualLink: { type: String },
    speakers: [{
      name: { type: String, required: true },
      bio: String,
      photo: String
    }],
    tags: [{ type: String }],
  }],

  status: { 
    type: String, 
    enum: Object.values(EVENT_STATUS), 
    default: EVENT_STATUS.DRAFT,
    index: true 
  },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isIdCardIssue: { type: Boolean, default: false },
  isCertificateIssue: { type: Boolean, default: false },
  certificateTemplate: { type: String, required: true },
  delegateIdCard: { type: String },
  guestIdCard: { type: String },
  organizerIdCard: { type: String }
}, { 
  timestamps: true 
});

export const EventModel = models?.Event || model<IEvent>('Event', eventSchema);
