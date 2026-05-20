export type Question = {
  _id: string;
  text: string;
  upVotes: number;
  createdAt: string;
  userId: string;
  userName: string;
  userDepartment: string;
  eventId: string;
  status?: 'active' | 'answered' | 'removed' | 'pending';
  replies?: string[];
};
