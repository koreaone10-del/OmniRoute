# OmniChat 📱

**تطبيق دردشة متعدد الوسائط** — صور، فيديوهات، ملفات، تسجيل صوتي، وموقع جغرافي.

## ✨ الميزات

- 📝 **رسائل نصية** مع دعم الإيموجي
- 🖼️ **إرسال صور** من المعرض أو الكاميرا
- 🎬 **فيديوهات** مع معاينة
- 📁 **ملفات** بأي صيغة
- 🎤 **تسجيل صوتي**
- 📍 **مشاركة الموقع**
- 🔍 **بحث في الرسائل**
- 💾 **حفظ محلي** (LocalStorage)
- 📤 **تصدير الدردشة**
- 🌙 **وضع داكن احترافي**
- 📱 **PWA** — يعمل offline

## 🚀 التشغيل

```bash
# افتح index.html في المتصفح
# أو استخدم خادم محلي:
python -m http.server 8080
```

## 📦 تحويل إلى APK (Capacitor)

### 1. تثبيت المتطلبات
```bash
npm install -g @capacitor/cli @capacitor/core
```

### 2. إعداد المشروع
```bash
cd OmniChat
npm init -y
npm install @capacitor/android
npx cap init OmniChat com.chibanilotfi.omnichat --web-dir .
```

### 3. إضافة Android
```bash
npx cap add android
```

### 4. تعديل AndroidManifest.xml
```xml
<!-- في android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### 5. بناء APK
```bash
npx cap sync android
npx cap open android
# ثم Build > Build Bundle(s) / APK(s) > Build APK(s)
```

## 📁 هيكل المشروع

```
OmniChat/
├── index.html          ← الصفحة الرئيسية
├── manifest.json       ← PWA manifest
├── css/
│   └── style.css       ← التنسيقات
├── js/
│   ├── app.js          ← التطبيق الرئيسي
│   ├── chat.js         ← إدارة الدردشة
│   └── media.js        ← إدارة الوسائط
└── assets/             ← الأيقونات
```

## 👨‍💻 المطور

**Chibani Lotfi**

## 📄 الترخيص

MIT License
