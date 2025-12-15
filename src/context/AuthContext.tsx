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
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";
import { UserCredential } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  register: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePhoto: (file: File) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
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
    return await createUserWithEmailAndPassword(auth, email, password);
  };
  
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfilePhoto = async (file: File) => {
    if (!user) throw new Error("No user logged in");
    const storageRef = ref(storage, `profilePhotos/${user.uid}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL });
    setUser({ ...user, photoURL });
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user || !user.email) throw new Error("No user logged in");

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);
    await firebaseUpdatePassword(user, newPassword);
  };

  const deleteAccount = async () => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
