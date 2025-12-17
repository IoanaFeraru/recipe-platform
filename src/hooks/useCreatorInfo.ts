import { useState, useEffect } from "react";
import { fetchUserAvatar } from "@/lib/utils/fetchUserAvatar";

interface CreatorInfo {
  name: string;
  avatarUrl?: string;
}

/**
 * Hook for loading recipe creator attribution (display name + optional avatar).
 *
 * Behavior:
 * - If `authorId`/`authorName` are missing, the hook resolves immediately with `loading=false`
 *   and `creator=null`.
 * - If present, it fetches the author's avatar from Firebase Storage (via `fetchUserAvatar`)
 *   while keeping UI logic simple for recipe pages that render attribution.
 *
 * Non-obvious business rule:
 * - Avatar loading is “best effort”: failures do not block rendering and degrade gracefully to
 *   name-only display. This is intentional to keep recipe detail pages resilient when Storage
 *   is unavailable or the user has no uploaded avatar.
 *
 * Return contract:
 * - `creator` is either `null` (insufficient inputs) or `{ name, avatarUrl? }`.
 * - `avatarUrl` may be omitted if unavailable; consumers should render conditionally.
 */
export const useCreatorInfo = (
  authorId: string | undefined,
  authorName: string | undefined
) => {
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId || !authorName) {
      setCreator(null);
      setLoading(false);
      return;
    }

    const fetchCreatorData = async () => {
      try {
        const avatarUrl = await fetchUserAvatar(authorId);
        setCreator({ name: authorName, avatarUrl });
      } catch (error) {
        console.error("Failed to fetch creator info:", error);
        setCreator({ name: authorName });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [authorId, authorName]);

  return { creator, loading };
};