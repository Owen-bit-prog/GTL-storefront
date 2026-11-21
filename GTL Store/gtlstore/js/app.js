// ================================================================
//  GTL STORE — js/app.js
//  Shared logic: nav auth state, cart badge, mobile menu
// ================================================================

import { auth, watchAuth, updateCartBadge, updateWishlistBadge, getInitials, getUserDisplayName } from "./firebase.js";
import { signOut }                                                       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── INIT ON EVERY PAGE ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();         // setup theme toggle and persistence
  updateCartBadge();   // set badge count from localStorage
  updateWishlistBadge(); // set wishlist count from localStorage
  initNav();
  initMobileMenu();
});

// ── THEME TOGGLE ─────────────────────────────────────────────
function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const updateThemeUI = () => {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const icon = toggle.querySelector("i");
    const label = toggle.querySelector(".theme-toggle-label");
    
    if (theme === "light") {
      if (icon) icon.className = "fas fa-sun";
      if (label) label.textContent = "Light";
      toggle.title = "Switch to Dark Mode 🌙";
      toggle.setAttribute("aria-label", "Switch to Dark Mode");
    } else {
      if (icon) icon.className = "fas fa-moon";
      if (label) label.textContent = "Dark";
      toggle.title = "Switch to Light Mode ☀️";
      toggle.setAttribute("aria-label", "Switch to Light Mode");
    }
  };

  // Initialize theme on page load
  let savedTheme = localStorage.getItem("gtl_theme");
  if (!savedTheme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    savedTheme = prefersDark ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeUI();

  // Toggle on button click
  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("gtl_theme", next);
    updateThemeUI();
  });
}

// ── NAV AUTH STATE ───────────────────────────────────────────
function initNav() {
  const loginLink  = document.getElementById("nav-login-link");
  const userWidget = document.getElementById("nav-user-widget");
  const avatarEl   = document.getElementById("nav-avatar");
  const logoutBtn  = document.getElementById("nav-logout-btn");

  if (!loginLink && !userWidget) return; // nav not on this page

  const mobileLoginLink = document.querySelector(".mobile-nav .nav-link[href='login.html']");

  watchAuth((user) => {
    if (user) {
      loginLink?.classList.add("hidden");
      userWidget?.classList.remove("hidden");

      const fullName = getUserDisplayName(user);
      const initials = getInitials(fullName);

      if (avatarEl) {
        avatarEl.textContent = initials;
        avatarEl.title = `Profile · ${fullName}`;
        avatarEl.setAttribute("aria-label", `View profile for ${fullName}`);
        avatarEl.onclick = () => { window.location.href = "profile.html"; };
      }

      if (mobileLoginLink) {
        mobileLoginLink.textContent = "My Profile";
        mobileLoginLink.setAttribute("href", "profile.html");
      }
    } else {
      loginLink?.classList.remove("hidden");
      userWidget?.classList.add("hidden");

      if (avatarEl) {
        avatarEl.textContent = "";
        avatarEl.title = "";
        avatarEl.removeAttribute("aria-label");
        avatarEl.onclick = null;
      }

      if (mobileLoginLink) {
        mobileLoginLink.textContent = "Login / Account";
        mobileLoginLink.setAttribute("href", "login.html");
      }
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// ── MOBILE MENU TOGGLE ────────────────────────────────────────
function initMobileMenu() {
  const burger  = document.getElementById("burger-btn");
  const mobileNav = document.getElementById("mobile-nav");
  const overlay   = document.getElementById("mobile-overlay");

  burger?.addEventListener("click", () => {
    mobileNav?.classList.toggle("open");
    overlay?.classList.toggle("open");
    burger.setAttribute("aria-expanded",
      mobileNav?.classList.contains("open") ? "true" : "false");
  });
  overlay?.addEventListener("click", () => {
    mobileNav?.classList.remove("open");
    overlay?.classList.remove("open");
  });
}
