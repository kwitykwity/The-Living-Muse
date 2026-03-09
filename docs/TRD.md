# 🔧 The Living Muse — Technical Requirements Document (TRD)

**Version:** 1.0
**Date:** March 8, 2026
**Team:** Jessenia Cintron, Carolina Cruz, Christina Ruiz

---

## 1. System Overview

The Living Muse is a multi-modal AI creative platform built on Google Cloud / Vertex AI. It processes user photos through a sequential AI pipeline (image stylization → poetry generation → video performance → music generation) and serves the results through a cross-platform application (Web, iOS, Android).

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ Web PWA  │  │ iOS (Expo)   │  │ Android (Expo)            │  │
│  │ Next.js  │  │ React Native │  │ React Native              │  │
│  └────┬─────┘  └──────┬───────┘  └─────────────┬─────────────┘  │
│       └───────────────┼─────────────────────────┘               │
│                       │ HTTPS / WebSocket                       │
├───────────────────────┼─────────────────────────────────────────┤
│                  API GATEWAY                                     │
│  ┌────────────────────┴──────────────────────────────────────┐  │
│  │           Firebase Cloud Functions / Cloud Run            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐  │  │
│  │  │ Auth API │ │ Muse API │ │Poem API │ │ Export API   │  │  │
│  │  └──────────┘ └──────────┘ └─────────┘ └──────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                  AI ORCHESTRATION LAYER                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 AI Service Adapter                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐   │  │
│  │  │ Gemini   │ │ Nano     │ │ Veo 3  │ │ Lyria 3      │   │  │
│  │  │ 3.1 Pro  │ │ Banana   │ │        │ │              │   │  │
│  │  └──────────┘ └──────────┘ └────────┘ └──────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                  DATA LAYER                                      │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────────┐  │
│  │ Firestore    │ │ Cloud Storage  │ │ Firebase Auth         │  │
│  │ (NoSQL DB)   │ │ (Media Files)  │ │ (Google/Apple/Email)  │  │
│  └──────────────┘ └────────────────┘ └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Web App** | Next.js (React) | 15.x | SSR for SEO, App Router, Vercel-ready |
| **Mobile Apps** | React Native + Expo | SDK 52+ | Cross-platform iOS/Android from shared codebase |
| **Styling** | Vanilla CSS + CSS Modules | — | Maximum control, no framework lock-in |
| **State Management** | Zustand | 5.x | Lightweight, minimal boilerplate |
| **Real-time** | Firebase SDK | 11.x | WebSocket for Conversational Verse |

### 2.2 Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **API Layer** | Firebase Cloud Functions (Gen 2) or Cloud Run | Serverless, auto-scaling, Python or Node.js |
| **Auth** | Firebase Authentication | Google, Apple, Email sign-in; built-in session management |
| **Database** | Cloud Firestore | Real-time sync, offline support, hierarchical data |
| **File Storage** | Cloud Storage for Firebase | Avatar images, videos, audio; signed URLs |
| **Task Queue** | Cloud Tasks | Async video/music generation processing |
| **CDN** | Firebase Hosting + Cloud CDN | Fast global delivery of static assets |

### 2.3 AI / ML

| Model | Provider | API | Use Case |
|-------|----------|-----|----------|
| **Gemini 3.1 Pro** | Google / Vertex AI | Gemini API | Poetry generation, sentiment analysis, conversation |
| **Gemini 3 Flash** | Google / Vertex AI | Gemini API | Draft poems, cost-optimized previews |
| **Nano Banana** (Gemini 3 Pro Image) | Google / Vertex AI | Imagen API | Photo → Orchid Muse avatar stylization |
| **Veo 3 / 3 Fast** | Google / Vertex AI | Veo API | Avatar lip-sync performance video |
| **Lyria 2/3** | Google / Vertex AI | Lyria API | Mood-matched background music |

### 2.4 Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Cloud Provider** | Google Cloud Platform | Single vendor for AI + infra; startup credits |
| **CI/CD** | GitHub Actions | Free for public repos; integrated with GCP |
| **Monitoring** | Google Cloud Monitoring + Sentry | Performance, errors, cost tracking |
| **Logging** | Cloud Logging (Stackdriver) | Centralized, searchable, real-time |
| **Secrets** | Secret Manager | API keys, service account credentials |
| **DNS** | Cloud DNS or Cloudflare | Fast resolution, DDoS protection |

---

## 3. Data Architecture (Firestore Schema)

### 3.1 Collection Structure

```
firestore/
├── users/{uid}                        # Top-level collection
│   ├── name: string
│   ├── email: string
│   ├── isPro: boolean                 # Default: true for Gemini Pro users
│   ├── favoriteColor: string          # Default: 'purple'
│   ├── vibePreset: string             # e.g., 'Harlem Soul', 'K-Dreamer'
│   ├── subscriptionTier: string       # 'free' | 'pro' | 'none'
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   │
│   ├── muses/{museID}                 # Sub-collection
│   │   ├── museID: string
│   │   ├── basePhotoURL: string       # Firebase Storage URL
│   │   ├── styleType: string          # e.g., 'Orchid Surrealism'
│   │   ├── voiceID: string            # Gemini Live voice preset
│   │   ├── createdAt: timestamp
│   │   │
│   │   └── poems/{poemID}             # Sub-collection of muses
│   │       ├── poemID: string
│   │       ├── textContent: string    # The 4-line generated verse
│   │       ├── audioURL: string       # Lyria 3 output URL
│   │       ├── videoURL: string       # Veo 3 output URL
│   │       ├── sentiment: string      # Captured from user conversation
│   │       ├── sentimentScore: number # -1.0 to 1.0
│   │       ├── isPublished: boolean
│   │       ├── timestamp: timestamp
│   │       └── metadata: map
│   │           ├── generationModel: string
│   │           ├── promptTokens: number
│   │           └── outputTokens: number
│   │
│   └── collections/{collectionID}     # Sub-collection
│       ├── title: string
│       ├── theme: string
│       ├── poemRefs: array<reference>  # References to poem documents
│       ├── coverImageURL: string
│       ├── createdAt: timestamp
│       └── isLivingBook: boolean
```

### 3.2 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // Muses — user-scoped
      match /muses/{museID} {
        allow read, write: if request.auth != null && request.auth.uid == uid;

        // Poems — user-scoped through muse
        match /poems/{poemID} {
          allow read, write: if request.auth != null && request.auth.uid == uid;
        }
      }

      // Collections — user-scoped
      match /collections/{collectionID} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3.3 Firestore Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "poems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "poems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sentiment", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "muses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "collections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 4. API Design

### 4.1 Backend API Endpoints

#### Auth & User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user profile after Firebase Auth signup |
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update user profile (vibe, color, etc.) |
| POST | `/api/users/me/upgrade` | Upgrade to Pro tier |

#### Muse (Avatar)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/muses` | Upload photo → generate Orchid Muse avatar |
| GET | `/api/muses` | List all user's muses |
| GET | `/api/muses/:museID` | Get specific muse details |
| DELETE | `/api/muses/:museID` | Delete muse and associated poems |

#### Poem
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/muses/:museID/poems` | Generate poem from muse's photo context |
| GET | `/api/muses/:museID/poems` | List poems for a muse |
| PATCH | `/api/muses/:museID/poems/:poemID` | Edit poem text |
| POST | `/api/muses/:museID/poems/:poemID/regenerate` | Regenerate poem |
| DELETE | `/api/muses/:museID/poems/:poemID` | Delete poem |

#### Performance (Pro)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/poems/:poemID/perform` | Generate lip-sync video + music |
| GET | `/api/poems/:poemID/performance` | Get performance status/URLs |

#### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/poems/:poemID/export` | Export as video (SD free / 4K Pro) |
| GET | `/api/exports/:exportID` | Get export status/download URL |

#### Collections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collections` | Create collection |
| GET | `/api/collections` | List user's collections |
| PATCH | `/api/collections/:id` | Update collection (add/remove poems) |
| POST | `/api/collections/:id/living-book` | Generate Living Book export |

#### Conversational Verse (Pro — WebSocket)
| Method | Endpoint | Description |
|--------|----------|-------------|
| WS | `/ws/conversation` | Real-time conversational poetry session |

### 4.2 AI Orchestration Pipeline

```
┌─────────┐    ┌──────────────┐    ┌────────────────┐    ┌─────────────┐
│  Photo  │───▶│ Nano Banana  │───▶│  Gemini 3.1    │───▶│   Veo 3     │
│ Upload  │    │ Avatar Gen   │    │  Poem Gen +    │    │  Lip-Sync   │
│         │    │              │    │  Sentiment     │    │  Video      │
└─────────┘    └──────────────┘    └────────────────┘    └──────┬──────┘
                                                                │
                                          ┌─────────────┐       │
                                          │  Lyria 3    │◀──────┘
                                          │  Music Gen  │ (parallel or sequential)
                                          └──────┬──────┘
                                                 │
                                          ┌──────┴──────┐
                                          │   Compose   │
                                          │ Final Video │
                                          │ + Audio     │
                                          └─────────────┘
```

---

## 5. Cross-Platform Strategy

### 5.1 Platform Matrix

| Feature | Web (PWA) | iOS | Android |
|---------|-----------|-----|---------|
| Photo upload | ✅ | ✅ | ✅ |
| Camera capture | ✅ (WebRTC) | ✅ (native) | ✅ (native) |
| Avatar generation | ✅ | ✅ | ✅ |
| Poem generation | ✅ | ✅ | ✅ |
| Gallery | ✅ | ✅ | ✅ |
| Video playback | ✅ | ✅ | ✅ |
| Offline gallery | ✅ (SW) | ✅ | ✅ |
| Conversational Verse | ✅ (WebSocket) | ✅ | ✅ |
| Push notifications | ✅ (Web Push) | ✅ (APNs) | ✅ (FCM) |
| In-app purchase | N/A | ✅ (StoreKit) | ✅ (Google Play) |
| Web payments | ✅ (Stripe) | N/A | N/A |

### 5.2 Code Sharing Strategy

```
monorepo/
├── apps/
│   ├── web/          # Next.js 15 PWA
│   └── mobile/       # React Native + Expo (iOS + Android)
├── packages/
│   ├── shared/       # Shared types, utils, constants
│   ├── api-client/   # API client (fetch-based, platform-agnostic)
│   └── ai-types/     # AI response types and interfaces
├── firebase/
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── functions/    # Cloud Functions (Node.js)
└── docs/             # This documentation
```

---

## 6. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Image-to-poem (P95)** | < 10 seconds | Cloud Monitoring latency |
| **Avatar generation (P95)** | < 8 seconds | Nano Banana API response |
| **Poem generation (P95)** | < 3 seconds | Gemini API response |
| **Video generation (P95)** | < 45 seconds | Veo 3 API response (async) |
| **Music generation (P95)** | < 15 seconds | Lyria API response |
| **Page load (FCP)** | < 1.5 seconds | Lighthouse |
| **TTI (web)** | < 3 seconds | Lighthouse |
| **App startup (mobile)** | < 2 seconds | Expo profiler |
| **Offline gallery load** | < 500ms | Local Firestore cache |

---

## 7. Security Requirements

| Area | Requirement | Implementation |
|------|-------------|----------------|
| **Authentication** | Multi-provider auth | Firebase Auth (Google, Apple, Email/Password) |
| **Authorization** | User-level data isolation | Firestore security rules (uid-scoped) |
| **API Security** | Rate limiting, API key protection | Cloud Armor + Secret Manager |
| **Data Encryption** | At rest and in transit | GCP default encryption + HTTPS/TLS 1.3 |
| **Media Security** | Signed URLs for generated content | Cloud Storage signed URLs (1-hour expiry) |
| **Content Safety** | AI-generated content filtering | Vertex AI safety filters + custom blocklist |
| **Privacy** | GDPR/CCPA compliance | User data export/delete endpoints; no training on user data |
| **Secrets** | API keys never in client code | Secret Manager + environment variables |

---

## 8. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Google Cloud Monitoring** | Infrastructure metrics, uptime checks |
| **Cloud Logging** | Centralized application logs |
| **Sentry** | Frontend/mobile error tracking |
| **Custom Firestore metrics** | API cost per user, creations per day |
| **Cloud Trace** | Distributed tracing for AI pipeline latency |
| **Budget Alerts** | GCP budget notifications at 50/80/100% |
