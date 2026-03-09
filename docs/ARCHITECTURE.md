# 🏗️ The Living Muse — System Architecture

**Version:** 1.0
**Date:** March 8, 2026

---

## 1. Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB["Web App<br/>(Next.js 15 PWA)"]
        IOS["iOS App<br/>(React Native + Expo)"]
        AND["Android App<br/>(React Native + Expo)"]
    end

    subgraph Gateway["API Gateway"]
        CF["Cloud Functions Gen 2<br/>or Cloud Run"]
        WS["WebSocket Server<br/>(Conversational Verse)"]
    end

    subgraph AI["AI Orchestration Layer"]
        ADAPTER["AI Service Adapter<br/>(Model Abstraction)"]
        GEMINI["Gemini 3.1 Pro<br/>(Poetry + Sentiment)"]
        FLASH["Gemini 3 Flash<br/>(Drafts + Previews)"]
        NANO["Nano Banana<br/>(Avatar Gen)"]
        VEO["Veo 3 / 3 Fast<br/>(Video Performance)"]
        LYRIA["Lyria 3<br/>(Background Music)"]
    end

    subgraph Data["Data Layer"]
        FS["Cloud Firestore<br/>(User + Muse + Poem)"]
        CS["Cloud Storage<br/>(Media Files)"]
        AUTH["Firebase Auth<br/>(Google/Apple/Email)"]
    end

    subgraph Infra["Infrastructure"]
        MON["Cloud Monitoring"]
        LOG["Cloud Logging"]
        SEC["Secret Manager"]
        TASKS["Cloud Tasks<br/>(Async Queue)"]
        CDN["Cloud CDN"]
    end

    WEB --> CF
    IOS --> CF
    AND --> CF
    WEB --> WS
    IOS --> WS
    AND --> WS

    CF --> ADAPTER
    WS --> ADAPTER
    CF --> FS
    CF --> CS
    CF --> AUTH

    ADAPTER --> GEMINI
    ADAPTER --> FLASH
    ADAPTER --> NANO
    ADAPTER --> VEO
    ADAPTER --> LYRIA

    CF --> TASKS
    TASKS --> VEO
    TASKS --> LYRIA

    CF --> MON
    CF --> LOG
    CF --> SEC

    CS --> CDN
```

---

## 2. AI Service Adapter Pattern

The **AI Service Adapter** is the most critical architectural decision. It abstracts all AI model calls behind a unified interface so that:
- Models can be **swapped without code changes** (e.g., Veo 3 → Veo 4)
- **Fallback chains** can be defined (Gemini Pro → Flash on timeout)
- **Cost tracking** is centralized per-call
- **Prompt templates** are versioned and cached

```
┌─────────────────────────────────────────────────────┐
│                AI Service Adapter                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │             Model Registry                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌────────────────┐  │   │
│  │  │ gemini- │ │ nano-   │ │ veo-3         │  │   │
│  │  │ 3.1-pro │ │ banana  │ │               │  │   │
│  │  └─────────┘ └─────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          Prompt Template Engine               │   │
│  │  • Versioned prompt templates                 │   │
│  │  • Variable injection (vibe, color, mood)     │   │
│  │  • Style persistence (favorite color auto)    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │          Cost Tracker                         │   │
│  │  • Per-request cost logging                   │   │
│  │  • User quota enforcement                     │   │
│  │  • Monthly budget alerts                      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 3. Request Flow — Creating a Living Page

### 3.1 Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant App as Client App
    participant API as Cloud Functions
    participant Store as Cloud Storage
    participant FS as Firestore
    participant NB as Nano Banana
    participant GEM as Gemini 3.1 Pro
    participant VEO as Veo 3
    participant LYR as Lyria 3

    User->>App: Upload photo / take selfie
    App->>API: POST /api/muses (photo)
    API->>Store: Upload raw photo
    Store-->>API: Photo URL

    par Avatar Generation
        API->>NB: Generate Orchid Muse avatar
        NB-->>API: Avatar image
        API->>Store: Store avatar image
    and Sentiment Pre-analysis
        API->>GEM: Analyze photo context
        GEM-->>API: Mood/context keywords
    end

    API->>FS: Create Muse document
    API-->>App: Muse created (avatar URL)
    App-->>User: Show avatar with orchid blooming animation

    User->>App: Request poem generation
    App->>API: POST /api/muses/:id/poems
    API->>GEM: Generate poem (photo context + vibe + color)
    GEM-->>API: 4-line verse + sentiment
    API->>FS: Create Poem document
    API-->>App: Poem text + sentiment
    App-->>User: Display poem with edit/regenerate options

    opt Pro User - Performance
        User->>App: Request performance
        App->>API: POST /api/poems/:id/perform
        API->>VEO: Generate lip-sync video (async)
        API->>LYR: Generate background music (async)
        API-->>App: Processing status
        VEO-->>API: Video file (webhook)
        LYR-->>API: Audio file (webhook)
        API->>Store: Store video + audio
        API->>FS: Update poem with URLs
        API-->>App: Performance ready
        App-->>User: Play Living Page performance
    end
```

### 3.2 Latency Budget

| Step | Target | Model | Parallel? |
|------|--------|-------|-----------|
| Photo upload | 2s | Cloud Storage | — |
| Avatar generation | 5s | Nano Banana | ✅ with sentiment |
| Sentiment pre-analysis | 2s | Gemini Flash | ✅ with avatar |
| Poem generation | 3s | Gemini 3.1 Pro | — |
| **Total (photo → poem)** | **< 10s** | | |
| Video generation | 30–45s | Veo 3 | ✅ with music |
| Music generation | 10–15s | Lyria 3 | ✅ with video |
| **Total (performance)** | **< 60s** | | (async, user notified) |

---

## 4. Conversational Verse Architecture

```mermaid
sequenceDiagram
    actor User
    participant App as Client App
    participant WS as WebSocket Server
    participant EIE as Emotional Intelligence Engine
    participant GEM as Gemini 3.1 Pro (Streaming)

    User->>App: Open "Live Mode"
    App->>WS: Connect WebSocket
    WS-->>App: Connected

    User->>App: Speak/type a line
    App->>WS: Send user utterance
    WS->>EIE: Classify emotion + intent

    alt Sad Input
        EIE-->>WS: Shift to melancholic mode
        WS->>GEM: Generate haiku (streaming)
        GEM-->>WS: Haiku tokens (stream)
        WS-->>App: Stream response + color shift (deep blues/purples)
    else User Interrupts
        EIE-->>WS: Acknowledge interruption
        WS->>GEM: Generate acknowledgment rhyme
        GEM-->>WS: Rhyme + "What shall we explore?" (stream)
        WS-->>App: Stream response
    else "Finish it"
        EIE-->>WS: Closing mode
        WS->>GEM: Generate closing couplet from context
        GEM-->>WS: Perfect closing couplet (stream)
        WS-->>App: Stream final verse + completion indicator
    else Default
        EIE-->>WS: Continue conversation
        WS->>GEM: Generate responding verse (streaming)
        GEM-->>WS: Verse tokens (stream)
        WS-->>App: Stream response
    end
```

---

## 5. Deployment Architecture

### 5.1 Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| **Development** | Local + Firebase Emulator | `localhost:3000` |
| **Staging** | Pre-release testing | `staging.thelivingmuse.app` |
| **Production** | Live users | `thelivingmuse.app` |

### 5.2 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Push to │───▶│  GitHub   │───▶│  Build + │───▶│  Deploy  │
│  main    │    │  Actions  │    │  Test    │    │  (Auto)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                     │
                              ┌──────┴──────┐
                              │   Lint      │
                              │   Type Check│
                              │   Unit Test │
                              │   E2E Test  │
                              └─────────────┘
```

### 5.3 Scaling Strategy

| Component | Scaling Method | Trigger |
|-----------|---------------|---------|
| Cloud Functions | Auto-scale (0 → N) | Request count |
| Cloud Run | Auto-scale (min 1) | CPU/memory utilization |
| Firestore | Auto (managed) | Read/write operations |
| Cloud Storage | Auto (managed) | Storage volume |
| WebSocket Server | Cloud Run (min instances) | Connection count |

---

## 6. Cost Control Architecture

```
┌─────────────────────────────────────────────────┐
│              Cost Control Layer                  │
│                                                  │
│  ┌────────────────────┐  ┌───────────────────┐  │
│  │  Usage Quota        │  │  Budget Alerts    │  │
│  │  Enforcer           │  │  (50/80/100%)     │  │
│  │  • 3/mo free tier   │  │                   │  │
│  │  • 15/mo pro tier   │  │                   │  │
│  └────────────────────┘  └───────────────────┘  │
│                                                  │
│  ┌────────────────────┐  ┌───────────────────┐  │
│  │  Model Router       │  │  Cost Logger      │  │
│  │  • Flash for drafts │  │  • Per-request    │  │
│  │  • Pro for finals   │  │  • Per-user/mo    │  │
│  │  • Batch for async  │  │  • Dashboard      │  │
│  └────────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────┘
```
