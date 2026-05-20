package com.mwijay.note;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.util.Log;
import android.view.KeyEvent;

public class MediaReceiver extends BroadcastReceiver {
    private static final String TAG = "MediaReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        
        String action = intent.getAction();
        Log.d(TAG, "MediaReceiver action received: " + action);

        if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(action)) {
            // Signal plugin to pause audio in the web layer
            Log.d(TAG, "Audio becoming noisy (headset unplugged)");
            MediaControlPlugin.onNativePause();
        } else if (Intent.ACTION_MEDIA_BUTTON.equals(action)) {
            KeyEvent event = intent.getParcelableExtra(Intent.EXTRA_KEY_EVENT);
            if (event != null && event.getAction() == KeyEvent.ACTION_DOWN) {
                int keyCode = event.getKeyCode();
                Log.d(TAG, "Media Button key event: " + keyCode);
                switch (keyCode) {
                    case KeyEvent.KEYCODE_MEDIA_PLAY:
                        MediaControlPlugin.onNativePlay();
                        break;
                    case KeyEvent.KEYCODE_MEDIA_PAUSE:
                        MediaControlPlugin.onNativePause();
                        break;
                    case KeyEvent.KEYCODE_MEDIA_NEXT:
                        MusicControlPlugin.onNativeNext();
                        break;
                    case KeyEvent.KEYCODE_MEDIA_PREVIOUS:
                        MusicControlPlugin.onNativePrevious();
                        break;
                }
            }
        }
    }
}
