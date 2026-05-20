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
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    Network: {
      shouldShowReachabilityDialog: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    },
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
