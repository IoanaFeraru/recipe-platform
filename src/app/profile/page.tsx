"use client";

import { useProfileForm } from "@/hooks/useProfileForm";
import { AuthCard } from "@/components/Auth";
import { ProfileDangerZone, ProfileNameSection, ProfilePasswordSection, ProfilePhotoSection } from "@/components/Profile";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

/**
 * ProfilePage - User profile management
 */
export default function ProfilePage() {
  const {
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
    userEmail,
    userPhotoURL,
  } = useProfileForm();

  return (
    <PageErrorBoundary>
      <AuthCard title="My Profile">
        <div className="flex flex-col items-center gap-6">
          {/* Profile Photo */}
          <ProfilePhotoSection
            currentPhotoURL={userPhotoURL || "/default-profile.svg"}
            photoPreview={photoPreview}
            newPhoto={newPhoto}
            message={photoMessage}
            isUploading={isUploadingPhoto}
            onPhotoChange={handlePhotoChange}
            onUpload={handleUploadPhoto}
          />

          {/* Name & Email */}
          <ProfileNameSection
            name={name}
            email={userEmail}
            message={nameMessage}
            isSaving={isSavingName}
            onNameChange={setName}
            onSave={handleSaveName}
          />

          {/* Password Change */}
          <ProfilePasswordSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            error={passwordError}
            message={passwordMessage}
            isChanging={isChangingPassword}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onSubmit={handleChangePassword}
          />

          {/* Danger Zone */}
          <ProfileDangerZone
            isDeleting={isDeletingAccount}
            onDelete={handleDeleteAccount}
          />
        </div>
      </AuthCard>
    </PageErrorBoundary>
  );
}