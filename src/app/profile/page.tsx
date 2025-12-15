"use client";

import { useState, useEffect } from "react";
import AuthCard from "@/components/Auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const { user, updateProfilePhoto, updatePassword, deleteAccount } = useAuth();
  const defaultProfilePic = "/default-profile.svg";

  const [name, setName] = useState(user?.displayName || "");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [nameMessage, setNameMessage] = useState("");

  useEffect(() => {
    setName(user?.displayName || "");
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!newPhoto || !user) return;
    try {
      await updateProfilePhoto(newPhoto);
      setPhotoMessage("Profile photo updated successfully!");
      setNewPhoto(null);
      setPhotoPreview(null);
    } catch (err: any) {
      setPhotoMessage("Failed to update photo.");
      console.error(err);
    }
  };

  const handleChangeName = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: name });
      setNameMessage("Name updated successfully!");
    } catch (err: any) {
      setNameMessage("Failed to update name.");
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !user) {
      setPasswordError("Please fill in all fields.");
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setPasswordError("");
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.message || "Failed to update password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await deleteAccount();
      alert("Account deleted successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  return (
    <AuthCard title="My Profile">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={photoPreview || user?.photoURL || defaultProfilePic}
            alt="Profile Picture"
            className="w-28 h-28 rounded-full object-cover border-2 border-(--color-border)"
          />
          <label className="cursor-pointer bg-(--color-primary) text-white px-4 py-2 rounded-full hover:brightness-110 transition text-sm font-semibold">
            Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {newPhoto && (
            <Button variant="primary" onClick={handleUploadPhoto}>
              Upload Photo
            </Button>
          )}
          {photoMessage && <p className="text-sm text-(--color-primary)">{photoMessage}</p>}
        </div>

        {/* Name */}
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-center"
          />
          <Button variant="primary" onClick={handleChangeName}>
            Save Name
          </Button>
          {nameMessage && <p className="text-sm text-(--color-primary)">{nameMessage}</p>}
        </div>

        {/* Email */}
        <p className="text-(--color-text-muted) text-sm">{user?.email}</p>

        {/* Password */}
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="px-3 py-2 rounded-md border border-(--color-border) bg-(--color-bg) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
          <Button variant="primary" onClick={handleChangePassword}>
            Change Password
          </Button>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-(--color-primary)">{passwordMessage}</p>}
        </div>

        {/* Delete Account */}
        <div className="mt-4">
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
