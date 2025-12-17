"use client";

/**
 * CommentsList
 *
 * Pure presentational component responsible for rendering a list of top-level
 * recipe comments (reviews) and their associated replies, including an empty
 * state when no comments are available.
 *
 * Responsibilities:
 * - Displays a friendly empty state when `comments` is empty
 * - Iterates over top-level comments and renders a `CommentItem` for each
 * - Resolves each comment’s replies via the injected `getReplies(parentId)` helper
 * - Delegates reply creation and deletion to parent callbacks (`onReply`, `onDelete`)
 * - Passes avatar URLs via `userAvatars` for consistent identity rendering
 *
 * Assumptions:
 * - `comments` contains only top-level comments (i.e., not replies). If replies are
 *   included, the parent should filter them out before passing to this component.
 * - `getReplies` returns replies for a given parent comment id, already sorted as desired.
 *
 * @component
 *
 * @param {Object} props
 * @param {Comment[]} props.comments - Top-level comments to render
 * @param {string} [props.currentUserId] - Current authenticated user ID (enables actions in children)
 * @param {string} props.recipeOwnerId - Recipe owner user ID (for owner styling in children)
 * @param {(id: string) => void} props.onDelete - Invoked when a comment or reply should be deleted
 * @param {(parentId: string, text: string) => Promise<void>} props.onReply
 *        Invoked when a reply is posted for a given parent comment
 * @param {(parentId: string) => Comment[]} props.getReplies - Resolves replies for a given parent comment
 * @param {Record<string, string>} props.userAvatars - Map of userId -> avatar URL
 *
 * @example
 * ```tsx
 * <CommentsList
 *   comments={topLevelComments}
 *   currentUserId={user?.uid}
 *   recipeOwnerId={recipe.authorId}
 *   onDelete={deleteComment}
 *   onReply={addReply}
 *   getReplies={getReplies}
 *   userAvatars={avatarMap}
 * />
 * ```
 */

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