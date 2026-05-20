package com.mwijay.note;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.MediaBrowserServiceCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class MusicService extends MediaBrowserServiceCompat {
    private static final String TAG = "MusicService";
    public static final String CHANNEL_ID = "music_playback";
    public static final int NOTIFICATION_ID = 2026;

    private MediaSessionCompat mediaSession;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private AudioManager.OnAudioFocusChangeListener focusChangeListener;
    private boolean isPlaying = false;
    
    private String trackTitle = "Mwijay Note";
    private String artistName = "Study Beats";
    private String albumName = "Ambient Music Hub";
    private String artworkUrl = "";
    private Bitmap cachedArtwork = null;

    private final BroadcastReceiver becomingNoisyReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                Log.d(TAG, "Headphones unplugged. Pausing audio.");
                pausePlayback();
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        setupAudioFocus();

        // Initialize MediaSessionCompat
        mediaSession = new MediaSessionCompat(this, "MusicServiceSession");
        setSessionToken(mediaSession.getSessionToken());

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                Log.d(TAG, "MediaSession: onPlay");
                requestAudioFocusAndPlay();
            }

            @Override
            public void onPause() {
                Log.d(TAG, "MediaSession: onPause");
                pausePlayback();
            }

            @Override
            public void onSkipToNext() {
                Log.d(TAG, "MediaSession: onSkipToNext");
                MusicControlPlugin.onNativeNext();
            }

            @Override
            public void onSkipToPrevious() {
                Log.d(TAG, "MediaSession: onSkipToPrevious");
                MusicControlPlugin.onNativePrevious();
            }

            @Override
            public void onStop() {
                Log.d(TAG, "MediaSession: onStop");
                stopPlayback();
            }

            @Override
            public void onSeekTo(long pos) {
                Log.d(TAG, "MediaSession: onSeekTo: " + pos);
                MusicControlPlugin.onNativeSeek(pos);
            }
        });

        mediaSession.setActive(true);

        // Register headphones unplug receiver
        registerReceiver(becomingNoisyReceiver, new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY));
        createNotificationChannel();
    }

    private void setupAudioFocus() {
        focusChangeListener = focusChange -> {
            switch (focusChange) {
                case AudioManager.AUDIOFOCUS_GAIN:
                    Log.d(TAG, "AudioFocus gained: restoring normal volume/playback");
                    MusicControlPlugin.onNativePlay();
                    break;
                case AudioManager.AUDIOFOCUS_LOSS:
                    Log.d(TAG, "AudioFocus lost: pausing playback completely");
                    pausePlayback();
                    MusicControlPlugin.onAudioFocusLoss();
                    break;
                case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                    Log.d(TAG, "AudioFocus lost transiently: pausing playback");
                    pausePlayback();
                    break;
                case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                    Log.d(TAG, "AudioFocus transient loss with duck: lowering volume");
                    MusicControlPlugin.onAudioFocusDuck(0.2f);
                    break;
            }
        };

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build())
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(focusChangeListener)
                    .build();
        }
    }

    private void requestAudioFocusAndPlay() {
        int result;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            result = audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            result = audioManager.requestAudioFocus(focusChangeListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }

        if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
            Log.d(TAG, "AudioFocus request granted!");
            MusicControlPlugin.onNativePlay();
        } else {
            Log.w(TAG, "AudioFocus request denied!");
        }
    }

    private void pausePlayback() {
        isPlaying = false;
        MusicControlPlugin.onNativePause();
        updateNotificationAndSessionState();
    }

    private void stopPlayback() {
        isPlaying = false;
        MusicControlPlugin.onNativePause();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
        } else {
            audioManager.abandonAudioFocus(focusChangeListener);
        }
        stopSelf();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            Log.d(TAG, "onStartCommand Action: " + action);
            if ("ACTION_PLAY".equals(action)) {
                requestAudioFocusAndPlay();
            } else if ("ACTION_PAUSE".equals(action)) {
                pausePlayback();
            } else if ("ACTION_STOP".equals(action)) {
                stopPlayback();
            } else if ("ACTION_NEXT".equals(action)) {
                MusicControlPlugin.onNativeNext();
            } else if ("ACTION_PREVIOUS".equals(action)) {
                MusicControlPlugin.onNativePrevious();
            }
        }

        if (intent != null) {
            String title = intent.getStringExtra("title");
            String artist = intent.getStringExtra("artist");
            String album = intent.getStringExtra("album");
            String artUrl = intent.getStringExtra("artworkUrl");
            boolean active = intent.getBooleanExtra("isPlaying", false);

            if (title != null) trackTitle = title;
            if (artist != null) artistName = artist;
            if (album != null) albumName = album;
            isPlaying = active;

            if (artUrl != null && !artUrl.equals(artworkUrl)) {
                artworkUrl = artUrl;
                cachedArtwork = null; // Clear artwork cache on update
                fetchArtworkAsync(artworkUrl);
            } else {
                updateNotificationAndSessionState();
            }
        }

        return START_STICKY;
    }

    private void fetchArtworkAsync(String artUrl) {
        new Thread(() -> {
            Bitmap bmp = null;
            if (artUrl.startsWith("http://") || artUrl.startsWith("https://")) {
                HttpURLConnection conn = null;
                InputStream is = null;
                try {
                    URL url = new URL(artUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setDoInput(true);
                    conn.connect();
                    is = conn.getInputStream();
                    bmp = BitmapFactory.decodeStream(is);
                } catch (Exception e) {
                    Log.w(TAG, "Remote artwork loading failed: " + e.getMessage());
                } finally {
                    try { if (is != null) is.close(); } catch (Exception ignored) {}
                    try { if (conn != null) conn.disconnect(); } catch (ignored) {}
                }
            } else if (artUrl.startsWith("content://") || artUrl.startsWith("file://")) {
                InputStream is = null;
                try {
                    is = getContentResolver().openInputStream(android.net.Uri.parse(artUrl));
                    bmp = BitmapFactory.decodeStream(is);
                } catch (Exception e) {
                    Log.w(TAG, "Content artwork loading failed: " + e.getMessage());
                } finally {
                    try { if (is != null) is.close(); } catch (Exception ignored) {}
                }
            }

            final Bitmap loadedBmp = bmp;
            new Handler(Looper.getMainLooper()).post(() -> {
                if (artUrl.equals(artworkUrl)) {
                    cachedArtwork = loadedBmp;
                    updateNotificationAndSessionState();
                }
            });
        }).start();
    }

    private void updateNotificationAndSessionState() {
        if (mediaSession == null) return;

        // Update MediaSession state
        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
                .setState(state, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1.0f)
                .setActions(PlaybackStateCompat.ACTION_PLAY |
                            PlaybackStateCompat.ACTION_PAUSE |
                            PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                            PlaybackStateCompat.ACTION_STOP |
                            PlaybackStateCompat.ACTION_SEEK_TO)
                .build());

        // Update MediaSession metadata
        MediaMetadataCompat.Builder metadata = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, trackTitle)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artistName)
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, albumName);

        if (cachedArtwork != null) {
            metadata.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, cachedArtwork);
        } else {
            // Standard launcher icon fallback
            Bitmap defaultIcon = BitmapFactory.decodeResource(getResources(), android.R.drawable.ic_media_play);
            metadata.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, defaultIcon);
        }
        mediaSession.setMetadata(metadata.build());

        // Notification intents
        Intent launchIntent = new Intent(this, MainActivity.class);
        PendingIntent pIntent = PendingIntent.getActivity(this, 99, launchIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Intent playIntent = new Intent(this, MusicService.class).setAction("ACTION_PLAY");
        Intent pauseIntent = new Intent(this, MusicService.class).setAction("ACTION_PAUSE");
        Intent nextIntent = new Intent(this, MusicService.class).setAction("ACTION_NEXT");
        Intent prevIntent = new Intent(this, MusicService.class).setAction("ACTION_PREVIOUS");
        Intent stopIntent = new Intent(this, MusicService.class).setAction("ACTION_STOP");

        PendingIntent pPlay = PendingIntent.getService(this, 10, playIntent, PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pPause = PendingIntent.getService(this, 11, pauseIntent, PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pNext = PendingIntent.getService(this, 12, nextIntent, PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pPrev = PendingIntent.getService(this, 13, prevIntent, PendingIntent.FLAG_IMMUTABLE);
        PendingIntent pStop = PendingIntent.getService(this, 14, stopIntent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(trackTitle)
                .setContentText(artistName)
                .setSubText(albumName)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(pIntent)
                .setOngoing(isPlaying)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOnlyAlertOnce(true)
                .addAction(android.R.drawable.ic_media_previous, "Previous", pPrev);

        if (isPlaying) {
            builder.addAction(android.R.drawable.ic_media_pause, "Pause", pPause);
        } else {
            builder.addAction(android.R.drawable.ic_media_play, "Play", pPlay);
        }

        builder.addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setShowActionsInCompactView(0, 1, 2)
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowCancelButton(true)
                        .setCancelButtonIntent(pStop));

        if (cachedArtwork != null) {
            builder.setLargeIcon(cachedArtwork);
        }

        Notification notification = builder.build();

        if (isPlaying) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification,
                        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } else {
            if (Build.VERSION.SDK_INT >= 33) {
                stopForeground(STOP_FOREGROUND_DETACH);
            } else {
                stopForeground(false);
            }
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager != null) {
                manager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID, "Music Playback Controls", NotificationManager.IMPORTANCE_LOW);
                channel.setDescription("Audio playback notifications");
                channel.setShowBadge(false);
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        unregisterReceiver(becomingNoisyReceiver);
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
            mediaSession = null;
        }
        super.onDestroy();
    }

    // MediaBrowserServiceCompat required root mappings
    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) {
        return new BrowserRoot("root", null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        result.sendResult(new ArrayList<>());
    }
}
