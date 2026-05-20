package com.mwijay.note;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MusicControl")
public class MusicControlPlugin extends Plugin {
    private static MusicControlPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @PluginMethod
    public void updateMetadata(PluginCall call) {
        String title = call.getString("title", "Mwijay Note");
        String artist = call.getString("artist", "Study Beats");
        String album = call.getString("album", "Ambient Music Hub");
        String artworkUrl = call.getString("artworkUrl", "");
        double duration = call.getDouble("duration", 0.0);

        Intent intent = new Intent(getContext(), MusicService.class);
        intent.putExtra("title", title);
        intent.putExtra("artist", artist);
        intent.putExtra("album", album);
        intent.putExtra("artworkUrl", artworkUrl);
        intent.putExtra("duration", duration);
        
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void setPlaybackState(PluginCall call) {
        String state = call.getString("state", "paused");
        double position = call.getDouble("position", 0.0);
        double speed = call.getDouble("speed", 1.0);

        boolean isPlaying = "playing".equalsIgnoreCase(state);

        Intent intent = new Intent(getContext(), MusicService.class);
        intent.putExtra("isPlaying", isPlaying);
        intent.putExtra("position", position);
        intent.putExtra("speed", speed);

        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void setQueueInfo(PluginCall call) {
        int currentIndex = call.getInt("currentIndex", 0);
        int totalTracks = call.getInt("totalTracks", 0);
        // Can be stored or passed to service if needed
        call.resolve();
    }

    @PluginMethod
    public void destroy(PluginCall call) {
        Intent intent = new Intent(getContext(), MusicService.class);
        getContext().stopService(intent);
        call.resolve();
    }

    // Static event triggers back to JavaScript
    public static void onNativePlay() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "play");
            instance.notifyListeners("play", ret);
        }
    }

    public static void onNativePause() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "pause");
            instance.notifyListeners("pause", ret);
        }
    }

    public static void onNativeNext() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "next");
            instance.notifyListeners("next", ret);
        }
    }

    public static void onNativePrevious() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "previous");
            instance.notifyListeners("previous", ret);
        }
    }

    public static void onNativeSeek(long positionMs) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("position", (double) (positionMs / 1000.0));
            instance.notifyListeners("seek", ret);
        }
    }

    public static void onAudioFocusLoss() {
        if (instance != null) {
            JSObject ret = new JSObject();
            instance.notifyListeners("audioFocusLoss", ret);
        }
    }

    public static void onAudioFocusDuck(float duckVolume) {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("volume", duckVolume);
            instance.notifyListeners("audioFocusDuck", ret);
        }
    }
}
