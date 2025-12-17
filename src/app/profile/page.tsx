/**
 * ProfilePage
 *
 * User profile management container page. Orchestrates the profile workflow by consuming
 * `useProfileForm` and composing the profile UI from dedicated, presentational sub-sections.
 *
 * Responsibilities:
 * - Retrieve and manage all profile-related state and handlers via `useProfileForm`
 *   - Profile photo selection/preview/upload lifecycle
 *   - Display name editing and persistence
 *   - Password change flow (current/new password + validation/errors)
 *   - Account deletion flow (danger zone)
 * - Pass state and callbacks to section components (`ProfilePhotoSection`, `ProfileNameSection`,
 *   `ProfilePasswordSection`, `ProfileDangerZone`) to keep UI modular and maintainable
 * - Provide consistent page layout using `AuthCard`
 * - Guard the page with `PageErrorBoundary` to prevent profile errors from breaking navigation
 *
 * Architecture:
 * - Container + presentational components separation:
 *   - This file coordinates data/state and delegates rendering to smaller UI components
 * - Hook-driven business logic:
 *   - Side effects and async operations are encapsulated in `useProfileForm`
 * - Error isolation:
 *   - Page-level error boundary for resilience during profile operations (upload, auth updates, deletion)
 *
 * @module ProfilePage
 */

"use client";

import { useProfileForm } from "@/hooks/useProfileForm";
import { AuthCard } from "@/components/Auth";
import {
  ProfileDangerZone,
  ProfileNameSection,
  ProfilePasswordSection,
  ProfilePhotoSection,
} from "@/components/Profile";
import { PageErrorBoundary } from "@/components/ErrorBoundary";

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
