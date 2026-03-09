# The Living Muse — Cost Protection & Overage Strategy
## Product Documentation v1.0

> **Purpose**: This document analyzes 4 approaches to protecting margins when users' generation mix 
> skews toward expensive operations (especially video), and recommends the optimal strategy based on 
> industry research and financial modeling.

---

## 1. The Problem

Our credit system assigns different credit costs to different generation types, but all credits 
within a plan are priced identically. This creates a **cost asymmetry**:

| Generation Type | Credits | Our AI Cost | Our Cost per Credit |
|----------------|---------|-------------|---------------------|
| Poem (Gemini)  | 1       | ~$0.005     | $0.005              |
| Avatar (Imagen)| 5       | ~$0.10      | $0.020              |
| Audio (TTS)    | 3       | ~$0.05      | $0.017              |
| Audio Premium  | 8       | ~$0.20      | $0.025              |
| Video (Veo)    | 25      | ~$1.50      | $0.060              |

Video costs us **12x more per credit** than poems. A user who spends all their credits on video 
costs us ~$0.06/credit, while our pricing assumes ~$0.025/credit blended average.

### Worst-Case Scenarios

| Plan    | Revenue | All-Video Cost | Margin  | Status |
|---------|---------|---------------|---------|--------|
| Starter | $9.99   | $4.50         | 55%     | ⚠️ Thin |
| Pro     | $29.99  | $18.00        | 40%     | 🔴 Risk |
| Studio  | $79.99  | $60.00        | 25%     | 🔴 Danger |

---

## 2. Industry Research: How Competitors Handle This

### Runway ML (2026)
- **Model**: Variable credit costs per second per model. A 10-sec Gen-4 Video Turbo = 50 credits, 
  but 10-sec Veo 3 with audio = **400 credits** (8x more).
- **Protection**: The credit cost IS the protection — expensive models consume dramatically more credits.
  Veo 3 at 40 credits/sec means a Pro user (2,250 credits) can only generate ~56 seconds of Veo 3 video.
- **Unlimited tier**: $95/mo adds "Explore Mode" for unlimited relaxed-rate generations, but 
  premium models (Veo) are EXCLUDED from Explore Mode.
- **Purchased credits**: Never expire, same rates as plan credits (no restriction).

### Pika Labs (2025-2026)
- **Model**: Credits scale by resolution, duration, and model used. 3-sec standard ≠ 10-sec 1080p.
- **Protection**: Higher quality = more credits consumed. A single 10-sec HD video can cost 5-10 credits.
- **Overage**: Add-on packs priced HIGHER per credit than plan rates (discouraging overuse).
- **Roll-over**: Paid plans carry unused credits forward (reducing urgency to burn).

### Sora 2 / OpenAI (2025-2026)
- **Model**: Fixed video counts per plan, not a shared credit pool.
  - Plus ($20/mo): 150 priority videos
  - Pro ($200/mo): 500 priority videos
- **Protection**: Hard video caps. No credit system — what you see is what you get.
- **Expensive**: $200/mo for 500 videos = $0.40/video, much higher than credit-based competitors.

### Synthesia (Enterprise)
- **Model**: Per-video-minute pricing. Plans include X minutes/month.
- **Protection**: Direct per-minute metering means cost is always proportional to usage.
- **Overage**: Additional minutes billed at a higher per-minute rate.

### Key Industry Patterns
1. **Variable credit consumption** is the dominant model (Runway, Pika)
2. **No one uses flat credit = flat cost** — everyone scales credit consumption by resource intensity
3. **Premium/expensive models are excluded from "unlimited" tiers** (Runway)
4. **Purchased credits are generally unrestricted** but priced higher than plan rates
5. **Hard caps per type are rare** — they feel restrictive and generate complaints

---

## 3. Four Approaches Analyzed

### Option A: Per-Type Monthly Caps

**How it works**: Each plan has hard monthly limits per generation type regardless of credits.
- Pro: max 12 videos/mo, max 100 poems/mo, etc.

| Pros | Cons |
|------|------|
| ✅ Absolute cost ceiling — impossible to exceed margin | ❌ Feels punitive and arbitrary |
| ✅ Simple to understand | ❌ Users who paid for credits can't use them freely |
| ✅ Easy to implement | ❌ Generates support complaints ("I have credits but can't generate") |
| | ❌ No major competitor uses this approach |

**Financial impact**: Guaranteed margins but at the cost of user experience and competitive positioning.

**Verdict**: ❌ **Not recommended**. No major AI creative platform uses hard per-type caps. It creates 
frustration and contradicts the flexibility promise of a credit system.

---

### Option B: Weighted (Higher) Video Credit Costs

**How it works**: Increase video from 25 to 40-50 credits per generation so margins always work.

At 50 credits/video:
| Plan    | Revenue | Max Videos | All-Video Cost | Margin |
|---------|---------|-----------|---------------|--------|
| Starter | $9.99   | 1         | $1.50         | 85%    |
| Pro     | $29.99  | 6         | $9.00         | 70%    |
| Studio  | $79.99  | 20        | $30.00        | 63%    |

| Pros | Cons |
|------|------|
| ✅ Mathematically guarantees healthy margins | ❌ Sticker shock — "50 credits for one video?!" |
| ✅ Simple, no special rules | ❌ Pro users only get 6 videos/mo (was 12) |
| ✅ Aligns with how Runway/Pika actually work | ❌ May push video-curious users to competitors |
| ✅ No "hidden" restrictions | ✅ Transparent — users see the cost upfront |

**Financial impact**: Solid 63-85% margins across all tiers. Reduces video output per plan.

**Verdict**: ⚠️ **Viable but harsh**. Works if video is truly premium, but may feel too expensive 
relative to competitors where video is the primary product.

---

### Option C: Tiered/Progressive Video Pricing

**How it works**: First N videos/month at 25 credits, subsequent ones cost progressively more.

| Video # This Month | Credits per Video | Rationale |
|--------------------|-------------------|-----------|
| 1-5                | 25 credits        | Included allocation at base rate |
| 6-10               | 40 credits        | +60% premium — moderate users pay more |
| 11-20              | 60 credits        | +140% — heavy users self-regulate |
| 21+                | 80 credits        | +220% — strongly discourages abuse |

Example: Pro user (300 credits) generates 10 videos:
- First 5: 5 × 25 = 125 credits, cost to us: $7.50
- Next 5: 5 × 40 = 200 credits, cost to us: $7.50
- Total: 325 credits needed (exceeds 300 — user buys a pack or stops at 9)
- Our cost: ~$13.50 on $29.99 revenue → **55% margin** ✓

| Pros | Cons |
|------|------|
| ✅ First videos feel affordable | ❌ Complex pricing — harder to communicate |
| ✅ Self-regulating — heavy users naturally throttle | ❌ Surprise cost increases feel deceptive |
| ✅ Protects margins without hard caps | ❌ "Why does my 6th video cost more?" support burden |
| ✅ Rewards moderate users | ❌ No major competitor uses progressive per-type pricing |

**Financial impact**: Good margin protection for heavy users while keeping light users happy.

**Verdict**: ⚠️ **Clever but complex**. The pricing escalation is hard to communicate clearly and 
may feel like a bait-and-switch. Users expect consistent credit costs.

---

### Option D: Separate Video Quota + Credit Pool

**How it works**: Video gets its own monthly quota separate from the credit pool. Credits cover 
text/image/audio only. Video is metered separately.

| Plan    | Credits (text/image/audio) | Video Quota       |
|---------|--------------------------|-------------------|
| Free    | 15 credits               | 0 videos          |
| Starter | 75 credits               | 0 videos          |
| Pro     | 200 credits              | 8 videos/mo       |
| Studio  | 600 credits              | 25 videos/mo      |

At 8 videos/mo for Pro: Our cost = 8 × $1.50 = $12.00
Non-video credits: 200 × $0.02 avg = $4.00
Total cost: $16.00 on $29.99 → **47% margin** ⚠️

| Pros | Cons |
|------|------|
| ✅ Absolute clarity — "you get 8 videos" | ❌ Two systems to track (credits + video quota) |
| ✅ Video cost is perfectly controlled | ❌ Reduces credit pool for other generations |
| ✅ OpenAI/Sora uses this model | ❌ Less flexible than unified credit system |
| ✅ Easy upsell: "need more videos?" | ❌ Users may feel downgraded ("why fewer credits?") |

**Financial impact**: Best cost control for video but margins are thinner overall because the 
credit pool is smaller while video quota has fixed costs.

**Verdict**: ⚠️ **Clean but restrictive**. Works for video-first platforms (Sora) but adds 
complexity to a multi-modal creative platform like ours.

---

## 4. Recommendation: Option B (Weighted Credits) + Smart Safeguards

### Why Option B Wins

After analyzing all 4 approaches and industry practices:

1. **Runway and Pika both use variable credit consumption** — this IS the industry standard.
   Runway charges 5-40 credits/second depending on model. We should do the same.

2. **Users accept that video costs more** — it's common knowledge that video AI is expensive.
   No one expects a video to cost the same as a text poem.

3. **Simplicity wins** — one unified credit system with transparent per-type costs is the 
   easiest to understand, implement, and support.

4. **No hidden restrictions** — users see exactly what each generation costs upfront. No 
   surprise escalation, no "you hit your video cap" frustration.

### Revised Credit Costs

| Generation Type    | Old Credits | New Credits | Our Cost | Margin per Credit |
|-------------------|------------|------------|----------|-------------------|
| Poem              | 1          | **1**      | $0.005   | $0.005            |
| Avatar            | 5          | **5**      | $0.10    | $0.020            |
| Audio (standard)  | 3          | **3**      | $0.05    | $0.017            |
| Audio (premium)   | 8          | **10**     | $0.20    | $0.020            |
| Video (standard)  | 25         | **40**     | $1.00    | $0.025            |
| Video (HD/long)   | —          | **60**     | $2.00    | $0.033            |
| Export HD         | 2          | **2**      | $0.02    | $0.010            |

### Video Sub-Tiers (Like Runway's Model Tiers)

| Video Quality     | Credits | Duration  | Resolution |
|------------------|---------|-----------|------------|
| Quick Draft      | 20      | ≤5 sec   | 720p       |
| Standard         | 40      | ≤10 sec  | 1080p      |
| Premium (HD)     | 60      | ≤15 sec  | 1080p+     |
| Cinematic        | 80      | ≤20 sec  | 4K (Studio)|

### Revised Plan Economics

| Plan    | Revenue | Credits | Max Videos (Standard) | All-Video Cost | Margin |
|---------|---------|---------|----------------------|---------------|--------|
| Free    | $0      | 15      | 0 (can't afford)     | —             | —      |
| Starter | $9.99   | 75      | 1 (+ 35 for other)   | $1.00         | 90%    |
| Pro     | $29.99  | 300     | 7                    | $7.00         | **77%**|
| Studio  | $79.99  | 1,000   | 25                   | $25.00        | **69%**|

### Worst Case (All Standard Video)

| Plan    | Revenue | Max Videos | Cost    | Margin |
|---------|---------|-----------|---------|--------|
| Starter | $9.99   | 1         | $1.00   | 90%    |
| Pro     | $29.99  | 7         | $7.00   | 77%    |
| Studio  | $79.99  | 25        | $25.00  | 69%    |

**All margins stay above 65% even in the worst case.** ✅

### Safeguard: Credit Pack Pricing for Video Protection

Purchased credit packs should price at a slight premium to plan-included credits:

| Pack         | Credits | Price  | $/Credit | Vs Plan Rate |
|-------------|---------|--------|----------|--------------|
| Starter     | 50      | $4.99  | $0.100   | Baseline     |
| Creator     | 150     | $11.99 | $0.080   | -20%         |
| Power       | 500     | $29.99 | $0.060   | -40%         |
| Studio      | 1,500   | $69.99 | $0.047   | -53%         |

At $0.047/credit (best pack rate), a video costs $1.88 — we still profit at ~$0.88 margin per 
video even on the cheapest purchased credits. ✓

### Safeguard: Real-Time Cost Display

Every generation screen shows the exact credit cost BEFORE the user clicks generate:

```
┌──────────────────────────────────┐
│ Generate Video                    │
│                                   │
│ Quality: Standard (1080p, 10sec)  │
│                                   │
│ ⚡ Cost: 40 credits               │
│ 💰 Balance: 185 credits remaining │
│                                   │
│ [Generate Video]                  │
└──────────────────────────────────┘
```

No surprises. Users always know exactly what they're spending.

---

## 5. Credit Pack Protection

**Recommendation: Same rules apply (Option A from the pack question).**

**Rationale:**
1. Purchased credits use the same per-type costs as plan credits — simple, consistent UX.
2. Since we increased video credit costs to 40+, even purchased credits are profitable for video.
3. At the best pack rate ($0.047/credit), a standard video = $1.88 vs $1.00 cost = 47% margin. ✓
4. Restricting purchased credits or creating separate video packs adds unnecessary complexity.
5. Industry standard: Both Runway and Pika allow purchased credits to be used identically to plan credits.

**Exception**: If analytics show >20% of pack purchases are used exclusively for video by 
non-subscribers, consider a modest video surcharge on free-tier pack purchases only (e.g., 
video costs 50 credits instead of 40 for free-tier users buying packs).

---

## 6. Implementation Checklist

- [ ] Update `CREDIT_COSTS` in `src/lib/types.ts` with new values
- [ ] Add video quality tiers (quick/standard/premium/cinematic) to video generation UI
- [ ] Show real-time credit cost + remaining balance on all generation screens
- [ ] Update pricing page with new credit costs per generation type
- [ ] Add video quality selector to CreateVideo page
- [ ] Update edge function credit deduction logic for new costs
- [ ] Add analytics tracking for credit usage by generation type (for ongoing margin monitoring)
- [ ] Set up monthly margin report: actual cost vs revenue per user segment
- [ ] Review credit costs quarterly based on actual AI API cost changes

---

## 7. Monitoring & Adjustment Plan

### Metrics to Track Monthly
1. **Blended cost per credit** — should stay ≤ $0.03
2. **Video share of total credits consumed** — if >40%, review video pricing
3. **Gross margin per tier** — alert if any tier drops below 60%
4. **Credit pack purchase patterns** — watch for video-only pack buyers

### Quarterly Review
- Compare actual AI API costs vs assumptions
- Adjust credit costs if provider pricing changes (Veo, Imagen, Gemini)
- Consider promotional credit bonuses for underused features (poems, avatars)

---

*Document created: March 2026*  
*Next review: June 2026*
