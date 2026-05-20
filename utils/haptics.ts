/**
 * Mwijay Note: Custom Haptic Feedback Utility
 * Provides native-feeling tactile feedback on mobile devices.
 * Gracefully falls back to no-op on desktop browsers or unsupported contexts.
 */

export const haptic = {
    /**
     * Light tap for simple actions like button clicks and tab changes.
     */
    lightTap() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(12);
            } catch (e) {
                // Ignore vibration restrictions in some secure sandboxes
            }
        }
    },

    /**
     * Medium tap for toggling switches, checklists, and primary actions.
     */
    mediumTap() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(35);
            } catch (e) {
                // Ignore
            }
        }
    },

    /**
     * Heavy tap for destructive actions like deleting entries, resetting data, or warnings.
     */
    heavyTap() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(65);
            } catch (e) {
                // Ignore
            }
        }
    },

    /**
     * Triple pulsing arpeggio for successful completions (e.g. Pomodoro timer finishing).
     */
    successPattern() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([30, 50, 30, 50, 60]);
            } catch (e) {
                // Ignore
            }
        }
    },

    /**
     * Heavy repetitive pulsing pattern for input errors or alerts.
     */
    errorPattern() {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate([80, 60, 80, 60, 100]);
            } catch (e) {
                // Ignore
            }
        }
    }
};

export default haptic;
