# GTL Store v2 — Firebase E-Commerce

## 📁 Project Structure

```
gtl-store-v2/
├── index.html          ← Homepage + product grid (loads from Firestore)
├── cart.html           ← Cart page with checkout → saves order to Firestore
├── login.html          ← Login + Signup (Firebase Auth)
├── admin.html          ← Admin dashboard (real-time orders)
├── css/
│   └── style.css       ← All styles (GTL brand, responsive, components)
└── js/
    ├── firebase.js     ← 🔧 Firebase config + cart helpers + seed function
    └── app.js          ← Shared nav/auth logic used by all pages
```

---

## 🚀 Quick Start (5 Steps)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click **Add project** → name it `gtl-store` → Create

### 2. Enable Email/Password Auth
- Firebase Console → **Authentication** → Get started
- Sign-in providers → **Email/Password** → Enable → Save

### 3. Create Firestore Database
- Firebase Console → **Firestore Database** → Create database
- Choose **Start in test mode** → Select region → Done

### 4. Register Web App & Copy Config
- Project Overview → click `</>` web icon → Register app
- Copy the `firebaseConfig` object

### 5. Paste Config into `js/firebase.js`
```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "gtl-store.firebaseapp.com",
  projectId:         "gtl-store",
  storageBucket:     "gtl-store.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

---

## 🌱 How to Add Products to Firebase

### Option A: Seed script (recommended)
Open `index.html` in your browser via Live Server, then open DevTools Console and run:
```js
import { seedProducts } from './js/firebase.js';
seedProducts();
```
This adds all 8 GTL products to Firestore automatically.

### Option B: Firebase Console (manual)
1. Firestore → **products** collection → Add document
2. Fields: `name` (string), `price` (number), `description` (string), `imageURL` (string), `category` (string), `badge` (string or null)

### Option C: Custom products
Add any product with this structure:
```json
{
  "name": "My Product",
  "price": 150,
  "description": "Product description here",
  "imageURL": "https://images.unsplash.com/photo-XXXXX?w=800",
  "category": "tops",
  "badge": "New"
}
```

---

## 🛒 How the Cart System Works

1. **Add to Cart** → calls `addToCart(product)` in `js/firebase.js`
2. Product saved to **localStorage** as a JSON array: `gtl_cart`
3. Cart badge updates across all pages automatically
4. `cart.html` reads localStorage → renders items with qty controls
5. Qty changes → `updateQty()` → re-saves to localStorage
6. Remove → `removeFromCart()` → filters array → saves

**Why localStorage?** It works without login, persists across page refreshes,
and doesn't require extra Firestore reads. Orders are only saved to Firestore
at checkout time.

---

## 📦 How Orders Are Saved

When user clicks **Checkout** on `cart.html`:
```
1. Check if user is logged in (Firebase Auth)
   → If not: show "Please login" message
2. Build order object:
   {
     customerName, customerEmail, customerUid,
     items: [{ productId, productName, price, qty, lineTotal }],
     subtotal, delivery, total,
     status: "pending",
     timestamp: serverTimestamp()
   }
3. addDoc(collection(db, "orders"), orderData)
4. Clear localStorage cart
5. Show success toast
```

---

## 🖼️ How Images Are Loaded

Products fetched from Firestore include an `imageURL` field pointing to Unsplash.
Images are inserted as `<img src="${p.imageURL}" loading="lazy">` — the browser
fetches them on demand as cards scroll into view (lazy loading).

To use your own images:
- Upload to Firebase Storage or Cloudinary
- Paste the public URL into the `imageURL` field in Firestore

---

## 🔐 Admin Access

1. Open `js/firebase.js` and set:
   ```js
   const ADMIN_EMAIL = "youremail@example.com";
   ```
2. Create an account on the store using that email
3. Navigate to `admin.html` — the page guard will let you in

---

## ✅ Pre-launch Checklist

- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Firestore database created (test mode)
- [ ] `firebaseConfig` pasted into `js/firebase.js`
- [ ] Admin email set in `js/firebase.js`
- [ ] Products seeded (run `seedProducts()` in console)
- [ ] Running via VS Code Live Server (not file://)
- [ ] Tested: signup → add to cart → checkout → check admin dashboard

---

## 🛡️ Firestore Security Rules (for production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if false; // Only via Firebase Console or Admin SDK
    }
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read:   if request.auth != null &&
                       resource.data.customerUid == request.auth.uid;
    }
  }
}
```
