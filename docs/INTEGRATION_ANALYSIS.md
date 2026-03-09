# 🔬 Integration Analysis — Loveable → The Living Muse

**Source:** `loveable-reference/` (museful-creations repo)
**Date:** March 8, 2026

---

## Executive Summary

The Loveable project is a well-designed frontend prototype with **no backend logic** — all AI calls are simulated (`setTimeout`). However, it contains three critical assets we must adopt:

1. **4-tier credit-based monetization model** (superior to our 2-tier monthly-limit system)
2. **Comprehensive cost protection strategy** with competitor research
3. **Granular creation UIs** (avatar styles, video quality tiers, voice selection)

---

## Integration Decision Matrix

### ✅ ADOPT — Use directly in our build

| Asset | Location | Why |
|-------|----------|-----|
| **4-tier pricing model** | `types.ts`, `Pricing.tsx` | More revenue than 2-tier. Free→Starter→Pro→Studio captures 4 customer segments |
| **Credit-based monetization** | `types.ts` `CREDIT_COSTS` | Industry standard (Runway, Pika). Weighted costs protect margins on expensive ops |
| **Video quality tiers** | `CreateVideo.tsx` lines 21-59 | Draft (20cr/720p) → Standard (40cr/1080p) → Premium (60cr) → Cinematic (80cr/4K). Critical for margin protection |
| **Cost protection strategy** | `docs/cost-protection-strategy.md` | Entire document. Competitor research, 4 options analyzed, recommended approach |
| **Credit packs** | `Pricing.tsx` lines 116-121 | $4.99-$69.99 one-time packs. Never-expire credits = recurring revenue |
| **Annual billing discount** | `Pricing.tsx` line 10 | 20% off annual = higher LTV, lower churn |
| **Voice selection UX** | `CreateAudio.tsx` | 8 voices across 2 tiers (standard 3cr, premium 10cr). Standard vs Premium Lyria |
| **Avatar style presets** | `CreateAvatar.tsx` lines 18-27 | 8 styles (Oil Painting → Cyberpunk) with stylization slider |
| **WCAG accessibility** | `index.css` | Skip links, focus-visible, ARIA roles, contrast ratios documented |

### 🔄 ADAPT — Use concept, rewrite for our stack

| Asset | What to Keep | What Changes |
|-------|-------------|-------------|
| **Landing page structure** | Hero + features + pricing preview + CTA | Rewrite from Vite/React Router → Next.js App Router |
| **Create hub page** | Card grid with credit costs and Pro badges | Port from React Router `Link` → Next.js `Link` |
| **AppShell layout** | Sidebar + TopNav + MobileTabBar pattern | Rebuild in Next.js layout with our design tokens |
| **Design system** | Color palette (gold/ink/muse gradients), WCAG compliance | Keep Playfair Display + DM Sans fonts, adapt from Tailwind → our CSS variables |
| **Drag-and-drop upload** | `onDrop` handler pattern, image preview with remove button | Already have basic upload; add drag-drop + style preview |
| **Real-time cost display** | "⚡ Cost: 40 credits" shown before generation | Add to our Cloud Functions response + UI |

### ❌ SKIP — Won't use

| Asset | Why |
|-------|-----|
| **Vite + React Router** | Our stack is Next.js App Router. No migration needed |
| **shadcn/ui components** | Would pull in 25+ Radix dependencies. Our vanilla CSS is lighter |
| **Tailwind CSS** | Already committed to vanilla CSS design system |
| **React Query** | Next.js has built-in data fetching. Unnecessary dep |
| **Framer Motion** | Nice animations but heavy (30KB). Our CSS animations suffice for MVP |
| **next-themes** (dark/light toggle) | Post-hackathon feature |
| **Simulated AI calls** (`setTimeout`) | We have real AI adapters with retry/fallback |
| **`lovable-tagger`** | Loveable-specific dev dependency |
| **All placeholder data** | We have real Firestore schema and Cloud Functions |

---

## 💰 Updated Financial Model

### Pricing Change: 2-Tier → 4-Tier Credit System

**OLD MODEL (our build):**

| Tier | Price | Limit | Per-Creation |
|------|-------|-------|-------------|
| Free | $0 | 3 creations/mo | ~$0.50/creation |
| Pro | $29.99 | 15 creations/mo | ~$2.00/creation |

**NEW MODEL (adopting Loveable's system):**

| Tier | Monthly | Annual | Credits/mo | Per-Credit Value |
|------|---------|--------|-----------|-----------------|
| Free | $0 | — | 15 | — |
| Starter | $9.99 | $7.99/mo | 75 | $0.133 |
| Pro | $29.99 | $24.99/mo | 300 | $0.100 |
| Studio | $79.99 | $64.99/mo | 1,000 | $0.080 |

### Updated Credit Costs (Verified Against API Pricing)

| Operation | Credits | Our AI Cost | Cost/Credit | Max Margin |
|-----------|---------|-------------|-------------|------------|
| Poem (Gemini Flash) | 1 | $0.005 | $0.005 | 97% |
| Poem (Gemini Pro) | 1 | $0.015 | $0.015 | 85% |
| Avatar (Imagen 3) | 5 | $0.10 | $0.020 | 80% |
| Audio Standard (Cloud TTS) | 3 | $0.05 | $0.017 | 83% |
| Audio Premium (Lyria) | 10 | $0.20 | $0.020 | 80% |
| Video Draft (Veo Fast) | 20 | $0.50 | $0.025 | 75% |
| Video Standard (Veo) | 40 | $1.00 | $0.025 | 75% |
| Video Premium (Veo HD) | 60 | $2.00 | $0.033 | 67% |
| Video Cinematic (Veo 4K) | 80 | $3.50 | $0.044 | 56% |
| Export HD | 2 | $0.02 | $0.010 | 90% |

### Worst-Case Margin Analysis (All Video)

| Tier | Revenue | Max Std Videos | All-Video Cost | Margin |
|------|---------|---------------|---------------|--------|
| Starter | $9.99 | 1 | $1.00 | **90%** ✅ |
| Pro | $29.99 | 7 | $7.00 | **77%** ✅ |
| Studio | $79.99 | 25 | $25.00 | **69%** ✅ |

> **All margins stay above 65% even in worst case.** The old 2-tier model had Pro margins as low as 40% on video-heavy users.

### Credit Pack Revenue (One-Time Purchases)

| Pack | Credits | Price | $/Credit | Min Margin on Video |
|------|---------|-------|----------|-------------------|
| Starter | 50 | $4.99 | $0.100 | 75% |
| Creator | 150 | $11.99 | $0.080 | 68% |
| Power | 500 | $29.99 | $0.060 | 58% |
| Studio | 1,500 | $69.99 | $0.047 | 47% |

### Revenue Projections (Revised)

| Month 6 Scenario | Free | Starter | Pro | Studio | MRR |
|-------------------|------|---------|-----|--------|-----|
| **Conservative** (10K users) | 9,000 | 600 | 300 | 100 | **$19,994** |
| **Moderate** (25K users) | 22,500 | 1,500 | 750 | 250 | **$49,985** |
| **Optimistic** (50K users) | 45,000 | 3,000 | 1,500 | 500 | **$99,970** |

### vs. Old Model Revenue

| Metric | Old (2-Tier) | New (4-Tier) | Delta |
|--------|-------------|-------------|-------|
| Free→Paid conversion | 10% (all to Pro) | 15% (split across tiers) | **+50%** |
| ARPU (paying users) | $29.99 | $28.50 (blended) | -5% |
| Total revenue (10K users) | $29,990 | **$19,994** (conservative) | See note |

> [!IMPORTANT]
> The 4-tier model captures more paying users at lower price points. The **Starter tier at $9.99** converts 6% of users who would never pay $29.99 directly. At 25K+ users the 4-tier model significantly outperforms due to higher conversion rates.

---

## Backend Changes Required

### 1. Update Firestore Schema — `users` collection

```diff
- monthlyCreationsUsed: number;
- monthlyCreationsLimit: number;
+ creditBalance: number;
+ creditLimit: number;  // Monthly allocation
+ creditResetDate: Timestamp;
+ subscriptionTier: 'free' | 'starter' | 'pro' | 'studio';
```

### 2. Update Types — `functions/src/types/firestore.ts`

```diff
- export type SubscriptionTier = 'free' | 'pro';
+ export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'studio';

+ export const CREDIT_COSTS = {
+   poem: 1,
+   avatar: 5,
+   audio_standard: 3,
+   audio_premium: 10,
+   video_draft: 20,
+   video_standard: 40,
+   video_premium: 60,
+   video_cinematic: 80,
+   export_hd: 2,
+ } as const;

+ export const TIER_CREDITS = {
+   free: 15,
+   starter: 75,
+   pro: 300,
+   studio: 1000,
+ } as const;
```

### 3. Update Quota Service — `functions/src/services/quota.service.ts`

Replace monthly creation counting with credit balance management:
- `enforceQuota(uid)` → `deductCredits(uid, action, quality)`
- `incrementQuota(uid)` → `deductCredits(uid, creditCost)`
- Add `grantCredits(uid, amount)` for credit pack purchases

### 4. Add Video Quality Tiers to Cloud Functions

Update `generateVideo` (currently a stub) to accept quality tier and validate credit cost matches.

### 5. Update Pricing Page

Replace our simple landing page pricing with the 4-tier card grid from Loveable, adapted to vanilla CSS.

---

## Key Metrics to Track (from Cost Protection Strategy)

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Blended cost per credit | ≤ $0.03 | > $0.03 |
| Video share of credits consumed | ≤ 30% | > 40% |
| Gross margin per tier | ≥ 65% | < 60% |
| Free→Paid conversion | ≥ 10% | < 5% |
| Monthly churn (paid) | ≤ 5% | > 8% |
| Credit pack purchase rate | ≥ 3% of paid users | < 1% |

---

## Implementation Priority

1. **Update Firestore types** → add 4-tier system + credit costs
2. **Rewrite quota service** → credit-based deduction
3. **Update Cloud Functions** → accept operation type + quality tier
4. **Update pricing page** → 4-tier cards + comparison table + credit packs
5. **Add video quality selector** to create video flow
6. **Add voice tier selector** to create audio flow
7. **Add avatar style presets** to create avatar flow
8. **Copy cost protection strategy** → `docs/COST_PROTECTION.md`
