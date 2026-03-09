# 🚀 The Living Muse — Deployment & Infrastructure Guide

**Version:** 1.0
**Date:** March 8, 2026

---

## Deployment Paths

The Living Muse supports two deployment strategies depending on your infrastructure preference:

### Path A: Firebase-Native (Recommended for MVP)
| Component | Service | Notes |
|-----------|---------|-------|
| Auth | Firebase Authentication | Google, Apple, Email |
| Database | Cloud Firestore | Real-time, offline support |
| Storage | Cloud Storage for Firebase | Media files |
| Backend | Cloud Functions Gen 2 | Serverless, auto-scaling |
| AI | Vertex AI (GCP) | Gemini, Imagen, Veo, Lyria |
| Payments | Stripe | Subscriptions + one-time |
| Hosting | Firebase Hosting / Vercel | Next.js SSR |
| CI/CD | GitHub Actions | Auto-deploy on push |

### Path B: Loveable Cloud (Fastest Path)
| Component | Service | Notes |
|-----------|---------|-------|
| Auth | Built-in (Loveable) | Eliminates Firebase Auth setup |
| Database | Built-in PostgreSQL | Replaces Firestore |
| Storage | Built-in storage | Replaces Cloud Storage |
| Backend | Built-in edge functions | Replaces Cloud Functions |
| AI | Vertex AI (GCP) | Same — plug in GCP key |
| Payments | Stripe | Same — plug in Stripe key |
| Hosting | Built-in | Eliminates Vercel setup |
| Secrets | Built-in secrets manager | Eliminates Secret Manager |
| CDN/SSL | Built-in | Automatic |

> **With Loveable Cloud you only need 2 API keys:** `GOOGLE_SERVICE_ACCOUNT_KEY` + `STRIPE_SECRET_KEY`

---

## Environment Variables / Secrets Needed

### Required (Both Paths)
| Variable | Purpose | Where to Get |
|----------|---------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | GCP credentials for Vertex AI | GCP Console → IAM → Service Accounts |
| `GCP_PROJECT_ID` | Google Cloud project | GCP Console |
| `STRIPE_SECRET_KEY` | Payment processing | Stripe Dashboard → Developers |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Stripe Dashboard → Webhooks |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe (safe in code) | Stripe Dashboard → Developers |

### Firebase-Native Path (Additional)
| Variable | Purpose | Where to Get |
|----------|---------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase init | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client auth domain | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Push notifications | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Analytics/tracking | Firebase Console |

### Loveable Cloud Path (Additional)
| Variable | Purpose | Where to Get |
|----------|---------|-------------|
| `SUPABASE_URL` | Database/auth endpoint | Loveable Cloud dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access | Loveable Cloud dashboard |
| `DATABASE_URL` | PostgreSQL connection | Loveable Cloud dashboard |

---

## GCP APIs to Enable

```bash
# Enable all required APIs in one command
gcloud services enable \
  aiplatform.googleapis.com \
  texttospeech.googleapis.com \
  storage.googleapis.com \
  cloudfunctions.googleapis.com \
  run.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com
```

---

## Service Account Setup

```bash
# Create service account for Vertex AI
gcloud iam service-accounts create living-muse-backend \
  --display-name="Living Muse Backend"

# Grant Vertex AI access
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:living-muse-backend@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Grant Storage access
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:living-muse-backend@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download key (store in Secret Manager, NEVER commit)
gcloud iam service-accounts keys create ./service-account-key.json \
  --iam-account=living-muse-backend@$GCP_PROJECT_ID.iam.gserviceaccount.com
```

---

## Deploy Commands

### Firebase-Native
```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# Local development with emulators
firebase emulators:start
```

### Loveable Cloud
```
1. Connect GitHub repo to Loveable
2. Set GOOGLE_SERVICE_ACCOUNT_KEY as secret
3. Set STRIPE_SECRET_KEY as secret
4. Deploy (automatic on push)
```

---

## Cost Estimates by Path

| Component | Firebase-Native (Month 6, 10K users) | Loveable Cloud |
|-----------|--------------------------------------|----------------|
| Database | ~$5/mo (Firestore) | Included |
| Storage | ~$1/mo (50GB) | Included |
| Functions | ~$10/mo (500K invocations) | Included |
| CDN | ~$16/mo (200GB) | Included |
| Hosting | Free (Firebase) / $20 (Vercel Pro) | Included |
| AI APIs (Vertex) | ~$2,200/mo | ~$2,200/mo (same) |
| Stripe | 2.9% + $0.30/txn | 2.9% + $0.30/txn |
| **Total** | **~$2,252/mo** | **~$2,200/mo + Loveable plan** |

> **AI API costs are the same regardless of deployment path.** Infrastructure costs are negligible compared to Vertex AI costs.

---

## What Loveable Cloud Eliminates

| Manual Setup (Firebase Path) | Loveable Cloud |
|------------------------------|----------------|
| Firebase project creation | ✅ Eliminated |
| Firestore rules deployment | ✅ Eliminated |
| Storage bucket configuration | ✅ Eliminated |
| Cloud Functions deployment | ✅ Eliminated |
| SSL/DNS configuration | ✅ Eliminated |
| Secret Manager setup | ✅ Eliminated |
| CI/CD pipeline (GitHub Actions) | ✅ Eliminated |
| **~7 services to manage** | **2 API keys to provide** |

---

## Recommended Path

| Scenario | Recommended Path |
|----------|-----------------|
| Hackathon / fast MVP | **Loveable Cloud** (2 API keys, deploy in minutes) |
| Production with team > 3 | **Firebase-Native** (more control, monitoring) |
| Need offline support | **Firebase-Native** (Firestore offline) |
| Need real-time features | **Firebase-Native** (Firestore listeners) |
| Need full GCP control | **Firebase-Native** (IAM, VPC, logging) |
| Solo founder / lean startup | **Loveable Cloud** (minimize ops burden) |
