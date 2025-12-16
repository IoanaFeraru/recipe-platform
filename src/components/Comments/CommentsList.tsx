"use client";

import React from "react";
import { Comment } from "@/types/comment";
import CommentItem from "./CommentItem";

interface CommentsListProps {
  comments: Comment[];
  currentUserId?: string;
  recipeOwnerId: string;
  onDelete: (id: string) => void;
  onReply: (parentId: string, text: string) => Promise<void>;
  getReplies: (parentId: string) => Comment[];
  userAvatars: Record<string, string>;
}

/**
 * CommentsList - Renders list of comments with empty state
 * Pure presentational component for comment display
 */
export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  currentUserId,
  recipeOwnerId,
  onDelete,
  onReply,
  getReplies,
  userAvatars,
}) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl">
        <div className="text-5xl mb-4">💬</div>
        <p className="text-(--color-text-muted)">
          No reviews yet. Be the first to review this recipe!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={getReplies(comment.id)}
          currentUserId={currentUserId}
          recipeOwnerId={recipeOwnerId}
          onDelete={onDelete}
          onReply={onReply}
          userAvatars={userAvatars}
        />
      ))}
    </div>
  );
};