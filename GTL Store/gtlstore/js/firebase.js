// ================================================================
//  GTL STORE — js/firebase.js
//  Central Firebase initialisation + shared helpers
//  🔧 REPLACE firebaseConfig with your own project credentials
// ================================================================

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics }                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged }          from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getMessaging, getToken }               from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";
import { getFunctions }                         from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

// ── 🔧 YOUR FIREBASE CONFIG ──────────────────────────────────
//  SETUP STEPS:
//  1. Go to Firebase Console (console.firebase.google.com)
//  2. Create a new project (or use existing)
//  3. In Project Settings → Your Apps → Web, get your SDK config
//  4. Replace the credentials below with your actual values
//  5. Enable Email/Password auth in Firebase Console
//  6. Enable Firestore Database (start in test mode)
//  7. Once done, uncomment the seedProducts() call below
const firebaseConfig = {
  apiKey:            "AIzaSyC1hOycTJiCrk8UheiMGwBAwf7QzIHHOfg",
  authDomain:        "gtl-store.firebaseapp.com",
  databaseURL:       "https://gtl-store-default-rtdb.firebaseio.com",
  projectId:         "gtl-store",
  storageBucket:     "gtl-store.firebasestorage.app",
  messagingSenderId: "859952419896",
  appId:             "1:859952419896:web:3462d3525043b505bb82cd",
  measurementId:     "G-LE6QQPPS0C"
};

// Initialise once; export shared instances
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const functions = getFunctions(app);

export let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (err) {
  console.warn("Firebase Analytics not supported in this environment:", err.message);
}

// ── 👑 ADMIN HELPERS ─────────────────────────────────────────
export const ADMIN_EMAILS = ["gtlbrand926@gmail.com"];

export function isAdminUser(user) {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// ── 💳 PAYSTACK CONFIGURATION ────────────────────────────────
//  🔧 To change your Paystack Public Key:
//  1. Go to Paystack Dashboard (dashboard.paystack.com) → Settings → API Keys & Webhooks
//  2. Copy your Public Key (pk_live_... or pk_test_...) and replace below:
export const PAYSTACK_PUBLIC_KEY = "pk_live_9606f21194545f4e579297517649da6a56c3b802";

// ── FIREBASE CLOUD MESSAGING (FCM) ──────────────────────────
// 🔧 SETUP NOTIFICATIONS:
//  1. Go to Firebase Console → Project Settings → Cloud Messaging
//  2. Copy your Server Key (VAPID Key) under Web Push certificates
//  3. Replace YOUR_VAPID_KEY below with the actual key
//  4. Call enableNotifications() when user subscribes
let messaging = null;

try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn("Messaging not available in this environment:", err.message);
}

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function enableNotifications() {
  if (!messaging) {
    console.warn("Firebase Messaging not initialized");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const vapidKey = "YOUR_VAPID_KEY"; // 🔧 Replace with your VAPID key from Firebase Console
      const opts = (vapidKey && vapidKey !== "YOUR_VAPID_KEY") ? { vapidKey } : {};
      const token = await getToken(messaging, opts).catch(err => {
        console.warn("FCM Token fetch note:", err.message);
        return null;
      });

      if (token) {
        console.log("✅ FCM Token obtained:", token);
        localStorage.setItem("fcm_token", token);

        if (auth.currentUser) {
          try {
            await setDoc(doc(db, "users", auth.currentUser.uid), { fcmToken: token }, { merge: true });
          } catch(e) {
            console.warn("Could not save FCM token to Firestore user document:", e.message);
          }
        }
        return token;
      }
    } else if (permission === "denied") {
      console.log("Notification permission denied by user");
    }
  } catch (err) {
    console.error("Error enabling notifications:", err);
  }
  return null;
}

// ── AUTH STATE OBSERVER ──────────────────────────────────────
// Any module can call this to react to login/logout changes.
export function watchAuth(cb) {
  onAuthStateChanged(auth, cb);
}

// ── TOAST NOTIFICATION ───────────────────────────────────────
// Small utility used by all pages.
export function showToast(msg, type = "success") {
  let t = document.getElementById("gtl-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "gtl-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className   = `gtl-toast gtl-toast--${type} gtl-toast--show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("gtl-toast--show"), 3500);
}

// ── USER PROFILE HELPERS ─────────────────────────────────────
// Generate initials from full name
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== "string") {
    return "?";
  }

  const parts = fullName.trim().split(/\s+/).filter(p => p.length > 0);
  
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  
  // Take first letter of first and last name
  const initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return initials.substring(0, 2);
}

// Get user's display name with fallback
export function getUserDisplayName(user) {
  if (!user) return "Guest";
  return user.displayName || user.email?.split("@")[0] || "User";
}

// Update user profile with name
export async function updateUserProfile(user, displayName) {
  if (!user) throw new Error("No user logged in");
  try {
    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
    await updateProfile(user, { displayName });
    await createUserRecord(user, displayName);
    return true;
  } catch (err) {
    console.error("Error updating profile:", err);
    return false;
  }
}

// Create or update user profile document in Firestore
export async function createUserRecord(user, displayName) {
  if (!user) return false;
  try {
    const { serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const userRef = doc(db, "users", user.uid);
    const nameToSave = displayName || user.displayName || user.email?.split("@")[0] || "User";
    const isProdAdmin = isAdminUser(user);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: nameToSave,
      email: user.email,
      role: isProdAdmin ? "admin" : "user",
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Could not save user document to Firestore:", err.message);
    return false;
  }
}

// ── CART HELPERS (localStorage) ──────────────────────────────
export function getCart() {
  try { return JSON.parse(localStorage.getItem("gtl_cart") || "[]"); }
  catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem("gtl_cart", JSON.stringify(cart));
  updateCartBadge();
}

export function addToCart(product) {
  const cart  = getCart();
  const index = cart.findIndex(i => i.id === product.id);
  if (index > -1) {
    cart[index].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showToast(`${product.name} added to cart ✓`);
}

export function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

export function updateQty(productId, delta) {
  const cart  = getCart();
  const index = cart.findIndex(i => i.id === productId);
  if (index === -1) return;
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem("gtl_cart");
  updateCartBadge();
}

export function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function updateCartBadge() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
  });
}

// ── WISHLIST HELPERS (localStorage) ──────────────────────────
export function getWishlist() {
  try { return JSON.parse(localStorage.getItem("gtl_wishlist") || "[]"); }
  catch { return []; }
}

export function saveWishlist(wishlist) {
  localStorage.setItem("gtl_wishlist", JSON.stringify(wishlist));
  updateWishlistBadge();
}

export function isWishlisted(productId) {
  return getWishlist().some(item => item.id === productId);
}

export function toggleWishlist(product) {
  const wishlist = getWishlist();
  const index = wishlist.findIndex(item => item.id === product.id);
  let added = false;
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast(`Removed ${product.name} from wishlist`, "info");
  } else {
    wishlist.push(product);
    showToast(`Added ${product.name} to wishlist ❤️`, "success");
    added = true;
  }
  saveWishlist(wishlist);
  return added;
}

export function updateWishlistBadge() {
  const count = getWishlist().length;
  document.querySelectorAll(".wishlist-badge").forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? "flex" : "none";
  });
}

// ── SEED PRODUCTS INTO FIRESTORE ─────────────────────────────
// Call seedProducts() once from the browser console after setup:
//   import { seedProducts } from './js/firebase.js'; seedProducts();
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function seedProducts() {
  const col  = collection(db, "products");
  const snap = await getDocs(col);
  if (!snap.empty) { console.log("Products already seeded."); return; }

  const products = [
    {
      name: "GTL Oversized Shirt",
      price: 120,
      category: "shirts",
      description: "Boxy cotton shirt with soft hand feel and relaxed fit.",
      badge: "New Drop",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"
    },
    {
      name: "GTL Skull Cap",
      price: 65,
      category: "skull-caps",
      description: "Ribbed acrylic skull cap with snug fit for everyday layering.",
      badge: "Best Seller",
      imageURL: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80"
    },
    {
      name: "GTL Crop Top",
      price: 90,
      category: "crop-tops",
      description: "Cropped cotton top with contrast stitch detail and bold GTL branding.",
      badge: "Limited",
      imageURL: "https://images.unsplash.com/photo-1520975913232-8c45738fd255?w=800&q=80"
    },
    {
      name: "GTL Sport Hoodie",
      price: 220,
      category: "hoodies",
      description: "Brushed fleece hoodie with oversized hood and hidden kangaroo pocket.",
      badge: "Hot",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"
    },
    {
      name: "GTL Street Shorts",
      price: 160,
      category: "shorts",
      description: "Utility-inspired shorts with elastic waist and tonal embroidery.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&q=80"
    },
    {
      name: "GTL Graphic Tee",
      price: 80,
      category: "shirts",
      description: "Soft jersey tee with graphic front print and vintage wash.",
      badge: "On Sale",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"
    },
    {
      name: "GTL Trucker Cap",
      price: 70,
      category: "caps",
      description: "Structured trucker cap with adjustable snapback and woven label.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1518541230616-92c768c3f797?w=800&q=80"
    },
    {
      name: "GTL Corded Skull Cap",
      price: 68,
      category: "skull-caps",
      description: "Thick corded skull cap with street-ready fit and premium finish.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1518675291790-290a1c4d21d6?w=800&q=80"
    },
  ];

  for (const p of products) await addDoc(col, p);
  console.log("✅ Products seeded to Firestore.");
}
