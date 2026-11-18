# Splitwise Modern Expense Sharing PWA 🚀

A modern, mobile-first Progressive Web Application (PWA) built with **React**, **TypeScript**, **Redux Toolkit**, **Tailwind CSS v4**, **shadcn/ui-inspired primitives**, and **Firebase**.

Designed with fintech-grade minimalism, lightning-fast interactions, and an intuitive workflow:
> **Open App → Select Group → Add Expense → Select Payer → Choose Split → Save**

---

## ✨ Features

- **Multi-Group Expense Management**: Track expenses for trips (e.g. *Goa Trip*), roommates (*Flat 402*), dinners, parties, and office outings.
- **Flexible Split Engines**:
  - **Equal (`=`)**: Instant equal split across all or selected members with penny rounding compensation.
  - **Exact (`123`)**: Custom dollar/rupee amounts with live remaining tracker.
  - **Percentage (`%`)**: Percentage-based allocation with automatic validation to 100%.
  - **Shares**: Weighted shares (1 share, 2 shares, etc.) with automatic proportional allocation.
- **Smart Debt Simplification (Min-Cash-Flow)**: Greedy debt minimization algorithm reducing complex group debts to the minimum number of direct transactions.
- **Pairwise Balances ("Friends")**: Real-time cross-group debt calculation between you and any specific friend.
- **1-Tap Settlements**: Record partial or complete settlements via UPI, Cash, Bank Transfer, or Venmo.
- **Installable PWA**: Works offline, installs directly to mobile home screen with service worker caching and manifest.
- **Firebase Ready + Offline/Demo Mode**: Out-of-the-box rich demo mode; plug in Firebase credentials to enable live Cloud Firestore syncing and Firebase Auth.
- **Accessible Design System**: Built with modern Tailwind CSS v4, Lucide icons, smooth animations, safe-area mobile paddings, and Sonner notifications.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6
- **Styling**: Tailwind CSS v4, Lucide React icons, shadcn/ui accessible primitives
- **State Management**: Redux Toolkit, React Redux, RTK Query
- **Backend & Database**: Firebase Authentication, Cloud Firestore, Firebase Hosting, Firebase Security Rules
- **Forms & Validation**: React Hook Form, Zod, `@hookform/resolvers`
- **PWA**: `vite-plugin-pwa`, Workbox service worker
- **Testing**: Vitest, React Testing Library, jsdom

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser or on your phone on the same network.

### 2. Run Unit Tests
```bash
npm test
```

### 3. Build for Production & PWA
```bash
npm run build
```
The production bundle will be generated in `dist/` with precached service worker (`sw.js`) and web manifest.

---

## 📱 PWA Installation

### Android / Chrome:
Tap the **Install App** button in the **Account** tab, or tap the browser menu (⋮) and select **"Add to Home screen"**.

### iOS / Safari:
Tap the **Share** button in Safari, scroll down and tap **"Add to Home Screen"**.

---

## 🔒 Firebase Configuration (Optional)

Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Deploy to Firebase Hosting:
```bash
firebase deploy
```
