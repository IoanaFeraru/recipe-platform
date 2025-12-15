import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export const fetchUserAvatar = async (userId: string) => {
  try {
    const folderRef = ref(storage, "profilePhotos");
    const list = await listAll(folderRef);
    const file = list.items.find((item) => item.name.startsWith(userId));
    if (!file) return "/default-profile.svg";
    return await getDownloadURL(file);
  } catch {
    return "/default-profile.svg";
  }
};