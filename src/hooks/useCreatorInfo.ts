import { useState, useEffect } from "react";
import { fetchUserAvatar } from "@/lib/utils/fetchUserAvatar";

interface CreatorInfo {
  name: string;
  avatarUrl?: string;
}

/**
 * useCreatorInfo - Custom hook for fetching recipe creator information
 * Separates creator data fetching from main component logic
 * 
 * @param authorId - Recipe author's user ID
 * @param authorName - Recipe author's display name
 * @returns Creator info with loading state
 */
export const useCreatorInfo = (
  authorId: string | undefined,
  authorName: string | undefined
) => {
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId || !authorName) {
      setLoading(false);
      return;
    }

    const fetchCreatorData = async () => {
      try {
        const avatarUrl = await fetchUserAvatar(authorId);
        setCreator({
          name: authorName,
          avatarUrl,
        });
      } catch (error) {
        console.error("Failed to fetch creator info:", error);
        setCreator({
          name: authorName,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [authorId, authorName]);

  return { creator, loading };
};