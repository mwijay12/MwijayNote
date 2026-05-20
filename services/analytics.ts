/**
 * Mwijay Note Analytics & Crash Reporting Service
 * Lightweight wrapper for tracking events and errors.
 */

export const trackEvent = (eventName: string, properties: any = {}) => {
    console.log(`[Analytics] Event: ${eventName}`, properties);
    // In production, send to Firebase Analytics or Mixpanel
};

export const reportError = (error: any, context: string = 'General') => {
    console.error(`[Analytics] Error in ${context}:`, error);
    // In production, send to Sentry or Firebase Crashlytics
};

export const initializeAnalytics = async () => {
    try {
        // Initialization logic for native plugins if needed
        trackEvent('app_opened');
    } catch (e) {
        console.error('Analytics init failed', e);
    }
};
