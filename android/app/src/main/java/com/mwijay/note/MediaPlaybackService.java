package com.mwijay.note;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * MediaPlaybackService – foreground service keeping audio alive.
 * Shows a rich media notification (lock screen + notification shade + taskbar)
 * with track title, artist, artwork, and media session actions.
 */
public class MediaPlaybackService extends Service {
    public static final String CHANNEL_ID      = "MwijayMediaChannel";
    public static final int    NOTIFICATION_ID  = 1001;

    public static final String ACTION_PLAY     = "com.mwijay.note.ACTION_PLAY";
    public static final String ACTION_PAUSE    = "com.mwijay.note.ACTION_PAUSE";
    public static final String ACTION_NEXT     = "com.mwijay.note.ACTION_NEXT";
    public static final String ACTION_PREVIOUS = "com.mwijay.note.ACTION_PREVIOUS";

    public static final String EXTRA_TITLE   = "track_title";
    public static final String EXTRA_ARTIST  = "track_artist";

    private MediaSessionCompat mediaSession;
    
    private String currentTitle = "Mwijay Note";
    private String currentArtist = "Now Playing";
    private String currentArtworkUrl = "";
    private boolean currentIsPlaying = false;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        mediaSession = new MediaSessionCompat(this, "MwijayMediaSession");
        
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                super.onPlay();
                MediaControlPlugin.onNativePlay();
            }

            @Override
            public void onPause() {
                super.onPause();
                MediaControlPlugin.onNativePause();
            }

            @Override
            public void onSkipToNext() {
                super.onSkipToNext();
                MediaControlPlugin.onNativeNext();
            }

            @Override
            public void onSkipToPrevious() {
                super.onSkipToPrevious();
                MediaControlPlugin.onNativePrevious();
            }

            @Override
            public void onStop() {
                super.onStop();
                MediaControlPlugin.onNativePause();
            }
        });
        
        mediaSession.setActive(true);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Handle notification button actions
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_PLAY.equals(action))     MediaControlPlugin.onNativePlay();
            if (ACTION_PAUSE.equals(action))    MediaControlPlugin.onNativePause();
            if (ACTION_NEXT.equals(action))     MediaControlPlugin.onNativeNext();
            if (ACTION_PREVIOUS.equals(action)) MediaControlPlugin.onNativePrevious();
            return START_NOT_STICKY;
        }

        // Read track metadata passed from the JS plugin
        if (intent != null) {
            String t = intent.getStringExtra(EXTRA_TITLE);
            String a = intent.getStringExtra(EXTRA_ARTIST);
            String art = intent.getStringExtra("artwork");
            boolean isPlaying = intent.getBooleanExtra("is_playing", true);

            if (t != null && !t.isEmpty()) currentTitle = t;
            if (a != null && !a.isEmpty()) currentArtist = a;
            currentArtworkUrl = art != null ? art : "";
            currentIsPlaying = isPlaying;
        }

        updateNotificationAndSession();

        return START_NOT_STICKY;
    }

    private void updateNotificationAndSession() {
        // 1. Immediately update with text details (no artwork / default placeholder)
        updateMediaSessionStateAndMetadata(null);
        showNotification(null);

        // 2. Fetch remote or local artwork asynchronously
        final String artworkUrl = currentArtworkUrl;
        if (artworkUrl != null && !artworkUrl.isEmpty()) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    Bitmap bitmap = null;
                    InputStream input = null;
                    HttpURLConnection connection = null;
                    try {
                        if (artworkUrl.startsWith("http://") || artworkUrl.startsWith("https://")) {
                            URL url = new URL(artworkUrl);
                            connection = (HttpURLConnection) url.openConnection();
                            connection.setDoInput(true);
                            connection.connect();
                            input = connection.getInputStream();
                        } else {
                            input = getContentResolver().openInputStream(android.net.Uri.parse(artworkUrl));
                        }
                        bitmap = BitmapFactory.decodeStream(input);
                    } catch (Exception e) {
                        e.printStackTrace();
                    } finally {
                        try { if (input != null) input.close(); } catch (Exception e) {}
                        try { if (connection != null) connection.disconnect(); } catch (Exception e) {}
                    }

                    final Bitmap finalBitmap = bitmap;
                    new Handler(Looper.getMainLooper()).post(new Runnable() {
                        @Override
                        public void run() {
                            // Check to avoid race condition if artwork changed during load
                            if (artworkUrl.equals(currentArtworkUrl)) {
                                updateMediaSessionStateAndMetadata(finalBitmap);
                                showNotification(finalBitmap);
                            }
                        }
                    });
                }
            }).start();
        }
    }

    private void updateMediaSessionStateAndMetadata(Bitmap artwork) {
        if (mediaSession == null) return;

        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE,  currentTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist);

        if (artwork != null) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, artwork);
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, artwork);
        }

        mediaSession.setMetadata(metaBuilder.build());

        int state = currentIsPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
                .setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f)
                .setActions(PlaybackStateCompat.ACTION_PLAY_PAUSE |
                            PlaybackStateCompat.ACTION_PAUSE       |
                            PlaybackStateCompat.ACTION_PLAY        |
                            PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS)
                .build());
    }

    private void showNotification(Bitmap artwork) {
        // Notification intents
        Intent notifIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notifIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Intent playIntent  = new Intent(this, MediaPlaybackService.class).setAction(ACTION_PLAY);
        Intent pauseIntent = new Intent(this, MediaPlaybackService.class).setAction(ACTION_PAUSE);
        Intent nextIntent  = new Intent(this, MediaPlaybackService.class).setAction(ACTION_NEXT);
        Intent prevIntent  = new Intent(this, MediaPlaybackService.class).setAction(ACTION_PREVIOUS);

        PendingIntent pPlay  = PendingIntent.getService(this, 1, playIntent,  PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent pPause = PendingIntent.getService(this, 2, pauseIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent pNext  = PendingIntent.getService(this, 3, nextIntent,  PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        PendingIntent pPrev  = PendingIntent.getService(this, 4, prevIntent,  PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(pendingIntent)
                .setOngoing(currentIsPlaying)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(android.R.drawable.ic_media_previous, "Previous", pPrev);

        if (currentIsPlaying) {
            builder.addAction(android.R.drawable.ic_media_pause, "Pause", pPause);
        } else {
            builder.addAction(android.R.drawable.ic_media_play, "Play", pPlay);
        }

        builder.addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setShowActionsInCompactView(0, 1, 2)
                        .setMediaSession(mediaSession.getSessionToken()));

        if (artwork != null) {
            builder.setLargeIcon(artwork);
        }

        Notification notification = builder.build();

        createNotificationChannel();

        if (currentIsPlaying) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification,
                        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } else {
            if (Build.VERSION.SDK_INT >= 33) {
                stopForeground(Service.STOP_FOREGROUND_DETACH);
            } else {
                stopForeground(false);
            }
            NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID, "Media Playback", NotificationManager.IMPORTANCE_LOW);
                channel.setDescription("Shows currently playing track controls");
                manager.createNotificationChannel(channel);
            }
        }
    }
}
