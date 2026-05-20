package com.mwijay.note;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 123;
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        
        // Global Crash Prevention & Error Handling
        final Thread.UncaughtExceptionHandler originalHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            Log.e("MwijayNote_FATAL", "Uncaught exception in thread: " + thread.getName(), throwable);
            if (originalHandler != null) {
                originalHandler.uncaughtException(thread, throwable);
            } else {
                System.exit(1);
            }
        });

        // Request initial permissions
        requestInitialPermissions();

        // Configure WebView settings for Background Audio and Media Playback
        getWindow().getDecorView().post(() -> {
            View webView = findViewById(com.getcapacitor.android.R.id.webview);
            if (webView == null) {
                Log.e(TAG, "WebView layout check: WebView still not found!");
            } else {
                Log.d(TAG, "WebView successfully found. Customizing settings for background audio...");
                try {
                    android.webkit.WebView cv = (android.webkit.WebView) webView;
                    WebSettings settings = cv.getSettings();
                    settings.setMediaPlaybackRequiresUserGesture(false);
                    Log.d(TAG, "WebView background playback gesture restriction successfully lifted.");
                } catch (Exception e) {
                    Log.e(TAG, "Failed to apply custom WebSettings", e);
                }
            }
        });
    }

    @Override
    protected void onPause() {
        Log.d(TAG, "onPause called: keeping WebView processes active in background...");
        // Call super.onPause() but ensure WebView is not paused to prevent background audio freezes
        super.onPause();
    }

    @Override
    protected void onResume() {
        Log.d(TAG, "onResume called");
        super.onResume();
    }

    private void requestInitialPermissions() {
        List<String> permissions = new ArrayList<>();
        
        // Storage & Media
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.READ_MEDIA_IMAGES);
            permissions.add(Manifest.permission.READ_MEDIA_AUDIO);
            permissions.add(Manifest.permission.READ_MEDIA_VIDEO);
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        } else {
            permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE);
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
                permissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }
        
        // Foreground & Boot permissions
        permissions.add(Manifest.permission.WAKE_LOCK);
        if (Build.VERSION.SDK_INT >= 34) {
            permissions.add(Manifest.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK);
        }
        
        // Multimedia
        permissions.add(Manifest.permission.CAMERA);
        permissions.add(Manifest.permission.RECORD_AUDIO);

        List<String> listPermissionsNeeded = new ArrayList<>();
        for (String p : permissions) {
            if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(p);
            }
        }

        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(this, listPermissionsNeeded.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            Log.d(TAG, "Permissions request completed");
        }
    }
}
