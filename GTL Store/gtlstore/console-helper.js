// ================================================================
//  GTL STORE — Console Helper Script
//  Paste this in browser console to quickly seed products
// ================================================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║          GTL STORE — FIREBASE SETUP HELPER                 ║
╚══════════════════════════════════════════════════════════════╝

📋 SETUP CHECKLIST:
  1. ✅ Firebase config added in js/firebase.js
  2. ✅ Firestore Database created
  3. ⏳ About to seed products...

QUICK COMMANDS:
  seedProducts()          → Seed 8 products to Firestore
  clearProducts()         → Remove all products (⚠️ use with caution)
  viewProducts()          → List all products
  viewOrders()            → List all orders
  resetCart()             → Clear browser cart
`);

import { db, showToast } from "./js/firebase.js";
import { collection, getDocs, addDoc, deleteDoc, query } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── SEED PRODUCTS ────────────────────────────────────────────
window.seedProducts = async function() {
  const col = collection(db, "products");
  const snap = await getDocs(col);
  if (!snap.empty) { 
    console.warn("⚠️  Products already exist. Skipping seed.");
    return; 
  }

  const products = [
    {
      name: "GTL Oversized Shirt",
      price: 120,
      category: "shirts",
      description: "Boxy cotton shirt with soft hand feel and relaxed fit.",
      badge: "New Drop",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80"
    },
    {
      name: "GTL Skull Cap",
      price: 65,
      category: "skull-caps",
      description: "Ribbed acrylic skull cap with snug fit for everyday layering.",
      badge: "Best Seller",
      imageURL: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80"
    },
    {
      name: "GTL Crop Top",
      price: 90,
      category: "crop-tops",
      description: "Cropped cotton top with contrast stitch detail and bold GTL branding.",
      badge: "Limited",
      imageURL: "https://images.unsplash.com/photo-1520975913232-8c45738fd255?w=500&q=80"
    },
    {
      name: "GTL Sport Hoodie",
      price: 220,
      category: "hoodies",
      description: "Brushed fleece hoodie with oversized hood and hidden kangaroo pocket.",
      badge: "Hot",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80"
    },
    {
      name: "GTL Street Shorts",
      price: 160,
      category: "shorts",
      description: "Utility-inspired shorts with elastic waist and tonal embroidery.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500&q=80"
    },
    {
      name: "GTL Graphic Tee",
      price: 80,
      category: "shirts",
      description: "Soft jersey tee with graphic front print and vintage wash.",
      badge: "On Sale",
      imageURL: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80"
    },
    {
      name: "GTL Trucker Cap",
      price: 70,
      category: "caps",
      description: "Structured trucker cap with adjustable snapback and woven label.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1518541230616-92c768c3f797?w=500&q=80"
    },
    {
      name: "GTL Corded Skull Cap",
      price: 68,
      category: "skull-caps",
      description: "Thick corded skull cap with street-ready fit and premium finish.",
      badge: null,
      imageURL: "https://images.unsplash.com/photo-1518675291790-290a1c4d21d6?w=500&q=80"
    },
  ];

  console.log("🌱 Seeding products...");
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    try {
      const docRef = await addDoc(col, p);
      console.log(`  ✓ ${p.name} (${docRef.id.substring(0, 6)}...)`);
    } catch (e) {
      console.error(`  ✗ Failed to add ${p.name}:`, e.message);
    }
  }
  console.log("✅ Seeding complete!");
  console.log("📄 Reload the page to see products.");
};

// ── CLEAR PRODUCTS ──────────────────────────────────────────
window.clearProducts = async function() {
  if (!confirm("⚠️  This will delete ALL products. Continue?")) return;
  const col = collection(db, "products");
  const snap = await getDocs(col);
  
  console.log(`🗑️  Deleting ${snap.size} products...`);
  for (const doc of snap.docs) {
    try {
      await deleteDoc(doc.ref);
      console.log(`  ✓ Deleted ${doc.id.substring(0, 6)}...`);
    } catch (e) {
      console.error(`  ✗ Failed to delete ${doc.id}:`, e.message);
    }
  }
  console.log("✅ All products deleted!");
};

// ── VIEW PRODUCTS ───────────────────────────────────────────
window.viewProducts = async function() {
  const col = collection(db, "products");
  const snap = await getDocs(col);
  
  if (snap.empty) {
    console.log("📦 No products found. Run seedProducts() first.");
    return;
  }

  console.log(`\n📦 PRODUCTS (${snap.size} total):`);
  console.table(snap.docs.map(doc => ({
    ID: doc.id.substring(0, 8),
    Name: doc.data().name,
    Price: "₵" + doc.data().price,
    Category: doc.data().category,
    Badge: doc.data().badge || "—"
  })));
};

// ── VIEW ORDERS ──────────────────────────────────────────────
window.viewOrders = async function() {
  const col = collection(db, "orders");
  const snap = await getDocs(col);
  
  if (snap.empty) {
    console.log("📋 No orders found yet.");
    return;
  }

  console.log(`\n📋 ORDERS (${snap.size} total):`);
  console.table(snap.docs.map(doc => ({
    "Order ID": doc.id.substring(0, 8),
    Customer: doc.data().customerName,
    Email: doc.data().customerEmail,
    Total: "₵" + doc.data().total,
    Status: doc.data().status,
    Items: doc.data().items.length
  })));
};

// ── RESET CART ───────────────────────────────────────────────
window.resetCart = function() {
  localStorage.removeItem("gtl_cart");
  console.log("✅ Cart cleared!");
  console.log("🔄 Reload page to see changes.");
};

console.log(`
✨ Helper functions loaded! Try:
   seedProducts()
   viewProducts()
   viewOrders()
   resetCart()
   clearProducts()
`);
