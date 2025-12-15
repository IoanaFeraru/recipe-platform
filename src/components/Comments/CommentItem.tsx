"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";
import StarRating from "./StarRating";
import { formatRelativeDate } from "@/lib/utils/formatting";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  currentUserId?: string;
  recipeOwnerId: string;
  onDelete: (id: string) => void;
  onReply: (parentId: string, text: string) => Promise<void>;
  userAvatars: Record<string, string>;
}

export default function CommentItem({
  comment,
  replies,
  currentUserId,
  recipeOwnerId,
  onDelete,
  onReply,
  userAvatars,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = comment.userId === recipeOwnerId;
  const canDelete = currentUserId === comment.userId;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
  };

  return (
    <div
      className={`bg-(--color-bg-secondary) border-2 rounded-2xl p-5 ${
        isOwner ? "border-(--color-primary)" : "border-(--color-border)"
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 relative shrink-0 rounded-full overflow-hidden border-2 border-(--color-border)">
          <Image
            src={userAvatars[comment.userId] || "/default-profile.svg"}
            alt={comment.userEmail || "User"}
            fill
            className="object-cover"
          />
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-(--color-text)">
                {comment.userEmail}
                {isOwner && (
                  <span className="ml-2 bg-(--color-primary) text-white text-xs px-2 py-0.5 rounded-full">
                    Recipe Owner
                  </span>
                )}
              </p>
              <p className="text-xs text-(--color-text-muted)">
                {formatRelativeDate(comment.createdAt)}
              </p>
            </div>

            {/* Delete Button */}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-(--color-danger) text-sm hover:brightness-110 transition"
              >
                Delete
              </button>
            )}
          </div>

          {/* Rating */}
          {comment.rating && (
            <div className="mb-2">
              <StarRating value={comment.rating} readonly size="sm" />
            </div>
          )}

          {/* Comment Text */}
          <p className="text-(--color-text) leading-relaxed mb-3">
            {comment.text}
          </p>

          {/* Reply Button */}
          {currentUserId && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-(--color-primary) font-semibold hover:text-(--color-secondary) transition"
            >
              {showReplyForm
                ? "↑ Hide Reply"
                : `↓ Reply${replies.length > 0 ? ` (${replies.length})` : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* Reply Form & Replies */}
      {showReplyForm && (
        <div className="mt-4 ml-16 space-y-3">
          {/* Reply Form */}
          <form onSubmit={handleReplySubmit} className="space-y-2">
            <textarea
              className="w-full border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm bg-(--color-secondary) text-white px-4 py-1.5 rounded-full hover:brightness-110 font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </button>
          </form>

          {/* Replies List */}
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`flex gap-3 p-3 rounded-lg ${
                reply.userId === recipeOwnerId
                  ? "bg-(--color-primary) bg-opacity-10 border border-(--color-primary)"
                  : "bg-(--color-bg) border border-(--color-border)"
              }`}
            >
              <div className="w-8 h-8 relative shrink-0 rounded-full overflow-hidden border-2 border-(--color-border)">
                <Image
                  src={userAvatars[reply.userId] || "/default-profile.svg"}
                  alt={reply.userEmail || "User"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-(--color-text)">
                      {reply.userEmail}
                      {reply.userId === recipeOwnerId && (
                        <span className="ml-2 text-xs bg-(--color-primary) text-white px-2 py-0.5 rounded-full">
                          Owner
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-(--color-text-muted)">
                      {formatRelativeDate(reply.createdAt)}
                    </p>
                  </div>

                  {currentUserId === reply.userId && (
                    <button
                      onClick={() => onDelete(reply.id)}
                      className="text-(--color-danger) text-xs hover:brightness-110"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm mt-1 text-(--color-text)">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}