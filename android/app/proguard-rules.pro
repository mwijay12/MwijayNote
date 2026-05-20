# Capacitor rules
-keep class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
-keep public class * implements com.getcapacitor.PluginHandle

# App-specific rules
-keep class com.mwijay.note.** { *; }
-keep class com.android.billingclient.** { *; }
-keep class androidx.** { *; }

# Keep attributes for better stack traces
-keepattributes SourceFile,LineNumberTable,Signature,EnclosingMethod

# Keep enum constants
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep custom exception classes
-keep public class * extends java.lang.Exception

# GMS/Ads rules
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.**

# Proguard optimization
-optimizationpasses 5
-allowaccessmodification
-dontpreverify
