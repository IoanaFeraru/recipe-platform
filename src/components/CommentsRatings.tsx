"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Comment } from "@/types/comment";

interface CommentsRatingsProps {
  recipeId: string;
  recipeOwnerId: string;
}

export default function CommentsRatings({ recipeId, recipeOwnerId }: CommentsRatingsProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("recipeId", "==", recipeId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];

      setComments(data);

      const ratings = data.filter(
        c => c.rating && !c.parentCommentId && c.userId !== recipeOwnerId
      );

      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + (b.rating || 0), 0);
        setAverageRating(sum / ratings.length);
        setTotalRatings(ratings.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    });
  }, [recipeId, recipeOwnerId]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || rating === 0) return;

    setIsSubmitting(true);

    await addDoc(collection(db, "comments"), {
      recipeId,
      userId: user.uid,
      userEmail: user.email,
      text: newComment.trim(),
      rating,
      createdAt: new Date(),
      parentCommentId: null,
      isOwnerReply: false
    });

    setNewComment("");
    setRating(0);
    setIsSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyText[parentId]?.trim()) return;

    await addDoc(collection(db, "comments"), {
      recipeId,
      userId: user.uid,
      userEmail: user.email,
      text: replyText[parentId].trim(),
      rating: null,
      createdAt: new Date(),
      parentCommentId: parentId,
      isOwnerReply: user.uid === recipeOwnerId
    });

    setReplyText(prev => ({ ...prev, [parentId]: "" }));
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "comments", id));
  };

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={i <= (interactive ? hoverRating || rating : value) ? "#f59e0b" : "#9ca3af"}
            width="22"
            height="22"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );

  const formatDate = (t: any) => {
    const d = t?.toDate ? t.toDate() : new Date(t);
    return d.toLocaleString();
  };

  const topLevel = comments.filter(c => !c.parentCommentId);
  const replies = comments.filter(c => c.parentCommentId);

  return (
    <div className="mt-12 border-t border-gray-300 pt-8 space-y-8">
      <h2 className="text-3xl font-bold mb-6 text-(--color-primary)">Ratings & Comments</h2>

      {/* Average Rating */}
      {totalRatings > 0 && (
        <div className="flex items-center gap-4 p-4 bg-yellow-100 rounded-lg">
          <span className="text-4xl font-bold text-yellow-700">{averageRating.toFixed(1)}</span>
          <div>
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-gray-600">
              Based on {totalRatings} rating{totalRatings !== 1 && "s"}
            </p>
          </div>
        </div>
      )}

      {/* Leave a Review */}
      {user && user.uid !== recipeOwnerId && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <h3 className="font-semibold text-gray-900">Leave a Review</h3>
          <div>{renderStars(rating, true)}</div>
          <textarea
            className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-700"
            rows={3}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write your comment..."
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-2 bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Submit
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {topLevel.map(c => (
          <div key={c.id} className="border p-4 rounded-lg bg-white space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800">{c.userEmail}</p>
              {c.userId === recipeOwnerId && (
                <span className="ml-2 text-xs text-red-700 font-semibold">OP</span>
              )}
            </div>
            <p className="text-xs text-gray-600">{formatDate(c.createdAt)}</p>
            {c.rating && <div className="my-2">{renderStars(c.rating)}</div>}
            <p className="text-gray-800">{c.text}</p>

            {/* Reply Input */}
            {user && (
              <div className="mt-3 ml-4 space-y-2">
                <textarea
                  className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                  rows={2}
                  value={replyText[c.id] || ""}
                  onChange={e =>
                    setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))
                  }
                  placeholder="Write a reply..."
                />
                <button
                  onClick={() => handleReply(c.id)}
                  className="text-sm text-blue-700 hover:text-blue-800 font-semibold"
                >
                  Reply
                </button>
              </div>
            )}

            {/* Replies */}
            <div className="mt-4 ml-6 space-y-3">
              {replies
                .filter(r => r.parentCommentId === c.id)
                .map(r => (
                  <div
                    key={r.id}
                    className={`p-3 rounded border ${
                      r.userId === recipeOwnerId
                        ? "bg-red-100 border-red-300"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${r.userId === recipeOwnerId ? "text-red-700" : "text-gray-800"}`}>
                      {r.userEmail}
                      {r.userId === recipeOwnerId && <span className="ml-2 text-xs font-semibold">OP</span>}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(r.createdAt)}</p>
                    <p className="text-sm mt-1 text-gray-800">{r.text}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
