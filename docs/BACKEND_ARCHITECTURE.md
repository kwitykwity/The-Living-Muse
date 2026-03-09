# 🔧 The Living Muse — Backend Architecture & Implementation Guide

> **Author perspective:** Principal Backend Engineer + Firebase Systems Architect
> **Stack:** Next.js + TypeScript + Firebase + Vertex AI
> **Audience:** Hackathon team implementing the backend, Loveable code generation

---

## SECTION 1 — BACKEND ARCHITECTURE

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS CLIENT (SSR + CSR)                    │
│  ┌───────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ Firebase Auth  │  │ Firestore   │  │ Storage (direct upload)  │  │
│  │ (client SDK)   │  │ (listeners) │  │ (resumable uploads)      │  │
│  └───────┬────────┘  └──────┬──────┘  └────────────┬─────────────┘  │
└──────────┼──────────────────┼──────────────────────┼────────────────┘
           │                  │                      │
           ▼                  ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FIREBASE CLOUD FUNCTIONS (Gen 2)                   │
│                                                                      │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────┐ │
│  │ HTTPS/Callable│  │ Firestore        │  │ Storage Triggers       │ │
│  │ Functions      │  │ Triggers         │  │ (on upload finalize)   │ │
│  │               │  │ (onCreate, etc.) │  │                        │ │
│  └──────┬────────┘  └────────┬─────────┘  └───────────┬────────────┘ │
│         │                    │                        │              │
│  ┌──────┴────────────────────┴────────────────────────┴────────────┐ │
│  │                    SERVICE LAYER                                 │ │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ AI       │ │ Credit    │ │ Living   │ │ Export           │  │ │
│  │  │ Orchestr.│ │ Service   │ │ Page Svc │ │ Pipeline         │  │ │
│  │  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                  AI ADAPTER LAYER                                │ │
│  │  ┌────────┐ ┌───────────┐ ┌────────┐ ┌───────┐ ┌────────────┐ │ │
│  │  │Gemini  │ │Nano Banana│ │ Veo 3  │ │Lyria 3│ │ Fallbacks  │ │ │
│  │  │3.1 Pro │ │(Imagen)   │ │        │ │       │ │            │ │ │
│  │  └────────┘ └───────────┘ └────────┘ └───────┘ └────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
           │                  │                      │
           ▼                  ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │ Firestore    │  │ Cloud Storage  │  │ Secret Manager           │ │
│  │ (all data)   │  │ (all media)    │  │ (API keys, creds)        │ │
│  └──────────────┘  └────────────────┘  └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Auth Flow
1. Client calls `signInWithPopup` (Google) or `createUserWithEmailAndPassword`
2. Firebase Auth issues ID token
3. `onAuthStateChanged` → client writes to Firestore `users/{uid}` via callable `createUserProfile`
4. All subsequent requests pass ID token → Cloud Functions verify via `auth` context
5. No custom JWT; Firebase-native throughout

### Logging & Observability
- **Cloud Functions logs** → Cloud Logging (automatic)
- **Structured logging** via `functions.logger` with severity levels
- **Cost tracking** → write `usage_events` to Firestore on every AI call
- **Error tracking** → Sentry SDK in Cloud Functions
- **Budget alerts** → GCP budget notifications at 50/80/100%

---

## SECTION 2 — FIRESTORE DATA MODEL

### Design Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Top-level vs subcollections | **Top-level for all major entities** | Simpler queries, collection group queries, easier admin access |
| Document references | **Store `uid` as field, not subcollection path** | Enables cross-collection queries, simpler security rules |
| Denormalization | **Selective** — store `userName` on living pages and exports | Avoid N+1 reads for gallery views |
| IDs | **Auto-generated** for most; `uid` for users | Firestore native; no collision risk |

### Collection: `users`
```typescript
// Purpose: User profile, preferences, and subscription status
// UPDATED: Credit-based system (March 8, 2026)
interface UserDoc {
  // Required
  uid: string;                    // Firebase Auth UID (document ID)
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Preferences
  favoriteColor: string;          // Default: 'purple'
  vibePreset: string;             // 'harlem_soul' | 'k_dreamer' | 'orchid_noir' | 'cosmic_bloom'
  onboardingComplete: boolean;    // Default: false

  // Subscription (server-managed — NOT writable by client)
  subscriptionTier: 'free' | 'starter' | 'pro' | 'studio';
  subscriptionStartDate?: Timestamp;
  subscriptionEndDate?: Timestamp;
  stripeCustomerId?: string;

  // Credits (server-managed)
  creditBalance: number;          // Monthly allocation remaining
  creditLimit: number;            // Monthly allocation cap for tier
  creditResetDate: Timestamp;     // When balance resets (1st of month)
  purchasedCredits: number;       // One-time pack credits (never expire)

  // Optional
  photoURL?: string;
  provider: 'google' | 'apple' | 'email';
}
```

**Example document:**
```json
{
  "uid": "abc123",
  "email": "jessenia@example.com",
  "displayName": "Jessenia Cintron",
  "favoriteColor": "purple",
  "vibePreset": "harlem_soul",
  "onboardingComplete": true,
  "subscriptionTier": "starter",
  "creditBalance": 42,
  "creditLimit": 75,
  "creditResetDate": "2026-04-01T00:00:00Z",
  "purchasedCredits": 50,
  "createdAt": "2026-03-08T12:00:00Z",
  "updatedAt": "2026-03-08T14:00:00Z",
  "provider": "google"
}
```

### Collection: `subscriptions`
```typescript
// Purpose: Subscription lifecycle tracking (server-only writes)
interface SubscriptionDoc {
  id: string;                     // Auto-generated
  uid: string;                    // Owner
  tier: 'starter' | 'pro' | 'studio';
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  provider: 'stripe' | 'apple' | 'google';
  providerSubscriptionId: string;
  priceId: string;
  amount: number;                 // In cents
  currency: string;               // 'usd'
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  canceledAt?: Timestamp;
  createdAt: Timestamp;
}
```

### Collection: `muses`
```typescript
// Purpose: Stylized avatar generated from user photo
interface MuseDoc {
  id: string;                     // Auto-generated
  uid: string;                    // Owner
  originalPhotoURL: string;       // Storage path to uploaded photo
  avatarURL: string;              // Storage path to generated avatar
  thumbnailURL: string;           // Storage path to thumbnail
  styleType: string;              // e.g., 'orchid_surrealism'
  vibePreset: string;             // Inherited from user at creation time
  colorPalette: string;           // Inherited from user.favoriteColor
  voiceID: string;                // Gemini Live voice preset
  status: 'processing' | 'ready' | 'failed';
  error?: string;
  createdAt: Timestamp;
}
```

### Collection: `poems`
```typescript
// Purpose: AI-generated poem text + metadata
interface PoemDoc {
  id: string;
  uid: string;
  museId: string;                 // Associated muse
  livingPageId?: string;          // If part of a living page
  textContent: string;            // The poem text
  promptUsed: string;             // What triggered the poem
  sentiment: string;              // 'melancholic' | 'joyful' | 'fierce' | 'reflective'
  sentimentScore: number;         // -1.0 to 1.0
  poemType: string;               // 'haiku' | 'free_verse' | 'quatrain' | 'couplet'
  generationModel: string;        // 'gemini-3.1-pro' | 'gemini-3-flash'
  tokensUsed: number;
  version: number;                // Increments on regenerate
  isEdited: boolean;              // User manually edited
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `media_assets`
```typescript
// Purpose: Track all generated media (audio, video, images)
interface MediaAssetDoc {
  id: string;
  uid: string;
  livingPageId?: string;
  poemId?: string;
  museId?: string;
  type: 'audio' | 'video' | 'avatar' | 'thumbnail' | 'export';
  storageURL: string;             // gs:// path
  downloadURL?: string;           // HTTPS signed URL (cached, expires)
  mimeType: string;               // 'audio/mp3', 'video/mp4', etc.
  sizeBytes: number;
  durationSeconds?: number;       // For audio/video
  resolution?: string;            // '1024x1024', '4096x4096'
  generationModel?: string;       // 'veo-3', 'lyria-2'
  status: 'processing' | 'ready' | 'failed';
  error?: string;
  createdAt: Timestamp;
}
```

### Collection: `living_pages`
```typescript
// Purpose: The core composed artifact — avatar + poem + audio + video
interface LivingPageDoc {
  id: string;
  uid: string;
  userName: string;               // Denormalized for gallery
  museId: string;
  poemId: string;
  audioAssetId?: string;
  videoAssetId?: string;
  title: string;                  // Auto-generated or user-set
  avatarURL: string;              // Denormalized from muse
  thumbnailURL: string;           // Denormalized
  poemPreview: string;            // First line of poem (denormalized)
  sentiment: string;              // Denormalized from poem
  vibePreset: string;
  status: 'draft' | 'ready' | 'performing' | 'complete';
  isPublic: boolean;              // Default: false
  isFavorite: boolean;            // Default: false
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `collections`
```typescript
// Purpose: User-curated groups of Living Pages
interface CollectionDoc {
  id: string;
  uid: string;
  title: string;
  description?: string;
  theme?: string;
  coverImageURL?: string;
  livingPageIds: string[];        // Ordered array of living page IDs
  livingPageCount: number;        // Denormalized count
  isLivingBook: boolean;          // Upgraded to book format
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `exports`
```typescript
// Purpose: Track export/render jobs
interface ExportDoc {
  id: string;
  uid: string;
  livingPageId: string;
  type: 'video_sd' | 'video_4k' | 'image' | 'living_book_pdf';
  status: 'queued' | 'processing' | 'ready' | 'failed' | 'expired';
  storageURL?: string;
  downloadURL?: string;
  resolution: string;
  watermarked: boolean;
  expiresAt: Timestamp;           // Signed URL expiry
  error?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

### Collection: `usage_events`
```typescript
// Purpose: Audit trail for every AI API call (cost tracking + analytics)
interface UsageEventDoc {
  id: string;
  uid: string;
  action: 'avatar_gen' | 'poem_gen' | 'audio_gen' | 'video_gen' | 'export';
  model: string;                  // 'gemini-3.1-pro', 'veo-3-fast', etc.
  tokensInput?: number;
  tokensOutput?: number;
  durationSeconds?: number;
  estimatedCostUSD: number;       // Server-calculated
  creditsCharged: number;         // Credits deducted for this operation
  success: boolean;
  error?: string;
  metadata?: Record<string, any>; // Model-specific data
  createdAt: Timestamp;
}
```

### Collection: `credit_transactions`
```typescript
// Purpose: Audit trail for every credit debit/credit/refund
interface CreditTransactionDoc {
  id: string;
  uid: string;
  type: 'debit' | 'credit' | 'refund' | 'reset' | 'purchase' | 'upgrade';
  amount: number;                 // Positive = added, negative = deducted
  action?: string;                // 'poem' | 'avatar' | 'video_draft' etc.
  qualityTier?: string;           // Video/audio quality tier
  balanceAfter: number;           // Running total for audit trail
  metadata?: Record<string, any>;
  createdAt: Timestamp;
}
```

### Collection: `feature_flags`
```typescript
// Purpose: Runtime feature toggles (admin-managed)
interface FeatureFlagDoc {
  id: string;                     // e.g., 'conversational_verse'
  enabled: boolean;
  enabledForPro: boolean;
  enabledForUsers: string[];      // Specific UIDs for beta testing
  rolloutPercent: number;         // 0-100
  description: string;
  updatedAt: Timestamp;
  updatedBy: string;              // Admin UID
}
```

### Collection: `prompts_or_sessions`
```typescript
// Purpose: Conversational Verse session state
interface SessionDoc {
  id: string;
  uid: string;
  museId: string;
  type: 'conversational' | 'single';
  turns: ConversationTurn[];
  currentSentiment: string;
  turnCount: number;
  maxTurns: number;               // Enforced by tier
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ConversationTurn {
  role: 'user' | 'muse';
  content: string;
  sentiment?: string;
  timestamp: Timestamp;
}
```

---

## SECTION 3 — STORAGE STRUCTURE

```
gs://living-muse-media/
│
├── uploads/                          # ① Original user photos
│   └── {uid}/
│       └── {museId}_original.{ext}   # Naming: museId for traceability
│
├── avatars/                          # ② Processed Muse avatars
│   └── {uid}/
│       ├── {museId}_avatar.png       # Full resolution
│       └── {museId}_thumb.webp       # 200x200 thumbnail (auto-generated)
│
├── audio/                            # ③ Generated poem audio
│   └── {uid}/
│       └── {poemId}_audio.mp3        # Lyria output
│
├── video/                            # ④ Generated performance video
│   └── {uid}/
│       └── {livingPageId}_perf.mp4   # Veo 3 output
│
├── thumbnails/                       # ⑤ Gallery thumbnails
│   └── {uid}/
│       └── {livingPageId}_thumb.webp # Auto-generated for gallery cards
│
├── temp/                             # ⑥ Temporary render assets
│   └── {uid}/
│       └── {jobId}_*.{ext}           # Intermediate files (auto-deleted after 24h)
│
└── exports/                          # ⑦ Final export files
    └── {uid}/
        └── {exportId}_final.{ext}    # mp4, png, pdf — expires after 7 days
```

### Lifecycle Rules
| Path | Retention | Auto-delete |
|------|-----------|-------------|
| `uploads/` | Permanent | No (user's original) |
| `avatars/` | Permanent | Only on user account deletion |
| `audio/` | Permanent | Only on living page deletion |
| `video/` | Permanent | Only on living page deletion |
| `thumbnails/` | Permanent | Regenerate on demand |
| `temp/` | 24 hours | Yes — Cloud Storage lifecycle rule |
| `exports/` | 7 days | Yes — signed URL expiry + lifecycle rule |

### Naming Convention
- All files: `{entityId}_{purpose}.{extension}`
- No spaces, no special characters
- Lowercase only
- Use `_` as separator, never `-` (to avoid URL encoding issues)

---

## SECTION 4 — SECURITY RULES

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper Functions ──
    function isAuth() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    function isAdmin() {
      return isAuth() && request.auth.token.admin == true;
    }

    // Prevent client from writing server-managed fields
    function notChangingServerFields() {
      return !request.resource.data.diff(resource.data).affectedKeys()
        .hasAny(['subscriptionTier', 'creditBalance',
                  'creditLimit', 'creditResetDate', 'purchasedCredits',
                  'stripeCustomerId', 'subscriptionStartDate',
                  'subscriptionEndDate']);
    }

    // ── users ──
    match /users/{uid} {
      allow read: if isOwner(uid);
      allow create: if isOwner(uid);
      allow update: if isOwner(uid) && notChangingServerFields();
      allow delete: if false; // Account deletion via Cloud Function only
    }

    // ── subscriptions (server-only writes) ──
    match /subscriptions/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow write: if false; // Server-only via admin SDK
    }

    // ── muses ──
    match /muses/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow create: if false; // Created via Cloud Function only
      allow update: if false; // Updated via Cloud Function only
      allow delete: if isAuth() && resource.data.uid == request.auth.uid;
    }

    // ── poems ──
    match /poems/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow create: if false; // Created via Cloud Function only
      allow update: if isAuth() && resource.data.uid == request.auth.uid
                    && !request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['uid', 'generationModel', 'tokensUsed']);
      allow delete: if isAuth() && resource.data.uid == request.auth.uid;
    }

    // ── media_assets (server-only writes) ──
    match /media_assets/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow write: if false; // Server-only
    }

    // ── living_pages ──
    match /living_pages/{docId} {
      // Public pages readable by anyone; private by owner only
      allow read: if resource.data.isPublic == true
                  || (isAuth() && resource.data.uid == request.auth.uid);
      allow create: if false; // Created via Cloud Function
      allow update: if isAuth() && resource.data.uid == request.auth.uid
                    && !request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['uid', 'museId', 'poemId']);
      allow delete: if isAuth() && resource.data.uid == request.auth.uid;
    }

    // ── collections ──
    match /collections/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow create: if isAuth() && request.resource.data.uid == request.auth.uid;
      allow update: if isAuth() && resource.data.uid == request.auth.uid;
      allow delete: if isAuth() && resource.data.uid == request.auth.uid;
    }

    // ── exports ──
    match /exports/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow write: if false; // Server-only
    }

    // ── usage_events (server-only) ──
    match /usage_events/{docId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    // ── feature_flags (admin-only write, everyone read) ──
    match /feature_flags/{docId} {
      allow read: if isAuth();
      allow write: if isAdmin();
    }

    // ── prompts_or_sessions ──
    match /prompts_or_sessions/{docId} {
      allow read: if isAuth() && resource.data.uid == request.auth.uid;
      allow write: if false; // Server-only (WebSocket/Cloud Function managed)
    }

    // ── Deny everything else ──
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ── Helper ──
    function isAuth() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    // Max upload size: 10MB for photos
    function isValidImage() {
      return request.resource.size < 10 * 1024 * 1024
          && request.resource.contentType.matches('image/.*');
    }

    // ── Uploads (user-writable) ──
    match /uploads/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if isOwner(uid) && isValidImage();
    }

    // ── All generated assets (server-only write, owner read) ──
    match /avatars/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false; // Cloud Function writes via admin SDK
    }

    match /audio/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    match /video/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    match /thumbnails/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    match /temp/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    match /exports/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow write: if false;
    }
  }
}
```

---

## SECTION 5 — INDEXING STRATEGY

### `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "living_pages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "living_pages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "vibePreset", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "living_pages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "sentiment", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "living_pages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "isFavorite", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "living_pages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isPublic", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "poems",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "muses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usage_events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "usage_events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "collections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Query Patterns These Indexes Support
| Query | Index Used |
|-------|-----------|
| Gallery: my pages, newest first | `living_pages: uid ASC, createdAt DESC` |
| Gallery filtered by vibe | `living_pages: uid ASC, vibePreset ASC, createdAt DESC` |
| Gallery filtered by mood | `living_pages: uid ASC, sentiment ASC, createdAt DESC` |
| My favorites | `living_pages: uid ASC, isFavorite ASC, createdAt DESC` |
| Public gallery (explore) | `living_pages: isPublic ASC, createdAt DESC` |
| My poems | `poems: uid ASC, createdAt DESC` |
| My exports | `exports: uid ASC, createdAt DESC` |
| Admin: usage by action | `usage_events: action ASC, createdAt DESC` |
| Admin: usage by user | `usage_events: uid ASC, createdAt DESC` |

---

## SECTION 6 — CLOUD FUNCTIONS / API LAYER

### Function Map

#### `createUserProfile`
| Field | Value |
|-------|-------|
| **Purpose** | Create user doc in Firestore after Firebase Auth signup |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required — uses `context.auth.uid` |
| **Timing** | Synchronous |
| **Request** | `{ displayName, favoriteColor?, vibePreset? }` |
| **Response** | `{ success: true, userId: string }` |
| **Validation** | displayName required, max 100 chars; favoriteColor from allowed list |
| **Errors** | `already-exists`, `unauthenticated` |
| **MVP?** | ✅ Yes |

#### `createMuseFromPhoto`
| Field | Value |
|-------|-------|
| **Purpose** | Upload photo → call Nano Banana → create Muse doc |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous (< 10s target) |
| **Request** | `{ photoStoragePath: string, styleType?: string }` |
| **Response** | `{ museId, avatarURL, thumbnailURL, status }` |
| **Validation** | Photo must exist in `uploads/{uid}/`; quota check |
| **Errors** | `quota-exceeded`, `invalid-argument`, `ai-service-error` |
| **MVP?** | ✅ Yes |

#### `generatePoem`
| Field | Value |
|-------|-------|
| **Purpose** | Generate poem from muse context + prompt/emotion |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous (< 3s) |
| **Request** | `{ museId, prompt?, emotion?, poemType? }` |
| **Response** | `{ poemId, textContent, sentiment, sentimentScore }` |
| **Validation** | museId must exist and belong to user; quota check |
| **Errors** | `quota-exceeded`, `not-found`, `ai-service-error` |
| **MVP?** | ✅ Yes |

#### `continueConversationalPoem`
| Field | Value |
|-------|-------|
| **Purpose** | Continue a live conversational verse session |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required + Pro tier |
| **Timing** | Synchronous (streaming via response) |
| **Request** | `{ sessionId, userUtterance }` |
| **Response** | `{ museResponse, sentiment, turnCount, isComplete }` |
| **Validation** | Session exists, belongs to user, within turn limits |
| **Errors** | `permission-denied` (free tier), `session-expired` |
| **MVP?** | ❌ Post-hackathon |

#### `synthesizePoemAudio`
| Field | Value |
|-------|-------|
| **Purpose** | Generate audio of poem via Lyria/TTS |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Background job (< 15s) |
| **Request** | `{ poemId, voiceId? }` |
| **Response** | `{ mediaAssetId, status: 'processing' }` |
| **Validation** | Poem exists, belongs to user |
| **Errors** | `not-found`, `ai-service-error` |
| **MVP?** | ✅ Yes (basic TTS fallback) |

#### `createLivingPage`
| Field | Value |
|-------|-------|
| **Purpose** | Compose muse + poem + audio into a Living Page |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous |
| **Request** | `{ museId, poemId, audioAssetId?, title? }` |
| **Response** | `{ livingPageId, status }` |
| **Validation** | All entities exist and belong to user; quota check + increment |
| **Errors** | `quota-exceeded`, `not-found`, `invalid-argument` |
| **MVP?** | ✅ Yes |

#### `renderPerformanceVideo`
| Field | Value |
|-------|-------|
| **Purpose** | Generate lip-sync video via Veo 3 |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required + Pro tier |
| **Timing** | Background job (30-60s) |
| **Request** | `{ livingPageId }` |
| **Response** | `{ exportId, status: 'queued' }` |
| **Validation** | Living page exists, user is Pro |
| **Errors** | `permission-denied`, `not-found`, `ai-service-error` |
| **MVP?** | ❌ Post-hackathon |

#### `createCollection`
| Field | Value |
|-------|-------|
| **Purpose** | Create a new collection |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous |
| **Request** | `{ title, description?, theme? }` |
| **Response** | `{ collectionId }` |
| **MVP?** | ❌ Post-hackathon |

#### `addLivingPageToCollection`
| Field | Value |
|-------|-------|
| **Purpose** | Add a living page to a collection |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous |
| **Request** | `{ collectionId, livingPageId }` |
| **Response** | `{ success: true }` |
| **MVP?** | ❌ Post-hackathon |

#### `exportLivingPage`
| Field | Value |
|-------|-------|
| **Purpose** | Generate exportable video/image |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Background job |
| **Request** | `{ livingPageId, format: 'video_sd' \| 'video_4k' \| 'image' }` |
| **Response** | `{ exportId, status: 'queued' }` |
| **MVP?** | ❌ Post-hackathon |

#### `trackUsageEvent`
| Field | Value |
|-------|-------|
| **Purpose** | Internal — called by other functions to log API usage |
| **Trigger** | Internal function call (not exposed) |
| **Auth** | N/A (server-to-server) |
| **MVP?** | ✅ Yes (simplified) |

#### `enforceQuota`
| Field | Value |
|-------|-------|
| **Purpose** | Check and enforce user creation limits |
| **Trigger** | Internal function call (not exposed) |
| **Auth** | N/A (server-to-server) |
| **MVP?** | ✅ Yes |

#### `getUserDashboard`
| Field | Value |
|-------|-------|
| **Purpose** | Return user profile + recent pages + quota status |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required |
| **Timing** | Synchronous |
| **Response** | `{ user, recentPages[], quotaRemaining, isPro }` |
| **MVP?** | ✅ Yes |

#### `deleteUserAssetSafely`
| Field | Value |
|-------|-------|
| **Purpose** | Delete a living page and all associated media |
| **Trigger** | `onCall` (callable) |
| **Auth** | Required — owner only |
| **Timing** | Background (cascading deletes) |
| **Request** | `{ livingPageId }` |
| **Response** | `{ success: true }` |
| **MVP?** | ❌ Post-hackathon (MVP: simple Firestore delete) |

---

## SECTION 7 — AI ORCHESTRATION PIPELINE

### Pipeline Flow

```
STEP 1: Photo → Avatar
┌─────────┐     ┌──────────────┐     ┌──────────┐
│ Upload  │────▶│ Nano Banana  │────▶│ Save to  │
│ Photo   │     │ (Imagen API) │     │ Storage  │
└─────────┘     └──────────────┘     └──────────┘
                  ↓ On failure
              ┌──────────────┐
              │ Retry ×2     │
              │ then Imagen  │
              │ 3 Fast       │
              └──────────────┘

STEP 2: Prompt/Emotion → Poem
┌───────────┐     ┌──────────────┐     ┌──────────┐
│ User      │────▶│ Gemini 3.1   │────▶│ Save to  │
│ Prompt    │     │ Pro          │     │ Firestore│
└───────────┘     └──────────────┘     └──────────┘
                    ↓ On failure
                ┌──────────────┐
                │ Gemini 3     │
                │ Flash        │
                └──────────────┘

STEP 3: Poem → Audio
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Poem     │────▶│ Lyria 2/3    │────▶│ Save to  │
│ Text     │     │              │     │ Storage  │
└──────────┘     └──────────────┘     └──────────┘
                   ↓ On failure
               ┌──────────────┐
               │ Google Cloud │
               │ TTS          │
               └──────────────┘

STEP 4: Avatar + Audio + Poem → Video (Pro only, async)
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Avatar + │────▶│ Veo 3 Fast   │────▶│ Save to  │
│ Audio    │     │              │     │ Storage  │
└──────────┘     └──────────────┘     └──────────┘
                   ↓ On failure
               ┌──────────────┐
               │ Veo 3 (no    │
               │ audio, retry)│
               └──────────────┘

STEP 5: Compose → Living Page
┌──────────────┐     ┌──────────────┐
│ All assets   │────▶│ Create       │
│ ready        │     │ living_page  │
│              │     │ document     │
└──────────────┘     └──────────────┘
```

### Retry & Fallback Strategy

| Step | Primary Model | Fallback | Retries | Timeout |
|------|---------------|----------|---------|---------|
| Avatar | Nano Banana (Gemini 3 Pro Image) | Imagen 3 Fast | 2 | 15s |
| Poem | Gemini 3.1 Pro | Gemini 3 Flash | 2 | 8s |
| Audio | Lyria 2/3 | Google Cloud TTS | 1 | 20s |
| Video | Veo 3 Fast + audio | Veo 3 Fast (no audio) | 1 | 60s |

### Idempotency
- Every AI call includes a client-generated `requestId`
- Before calling the API, check `usage_events` for existing `requestId`
- If found and successful, return cached result
- Prevents duplicate API charges on retries

### Job Status Tracking
- `media_assets.status`: `processing` → `ready` | `failed`
- `living_pages.status`: `draft` → `ready` → `performing` → `complete`
- Client polls via Firestore `onSnapshot` listener (real-time updates)

---

## SECTION 8 — QUOTA / SUBSCRIPTION LOGIC

### Tier Definitions
| Feature | Free | Pro ($9.99/mo) |
|---------|------|----------------|
| Monthly Living Pages | 3 | 15 |
| Avatar resolution | 1024px | 2048px |
| Poem model | Gemini 3 Flash | Gemini 3.1 Pro |
| Audio generation | ❌ | ✅ Lyria |
| Video performance | ❌ | ✅ Veo 3 Fast |
| Conversational mode | ❌ | ✅ |
| Export resolution | SD + watermark | 4K, no watermark |

### Quota Enforcement Flow
```
1. User calls createLivingPage()
2. Server reads users/{uid}
3. CHECK: quotaResetDate < now? → Reset counter to 0, set next reset date
4. CHECK: monthlyCreationsUsed < monthlyCreationsLimit?
   YES → Proceed, increment counter
   NO  → Return 'quota-exceeded' error
5. On success → increment monthlyCreationsUsed atomically
```

### Monthly Reset Logic
```typescript
// Called at the start of any quota-checked function
async function checkAndResetQuota(uid: string): Promise<UserQuota> {
  const userRef = db.collection('users').doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    const data = doc.data()!;
    const now = Timestamp.now();

    if (data.quotaResetDate.toDate() <= now.toDate()) {
      // Reset quota for new period
      const nextReset = getFirstOfNextMonth();
      tx.update(userRef, {
        monthlyCreationsUsed: 0,
        quotaResetDate: nextReset,
      });
      return { used: 0, limit: data.monthlyCreationsLimit };
    }

    return { used: data.monthlyCreationsUsed, limit: data.monthlyCreationsLimit };
  });
}
```

### Upgrade Gating
```typescript
function requirePro(user: UserDoc, feature: string): void {
  if (user.subscriptionTier !== 'pro') {
    throw new HttpsError(
      'permission-denied',
      `${feature} requires a Pro subscription. Upgrade at /upgrade`
    );
  }
}
```

---

## SECTION 9 — REPOSITORY / FILE STRUCTURE

```
the-living-muse/
├── README.md
├── docs/                              # All documentation (already created)
│   ├── PRD.md
│   ├── TRD.md
│   ├── ERD.md
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_PLAN.md
│   ├── MARKET_RESEARCH.md
│   ├── FINANCIAL_MODEL.md
│   ├── USER_FLOWS.md
│   ├── CONDITIONAL_LOGIC.md
│   ├── SYSTEM_REQUIREMENTS.md
│   ├── ROADMAP.md
│   └── wireframes/
│
├── firebase/                          # Firebase configuration
│   ├── firebase.json                  # Firebase project config
│   ├── .firebaserc                    # Project aliases
│   ├── firestore.rules                # Firestore security rules
│   ├── firestore.indexes.json         # Composite indexes
│   └── storage.rules                  # Storage security rules
│
├── functions/                         # Cloud Functions (Node.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                   # Function exports entrypoint
│   │   │
│   │   ├── config/
│   │   │   ├── firebase-admin.ts      # Admin SDK init
│   │   │   └── env.ts                 # Environment variables
│   │   │
│   │   ├── types/
│   │   │   ├── firestore.ts           # All Firestore document types
│   │   │   ├── api.ts                 # Request/response types
│   │   │   └── ai.ts                  # AI model types
│   │   │
│   │   ├── functions/                 # Cloud Function handlers
│   │   │   ├── auth.ts                # createUserProfile
│   │   │   ├── muse.ts                # createMuseFromPhoto
│   │   │   ├── poem.ts                # generatePoem, continueConversationalPoem
│   │   │   ├── audio.ts               # synthesizePoemAudio
│   │   │   ├── video.ts               # renderPerformanceVideo
│   │   │   ├── livingPage.ts          # createLivingPage
│   │   │   ├── collection.ts          # createCollection, addLivingPageToCollection
│   │   │   ├── export.ts              # exportLivingPage
│   │   │   ├── dashboard.ts           # getUserDashboard
│   │   │   └── cleanup.ts             # deleteUserAssetSafely
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── quota.service.ts       # Quota enforcement + reset
│   │   │   ├── usage.service.ts       # Usage event tracking
│   │   │   ├── livingPage.service.ts  # Living page composition logic
│   │   │   ├── subscription.service.ts# Subscription management
│   │   │   └── storage.service.ts     # Storage helpers (upload, signed URLs)
│   │   │
│   │   ├── ai/                        # AI provider adapters
│   │   │   ├── adapter.ts             # Base adapter interface
│   │   │   ├── gemini.ts              # Gemini Pro / Flash
│   │   │   ├── imagen.ts              # Nano Banana / Imagen
│   │   │   ├── veo.ts                 # Veo 3 video generation
│   │   │   ├── lyria.ts               # Lyria music generation
│   │   │   ├── tts.ts                 # Google Cloud TTS (fallback)
│   │   │   └── orchestrator.ts        # Pipeline orchestration + retry
│   │   │
│   │   ├── validation/
│   │   │   └── schemas.ts             # Zod validation schemas
│   │   │
│   │   └── utils/
│   │       ├── logger.ts              # Structured logging wrapper
│   │       ├── errors.ts              # Custom error classes
│   │       └── helpers.ts             # Shared utilities
│   │
│   └── .env.example                   # Environment variable template
│
├── src/                               # Next.js app
│   ├── app/                           # App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing / home
│   │   ├── auth/
│   │   ├── gallery/
│   │   ├── create/
│   │   ├── page/[id]/
│   │   ├── collections/
│   │   ├── settings/
│   │   └── upgrade/
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts              # Client SDK init
│   │   │   ├── auth.ts                # Auth helpers
│   │   │   ├── firestore.ts           # Firestore helpers + converters
│   │   │   └── storage.ts             # Storage upload helpers
│   │   │
│   │   ├── hooks/                     # React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useLivingPages.ts
│   │   │   └── useQuota.ts
│   │   │
│   │   └── types/
│   │       └── index.ts               # Shared client types
│   │
│   ├── components/                    # React components
│   └── styles/
│       └── globals.css
│
├── .env.local.example                 # Client env template
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## SECTION 10 — IMPLEMENTATION ORDER

### A. Hackathon MVP (1 Day)

| Order | Task | Time | Files |
|-------|------|------|-------|
| 1 | Firebase project setup + enable APIs | 15 min | Firebase Console |
| 2 | `firebase/firebase.json` + `.firebaserc` | 5 min | Config |
| 3 | `functions/src/config/firebase-admin.ts` | 10 min | Admin init |
| 4 | `src/lib/firebase/client.ts` | 10 min | Client init |
| 5 | `functions/src/types/firestore.ts` | 15 min | Types |
| 6 | `firebase/firestore.rules` (simplified) | 10 min | Security |
| 7 | `firebase/storage.rules` (simplified) | 5 min | Security |
| 8 | `functions/src/functions/auth.ts` — createUserProfile | 20 min | Auth |
| 9 | `src/lib/firebase/auth.ts` — sign in + onAuthStateChanged | 15 min | Auth |
| 10 | `src/lib/firebase/storage.ts` — photo upload | 15 min | Upload |
| 11 | `functions/src/ai/gemini.ts` — poem generation | 30 min | AI |
| 12 | `functions/src/ai/imagen.ts` — avatar generation | 30 min | AI |
| 13 | `functions/src/functions/muse.ts` — createMuseFromPhoto | 25 min | Core |
| 14 | `functions/src/functions/poem.ts` — generatePoem | 20 min | Core |
| 15 | `functions/src/functions/livingPage.ts` — createLivingPage | 20 min | Core |
| 16 | `functions/src/services/quota.service.ts` (basic) | 15 min | Quota |
| 17 | Gallery page — list living pages | 30 min | UI |
| 18 | Create page — upload + generate flow | 45 min | UI |
| 19 | Deploy and test | 30 min | — |

**Total: ~6 hours** (focused, no distractions)

### B. Post-Hackathon Hardening

| Priority | Task | Sprint |
|----------|------|--------|
| P0 | Full Firestore security rules | Sprint 1 |
| P0 | Full Storage security rules | Sprint 1 |
| P0 | Proper error handling + validation (Zod) | Sprint 1 |
| P0 | Usage event tracking | Sprint 1 |
| P1 | Lyria audio generation | Sprint 2 |
| P1 | Veo 3 video generation (async) | Sprint 2 |
| P1 | Export pipeline | Sprint 2 |
| P1 | Subscription/payment (Stripe) | Sprint 2 |
| P2 | Conversational verse (WebSocket) | Sprint 3 |
| P2 | Collections CRUD | Sprint 3 |
| P2 | Living Book export | Sprint 3 |
| P2 | Content moderation (Vertex safety) | Sprint 3 |
| P3 | Admin analytics dashboard | Sprint 4 |
| P3 | Performance optimization (caching) | Sprint 4 |
| P3 | Mobile app (Expo) | Sprint 4-5 |
| P3 | A/B testing framework | Sprint 5 |

---

## SECTION 11 — CODE GENERATION TARGETS

### Starter Files (Create First)

| # | File | Purpose | MVP? |
|---|------|---------|------|
| 1 | `functions/src/config/firebase-admin.ts` | Initialize Firebase Admin SDK | ✅ |
| 2 | `src/lib/firebase/client.ts` | Initialize Firebase client SDK | ✅ |
| 3 | `functions/src/types/firestore.ts` | All Firestore document type interfaces | ✅ |
| 4 | `functions/src/types/api.ts` | Request/response payload types | ✅ |
| 5 | `firebase/firestore.rules` | Production Firestore security rules | ✅ |
| 6 | `firebase/storage.rules` | Production Storage security rules | ✅ |
| 7 | `firebase/firestore.indexes.json` | Composite index definitions | ✅ |
| 8 | `functions/src/index.ts` | Cloud Functions export entrypoint | ✅ |
| 9 | `functions/src/ai/gemini.ts` | Gemini wrapper (poem + sentiment) | ✅ |
| 10 | `functions/src/ai/imagen.ts` | Nano Banana wrapper (avatar gen) | ✅ |
| 11 | `functions/src/ai/adapter.ts` | Base AI adapter interface | ✅ |
| 12 | `functions/src/ai/orchestrator.ts` | Pipeline orchestration + retry | ✅ |
| 13 | `functions/src/services/quota.service.ts` | Quota check/reset/enforce | ✅ |
| 14 | `functions/src/services/usage.service.ts` | Usage event logging | ✅ |
| 15 | `functions/src/services/livingPage.service.ts` | Living page composition | ✅ |
| 16 | `functions/src/validation/schemas.ts` | Zod schemas for all payloads | ✅ |
| 17 | `functions/.env.example` | Environment variable template | ✅ |
| 18 | `.env.local.example` | Client environment template | ✅ |

---

## SECTION 12 — ENGINEERING GUARDRAILS

### Hard Rules

| # | Guardrail | Rationale |
|---|-----------|-----------|
| 1 | **All AI calls happen in Cloud Functions, never client-side** | API keys stay server-side; cost control |
| 2 | **Quota logic is server-enforced via Firestore transactions** | Client can't bypass limits |
| 3 | **Subscription tier is a server-managed field** | Client security rules block writes |
| 4 | **Every AI call logs a usage_event** | Cost visibility from day 1 |
| 5 | **All media writes go through admin SDK, never client** | Except photo uploads (validated by storage rules) |
| 6 | **Use Firestore converters for type safety** | Prevent runtime type errors |
| 7 | **Feature flags control rollout** | Kill switch for expensive features |
| 8 | **No secrets in client code — ever** | Firebase config is public, API keys are not |
| 9 | **Prefer callable functions over HTTPS** | Built-in auth context, CORS, typing |
| 10 | **Design for model swappability** | Adapter pattern; swap Veo 3 → 4 without code changes |

### Anti-Patterns to Avoid
| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Call Vertex AI from the client | Call from Cloud Functions |
| Store API keys in `.env.local` | Store in Secret Manager → Cloud Functions env |
| Trust client-reported usage | Count on server, reject on server |
| Build a custom auth system | Use Firebase Auth — it's battle-tested |
| Over-normalize Firestore | Denormalize for read-heavy gallery views |
| Build a queue system from scratch | Use Cloud Tasks or Firestore triggers |
| Make video gen synchronous | Make it async + poll via `onSnapshot` |

### Migration Path
If scale exceeds Firebase limits:
1. **Firestore → Cloud SQL**: If complex joins needed, migrate `usage_events` and `subscriptions` first
2. **Cloud Functions → Cloud Run**: If function cold starts are too slow, containerize
3. **Firebase Hosting → Vercel/GKE**: If SSR needs edge deployment
4. **Monolith Functions → Microservices**: Split by domain (AI, payments, content) when team > 5

> [!IMPORTANT]
> These migrations are **independent** — you can migrate one layer without touching others. The adapter pattern in the AI layer makes model changes zero-risk.
