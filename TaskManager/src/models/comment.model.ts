// CommentDomain model
export interface Comment {
  id?: string;
  content?: string;
  issueId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
