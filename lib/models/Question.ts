import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  eventId: Types.ObjectId;
  text: string;
  upVotes: number;
  createdAt: Date;
  replies: string[];
  userId: string;
  userName: string;
  userDepartment: string;
  status: 'active' | 'answered' | 'removed';
}

const QuestionSchema: Schema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  upVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'answered', 'removed', 'pending'],
    default: 'active'
  }
});

QuestionSchema.index({ upVotes: -1, createdAt: -1 });

export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
