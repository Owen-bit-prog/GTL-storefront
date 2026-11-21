# GTL Store v2 — Complete Setup Guide

A production-ready e-commerce platform with Firebase integration, product cards, cart system, and checkout flow.

## 🚀 Quick Start

### 1. Firebase Configuration

**Step 1: Create a Firebase Project**
- Go to [Firebase Console](https://console.firebase.google.com)
- Click "Create project"
- Name it "GTL-Store" (or your preferred name)
- Enable Google Analytics (optional)

**Step 2: Get Firebase Credentials**
- In Firebase Console, go to **Project Settings** (gear icon)
- Scroll to "Your apps" section
- Click on the web app icon `</>`
- Copy the configuration object
- Replace the values in `js/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

**Step 3: Enable Authentication**
- Go to **Build → Authentication** in Firebase Console
- Click "Get Started"
- Enable **Email/Password** provider
- (Optional) Enable **Google Sign-in**

**Step 4: Create Firestore Database**
- Go to **Build → Firestore Database**
- Click "Create database"
- Start in **Test mode** (for development)
- Choose your region (closest to your users)

**Step 5: Import Security Rules (Important for Production)**

Create these rules in **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Public read, Admin-only write
    match /products/{document=**} {
      allow read: if true;
      allow write: if false; // Use Firebase Admin SDK for seeding
    }

    // Orders: Users can read their own, create new
    match /orders/{document=**} {
      allow read: if request.auth.uid == resource.data.customerUid;
      allow create: if request.auth.uid != null;
      allow write: if false; // Admin only for modifications
    }

    // Users: Private by default
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 2. Seed Products to Firestore

**Option A: Using Browser Console**

1. Open the app in browser (e.g., `http://localhost:8000/index.html`)
2. Open **Dev Tools** (F12)
3. Go to **Console** tab
4. Run:

```javascript
import { seedProducts } from './js/firebase.js';
seedProducts();
```

You should see: `✅ Products seeded to Firestore.`

**Option B: Using Firebase Admin CLI (Recommended for Production)**

```bash
npm install -g firebase-tools
firebase login
firebase init  # Configure your project
# Then use the Admin SDK to seed products
```

### 3. Test the Shop

**Start a local server:**

```bash
# If you have Python 3
python -m http.server 8000

# Or using Node.js/npm
npx http-server

# Or using VS Code Live Server extension
```

**Visit:** `http://localhost:8000/index.html`

**Test flow:**
1. Browse products (should load from Firestore or fallback to static data)
2. Add items to cart
3. View cart (`/cart.html`)
4. Login (test Google/Email)
5. Proceed to checkout (`/checkout.html`)
6. Complete order (saved to Firestore)

---

## 📁 Project Structure

```
gtl-store-v2/
├── index.html          # Homepage + shop products
├── cart.html           # Shopping cart
├── checkout.html       # Order checkout & shipping
├── login.html          # Authentication
├── admin.html          # (Admin dashboard - future)
│
├── css/
│   └── style.css       # All styling (brand colors, animations)
│
├── js/
│   ├── firebase.js     # Firebase config + Firestore helpers
│   ├── app.js          # Shared logic (nav auth, mobile menu)
│   └── checkout.js     # (Optional) Separate checkout logic
│
└── README.md           # This file
```

---

## 🎨 Features

### Product Display
- ✅ Real product cards with images
- ✅ Category filtering (All, Tops, Bottoms, Headwear)
- ✅ Product badges ("New Drop", "Hot", "Limited")
- ✅ Smooth animations & hover effects
- ✅ Image lazy loading

### Shopping Cart
- ✅ Add/remove items
- ✅ Adjust quantities
- ✅ Persistent cart (localStorage)
- ✅ Cart badge on navbar

### Checkout System
- ✅ Shipping information form
- ✅ Order summary with product details
- ✅ Order confirmation screen
- ✅ Order saved to Firestore (`/orders` collection)

### Authentication
- ✅ Email/Password login
- ✅ Google Sign-in (optional)
- ✅ User display on navbar
- ✅ Logout functionality

### Design
- ✅ Dark mode (brand: #CCFF00 on #0a0a0a)
- ✅ Mobile responsive
- ✅ Accessible forms & buttons
- ✅ Toast notifications
- ✅ Loading states

---

## 🔧 Product Data Structure

Products in Firestore (`products` collection):

```javascript
{
  name: "Lemon Oversized Tee",
  price: 120,
  category: "tops",
  description: "Heavy 280gsm cotton. Dropped shoulders, boxy silhouette.",
  badge: "New Drop",  // or null
  imageURL: "https://images.unsplash.com/photo-1521572163474-..."
}
```

Orders in Firestore (`orders` collection):

```javascript
{
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerUid: "user123",
  shippingInfo: {
    firstName: "John",
    lastName: "Doe",
    phone: "+233 20 123 4567",
    address: "123 Main St",
    city: "Accra",
    postal: "00100"
  },
  items: [
    {
      productId: "prod123",
      productName: "Lemon Oversized Tee",
      price: 120,
      qty: 2,
      lineTotal: 240
    }
  ],
  subtotal: 240,
  delivery: 0,
  total: 240,
  status: "pending",
  timestamp: 1713446400000
}
```

---

## 🚨 Production Checklist

- [ ] Replace Firebase config with your credentials
- [ ] Enable Email/Password authentication
- [ ] Create Firestore Database
- [ ] Seed products to Firestore
- [ ] Update security rules (from Step 2)
- [ ] Test login/logout
- [ ] Test add to cart & checkout
- [ ] Update branding (colors, logo, message)
- [ ] Set up custom domain (Firebase Hosting)
- [ ] Enable HTTPS
- [ ] Set up payment gateway (Stripe, PayPal, etc.)
- [ ] Add email notifications
- [ ] Monitor Firestore database usage

---

## 🛠 Customization

### Change Brand Color
Edit `css/style.css`:
```css
:root {
  --brand: #CCFF00;        /* Change this */
  --brand-dim: #aad900;    /* And this */
  --dark: #0a0a0a;
  /* ... */
}
```

### Add More Products
Add to the `STATIC_PRODUCTS` array in `index.html` or seed to Firestore.



### Customize Checkout Form
Edit the shipping form in `checkout.html` (`<form id="checkout-form">` section).

---

## 🐛 Troubleshooting

**Products not loading?**
- Check Firebase credentials in `js/firebase.js`
- Check browser console for errors
- Verify Firestore database is created
- Check Firestore security rules aren't blocking reads

**Cart items not persisting?**
- Check if localStorage is enabled
- Clear browser cache/cookies
- Check browser console for quota errors

**Checkout not working?**
- Ensure user is logged in
- Check Firestore database permissions
- Verify shipping form is filled
- Check browser console for errors

**Images not loading?**
- Check image URLs are valid (HTTPS)
- Verify CORS headers on image server
- Try different image URLs

---

## 📚 Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore/start)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)

---

## 📝 License

This project is open-source. Feel free to customize for your business!

---

**Built with ❤️ for GTL Brand, Accra.**
