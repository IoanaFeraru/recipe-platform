import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Resolves the public URL for a user's profile photo stored in Firebase Storage.
 *
 * Storage layout and convention:
 * - Folder: `profilePhotos/`
 * - File name prefix: `{userId}_...`
 *
 * The implementation lists the folder and returns the first item whose name
 * starts with the provided userId. If nothing is found (or Storage is not
 * reachable), it falls back to a default local avatar.
 *
 * Note: `listAll()` is simple but can become expensive as the folder grows.
 * If this becomes an issue, consider storing `photoPath`/`photoUrl` on the user
 * document, or using `list()` with pagination and a stricter naming strategy.
 */
export const fetchUserAvatar = async (userId: string): Promise<string> => {
  const fallback = "/default-profile.svg";

  try {
    const folderRef = ref(storage, "profilePhotos");
    const { items } = await listAll(folderRef);

    const match = items.find(item => item.name.startsWith(userId));
    if (!match) return fallback;

    return await getDownloadURL(match);
  } catch {
    return fallback;
  }
};