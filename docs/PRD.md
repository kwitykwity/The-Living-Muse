# 📋 The Living Muse — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** March 8, 2026
**Authors:** Jessenia Cintron, Carolina Cruz, Christina Ruiz
**Status:** Draft — Pre-Development

---

## 1. Product Overview

### 1.1 What is The Living Muse?
The Living Muse is a **multi-modal AI creative platform** that transforms personal photos into stylized "Orchid Muse" avatars and generates emotionally adaptive poetry — performed with synchronized lip-sync, background music, and real-time conversational verse.

It is a **Collaborative Creative Sanctuary** — a digital mirror and Artistic Co-Creator that bridges the gap between visual identity (user photos) and emotional expression (AI-generated poetry).

### 1.2 Problem Statement
Aspiring poets and social creatives lack a unified tool that:
- Transforms their emotions into **multimedia art** without requiring technical skills
- Combines **visual, textual, and auditory** creative output in one flow
- Provides an AI **co-creator** (not just a generator) that responds to emotional context
- Produces **social-ready, high-fidelity content** for platforms like TikTok and Instagram

### 1.3 The 5 Whys — Root Cause Analysis

| # | Why? | Answer |
|---|------|--------|
| 1 | Why do poets struggle to share their work on social media? | Because text-only poetry doesn't capture attention in a video-first feed. |
| 2 | Why don't they just add visuals? | Because creating matching visuals requires design skills most poets don't have. |
| 3 | Why can't existing AI tools help? | Because poetry AI (ChatGPT) and visual AI (Lensa) are siloed — no one connects them into a unified emotional experience. |
| 4 | Why hasn't anyone built this connection? | Because multi-modal AI pipelines (text + image + video + audio) only became cost-effective in late 2025 with Veo 3, Nano Banana, and Lyria 3. |
| 5 | Why is now the right time? | Because API costs have dropped 50%+ in 12 months, Google offers $200K–$350K in startup credits, and the AI poetry market is growing at 29.4% CAGR. |

---

## 2. Target Audience

### 2.1 Primary Personas

#### Persona 1: **The Aspiring Poet** — "Maya"
- **Age:** 22–35
- **Profile:** Published 0–2 poems online, wants to release a poetry book, active on Instagram
- **Pain:** Feels their poetry is "invisible" in a visual-first social media world
- **Need:** A way to transform their words into shareable multimedia art
- **Trigger:** "I wish my poem could come to life"

#### Persona 2: **The Social Creative** — "Kai"
- **Age:** 18–28
- **Profile:** TikTok/Instagram content creator, 5K–50K followers, loves aesthetics
- **Pain:** Generic filters and AI art tools don't feel "artistic" enough
- **Need:** High-art, personalized content that stands out from the feed
- **Trigger:** "I want something that feels like me, not like everyone else"

#### Persona 3: **The Digital Collector** — "Devyn"
- **Age:** 28–45
- **Profile:** Early adopter, appreciates digital art, buys NFTs/digital prints
- **Pain:** Wants personalized "Living Art" mementos, not mass-produced prints
- **Need:** Unique, AI-generated art pieces tied to personal moments
- **Trigger:** "I want to turn this photo into something I can keep forever"

### 2.2 Market Sizing

| Metric | Value | Source |
|--------|-------|--------|
| AI Poetry Market (2026) | $1.41B | Research & Markets |
| AI Poetry Market CAGR | 29.4% | Research & Markets |
| AI Avatar Market (2025) | $9.78B | Medium / Market.us |
| Gen AI Creative Tools (2025) | $4.06B | TBRC |
| Target Addressable Market (TAM) | $1.41B | AI Poetry market |
| Serviceable Addressable Market (SAM) | $140M | ~10% poetry creators who want multimedia |
| Serviceable Obtainable Market (SOM) | $1.4M | ~1% of SAM in Year 1 |

---

## 3. Core Features

### 3.1 Feature Matrix

| # | Feature | Description | Tier | Priority | Phase |
|---|---------|-------------|------|----------|-------|
| F1 | **Onboarding — Vibe Selection** | User selects aesthetic "vibe" (Harlem Soul, K-Dreamer, Orchid Noir, etc.) | Free | P0 | 1 |
| F2 | **Photo Upload / Selfie** | Upload or take a selfie as the base for avatar generation | Free | P0 | 1 |
| F3 | **Orchid Avatar Creator** | Transform photo into "Orchid Muse" avatar using Nano Banana (Gemini 3 Pro Image) | Free | P0 | 1 |
| F4 | **AI Poem Generation** | Gemini 3.1 Pro generates emotionally adaptive 4-line verse from photo mood | Free | P0 | 1 |
| F5 | **Edit / Regenerate Poem** | User can modify or regenerate the poem while maintaining creative control | Free | P0 | 1 |
| F6 | **The Gallery** | Personal library of "Living Pages" (CRUD operations) | Free | P1 | 1 |
| F7 | **Syllabic Syncing** | Avatar lip-syncs the poem performance using Veo 3 video generation | Pro | P1 | 2 |
| F8 | **Background Music** | Lyria 3 generates mood-matched ambient music | Pro | P1 | 2 |
| F9 | **Social Export** | One-click export as watermarked (Free) or unwatermarked 4K video (Pro) | Both | P1 | 2 |
| F10 | **Conversational Verse** | "Live Mode" — user speaks, Muse responds in rhyme in real-time | Pro | P2 | 3 |
| F11 | **The Living Book** | Export a 10-poem collection as a premium printable digital file | One-time | P2 | 3 |
| F12 | **Style Persistence** | Favorite color auto-appends to all image generation prompts (e.g., purple → "orchid and lavender hues") | Free | P1 | 1 |

### 3.2 Conditional Logic — Emotional Intelligence Engine

The Muse doesn't generate poetry randomly — it follows a structured emotional logic:

| Condition | Trigger | Response |
|-----------|---------|----------|
| **Sad input detected** | User speaks/types something sad | Avatar shifts to deep blues/purples; generates melancholic haiku |
| **User interrupts** | User speaks while Muse is performing | Muse pauses, acknowledges interruption with a rhyme, asks for new prompt |
| **"Finish it"** | User says "finish it" or similar | Muse takes user's last sentence and finds a perfect closing couplet |
| **Credit check** | `creditBalance + purchasedCredits >= cost` | Deduct credits before generation; refund on failure |
| **Style persistence** | `user.favoriteColor == 'purple'` | Auto-append "orchid and lavender hues" to all Nano Banana image prompts |

### 3.3 Monetization Tiers (Credit-Based System)

| Tier | Monthly | Annual | Credits/mo | Key Features |
|------|---------|--------|------------|-------------|
| **Free** | $0 | — | 15 | Poems, avatars, standard audio, 720p watermarked exports, 1 muse |
| **Starter** | $9.99 | $7.99 | 75 | + 1080p export, 10% credit pack discount, 2GB storage |
| **Pro** | $29.99 | $24.99 | 300 | + Video gen, premium voices, conversational muse, no watermark, 3 muses |
| **Studio** | $79.99 | $64.99 | 1,000 | + 4K export, unlimited muses, 50GB storage, 30% pack discount |
| **Living Book** | $14.99 one-time | — | — | Premium printable digital file of a curated 10-poem collection |

#### Credit Costs Per Operation
| Operation | Credits | Why? |
|-----------|---------|------|
| Poem | 1 | Low API cost (~$0.01) |
| Avatar | 5 | Medium API cost (~$0.05–$0.13) |
| Standard Audio | 3 | Cloud TTS (~$0.05) |
| Premium Audio | 10 | Lyria/ElevenLabs (~$0.20) |
| Draft Video | 20 | Veo Fast (~$0.50) |
| Cinematic Video | 80 | Veo 4K (~$3.20) |

---

## 4. User Stories

### Phase 1 — Core Experience
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-01 | As a new user, I want to select my "vibe" so the Muse understands my aesthetic | Vibe selection screen with 4+ presets; selection persists to profile |
| US-02 | As a user, I want to upload a photo or take a selfie so I can create a Living Page | Photo upload via camera or gallery; validation for face detection |
| US-03 | As a user, I want to see my photo transformed into an Orchid Muse avatar | Avatar generated via Nano Banana within <10s; loading animation (orchid blooming) |
| US-04 | As a user, I want to receive an AI-generated poem based on my photo's mood | Gemini generates 4-line verse; sentiment score captured |
| US-05 | As a user, I want to edit or regenerate my poem | Edit inline or tap "Regenerate" for new verse |
| US-06 | As a user, I want to save my Living Page to my Gallery | Living Page persisted to Firestore; appears in Gallery list |
| US-07 | As a user, I want my favorite color to influence all future avatar styles | Color picked during onboarding; auto-appended to image prompts |

### Phase 2 — Performance & Export
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-08 | As a Pro user, I want my avatar to lip-sync my poem | Veo 3 generates synced video; playable in-app |
| US-09 | As a Pro user, I want background music matched to my poem's mood | Lyria 3 generates 30s ambient track; synchronized with video |
| US-10 | As a user, I want to export my Living Page as a video | Free: watermarked SD; Pro: unwatermarked 4K |
| US-11 | As a user, I want to browse and manage my Gallery | List/grid view, delete, reorder, favorites |

### Phase 3 — Conversational & Publishing
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-12 | As a Pro user, I want to have a real-time conversation with my Muse | Streaming Gemini responses via WebSocket; Muse responds in rhyme |
| US-13 | As a user, I want to compile 10 poems into a Living Book | Selection UI, ordering, cover generation, PDF/digital export |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Image-to-poem transformation < 10 seconds |
| **Availability** | 99.5% uptime SLA |
| **Scalability** | Support 10,000 concurrent users by Month 12 |
| **Security** | Firebase Auth; Firestore rules enforce user-level data isolation |
| **Privacy** | GDPR/CCPA compliant; user photos never used for model training |
| **Accessibility** | WCAG 2.1 AA compliance; screen reader support |
| **Platforms** | Web (PWA), iOS, Android |
| **Latency** | API calls < 3s (text), < 10s (image), < 30s (video) |
| **Cost Cap** | Credit-weighted: poem=1cr, avatar=5cr, video=20-80cr. Margins ≥52% worst-case |

---

## 6. Success Metrics

| Metric | Definition | Target (Month 6) |
|--------|-----------|------------------|
| **Activation Rate** | % of signups who complete first Living Page | > 60% |
| **Creation Frequency** | Living Pages created per active user per month | > 3 |
| **Pro Conversion** | % of free users who upgrade to Pro | > 5% |
| **Retention (D7)** | % of users returning 7 days after signup | > 40% |
| **Retention (D30)** | % of users returning 30 days after signup | > 25% |
| **NPS** | Net Promoter Score | > 50 |
| **Social Share Rate** | % of Living Pages that are exported/shared | > 30% |

---

## 7. Out of Scope (v1)

- NFT minting of Living Pages
- Multi-language poetry (English only at launch)
- Third-party API/SDK for developers
- Collaborative multi-user poem creation
- Integration with print-on-demand services
- AR/VR experiences
