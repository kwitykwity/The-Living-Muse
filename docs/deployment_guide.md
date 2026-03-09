# Deployment Guide: The Living Muse

This guide provides the necessary steps to manifest The Living Muse in a production environment.

## 📦 Prerequisites
- **Node.js**: v18+
- **Firebase CLI**: `npm install -g firebase-tools`
- **GCP Project**: Ensure billing is enabled for Vertex AI and Cloud Storage.

---

## 🚀 1. Firebase Configuration

### Login & Initialize
```bash
firebase login
firebase use --add the-living-muse
```

### Environment Secrets (Production Security)
Set the required secrets for the backend. These are stored securely in Google Cloud Secret Manager and injected at runtime.
```bash
# Required for payments
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# Optional: Override defaults if necessary
# firebase functions:config:set project.id="your-id"
```

---

## 🏗️ 2. Pre-flight Verification
Before deploying, run the pre-flight check to verify that all APIs (Vertex AI, Stripe, Firestore) are connected and writable.
```bash
cd functions
npm run build
# Requires local environment setup for credentials
npm run preflight
```

---

## 🌐 3. Frontend Deployment (Hosting)
...

### Build the Next.js App
```bash
cd app
npm install
npm run build
```

### Deploy to Hosting
```bash
firebase deploy --only hosting
```

---

## 🧠 3. Backend Deployment (Functions)

### Build & Deploy Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## 🛠️ 4. Post-Deployment Checklist

1. **Stripe Webhooks**: Point your Stripe Dashboard webhooks to `https://[location]-[project-id].cloudfunctions.net/stripeWebhook`.
2. **Vertex AI Quotas**: Ensure your GCP project has sufficient quota for `gemini-3.1-pro-002` and `veo-3.1`.
3. **CORS**: Verify that `next.config.ts` allowed origins match your production domain.
4. **Vector Search Index**: Ensure the `memories` collection index has finished building in the Firebase Console.

---
*The Living Muse — Launched for the world to witness.*
