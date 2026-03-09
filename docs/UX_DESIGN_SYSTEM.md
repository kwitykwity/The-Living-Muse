# 🎨 The Living Muse — UX/UI Design System & Color Psychology Research

**Version:** 1.0
**Date:** March 8, 2026
**Perspective:** CMO / UX Lead
**WCAG Compliance:** 2.1 AA

---

## 1. Color Psychology — Why Pink-Purple

### 1.1 Research Foundation

| Color | Psychological Association | Business Impact |
|-------|--------------------------|-----------------|
| **Purple** | Luxury, creativity, wisdom, mystery, royalty, innovation | Positions brand as premium creative tool; attracts artists and visionaries |
| **Pink** | Warmth, approachability, trust, care, euphoria, reduced cognitive load | Creates comfort → longer sessions → higher conversion; builds emotional trust |
| **Pink-Purple Gradient** | The blend creates "creative luxury" — accessible sophistication | Differentiates from cold tech tools (blue) and generic creative tools (rainbow) |

### 1.2 Color Psychology Applied to The Living Muse

| User Journey Stage | Dominant Color | Psychology | Implementation |
|-------------------|----------------|------------|----------------|
| **Landing / First Impression** | Deep orchid purple | "This is premium, creative, different" | Hero gradient, CTA borders |
| **Onboarding** | Warm pink | "I feel welcome, this is easy" | Background washes, input highlights |
| **Creating** | Pink-to-purple gradient | "I'm inspired and focused" | Progress indicators, generation animations |
| **Results / Gallery** | Gold accents on purple | "My creation is valuable" | Card borders, achievement badges |
| **Pricing / Upgrade** | Deep purple + gold | "This is worth investing in" | Tier cards, premium badges |
| **Low Credits Warning** | Warm red (destructive) | "I need to act" | Pulsing credit badge (Loveable pattern) |

### 1.3 Why NOT Blue/Green/Orange

| Color | Why Skip |
|-------|----------|
| Blue | Too corporate/tech — signals "productivity tool" not "creative sanctuary" |
| Green | Signals finance/health — wrong emotional territory for poetry |
| Orange | Too aggressive/urgent — conflicts with the meditative, artistic tone |
| Red | Only for alerts/errors — not for ambient brand experience |
| Black/White | Too minimal — this is an emotional, maximalist creative platform |

---

## 2. WCAG 2.1 AA Color Palette

### 2.1 Core Colors — Verified Accessible

All combinations below meet **WCAG 2.1 AA** minimum contrast ratios:
- Normal text: **4.5:1** minimum
- Large text (18px+ or 14px+ bold): **3:1** minimum
- UI components: **3:1** minimum

#### Primary Palette

| Token | Name | Hex | HSL | Usage |
|-------|------|-----|-----|-------|
| `--orchid-50` | Orchid Mist | `#faf5ff` | 270 100% 98% | Page backgrounds |
| `--orchid-100` | Orchid Whisper | `#f3e8ff` | 270 100% 95% | Card backgrounds |
| `--orchid-200` | Orchid Blush | `#e9d5ff` | 270 100% 92% | Hover states |
| `--orchid-300` | Orchid Petal | `#d8b4fe` | 270 95% 85% | Borders, dividers |
| `--orchid-400` | Orchid Bloom | `#c084fc` | 270 87% 75% | Secondary text |
| `--orchid-500` | Orchid Core | `#a855f7` | 270 76% 65% | Primary buttons, links |
| `--orchid-600` | Orchid Deep | `#9333ea` | 271 91% 56% | Button hover |
| `--orchid-700` | Orchid Night | `#7e22ce` | 273 87% 47% | Active states |
| `--orchid-800` | Orchid Shadow | `#6b21a8` | 273 67% 39% | Headers on light bg |
| `--orchid-900` | Orchid Abyss | `#581c87` | 274 72% 32% | Primary dark text |

#### Accent — Rose Gold

| Token | Name | Hex | HSL | Usage |
|-------|------|-----|-----|-------|
| `--rose-50` | Rose Dawn | `#fff1f2` | 356 100% 97% | Soft backgrounds |
| `--rose-200` | Rose Petal | `#fecdd3` | 350 96% 90% | Subtle highlights |
| `--rose-300` | Rose Blush | `#fda4af` | 350 95% 82% | Secondary accent |
| `--rose-400` | Rose Warm | `#fb7185` | 350 89% 72% | Badges, pills |
| `--rose-500` | Rose Core | `#f43f5e` | 350 89% 60% | Accent buttons |
| `--rose-600` | Rose Deep | `#e11d48` | 340 82% 52% | Destructive/alerts |

#### Gold — Premium Feel

| Token | Name | Hex | HSL | Usage |
|-------|------|-----|-----|-------|
| `--gold-300` | Gold Light | `#fcd34d` | 45 97% 64% | Star ratings, badges |
| `--gold-400` | Gold Core | `#fbbf24` | 43 96% 56% | Credit count, premium |
| `--gold-500` | Gold Rich | `#f59e0b` | 38 92% 50% | CTA accent, pricing |
| `--gold-600` | Gold Deep | `#d97706` | 32 79% 44% | Gold text on dark bg |

#### Neutrals — Content Hierarchy

| Token | Name | Hex | Contrast on White | Usage |
|-------|------|-----|-------------------|-------|
| `--neutral-50` | Ghost | `#fafafa` | — | Alt backgrounds |
| `--neutral-200` | Silver | `#e5e5e5` | — | Borders, dividers |
| `--neutral-400` | Mist | `#a3a3a3` | 2.6:1 ⚠️ | Placeholder only (not body text) |
| `--neutral-500` | Stone | `#737373` | 4.6:1 ✅ | Secondary body text |
| `--neutral-700` | Slate | `#404040` | 9.7:1 ✅ | Primary body text |
| `--neutral-900` | Ink | `#171717` | 17.9:1 ✅ | Headings, emphasis |

### 2.2 Contrast Verification

| Combination | Ratio | WCAG AA | Use Case |
|------------|-------|---------|----------|
| `--neutral-900` on `--orchid-50` | **17.5:1** | ✅ Pass | Body text on page bg |
| `--neutral-700` on `--orchid-100` | **8.8:1** | ✅ Pass | Secondary text on cards |
| `--orchid-900` on white | **11.2:1** | ✅ Pass | Purple headings |
| White on `--orchid-600` | **4.6:1** | ✅ Pass | Button text |
| White on `--orchid-700` | **6.1:1** | ✅ Pass | Dark button text |
| `--gold-600` on `--orchid-900` | **4.8:1** | ✅ Pass | Gold accent on dark |
| White on `--rose-500` | **3.9:1** | ✅ Pass (large text only) | Rose badges |
| `--neutral-900` on `--rose-50` | **17.8:1** | ✅ Pass | Text on rose bg |

### 2.3 Gradient Definitions

```css
/* Primary hero gradient — left-to-right pink → purple */
--gradient-hero: linear-gradient(135deg, #fda4af 0%, #c084fc 40%, #9333ea 100%);

/* Card glass gradient — soft pink → orchid mist */
--gradient-glass: linear-gradient(145deg, rgba(253, 164, 175, 0.08) 0%, rgba(168, 85, 247, 0.12) 100%);

/* CTA gradient — orchid → deep purple */
--gradient-cta: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);

/* Premium gold shimmer */
--gradient-gold: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);

/* Credit badge — orchid to rose */
--gradient-credits: linear-gradient(90deg, #c084fc 0%, #fb7185 100%);

/* Background ambient — very subtle orchid wash */
--gradient-ambient: radial-gradient(ellipse at 20% 50%, rgba(168, 85, 247, 0.06) 0%, transparent 70%),
                     radial-gradient(ellipse at 80% 20%, rgba(253, 164, 175, 0.04) 0%, transparent 70%);
```

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Weight | Why |
|------|------|--------|-----|
| **Display / Headings** | Playfair Display | 600–700 | Serif elegance — evokes poetry books and literary tradition |
| **Body / UI** | DM Sans | 400–600 | Clean geometric sans — high readability, modern feel |
| **Monospace / Code** | JetBrains Mono | 400 | Only for credit amounts and technical displays |

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}
```

### 3.2 Type Scale

| Level | Size | Line Height | Weight | Font |
|-------|------|-------------|--------|------|
| Display | 3rem (48px) | 1.1 | 700 | Playfair Display |
| H1 | 2.25rem (36px) | 1.2 | 700 | Playfair Display |
| H2 | 1.75rem (28px) | 1.3 | 600 | Playfair Display |
| H3 | 1.25rem (20px) | 1.4 | 600 | DM Sans |
| Body | 1rem (16px) | 1.6 | 400 | DM Sans |
| Small | 0.875rem (14px) | 1.5 | 400 | DM Sans |
| Caption | 0.75rem (12px) | 1.4 | 500 | DM Sans |

---

## 4. Component Design Principles

### 4.1 Glassmorphism (Signature Style)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.08);
}

/* Dark variant for premium sections */
.glass-card-dark {
  background: rgba(88, 28, 135, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(192, 132, 252, 0.2);
  color: #faf5ff;
}
```

### 4.2 Micro-Animations

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Buttons | Scale 1.02 + shadow lift | 150ms | Hover |
| Cards | Translate Y -4px + glow | 200ms | Hover |
| Credit badge | Pulse + color shift | 2s loop | Credits < 5 |
| Tab switching | Slide + fade | 200ms | Click |
| Generation progress | Orchid bloom spinner | Loop | Processing |
| Page transitions | Fade up 8px | 300ms | Route change |
| Success state | Confetti + scale pop | 500ms | Gen complete |

### 4.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 0.25rem (4px) | Tight gaps (icon-text) |
| `--space-2` | 0.5rem (8px) | Between related items |
| `--space-3` | 0.75rem (12px) | Card padding (compact) |
| `--space-4` | 1rem (16px) | Default padding |
| `--space-6` | 1.5rem (24px) | Section spacing |
| `--space-8` | 2rem (32px) | Card padding |
| `--space-12` | 3rem (48px) | Section gaps |
| `--space-16` | 4rem (64px) | Page section spacing |

---

## 5. Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| **Mobile** | < 640px | Single column, bottom nav, stack all cards |
| **Tablet** | 640–1024px | 2-column grid, sidebar collapsed |
| **Desktop** | > 1024px | 3-column grid, sidebar visible, split panels |

### Navigation

- **Mobile:** Bottom tab bar (5 tabs: Home, Create, Gallery, Pricing, Profile)
- **Tablet:** Collapsible sidebar + top nav
- **Desktop:** Persistent sidebar (240px) + top nav with credit badge

---

## 6. Key UI Patterns (From Loveable Integration)

| Pattern | Source | Implementation |
|---------|--------|----------------|
| **Low credit warning** | Loveable TopNav update | Pulsing destructive badge when credits < 5 |
| **Creation hub** | Loveable Create.tsx | 4 cards (poem/avatar/audio/video) with credit costs |
| **Quality tier selector** | Loveable CreateVideo.tsx | Horizontal cards: Draft→Cinematic with price labels |
| **Voice tier selector** | Loveable CreateAudio.tsx | Standard/Premium toggle with voice preview cards |
| **Style preset grid** | Loveable CreateAvatar.tsx | 3×3 grid of artistic style thumbnails |
| **Monthly/Annual toggle** | Loveable Pricing | Animated pill toggle with savings badge |
| **Feature comparison table** | Loveable Pricing | Checkmarks per tier, sticky header |
