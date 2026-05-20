package com.mwijay.note;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 123;

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

        // Check and request permissions at startup
        requestInitialPermissions();

        // Verify WebView existence to debug "view not found"
        // Using a post-runnable to ensure layout inflation is complete
        getWindow().getDecorView().post(() -> {
            View webView = findViewById(com.getcapacitor.android.R.id.webview);
            if (webView == null) {
                Log.e("MwijayNote", "CRITICAL: WebView still not found in default layout!");
            } else {
                Log.d("MwijayNote", "WebView successfully found in default layout.");
            }
        });
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
        
        // Multimedia
        permissions.add(Manifest.permission.CAMERA);
        permissions.add(Manifest.permission.RECORD_AUDIO);
        
        // Bluetooth & Location removed as per performance optimization plan

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
            Log.d("MwijayNote", "Permissions request completed");
        }
    }
}
