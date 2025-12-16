import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";

interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

interface UseProfileFormReturn {
  // Photo state
  photoPreview: string | null;
  newPhoto: File | null;
  photoMessage: ProfileMessage | null;
  isUploadingPhoto: boolean;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadPhoto: () => Promise<void>;
  
  // Name state
  name: string;
  nameMessage: ProfileMessage | null;
  isSavingName: boolean;
  setName: (value: string) => void;
  handleSaveName: () => Promise<void>;
  
  // Password state
  currentPassword: string;
  newPassword: string;
  passwordMessage: ProfileMessage | null;
  passwordError: string;
  isChangingPassword: boolean;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  handleChangePassword: () => Promise<void>;
  
  // Account deletion
  isDeletingAccount: boolean;
  handleDeleteAccount: () => Promise<void>;
  
  // User data
  userEmail: string | null;
  userPhotoURL: string | null;
}

/**
 * useProfileForm - Custom hook for profile page state and logic
 * 
 * Encapsulates:
 * - Photo upload handling
 * - Name update handling
 * - Password change handling
 * - Account deletion
 * - Message management
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

  // Sync name with user
  useEffect(() => {
    setName(user?.displayName || "");
  }, [user]);

  // Clear messages after delay
  const clearMessageAfterDelay = useCallback((
    setter: React.Dispatch<React.SetStateAction<ProfileMessage | null>>
  ) => {
    setTimeout(() => setter(null), 5000);
  }, []);

  // Photo handlers
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
    } catch (err: any) {
      setPhotoMessage({ type: "error", text: "Failed to update photo." });
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [newPhoto, user, updateProfilePhoto, clearMessageAfterDelay]);

  // Name handlers
  const handleSaveName = useCallback(async () => {
    if (!user) return;
    
    setIsSavingName(true);
    setNameMessage(null);
    
    try {
      await updateProfile(user, { displayName: name.trim() });
      setNameMessage({ type: "success", text: "Name updated successfully!" });
      clearMessageAfterDelay(setNameMessage);
    } catch (err: any) {
      setNameMessage({ type: "error", text: "Failed to update name." });
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  }, [user, name, clearMessageAfterDelay]);

  // Password handlers
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
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  }, [currentPassword, newPassword, user, updatePassword, clearMessageAfterDelay]);

  // Account deletion
  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    
    try {
      await deleteAccount();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete account. You may need to re-login first.");
    } finally {
      setIsDeletingAccount(false);
    }
  }, [deleteAccount]);

  return {
    // Photo
    photoPreview,
    newPhoto,
    photoMessage,
    isUploadingPhoto,
    handlePhotoChange,
    handleUploadPhoto,
    
    // Name
    name,
    nameMessage,
    isSavingName,
    setName,
    handleSaveName,
    
    // Password
    currentPassword,
    newPassword,
    passwordMessage,
    passwordError,
    isChangingPassword,
    setCurrentPassword,
    setNewPassword,
    handleChangePassword,
    
    // Account
    isDeletingAccount,
    handleDeleteAccount,
    
    // User data
    userEmail: user?.email || null,
    userPhotoURL: user?.photoURL || defaultProfilePic,
  };
};

export default useProfileForm;