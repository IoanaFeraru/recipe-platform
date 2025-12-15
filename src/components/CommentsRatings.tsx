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
  where,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Comment } from "@/types/comment";
import Image from "next/image";
import { storage } from "@/lib/firebase";
import { ref, getDownloadURL, listAll } from "firebase/storage";

interface CommentsRatingsProps {
  recipeId: string;
  recipeOwnerId: string;
}

const updateRecipeStats = async (recipeId: string, recipeOwnerId: string) => {
  try {
    const q = query(
      collection(db, "comments"),
      where("recipeId", "==", recipeId)
    );

    const snapshot = await getDocs(q);

    const ratings = snapshot.docs
      .map((d) => d.data())
      .filter(
        (c) => c.rating && !c.parentCommentId && c.userId !== recipeOwnerId
      );

    const totalRatings = ratings.length;
    let averageRating = 0;

    if (totalRatings > 0) {
      const sum = ratings.reduce((a, b) => a + (b.rating || 0), 0);
      averageRating = sum / totalRatings;
    }

    const recipeRef = doc(db, "recipes", recipeId);
    await updateDoc(recipeRef, {
      avgRating: averageRating,
      reviewCount: totalRatings,
    });
  } catch (error) {
    console.error("Failed to update recipe stats:", error);
  }
};

export default function CommentsRatings({
  recipeId,
  recipeOwnerId,
}: CommentsRatingsProps) {
  const { user } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [userHasRated, setUserHasRated] = useState(false);
  const [userExistingRating, setUserExistingRating] = useState<Comment | null>(
    null
  );

  const isOwner = user?.uid === recipeOwnerId;

  useEffect(() => {
    comments.forEach(async (c) => {
      if (!userPhotos[c.userId]) {
        try {
          const folderRef = ref(storage, "profilePhotos");
          const list = await listAll(folderRef);
          const file = list.items.find((item) =>
            item.name.startsWith(c.userId)
          );
          if (file) {
            const url = await getDownloadURL(file);
            setUserPhotos((prev) => ({ ...prev, [c.userId]: url }));
          } else {
            setUserPhotos((prev) => ({
              ...prev,
              [c.userId]: "/default-profile.svg",
            }));
          }
        } catch (err) {
          console.error("Error fetching profile picture:", err);
          setUserPhotos((prev) => ({
            ...prev,
            [c.userId]: "/default-profile.svg",
          }));
        }
      }
    });
  }, [comments, userPhotos]);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("recipeId", "==", recipeId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Comment[];

      setComments(data);

      if (user && !isOwner) {
        const existingRating = data.find(
          (c) => c.userId === user.uid && c.rating && !c.parentCommentId
        );
        if (existingRating) {
          setUserHasRated(true);
          setUserExistingRating(existingRating);
          setRating(existingRating.rating || 0);
        } else {
          setUserHasRated(false);
          setUserExistingRating(null);
        }
      }

      const ratings = data.filter(
        (c) => c.rating && !c.parentCommentId && c.userId !== recipeOwnerId
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
  }, [recipeId, recipeOwnerId, user, isOwner]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) {
      alert("Please write a comment");
      return;
    }

    if (!isOwner && rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!isOwner && userHasRated) {
      alert(
        "You have already rated this recipe. You can edit your existing review."
      );
      return;
    }

    setIsSubmitting(true);

    await addDoc(collection(db, "comments"), {
      recipeId,
      userId: user.uid,
      userEmail: user.email,
      userPhotoURL: user.photoURL || "/default-profile.svg",
      text: newComment.trim(),
      rating: isOwner ? null : rating,
      createdAt: new Date(),
      parentCommentId: null,
      isOwnerReply: isOwner,
    });

    if (!isOwner && rating > 0) {
      await updateRecipeStats(recipeId, recipeOwnerId);
    }

    setNewComment("");
    setRating(0);
    setIsSubmitting(false);
  };

  const handleEditRating = async () => {
    if (!user || !userExistingRating || !newComment.trim()) {
      alert("Please write a comment");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateDoc(doc(db, "comments", userExistingRating.id), {
        text: newComment.trim(),
        rating: rating,
      });

      await updateRecipeStats(recipeId, recipeOwnerId);

      setNewComment("");
      setRating(0);
    } catch (error) {
      console.error("Error updating rating:", error);
      alert("Failed to update rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyText[parentId]?.trim()) return;
    await addDoc(collection(db, "comments"), {
      recipeId,
      userId: user.uid,
      userEmail: user.email,
      userPhotoURL: user.photoURL || "/default-profile.svg",
      text: replyText[parentId].trim(),
      rating: null,
      createdAt: new Date(),
      parentCommentId: parentId,
      isOwnerReply: user.uid === recipeOwnerId,
    });
    setReplyText((prev) => ({ ...prev, [parentId]: "" }));
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Are you sure you want to delete this comment?")) {
      const commentToDelete = comments.find((c) => c.id === id);
      await deleteDoc(doc(db, "comments", id));
      if (
        commentToDelete &&
        commentToDelete.rating &&
        !commentToDelete.parentCommentId
      ) {
        await updateRecipeStats(recipeId, recipeOwnerId);
      }
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`transition ${interactive ? "hover:scale-110" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={
              i <= (interactive ? hoverRating || rating : value)
                ? "#f59e0b"
                : "#d1d5db"
            }
            width="24"
            height="24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );

  const formatDate = (t: any) => {
    if (!t) return "";
    const d = t?.toDate ? t.toDate() : new Date(t);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold garet-heavy text-(--color-text)">
        Reviews & Comments
      </h2>

      {/* Average Rating Display */}
      {totalRatings > 0 && (
        <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-(--color-border) rounded-2xl p-6 flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-600 garet-heavy">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2">{renderStars(Math.round(averageRating))}</div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-(--color-primary)">
              {totalRatings} {totalRatings === 1 ? "Review" : "Reviews"}
            </p>
            <p className="text-sm text-(--color-text-muted)">
              Based on verified ratings
            </p>
          </div>
        </div>
      )}

      {/* Leave a Review/Comment */}
      {user ? (
        <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold text-(--color-text) garet-heavy">
            {isOwner
              ? "Reply to Comments"
              : userHasRated
              ? "Edit Your Review"
              : "Leave a Review"}
          </h3>

          {!isOwner && userHasRated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ℹ️ You've already reviewed this recipe. You can edit your rating
                and comment below.
              </p>
            </div>
          )}

          {!isOwner && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-(--color-text)">
                Your Rating *
              </label>
              {renderStars(rating, true)}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-(--color-text)">
              Your Comment *
            </label>
            <textarea
              className="w-full border-2 border-(--color-border) rounded-lg p-3 bg-(--color-bg) text-(--color-text) focus:outline-none focus:border-(--color-primary) min-h-24"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isOwner
                  ? "Reply to your reviewers..."
                  : userHasRated
                  ? "Update your review..."
                  : "Share your thoughts about this recipe..."
              }
            />
          </div>

          <button
            onClick={userHasRated ? handleEditRating : handleSubmit}
            disabled={isSubmitting}
            className="bg-(--color-primary) text-white px-6 py-3 rounded-full font-semibold shadow-[4px_4px_0_0_var(--color-shadow)] hover:brightness-110 disabled:opacity-50 transition"
          >
            {isSubmitting
              ? userHasRated
                ? "Updating..."
                : "Posting..."
              : userHasRated
              ? "Update Review"
              : "Post Comment"}
          </button>
        </div>
      ) : (
        <div className="bg-(--color-bg-secondary) border-2 border-(--color-border) rounded-2xl p-6 text-center">
          <p className="text-(--color-text-muted)">
            Please log in to leave a review or comment
          </p>
        </div>
      )}

      {topLevel.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-(--color-text-muted)">
            No reviews yet. Be the first to review this recipe!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevel.map((c) => {
            const commentReplies = replies.filter(
              (r) => r.parentCommentId === c.id
            );
            const isExpanded = expandedReplies[c.id];
            return (
              <div
                key={c.id}
                className={`bg-(--color-bg-secondary) border-2 rounded-2xl p-5 ${
                  c.userId === recipeOwnerId
                    ? "border-(--color-primary)"
                    : "border-(--color-border)"
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 relative shrink-0 rounded-full overflow-hidden border-2 border-(--color-border)">
                    <Image
                      src={userPhotos[c.userId] || "/default-profile.svg"}
                      alt={c.userEmail || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-(--color-text)">
                          {c.userEmail}
                          {c.userId === recipeOwnerId && (
                            <span className="ml-2 bg-(--color-primary) text-white text-xs px-2 py-0.5 rounded-full">
                              Recipe Owner
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-(--color-text-muted)">
                          {formatDate(c.createdAt)}
                        </p>
                      </div>
                      {user && user.uid === c.userId && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-(--color-danger) text-sm hover:brightness-110"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    {c.rating && (
                      <div className="mb-2">{renderStars(c.rating)}</div>
                    )}
                    <p className="text-(--color-text) leading-relaxed">
                      {c.text}
                    </p>
                    {user && (
                      <button
                        onClick={() => toggleReplies(c.id)}
                        className="mt-3 text-sm text-(--color-primary) font-semibold hover:text-(--color-secondary)"
                      >
                        {isExpanded
                          ? "↑ Hide Reply"
                          : `↓ Reply${
                              commentReplies.length > 0
                                ? ` (${commentReplies.length})`
                                : ""
                            }`}
                      </button>
                    )}
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 ml-16 space-y-3">
                    <div className="space-y-2">
                      <textarea
                        className="w-full border-2 border-(--color-border) rounded-lg p-2 bg-(--color-bg) text-(--color-text) text-sm focus:outline-none focus:border-(--color-primary)"
                        rows={2}
                        value={replyText[c.id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        placeholder="Write a reply..."
                      />
                      <button
                        onClick={() => handleReply(c.id)}
                        className="text-sm bg-(--color-secondary) text-white px-4 py-1.5 rounded-full hover:brightness-110 font-semibold"
                      >
                        Post Reply
                      </button>
                    </div>
                    {commentReplies.map((r) => (
                      <div
                        key={r.id}
                        className={`flex gap-3 p-3 rounded-lg ${
                          r.userId === recipeOwnerId
                            ? "bg-(--color-primary) bg-opacity-10 border border-(--color-primary)"
                            : "bg-(--color-bg) border border-(--color-border)"
                        }`}
                      >
                        <div className="w-8 h-8 relative shrink-0 rounded-full overflow-hidden border-2 border-(--color-border)">
                          <Image
                            src={userPhotos[r.userId] || "/default-profile.svg"}
                            alt={r.userEmail || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold text-(--color-text)">
                                {r.userEmail}
                                {r.userId === recipeOwnerId && (
                                  <span className="ml-2 text-xs bg-(--color-primary) text-white px-2 py-0.5 rounded-full">
                                    Owner
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-(--color-text-muted)">
                                {formatDate(r.createdAt)}
                              </p>
                            </div>
                            {user && user.uid === r.userId && (
                              <button
                                onClick={() => handleDelete(r.id)}
                                className="text-(--color-danger) text-xs hover:brightness-110"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                          <p className="text-sm mt-1 text-(--color-text)">
                            {r.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
