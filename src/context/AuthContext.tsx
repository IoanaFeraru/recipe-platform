"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as firebaseUpdatePassword,
  deleteUser as firebaseDeleteUser,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  UserCredential,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

/**
 * React authentication context for Firebase Auth in a Next.js client environment.
 *
 * Provides:
 * - Reactive `user` session state via `onAuthStateChanged`
 * - Standard auth flows: register, login, logout
 * - Account maintenance: profile photo upload (Storage + Auth profile), password update (reauth), and account deletion
 *
 * Operational notes:
 * - Password updates require recent sign-in; this module reauthenticates using email/password credentials.
 * - Account deletion removes only the Firebase Auth identity. Application data stored in Firestore/Storage must be
 *   cleaned up separately to avoid orphaned recipes/comments/favorites/assets.
 * - Profile photo uploads are written to `profilePhotos/{uid}` and then the Auth profile’s `photoURL` is updated.
 */
interface AuthContextType {
  user: User | null;
  register: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePhoto: (file: File) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const register = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const updateProfilePhoto = async (file: File): Promise<void> => {
    if (!user) throw new Error("No user logged in");

    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    await uploadBytes(storageRef, file);

    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL });

    // Keep local state in sync for immediate UI refresh.
    setUser({ ...user, photoURL });
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!user || !user.email) throw new Error("No user logged in");

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await firebaseUpdatePassword(user, newPassword);
  };

  const deleteAccount = async (): Promise<void> => {
    if (!user) throw new Error("No user logged in");
    await firebaseDeleteUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        updateProfilePhoto,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};