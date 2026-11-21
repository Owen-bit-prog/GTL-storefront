# GTL Store — Push Notifications Setup Guide

Enable push notifications for order updates, promotions, and customer engagement.

## 🚀 Quick Setup

### Step 1: Get Your VAPID Key

1. Go to **Firebase Console** → [console.firebase.google.com](https://console.firebase.google.com)
2. Select your **"gtl-store"** project
3. Navigate to **Project Settings** (gear icon, top-left)
4. Go to the **Cloud Messaging** tab
5. Under **Web Push certificates**, click **"Generate Key Pair"**
6. Copy the **VAPID Public Key** (also called "Server Key")

### Step 2: Add VAPID Key to Code

In `js/firebase.js`, replace `YOUR_VAPID_KEY`:

```javascript
const vapidKey = "YOUR_VAPID_KEY"; // Replace with your key from Firebase
```

**Example:**
```javascript
const vapidKey = "BG7r8XsZq9pL2hM9..."; // Your actual VAPID key
```

### Step 3: Enable Notifications in Your App

Add this to any page where you want to request notification permissions:

```javascript
import { enableNotifications } from "./js/firebase.js";

// Call when user opts in (e.g., on login or settings page)
document.getElementById("enable-notifications-btn").addEventListener("click", async () => {
  const token = await enableNotifications();
  if (token) {
    console.log("Notifications enabled! Token:", token);
  }
});
```

### Step 4: (Optional) Add Service Worker

For background notifications, create a `firebase-messaging-sw.js` file in the root directory:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/path-to-icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

Register it in your `index.html`:

```javascript
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('firebase-messaging-sw.js');
  }
</script>
```

---

## 📱 How Notifications Work

1. **User grants permission** → Browser shows permission dialog
2. **FCM Token generated** → Stored in localStorage
3. **Token sent to server** → Save to Firestore for future use
4. **Notification triggered** → Firebase sends via Cloud Messaging

---

## 💡 Example Use Cases

### Send Notification to Specific User
```javascript
// From your backend or Cloud Function
admin.messaging().sendToDevice(fcm_token, {
  notification: {
    title: "Order Shipped!",
    body: "Your GTL order is on its way"
  }
});
```

### Send to All Users
```javascript
admin.messaging().sendAll({
  notification: {
    title: "Flash Sale - 30% Off",
    body: "Limited time offer on all tees!"
  }
});
```

---

## 🔧 Troubleshooting

**"Notifications not working?"**
- ✅ Check that VAPID key is correct in `firebase.js`
- ✅ Ensure user granted notification permission
- ✅ Check browser console for errors
- ✅ Service Worker must be registered

**"Token not generating?"**
- ✅ Must be HTTPS (or localhost for testing)
- ✅ Browser must support notifications
- ✅ User must allow notifications

**"Background notifications not showing?"**
- ✅ Service Worker file must be in root directory
- ✅ Service Worker must be registered
- ✅ `firebase-messaging-sw.js` must have correct imports

---

## 📚 Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## ✅ Implementation Checklist

- [ ] Get VAPID Key from Firebase Console
- [ ] Add VAPID key to `js/firebase.js`
- [ ] Add notification request button to your app
- [ ] Test notification permissions
- [ ] (Optional) Set up Service Worker for background notifications
- [ ] Test sending test notifications from Firebase Console
