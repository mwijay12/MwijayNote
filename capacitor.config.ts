import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mwijay.note',
  appName: 'Mwijay Note',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: ["*.cloudinary.com", "*.google.com", "*.googleapis.com", "*.firebaseapp.com"]
  },
  plugins: {
    Network: {
      shouldShowReachabilityDialog: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;
