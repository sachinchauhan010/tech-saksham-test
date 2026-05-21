
import { Types } from 'mongoose';

export interface IUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role?: string;
  eventApplied?: { eventCode: string; appliedDate: Date }[];
  managedEvents?: string[];
}

export interface IRegisterationForm {
  name: string;
  email: string;
  phone: string;
  department: string;
}

export interface IOTPForm {
  otp: string;
}

export interface ISession {
  _id?: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: {
    room?: string;
    venue?: string;
  };
  virtualLink?: string;
  speakers: Array<{
    name: string;
    bio?: string;
    photo?: string;
  }>;
  maxAttendees: number;
  currentAttendees: number;
  tags?: string[];
  track?: string;
}

// types/event.ts

export interface Speaker {
  _id: string;
  name: string;
  bio: string;
  photo: string;
}

export interface Session {
  _id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: {
    room: string;
    venue: string;
  };
  speakers: Speaker[];
  tags: string[];
}

export interface IEvent {
  _id?: string;
  eventCode: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  bannerImage: string;
  stateLogo: string;
  gallery: string[];
  startDate: Date;
  endDate: Date;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
  format: string;
  location: {
    venueName: string;
    address: string;
    city: string;
    mapLink: string;
  };
  virtualLink?: string;
  organizer: Types.ObjectId[] | IUser[];
  // speakers: Speaker[];
  sessions: Session[];
  status: string;
  tags: string[];
  isFeatured?: boolean;
  isIdCardIssue?: boolean;
  isCertificateIssue?: boolean;
  certificateTemplate: string;
  delegateIdCard?: string;
  guestIdCard?: string;
  organizerIdCard?: string;
}
