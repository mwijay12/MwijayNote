package com.mwijay.note;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaControl")
public class MediaControlPlugin extends Plugin {
    private static MediaControlPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    /** Start foreground service with track metadata so the notification shows title/artist */
    @PluginMethod
    public void startService(PluginCall call) {
        String title  = call.getString("title",  "Now Playing");
        String artist = call.getString("artist", "Mwijay Note");
        String artwork = call.getString("artwork", "");
        boolean isPlaying = call.getBoolean("isPlaying", true);

        Intent intent = new Intent(getContext(), MediaPlaybackService.class);
        intent.putExtra(MediaPlaybackService.EXTRA_TITLE,  title);
        intent.putExtra(MediaPlaybackService.EXTRA_ARTIST, artist);
        intent.putExtra("is_playing", isPlaying);
        if (artwork != null && !artwork.isEmpty()) {
            intent.putExtra("artwork", artwork);
        }
        getContext().startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Intent intent = new Intent(getContext(), MediaPlaybackService.class);
        getContext().stopService(intent);
        call.resolve();
    }

    public static void onNativePlay() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "play");
            instance.notifyListeners("mediaAction", ret);
        }
    }

    public static void onNativePause() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "pause");
            instance.notifyListeners("mediaAction", ret);
        }
    }

    public static void onNativeNext() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "next");
            instance.notifyListeners("mediaAction", ret);
        }
    }

    public static void onNativePrevious() {
        if (instance != null) {
            JSObject ret = new JSObject();
            ret.put("action", "previous");
            instance.notifyListeners("mediaAction", ret);
        }
    }
}
