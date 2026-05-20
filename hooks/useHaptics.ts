import { useCallback } from 'react';

export const useHaptics = () => {
    const triggerHaptic = useCallback((type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy') => {
        // Check if the Vibration API is supported
        if (!navigator.vibrate) return;

        try {
            switch (type) {
                case 'success':
                    navigator.vibrate([10, 50, 20]);
                    break;
                case 'warning':
                    navigator.vibrate([50, 30, 50]);
                    break;
                case 'error':
                    navigator.vibrate([100, 50, 100]);
                    break;
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(40);
                    break;
                case 'heavy':
                    navigator.vibrate(70);
                    break;
            }
        } catch (e) {
            console.warn("Haptic feedback failed. It may not be supported on this device/browser.", e);
        }
    }, []);

    return { triggerHaptic };
};
