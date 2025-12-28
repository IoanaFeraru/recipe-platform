import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";

interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

interface UseProfileFormReturn {
  photoPreview: string | null;
  newPhoto: File | null;
  photoMessage: ProfileMessage | null;
  isUploadingPhoto: boolean;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadPhoto: () => Promise<void>;
  name: string;
  nameMessage: ProfileMessage | null;
  isSavingName: boolean;
  setName: (value: string) => void;
  handleSaveName: () => Promise<void>;
  currentPassword: string;
  newPassword: string;
  passwordMessage: ProfileMessage | null;
  passwordError: string;
  isChangingPassword: boolean;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  handleChangePassword: () => Promise<void>;
  isDeletingAccount: boolean;
  handleDeleteAccount: () => Promise<void>;
  userEmail: string | null;
  userPhotoURL: string | null;
}

/**
 * Profile settings orchestration hook.
 *
 * Provides a unified API for profile-management UX, coordinating independent flows:
 * - Profile photo selection + preview + upload via AuthContext (`updateProfilePhoto`)
 * - Display name updates via Firebase Auth (`updateProfile`)
 * - Password changes via AuthContext (`updatePassword`) with basic client validation
 * - Account deletion via AuthContext (`deleteAccount`)
 *
 * The hook intentionally keeps each section’s state separate (photo/name/password/delete)
 * to allow concurrent UI rendering and distinct loading/error messaging.
 *
 * Business rules:
 * - Photo upload requires both an authenticated `user` and a selected `newPhoto`.
 * - Display name is trimmed before persistence.
 * - Password change enforces required fields and a minimum length check (>= 6 chars).
 * - Success messages are auto-dismissed after 5 seconds; errors are surfaced either as
 *   section messages (photo/name) or as `passwordError` (password flow).
 *
 * UX considerations:
 * - Uses an object URL for immediate image preview before upload.
 * - Resets photo/password inputs after successful operations to prevent accidental reuse.
 * - Exposes `userEmail` and `userPhotoURL` for easy binding in profile screens.
 *
 * @returns Profile section state plus action handlers for profile settings UIs.
 */
export const useProfileForm = (): UseProfileFormReturn => {
  const { user, updateProfilePhoto, updatePassword, deleteAccount } = useAuth();
  const defaultProfilePic = "/default-profile.svg";

  // Photo state
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMessage, setPhotoMessage] = useState<ProfileMessage | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Name state
  const [name, setName] = useState(user?.displayName || "");
  const [nameMessage, setNameMessage] = useState<ProfileMessage | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<ProfileMessage | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account deletion state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setName(user?.displayName || "");
  }, [user]);

  const clearMessageAfterDelay = useCallback(
    (setter: React.Dispatch<React.SetStateAction<ProfileMessage | null>>) => {
      setTimeout(() => setter(null), 5000);
    },
    []
  );

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoMessage(null);
    }
  }, []);

  const handleUploadPhoto = useCallback(async () => {
    if (!newPhoto || !user) return;

    setIsUploadingPhoto(true);
    setPhotoMessage(null);

    try {
      await updateProfilePhoto(newPhoto);
      setPhotoMessage({ type: "success", text: "Profile photo updated successfully!" });
      setNewPhoto(null);
      setPhotoPreview(null);
      clearMessageAfterDelay(setPhotoMessage);
    } catch (err: unknown) {
      setPhotoMessage({ type: "error", text: "Failed to update photo." });
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [newPhoto, user, updateProfilePhoto, clearMessageAfterDelay]);

  const handleSaveName = useCallback(async () => {
    if (!user) return;

    setIsSavingName(true);
    setNameMessage(null);

    try {
      await updateProfile(user, { displayName: name.trim() });
      setNameMessage({ type: "success", text: "Name updated successfully!" });
      clearMessageAfterDelay(setNameMessage);
    } catch (err: unknown) {
      setNameMessage({ type: "error", text: "Failed to update name." });
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  }, [user, name, clearMessageAfterDelay]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !user) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordMessage(null);

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      clearMessageAfterDelay(setPasswordMessage);
    } catch (err: unknown) {
      console.error(err);
      setPasswordError((err instanceof Error && err.message) || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, user, updatePassword, clearMessageAfterDelay]);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);

    try {
      await deleteAccount();
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to delete account. You may need to re-login first.");
    } finally {
      setIsDeletingAccount(false);
    }
  }, [deleteAccount]);

  return {
    photoPreview,
    newPhoto,
    photoMessage,
    isUploadingPhoto,
    handlePhotoChange,
    handleUploadPhoto,

    name,
    nameMessage,
    isSavingName,
    setName,
    handleSaveName,

    currentPassword,
    newPassword,
    passwordMessage,
    passwordError,
    isChangingPassword,
    setCurrentPassword,
    setNewPassword,
    handleChangePassword,

    isDeletingAccount,
    handleDeleteAccount,

    userEmail: user?.email || null,
    userPhotoURL: user?.photoURL || defaultProfilePic,
  };
};

export default useProfileForm;