# ⚙️ The Living Muse — System Requirements & Infrastructure

**Version:** 1.0
**Date:** March 8, 2026

---

## 1. Development Environment Requirements

### 1.1 Local Development

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20.x LTS | Runtime for Next.js, Cloud Functions |
| **npm** | 10.x | Package management |
| **Git** | 2.40+ | Version control |
| **VS Code / Antigravity IDE** | Latest | IDE with AI assistance |
| **Firebase CLI** | 13.x+ | Firestore emulator, deploy, rules |
| **Google Cloud CLI (gcloud)** | Latest | GCP resource management |
| **Expo CLI** | 52+ | React Native development |
| **Xcode** | 16+ | iOS builds (Mac only) |
| **Android Studio** | Latest | Android builds + emulator |

### 1.2 Required Accounts & Access

| Account | Purpose | Cost |
|---------|---------|------|
| **Google Cloud Platform** | Vertex AI, Firestore, Cloud Functions, Storage | Pay-as-you-go (startup credits) |
| **Firebase** | Auth, Firestore, Hosting, Storage | Free tier + pay-as-you-go |
| **GitHub** | Repository, Actions CI/CD | Free for public repos |
| **Apple Developer** | iOS App Store distribution | $99/year |
| **Google Play Console** | Android distribution | $25 one-time |
| **Vercel** (optional) | Web deployment | Free tier available |
| **Stripe** | Web payments (non-mobile) | 2.9% + $0.30 per transaction |
| **Sentry** | Error tracking | Free tier (5K events/mo) |
| **Domain registrar** | `thelivingmuse.app` | ~$12/year |

---

## 2. Cloud Infrastructure — Google Cloud Platform

### 2.1 GCP Services Required

| Service | Purpose | Pricing Model |
|---------|---------|--------------|
| **Vertex AI** | AI model serving (Gemini, Veo, Imagen, Lyria) | Per-request (tokens/images/seconds) |
| **Cloud Firestore** | Primary database | Free tier: 50K reads, 20K writes/day |
| **Cloud Storage** | Media files (photos, avatars, videos, audio) | $0.020/GB/month (standard) |
| **Cloud Functions Gen 2** | Serverless API backend | Free tier: 2M invocations/month |
| **Cloud Run** | WebSocket server (Conversational Verse) | Per-request + min instances |
| **Cloud Tasks** | Async job queue (video/music generation) | Free tier: 1M operations/month |
| **Cloud CDN** | Global content delivery | $0.08/GB served |
| **Secret Manager** | API keys, credentials | Free tier: 6 active versions |
| **Cloud Monitoring** | Metrics, uptime, alerts | Free tier included |
| **Cloud Logging** | Centralized logs | First 50GB/month free |
| **Cloud Build** | Container builds | Free tier: 120 build-minutes/day |
| **Firebase Hosting** | Web app hosting | Free tier: 10GB storage, 360MB/day transfer |
| **Firebase Auth** | User authentication | Free tier: 50K MAU |

### 2.2 Resource Estimates (Month 6 — 10K Users)

| Resource | Estimated Usage | Monthly Cost |
|----------|----------------|-------------|
| Firestore reads | 5M | ~$3 |
| Firestore writes | 1M | ~$2 |
| Cloud Storage | 50GB | ~$1 |
| Cloud Functions | 500K invocations | Free |
| Cloud Run | 100K requests | ~$10 |
| Cloud CDN | 200GB transfer | ~$16 |
| AI APIs | See Financial Model | ~$2,200 |
| **Total** | | **~$2,232/month** |

---

## 3. API Keys & Credentials

### 3.1 Required API Keys

| Key | Service | Storage Location | Rotation |
|-----|---------|-----------------|----------|
| Vertex AI Service Account | Gemini, Veo, Imagen, Lyria | Secret Manager | 90-day rotation |
| Firebase Admin SDK | Firestore, Auth, Storage | Secret Manager | On credential compromise |
| Firebase Web Config | Client-side Firebase init | Environment variables | N/A (public) |
| Stripe Secret Key | Payment processing | Secret Manager | 90-day rotation |
| Stripe Publishable Key | Client-side Stripe | Environment variables | N/A (public) |
| Sentry DSN | Error reporting | Environment variables | N/A |

### 3.2 Environment Variables

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Cloud
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=  # Path to service account JSON

# Vertex AI
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-3.1-pro
GEMINI_FLASH_MODEL=gemini-3-flash
IMAGEN_MODEL=imagen-3-fast  # Nano Banana
VEO_MODEL=veo-3-fast
LYRIA_MODEL=lyria-2

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App Config
NEXT_PUBLIC_APP_URL=https://thelivingmuse.app
FREE_MONTHLY_LIMIT=3
PRO_MONTHLY_LIMIT=15
MAX_RETRY_ATTEMPTS=3
```

---

## 4. Cross-Platform Build Requirements

### 4.1 Web (Next.js PWA)

| Requirement | Specification |
|-------------|--------------|
| Framework | Next.js 15 (App Router) |
| Hosting | Vercel or Firebase Hosting |
| PWA | Service Worker for offline Gallery |
| Browser Support | Chrome 90+, Safari 16+, Firefox 100+, Edge 90+ |
| Mobile Browser | Chrome Mobile, Safari iOS 16+ |
| Min Screen | 320px width (responsive) |

### 4.2 iOS

| Requirement | Specification |
|-------------|--------------|
| Framework | React Native + Expo SDK 52+ |
| Min iOS | 16.0+ |
| Build System | EAS Build (Expo Application Services) |
| Distribution | Apple App Store |
| In-App Purchase | StoreKit 2 (via `expo-in-app-purchases`) |
| Push Notifications | APNs via Firebase Cloud Messaging |
| Camera | `expo-camera` |
| File System | `expo-file-system` |

### 4.3 Android

| Requirement | Specification |
|-------------|--------------|
| Framework | React Native + Expo SDK 52+ |
| Min Android | API 24 (Android 7.0) |
| Target Android | API 34 (Android 14) |
| Build System | EAS Build |
| Distribution | Google Play Store |
| In-App Purchase | Google Play Billing (via `expo-in-app-purchases`) |
| Push Notifications | FCM (Firebase Cloud Messaging) |
| Camera | `expo-camera` |

---

## 5. Performance Budgets

### 5.1 Web Performance

| Metric | Budget | Tool |
|--------|--------|------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Total Bundle Size (initial) | < 200KB (gzip) | webpack-bundle-analyzer |
| Lighthouse Performance Score | > 90 | Lighthouse |

### 5.2 Mobile Performance

| Metric | Budget | Tool |
|--------|--------|------|
| App Launch | < 2s | Expo Profiler |
| Screen Transition | < 300ms | React Navigation metrics |
| Memory Usage | < 150MB | Xcode Instruments / Android Profiler |
| Battery Impact | Minimal (no background AI) | Platform tools |

### 5.3 API Latency

| Endpoint | Budget (P95) |
|----------|-------------|
| Auth operations | < 500ms |
| Gallery list | < 1s |
| Avatar generation | < 8s |
| Poem generation | < 3s |
| Video generation | < 45s (async) |
| Music generation | < 15s (async) |
| Export | < 5s |

---

## 6. Security & Compliance

### 6.1 Security Requirements

| Area | Requirement |
|------|-------------|
| Transport | TLS 1.3 for all connections |
| Auth tokens | Firebase ID tokens (1-hour expiry, auto-refresh) |
| API rate limiting | 60 requests/minute per user |
| File uploads | Max 10MB per photo; validated MIME type |
| Media URLs | Signed URLs with 1-hour expiry |
| Secrets | Never in client code; Secret Manager only |
| CORS | Restricted to app domains only |

### 6.2 Compliance

| Regulation | Status | Implementation |
|------------|--------|----------------|
| GDPR | Required | Data export/delete endpoints; privacy policy; consent flow |
| CCPA | Required | "Do Not Sell" option; data deletion on request |
| COPPA | Required | Age gate (13+) during signup |
| AI Transparency | Recommended | Watermark AI content; disclose AI generation |
| App Store Guidelines | Required | Follow Apple/Google content policies |
| PCI DSS | Via Stripe | Stripe handles all card data; no card storage |

---

## 7. Monitoring & Alerting

### 7.1 Monitoring Stack

| Tool | Covers | Alert Channel |
|------|--------|---------------|
| Google Cloud Monitoring | Infra, uptime, latency | Email + Slack |
| Cloud Logging | Application logs | Cloud Alerting |
| Sentry | Frontend/mobile errors | Email + Slack |
| Custom Firestore metrics | Business metrics (cost/user) | Dashboard |
| Firebase Performance | Mobile app performance | Firebase Console |
| Budget Alerts | GCP spending | Email |

### 7.2 Alert Thresholds

| Alert | Condition | Severity |
|-------|-----------|----------|
| API error rate > 5% | 5-minute window | Critical |
| P95 latency > 15s | Rolling 15-minute | Warning |
| Monthly GCP spend > 80% budget | Monthly | Warning |
| Monthly GCP spend > 100% budget | Monthly | Critical |
| Firestore daily ops > 80% free tier | Daily | Warning |
| Storage > 100GB | — | Info |
| Auth failures > 100/hour | Hourly | Warning |
