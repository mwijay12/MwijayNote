
import { useState, useEffect, useCallback } from 'react';
import { UserData } from '../types';
import { auth, signInWithGoogle, handleRedirectResult, db as firestoreDb } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Preferences } from '@capacitor/preferences';
import { sendUserRegistered } from '../services/n8nEvents';

const USER_STORAGE_KEY = 'mwijay_note_user';

const defaultUserData: Omit<UserData, 'name'> = {
    profilePicture: '🧘',
    journeyProgress: {},
    growthPoints: 0,
    activityLog: {},
    streakFreezes: 0,
};

export const useUser = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsLoggedIn(true);
        // Sync user data from Firestore
        try {
          const docRef = doc(firestoreDb, `users/${user.uid}/profile/data`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as UserData;
            // Always apply latest Google photoURL for profile pic consistency
            const latestPic = user.photoURL || cloudData.profilePicture || '🧘';
            const merged = { ...defaultUserData, ...cloudData, profilePicture: latestPic };
            setUserData(prev => ({ ...defaultUserData, ...prev, ...merged }));
            _saveUserDataToStorage({ ...defaultUserData, ...merged });
            setIsOnboarded(true);
          } else {
            // First time login - New User Detected
            const { value } = await Preferences.get({ key: 'mwijay_settings' });
            const settings = value ? JSON.parse(value) : {};
            if (user.email) {
                await sendUserRegistered(user.displayName || 'User', user.email, user.uid);
            }
            // Save initial profile to prevent triggering again
            const initialData = { ...defaultUserData, userId: user.uid, email: user.email, name: user.displayName || 'User' };
            await setDoc(docRef, initialData);
            setUserData(initialData as any);
            _saveUserDataToStorage(initialData as any);
            setIsOnboarded(true);
          }
        } catch (error) {
          console.error("Error pulling profile:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    try {
      const storedUserData = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserData) {
        const data: UserData = JSON.parse(storedUserData);
        setUserData({ ...defaultUserData, ...data });
        setIsOnboarded(true);
        // Initially lock if PIN exists
        if (data.pin) {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
        if (data.email) {
          setIsLoggedIn(true);
        }
      } else {
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage', error);
      setIsLocked(false);
    } finally {
        setIsLoading(false);
    }

    // Handle Google Redirect Result
    const checkRedirect = async () => {
        const user = await handleRedirectResult();
        if (user) {
            updateUserAccountDetails({
                name: user.displayName || 'User',
                email: user.email || undefined,
                profilePicture: user.photoURL || '🧘',
            });
        }
    };
    checkRedirect();

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) {
      updateUserAccountDetails({
        name: user.displayName || 'User',
        email: user.email || undefined,
        profilePicture: user.photoURL || '🧘',
      });
    }
  };

  const _syncProfileToCloud = async (data: UserData) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(firestoreDb, `users/${user.uid}/profile/data`);
      await setDoc(docRef, { ...data, userId: user.uid });
    } catch (e) {
      console.error("Cloud profile sync failed:", e);
    }
  };

  const _saveUserDataToStorage = (data: UserData | null) => {
    try {
      if (data) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
        _syncProfileToCloud(data);
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save user data to localStorage', error);
    }
  };

  const completeOnboarding = useCallback((name: string) => {
    const newUserData: UserData = { ...defaultUserData, name };
    setUserData(newUserData);
    _saveUserDataToStorage(newUserData);
    setIsOnboarded(true);
  }, []);

  const updateUserAccountDetails = useCallback((details: Partial<UserData>) => {
    setUserData(prevUserData => {
      let updatedUserData: UserData;
      if (prevUserData) {
        updatedUserData = { ...prevUserData, ...details };
      } else if (details.name && details.email && details.password) {
        updatedUserData = { ...defaultUserData, ...details } as UserData;
        setIsOnboarded(true);
      } else {
        return prevUserData; 
      }
      
      _saveUserDataToStorage(updatedUserData);
      if (updatedUserData.email) {
        setIsLoggedIn(true);
      }
      return updatedUserData;
    });
  }, []);
  
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
    setUserData(prevUserData => {
      if (prevUserData) {
          const { email, password, ...rest } = prevUserData;
          const updatedUserData = { ...rest, pin: undefined }; 
          _saveUserDataToStorage(updatedUserData);
          setIsLoggedIn(false);
          setIsLocked(false);
          return updatedUserData;
      }
      return prevUserData;
    });
  }, []);
  
  const updateJourneyProgress = useCallback((journeyId: string, stepIndex: number) => {
    setUserData(prevUserData => {
      if(prevUserData) {
          const newProgress = { ...prevUserData.journeyProgress, [journeyId]: stepIndex };
          const updatedUserData = { ...prevUserData, journeyProgress: newProgress };
          _saveUserDataToStorage(updatedUserData);
          return updatedUserData;
      }
      return prevUserData;
    });
  }, []);
  
  const unlockApp = () => {
      setIsLocked(false);
  };

  const lockApp = () => {
      if (userData?.pin) {
          setIsLocked(true);
      }
  };
  
  const addGrowthPoints = useCallback((points: number) => {
    setUserData(prevUserData => {
      if (prevUserData) {
        const newPoints = (prevUserData.growthPoints || 0) + points;
        const updatedUserData = { ...prevUserData, growthPoints: newPoints };
        _saveUserDataToStorage(updatedUserData);
        return updatedUserData;
      }
      return prevUserData;
    });
  }, []);

  const logActivity = useCallback((type: 'news' | 'planning') => {
      setUserData(prev => {
          if (!prev) return null;
          const now = new Date().toISOString();
          const newActivity = { ...prev.activityLog };
          if (type === 'news') newActivity.lastNewsRead = now;
          if (type === 'planning') newActivity.lastPlanningSession = now;
          
          const updated = { ...prev, activityLog: newActivity };
          _saveUserDataToStorage(updated);
          return updated;
      });
  }, []);

  return { 
      userData, 
      isOnboarded, 
      isLoading, 
      isLocked,
      isLoggedIn,
      firebaseUser,
      unlockApp,
      lockApp,
      completeOnboarding, 
      updateUserAccountDetails,
      updateJourneyProgress,
      logout,
      loginWithGoogle,
      addGrowthPoints,
      logActivity
  };
};
