# 📱 دليل تحويل OmniChat إلى APK متقن

## المتطلبات المسبقة

1. **Node.js** (v18+) — [تحميل](https://nodejs.org/)
2. **Android Studio** — [تحميل](https://developer.android.com/studio)
3. **Java JDK 17** — [تحميل](https://adoptium.net/)
4. **Android SDK** (يتم تثبيته مع Android Studio)

---

## الخطوة 1: تثبيت Capacitor CLI

افتح Terminal/CMD ونفذ:

```bash
# تثبيت Capacitor CLI عالمياً
npm install -g @capacitor/cli

# التحقق من التثبيت
cap --version
```

---

## الخطوة 2: إعداد مشروع Capacitor

انتقل إلى مجلد المشروع:

```bash
cd /path/to/OmniChat

# تهيئة package.json
npm init -y

# تثبيت Capacitor
npm install @capacitor/core @capacitor/cli

# تثبيت إضافات Android
npm install @capacitor/android

# تهيئة المشروع
npx cap init OmniChat com.chibanilotfi.omnichat --web-dir . --npm-client npm
```

---

## الخطوة 3: إضافة منصة Android

```bash
# إضافة Android
npx cap add android

# مزامنة الملفات
npx cap sync android
```

---

## الخطوة 4: تعديل AndroidManifest.xml

افتح الملف:
```
android/app/src/main/AndroidManifest.xml
```

أضف الأذونات داخل `<manifest>`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- أذونات الإنترنت والشبكة -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- أذونات الكاميرا والصور -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- أذونات التسجيل الصوتي -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- أذونات الموقع -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- أذونات الإشعارات -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:name="com.chibanilotfi.omnichat.MainActivity"
            android:screenOrientation="portrait"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <!-- FileProvider للملفات -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
```

---

## الخطوة 5: إنشاء ملفات الإعدادات الإضافية

### 5.1 إنشاء `android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-files-path name="downloads" path="Downloads/" />
    <cache-path name="cache" path="cache/" />
    <files-path name="files" path="files/" />
</paths>
```

### 5.2 تعديل `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">OmniChat</string>
    <string name="title_activity_main">OmniChat</string>
    <string name="package_name">com.chibanilotfi.omnichat</string>
    <string name="custom_url_scheme">com.chibanilotfi.omnichat</string>
</resources>
```

### 5.3 تعديل `android/app/build.gradle`

```gradle
android {
    namespace "com.chibanilotfi.omnichat"
    compileSdk 34

    defaultConfig {
        applicationId "com.chibanilotfi.omnichat"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## الخطوة 6: تثبيت إضافات Capacitor

```bash
# إضافة الكاميرا
npm install @capacitor/camera
npx cap sync

# إضافة الملفات
npm install @capacitor/filesystem
npx cap sync

# إضافة الموقع
npm install @capacitor/geolocation
npx cap sync

# إضافة الإشعارات
npm install @capacitor/local-notifications
npx cap sync

# إضافة Share
npm install @capacitor/share
npx cap sync

# إضافة Splash Screen
npm install @capacitor/splash-screen
npx cap sync

# إضافة Status Bar
npm install @capacitor/status-bar
npx cap sync
```

---

## الخطوة 7: تعديل الكود JavaScript لدعم Capacitor

أضف في `js/app.js` في بداية الملف:

```javascript
// Capacitor Plugins
let CapacitorPlugins = {};

if (window.Capacitor) {
    CapacitorPlugins = {
        Camera: Capacitor.Plugins.Camera,
        Filesystem: Capacitor.Plugins.Filesystem,
        Geolocation: Capacitor.Plugins.Geolocation,
        Share: Capacitor.Plugins.Share,
        StatusBar: Capacitor.Plugins.StatusBar,
        SplashScreen: Capacitor.Plugins.SplashScreen
    };

    // إخفاء شريط الحالة
    CapacitorPlugins.StatusBar?.setOverlaysWebView({ overlay: true });
    CapacitorPlugins.StatusBar?.setStyle({ style: 'DARK' });
    CapacitorPlugins.StatusBar?.setBackgroundColor({ color: '#0f0f23' });
}
```

---

## الخطوة 8: إنشاء أيقونات التطبيق

```bash
# تثبيت أداة إنشاء الأيقونات
npm install -g cordova-res

# إنشاء الأيقونات (ضع صورة 1024x1024 في المجلد الرئيسي)
cordova-res android --skip-config --copy

# أو يدوياً: ضع الأيقونات في:
# android/app/src/main/res/mipmap-xxxhdpi/
# android/app/src/main/res/mipmap-xxhdpi/
# android/app/src/main/res/mipmap-xhdpi/
# android/app/src/main/res/mipmap-hdpi/
# android/app/src/main/res/mipmap-mdpi/
```

---

## الخطوة 9: بناء APK

### 9.1 فتح في Android Studio

```bash
npx cap open android
```

### 9.2 بناء APK من Android Studio

1. انتظر Gradle Sync
2. اذهب إلى **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. أو للـ Release: **Build** → **Generate Signed Bundle / APK**

### 9.3 بناء APK من سطر الأوامر

```bash
# Debug APK
cd android
./gradlew assembleDebug

# Release APK (تحتاج keystore)
./gradlew assembleRelease

# الملفات الناتجة:
# android/app/build/outputs/apk/debug/app-debug.apk
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## الخطوة 10: توقيع APK (للنشر)

```bash
# إنشاء Keystore
keytool -genkey -v -keystore omnichat.keystore -alias omnichat -keyalg RSA -keysize 2048 -validity 10000

# توقيع APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore omnichat.keystore android/app/build/outputs/apk/release/app-release-unsigned.apk omnichat

# محاذاة APK
zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk OmniChat-v1.0.apk
```

---

## 🎯 ملخص الأوامر السريع

```bash
# مرة واحدة
npm install -g @capacitor/cli

# في مجلد المشروع
cd OmniChat
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init OmniChat com.chibanilotfi.omnichat --web-dir .
npx cap add android

# تعديل AndroidManifest.xml ثم:
npx cap sync android
npx cap open android

# Build → Build APK(s)
```

---

## 🔧 حل المشاكل الشائعة

### مشكلة: Gradle sync failed
```bash
cd android
./gradlew clean
./gradlew build
```

### مشكلة: الكاميرا لا تعمل
تأكد من إضافة الأذونات في `AndroidManifest.xml`

### مشكلة: الملفات لا تُرفع
تأكد من إضافة `FileProvider` في `AndroidManifest.xml`

### مشكلة: التطبيق يظهر أبيض
تأكد من أن `index.html` في المجلد الرئيسي ومسارات الملفات صحيحة

---

## 📱 اختبار التطبيق

1. وصل هاتف Android بالكمبيوتر
2. فعل **USB Debugging** في إعدادات المطور
3. في Android Studio: **Run** → **Run 'app'**
4. أو من سطر الأوامر:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

**تم التطوير بواسطة: Chibani Lotfi** 🚀
