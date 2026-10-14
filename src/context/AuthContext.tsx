import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  currentUser: { email: string; displayName: string; uid: string } | null;
  userProfile: UserProfile;
  isFirebase: boolean;
  isDemoMode: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const hasFirebase = isFirebaseConfigured();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!hasFirebase);
  const [currentUser, setCurrentUser] = useState<{ email: string; displayName: string; uid: string } | null>(
    () => StorageService.getStoredAuthUser()
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (hasFirebase && auth && !isDemoMode) {
      setLoading(true);
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const userObj = {
            email: fbUser.email || '',
            displayName: fbUser.displayName || userProfile.displayName || 'Student',
            uid: fbUser.uid,
          };
          setCurrentUser(userObj);
          StorageService.setStoredAuthUser(userObj);
        } else {
          setCurrentUser(null);
          StorageService.setStoredAuthUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [hasFirebase, isDemoMode, userProfile.displayName]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    if (hasFirebase && auth && !isDemoMode) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const userObj = {
          email: userCred.user.email || '',
          displayName: userCred.user.displayName || 'Student',
          uid: userCred.user.uid,
        };
        setCurrentUser(userObj);
        StorageService.setStoredAuthUser(userObj);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to authenticate with Firebase' };
      }
    } else {
      // Demo authentication mode
      const userObj = {
        email,
        displayName: email.split('@')[0] || userProfile.displayName,
        uid: 'demo-user-123',
      };
      setCurrentUser(userObj);
      StorageService.setStoredAuthUser(userObj);
      return { success: true };
    }
  };

  const signup = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass || !name) {
      return { success: false, error: 'Please fill in all registration fields.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (hasFirebase && auth && !isDemoMode) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        const userObj = {
          email: userCred.user.email || '',
          displayName: name,
          uid: userCred.user.uid,
        };
        setCurrentUser(userObj);
        StorageService.setStoredAuthUser(userObj);
        const updatedProfile = {
          ...userProfile,
          uid: userCred.user.uid,
          displayName: name,
          email,
          onboardingCompleted: false,
        };
        setUserProfile(updatedProfile);
        StorageService.saveUserProfile(updatedProfile);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Firebase sign-up failed.' };
      }
    } else {
      // Demo sign up mode
      const userObj = {
        email,
        displayName: name,
        uid: `user-${Date.now()}`,
      };
      setCurrentUser(userObj);
      StorageService.setStoredAuthUser(userObj);
      const updatedProfile = {
        ...userProfile,
        displayName: name,
        email,
        onboardingCompleted: false, // will direct to onboarding wizard
      };
      setUserProfile(updatedProfile);
      StorageService.saveUserProfile(updatedProfile);
      return { success: true };
    }
  };

  const logout = async () => {
    if (hasFirebase && auth && !isDemoMode) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error', err);
      }
    }
    setCurrentUser(null);
    StorageService.setStoredAuthUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) return { success: false, error: 'Please provide your account email address.' };
    if (hasFirebase && auth && !isDemoMode) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send password reset.' };
      }
    } else {
      // Demo password reset simulation
      return { success: true };
    }
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...partial };
    setUserProfile(updated);
    StorageService.saveUserProfile(updated);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isFirebase: hasFirebase,
        isDemoMode,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        setDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
