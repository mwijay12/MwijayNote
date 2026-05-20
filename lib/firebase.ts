
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signInWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Device } from '@capacitor/device';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard OAuth Scopes
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export const signInWithGoogle = async () => {
  try {
    const info = await Device.getInfo();
    const isMobile = info.platform === 'android' || info.platform === 'ios';

    if (isMobile) {
      // Use Native Capacitor Google Auth
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(result.credential.idToken);
          const userCredential = await signInWithCredential(auth, credential);
          return userCredential.user;
      }
      return null;
    } else {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error("Google sign-in error:", error);
    return null;
  }
};

export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        return result?.user || null;
    } catch (error) {
        console.error("Redirect result error:", error);
        return null;
    }
};
