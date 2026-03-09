# 💰 The Living Muse — Financial Model & API Cost Analysis

**Version:** 2.0 — Credit-Based Model
**Date:** March 8, 2026
**Perspective:** CFO / Financial Planning
**Status:** Updated after Loveable integration analysis

---

## 1. API Cost Breakdown

### 1.1 Per-Model Pricing (Current as of March 2026)

#### Gemini 3.1 Pro (Poetry Generation + Conversational Verse)
| Metric | Cost |
|--------|------|
| Input tokens (≤200K) | $2.00 / 1M tokens |
| Output tokens (≤200K) | $12.00 / 1M tokens |
| **Estimated per-poem cost** | ~$0.014 (1K input + 500 output tokens) |

#### Gemini 3 Flash (Draft/Preview — cost optimization)
| Metric | Cost |
|--------|------|
| Input tokens | $0.50 / 1M tokens |
| Output tokens | $3.00 / 1M tokens |
| **Estimated per-poem cost** | ~$0.002 (cost-optimized path) |

#### Nano Banana (Gemini 3 Pro Image — Avatar Generation)
| Resolution | Cost | Notes |
|-----------|------|-------|
| Standard (1024×1024) | ~$0.039 / image | Free/Starter tier avatars |
| 1K–2K | ~$0.134 / image | Pro tier avatars |
| 4K (4096×4096) | ~$0.24 / image | Studio tier / premium export |
| Batch API (4K) | ~$0.12 / image | 50% discount, 24h delay |

#### Veo 3 (Video Performance)
| Model | Cost | Notes |
|-------|------|-------|
| Veo 3 with audio | $0.40 / second | Full lip-sync performance |
| Veo 3 Fast with audio | $0.15 / second | Draft preview |
| Veo 3 without audio | $0.20 / second | Silent version |
| Veo 3 Fast without audio | $0.10 / second | Quick preview (Draft tier) |

#### Cloud Text-to-Speech / Lyria (Audio)
| Model | Cost | Notes |
|-------|------|-------|
| Cloud TTS (standard voices) | ~$0.05 / poem | Standard audio tier |
| Lyria 2/3 (premium voices) | ~$0.20 / poem | Premium audio tier |
| Lyria RealTime (experimental) | Free (current) | While available |

---

## 2. The Credit System — Why It Exists

> [!CAUTION]
> **The old model (flat creation counts) was financially catastrophic.** Under the original 2-tier model (Free: 3 creations/month, Pro: 15 creations/month at $9.99), a Pro user generating 15 full videos at $2+ each = $30+ in API costs on $9.99 revenue = **negative margins.** The credit system fixes this by weighting costs to reflect actual API expense.

### 2.1 Credit Costs Per Operation

| Operation | Credits | Est. API Cost | Credit Value |
|-----------|---------|---------------|--------------|
| **Poem generation** | 1 | $0.002–$0.014 | ~$0.01 |
| **Avatar generation** | 5 | $0.039–$0.134 | ~$0.05 |
| **Audio (Standard)** | 3 | ~$0.05 | ~$0.03 |
| **Audio (Premium)** | 10 | ~$0.20 | ~$0.10 |
| **Video (Draft)** | 20 | ~$0.50 | ~$0.20 |
| **Video (Standard)** | 40 | ~$1.00 | ~$0.40 |
| **Video (Premium)** | 60 | ~$1.50 | ~$0.60 |
| **Video (Cinematic)** | 80 | ~$3.20 | ~$0.80 |
| **HD Export** | 2 | ~$0.02 | ~$0.02 |

### 2.2 Subscription Tiers

| Tier | Monthly | Annual (per mo) | Credits/mo | Key Features |
|------|---------|----------------|------------|--------------|
| **Free** | $0 | — | 15 | Poems, avatars, standard audio, 720p export (watermarked) |
| **Starter** | $9.99 | $7.99 | 75 | + 1080p export, 10% credit pack discount, 2GB storage |
| **Pro** | $29.99 | $24.99 | 300 | + Video, premium audio, conversational muse, no watermark |
| **Studio** | $79.99 | $64.99 | 1,000 | + 4K export, unlimited muses, 50GB storage, 30% pack discount |

### 2.3 Credit Packs (One-Time Purchase — Never Expire)

| Pack | Credits | Price | Per-Credit Cost |
|------|---------|-------|-----------------|
| Starter Pack | 50 | $4.99 | $0.100 |
| Creator Pack | 150 | $11.99 | $0.080 |
| Power Pack | 500 | $29.99 | $0.060 |
| Studio Pack | 1,500 | $69.99 | $0.047 |

---

## 3. Unit Economics — Margin Analysis

### 3.1 Worst-Case Scenarios (Margin Floor Analysis)

The critical question: **What happens if a user spends ALL credits on the most expensive operation (Cinematic video)?**

| Tier | Credits | Max Cinematic Videos | API Cost | Revenue | Margin |
|------|---------|---------------------|----------|---------|--------|
| **Starter** | 75 | 0 (video is Pro+) | N/A | $9.99 | 100% ✅ |
| **Pro** | 300 | 3.75 (≈3) | $9.60 | $29.99 | **68%** ✅ |
| **Studio** | 1,000 | 12.5 (≈12) | $38.40 | $79.99 | **52%** ✅ |

> [!IMPORTANT]
> **Even in the absolute worst case (all Cinematic video), margins remain positive at every paid tier.** This is the fundamental improvement over the old model. The old model had -42% margins in worst case.

### 3.2 Expected-Case Scenarios (Based on Competitor Data)

Typical user behavior: 60% poems/avatars, 25% audio, 15% video

| Tier | Revenue | Expected API Cost | Expected Margin |
|------|---------|-------------------|-----------------|
| **Free** | $0 | ~$0.15 | -$0.15 (subsidized) |
| **Starter** | $9.99 | ~$1.20 | **$8.79 (88%)** |
| **Pro** | $29.99 | ~$5.80 | **$24.19 (81%)** |
| **Studio** | $79.99 | ~$18.50 | **$61.49 (77%)** |

### 3.3 Revenue Per User (Blended)

With credit packs as additional revenue:

| Revenue Stream | Year 1 Est. | Year 2 Est. |
|---------------|-------------|-------------|
| Subscription MRR | $14K/mo (M12) | $45K/mo |
| Credit Pack Purchases | ~$2K/mo (M12) | ~$8K/mo |
| **Total MRR (M12)** | **$16K/mo** | **$53K/mo** |

---

## 4. Financial Projections (4-Tier Model)

### 4.1 Assumptions
- Google Startup Credits: $250,000 (Year 1) + $100,000 (Year 2)
- Conversion rates: Free→Starter 5%, Free→Pro 3%, Free→Studio 0.5%
- Monthly churn: 8% (Starter), 6% (Pro), 4% (Studio)
- Team cost: 2 co-founders ($0 salary initially) + 1 contractor ($5K/mo)
- 15% of paid users purchase 1 credit pack/quarter

### 4.2 12-Month P&L Projection

| Month | Users | MAU | Starter | Pro | Studio | Sub MRR | Pack Rev | API Cost | Net |
|-------|-------|-----|---------|-----|--------|---------|----------|----------|-----|
| 1 | 200 | 80 | 4 | 2 | 0 | $100 | $10 | $50 | -$5,940 |
| 3 | 2,000 | 800 | 40 | 24 | 4 | $1,440 | $150 | $400 | -$4,810 |
| 6 | 10,000 | 4,000 | 200 | 120 | 20 | $7,200 | $750 | $2,500 | -$1,550 |
| 9 | 25,000 | 10,000 | 500 | 300 | 50 | $17,500 | $1,800 | $6,500 | **+$4,800** |
| 12 | 50,000 | 20,000 | 1,000 | 600 | 100 | $35,970 | $3,500 | $12,500 | **+$17,970** |

> [!NOTE]
> **Break-even at Month 8–9** with the 4-tier model, vs Month 14–16 with the old 2-tier model. The Starter tier captures 5× more paid conversions than a $29.99 entry point alone.

### 4.3 Break-Even Analysis

| Scenario | Required Paid Users | Monthly Revenue | Monthly Costs | Timeline |
|----------|-------------------|----------------|---------------|----------|
| **Lean (credits covering infra)** | 500 combined | $6,000 | $6,000 | Month 8 |
| **With team** | 900 combined | $12,000 | $12,000 | Month 10 |
| **Profitable (20% margin)** | 1,500 combined | $18,000 | $15,000 | Month 12 |

---

## 5. Competitive Pricing Analysis

| Competitor | Pricing | Credits | Our Advantage |
|-----------|---------|---------|---------------|
| **Canva Pro** | $12.99/mo | N/A (unlimited) | We specialize in poetry+art; Canva is generic |
| **Lensa AI** | $7.99/mo | 50 avatars | We include poem+audio+video, not just avatars |
| **Suno AI** | $10/mo | 500 songs | Similar credit model; we cover more modalities |
| **ElevenLabs** | $5/mo | 30K chars | Audio-only; we're multimedia |
| **RunwayML** | $15/mo | 125 credits | Video-focused; our poetry+avatar+video is unique |
| **Jasper** | $49/mo | Unlimited text | Text-only; no multimodal creation |

**Our positioning:** Most competitors are single-modality. We're the only multi-modal creative platform combining photo→avatar→poem→audio→video in one flow. Our $9.99 Starter tier undercuts most competitors while offering more modalities.

---

## 6. Cost Optimization Strategies

| Strategy | Savings | Implementation | Status |
|----------|---------|----------------|--------|
| **Gemini 3 Flash for Free/Starter** | 85% on text | Route Free/Starter to Flash, Pro+ to 3.1 Pro | ✅ Implemented |
| **Veo Fast for Draft tier** | 75% on video | Draft quality uses fast model | ✅ Implemented |
| **Credit-weighted costs** | Prevents margin erosion | Heavy operations cost more credits | ✅ Implemented |
| **Feature gating** | Prevents free-tier abuse | Video requires Pro+, premium audio requires Pro+ | ✅ Implemented |
| **Purchased credits first** | Extends monthly allocation | Deduct pack credits before monthly balance | ✅ Implemented |
| **Batch API for avatars** | 50% on images | Queue non-urgent avatar generation | ☐ Phase 4 |
| **Cache popular styles** | Variable | Pre-generate common vibe×color combos | ☐ Phase 4 |
| **Aggressive prompt optimization** | 20–40% on tokens | Minimize prompt length; cache system prompts | ☐ Phase 4 |

---

## 7. Risk-Adjusted Scenarios

### 7.1 Best Case
- Viral TikTok moment → 100K users in 3 months
- Paid conversion at 10%+ → $120K MRR by Month 12
- Raise $2M seed → accelerate mobile apps

### 7.2 Base Case (shown above)
- Steady organic growth → 50K users by Month 12
- Paid conversion at 8.5% (combined tiers) → $36K MRR by Month 12
- Break-even by Month 8–9

### 7.3 Worst Case
- Low adoption → 10K users by Month 12
- Paid conversion at 3% → $4K MRR
- **Pivot options:** License technology as API, pivot to B2B (publishers/educators), reduce to text+avatar only (cut Veo costs)

---

## 8. Key Financial Controls

| Control | Implementation |
|---------|----------------|
| **Credit-based usage caps** per user | Enforced in `credit.service.ts`; prevents runaway costs |
| **Low credit warning** | UI badge turns red + pulses when credits < 5 |
| **Transaction audit trail** | Every debit/credit recorded in `credit_transactions` collection |
| **Feature gates per tier** | Video/premium audio gated to Pro+; prevents margin erosion on lower tiers |
| **Refund on failed generation** | Credits auto-refunded if AI call fails |
| **Real-time cost dashboard** | Cloud Monitoring + `usage_events` Firestore collection |
| **Monthly burn rate review** | Calendar invite; min 6-month runway policy |
| **API cost alerts** | Budget alerts at 50%, 80%, 100% of monthly target |
| **Model cost comparison** | Monthly audit: is there a cheaper model that maintains quality? |

---

## 9. Funding Strategy

### 9.1 Funding Path

| Round | Timing | Amount | Purpose |
|-------|--------|--------|---------|
| **Bootstrap** | Now | $0 + Credits | Build MVP, launch beta |
| **Google Startup Credits** | Now (apply) | $200K–$350K | Cloud costs for 12–18 months |
| **Pre-Seed** | Month 3–6 | $50K–$100K (angels) | Design, marketing, contractor |
| **Seed** | Month 9–12 | $500K–$1M | Scale team, marketing, mobile apps |
| **Series A** | Month 18–24 | $3M–$5M | Scale operations, international |

### 9.2 Use of Funds (Seed Round — $750K)

| Category | Allocation | % |
|----------|-----------|---|
| Engineering (2 FTE) | $300K | 40% |
| Marketing & Growth | $150K | 20% |
| Design & UX | $75K | 10% |
| Cloud & Infrastructure | $75K | 10% |
| Operations & Legal | $75K | 10% |
| Reserve | $75K | 10% |
