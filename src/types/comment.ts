export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userEmail: string;
  text: string;
  rating?: number | null;
  createdAt: any;
  isOwnerReply?: boolean;
  parentCommentId?: string | null;
}
