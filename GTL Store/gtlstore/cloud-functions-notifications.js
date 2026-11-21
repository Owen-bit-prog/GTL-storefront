// Firebase Cloud Functions Example - Send Push Notifications
// Deploy this to Firebase Functions to send notifications to users

// Install: npm install firebase-admin firebase-functions

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// ── Send notification when order is placed ──────────────────
exports.notifyOrderPlaced = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    
    // Get user's FCM token from Firestore
    const userDoc = await admin.firestore().collection("users").doc(order.customerUid).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log("No FCM token for user:", order.customerUid);
      return;
    }

    const message = {
      notification: {
        title: "✅ Order Confirmed!",
        body: `Your order #${context.params.orderId} has been received`,
        icon: "https://images.unsplash.com/photo-1543163521-9a539c6dd60b?w=100"
      },
      data: {
        orderId: context.params.orderId,
        click_action: "https://gtlstore.com"
      },
      token: fcmToken
    };

    try {
      await admin.messaging().send(message);
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

// ── Send promotional notification to all users ──────────────
exports.sendPromoNotification = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const ADMIN_EMAILS = ["gtlbrand926@gmail.com"];
  const user = await admin.auth().getUser(context.auth.uid);

  if (!ADMIN_EMAILS.includes(user.email)) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can send promotions");
  }

  // Get all users with FCM tokens
  const usersSnapshot = await admin.firestore().collection("users").where("fcmToken", "!=", "").get();
  
  const message = {
    notification: {
      title: data.title || "🎉 Special Offer!",
      body: data.body || "Check out our latest collection",
      icon: data.icon || "https://images.unsplash.com/photo-1543163521-9a539c6dd60b?w=100"
    },
    data: {
      promoCode: data.promoCode || "",
      link: data.link || ""
    }
  };

  let successCount = 0;
  let failureCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const fcmToken = userDoc.data().fcmToken;
    
    try {
      message.token = fcmToken;
      await admin.messaging().send(message);
      successCount++;
    } catch (error) {
      console.error(`Failed to send to ${fcmToken}:`, error);
      failureCount++;
    }
  }

  return {
    success: true,
    sent: successCount,
    failed: failureCount
  };
});

// ── Send order status update ─────────────────────────────────
exports.notifyOrderStatus = functions.https.onCall(async (data, context) => {
  const { orderId, status } = data;

  if (!orderId || !status) {
    throw new functions.https.HttpsError("invalid-argument", "orderId and status required");
  }

  const orderDoc = await admin.firestore().collection("orders").doc(orderId).get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Order not found");
  }

  const order = orderDoc.data();
  const userDoc = await admin.firestore().collection("users").doc(order.customerUid).get();
  const fcmToken = userDoc.data()?.fcmToken;

  if (!fcmToken) return;

  const statusMessages = {
    pending: "Your order is being processed",
    confirmed: "Order confirmed!",
    shipped: "📦 Your order is on its way!",
    delivered: "✅ Order delivered!",
    cancelled: "Order cancelled"
  };

  const message = {
    notification: {
      title: `Order ${status.toUpperCase()}`,
      body: statusMessages[status] || `Order status: ${status}`
    },
    data: {
      orderId: orderId,
      status: status
    },
    token: fcmToken
  };

  try {
    await admin.messaging().send(message);
    console.log(`Status notification sent: ${status}`);
  } catch (error) {
    console.error("Error sending status notification:", error);
  }
});
// ── Verify Paystack transaction after customer checkout ─────
exports.verifyPaystack = functions.https.onCall(async (data, context) => {
  const reference = data?.reference;
  if (!reference) {
    throw new functions.https.HttpsError("invalid-argument", "Transaction reference is required");
  }

  const secret = functions.config().paystack?.secret || process.env.PAYSTACK_SECRET;
  if (!secret) {
    throw new functions.https.HttpsError("failed-precondition", "Paystack secret key is not configured");
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${secret}`
      }
    });

    const result = await response.json();

    if (!response.ok || !result.status || !result.data) {
      throw new Error(result.message || "Failed to verify Paystack transaction");
    }

    return {
      verified: result.data.status === "success",
      status: result.data.status,
      amount: result.data.amount,
      reference: result.data.reference,
      gatewayResponse: result.data.gateway_response
    };
  } catch (err) {
    console.error("Paystack verification error:", err);
    throw new functions.https.HttpsError("internal", err.message || "Paystack verification failed");
  }
});
// ── Usage Example from Client ────────────────────────────────
/*
import { httpsCallable } from "firebase/functions";
import { functions } from "./js/firebase.js";

// Send promo
const sendPromo = httpsCallable(functions, "sendPromoNotification");

sendPromo({
  title: "🎉 Summer Sale",
  body: "Get 40% off all products!",
  promoCode: "SUMMER40",
  link: "https://gtlstore.com/sale"
}).then(result => {
  console.log("Promo sent to", result.data.sent, "users");
});
*/
