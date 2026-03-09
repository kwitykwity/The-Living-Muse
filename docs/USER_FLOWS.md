# 🚶 The Living Muse — User Flows & Journey Maps

**Version:** 1.0
**Date:** March 8, 2026

---

## 1. Primary User Flow — Creating a Living Page

```mermaid
flowchart TD
    START([User Opens App]) --> AUTH{Authenticated?}
    AUTH -->|No| LOGIN[Sign In / Sign Up<br/>Google / Apple / Email]
    AUTH -->|Yes| ONBOARD{First Visit?}
    LOGIN --> ONBOARD

    ONBOARD -->|Yes| VIBE[Select Vibe Preset<br/>Harlem Soul / K-Dreamer /<br/>Orchid Noir / Cosmic Bloom]
    ONBOARD -->|No| HOME

    VIBE --> COLOR[Pick Favorite Color<br/>Default: Purple]
    COLOR --> HOME[Home Screen<br/>Gallery + Create Button]

    HOME --> CREATE[Tap 'Create Living Page']
    CREATE --> UPLOAD{Photo Source?}
    UPLOAD -->|Camera| SELFIE[Take Selfie]
    UPLOAD -->|Gallery| PICK[Pick from Photos]

    SELFIE --> PROCESS
    PICK --> PROCESS

    PROCESS[Orchid Blooming Animation<br/>While Nano Banana processes] --> AVATAR[Avatar Revealed<br/>Orchid Muse Style]

    AVATAR --> POEM[AI Poem Generated<br/>4-line verse displayed]

    POEM --> CHOICE{User Action?}
    CHOICE -->|Edit| EDIT[Edit Poem Text]
    CHOICE -->|Regenerate| REGEN[New Poem Generated]
    CHOICE -->|Speak Response| CONVO[Conversational Mode<br/>Pro Only]
    CHOICE -->|Accept| SAVE

    EDIT --> SAVE
    REGEN --> CHOICE
    CONVO --> SAVE

    SAVE[Save to Gallery] --> VIEW[View Living Page]

    VIEW --> ACTION{User Action?}
    ACTION -->|Export| EXPORT{Pro User?}
    ACTION -->|Perform| PERFORM{Pro User?}
    ACTION -->|Add to Collection| COLLECT[Add to Collection]
    ACTION -->|Share| SHARE[Share Link]

    EXPORT -->|Yes| EXPORT4K[4K Unwatermarked Export]
    EXPORT -->|No| EXPORTSD[SD Watermarked Export]

    PERFORM -->|Yes| PERFGEN[Generate Video<br/>Veo 3 + Lyria 3<br/>30-60s processing]
    PERFORM -->|No| UPSELL[Upgrade to Pro Prompt]

    PERFGEN --> PLAY[Play Performance]

    style START fill:#9333ea,color:#fff
    style PROCESS fill:#d946ef,color:#fff
    style AVATAR fill:#a855f7,color:#fff
    style POEM fill:#8b5cf6,color:#fff
    style SAVE fill:#22c55e,color:#fff
    style PERFGEN fill:#f59e0b,color:#fff
```

---

## 2. Onboarding Flow

```mermaid
flowchart LR
    SPLASH[Splash Screen<br/>'Your story deserves<br/>to bloom'] --> SIGNIN[Sign In Options<br/>Google / Apple / Email]

    SIGNIN --> WELCOME[Welcome Screen<br/>'Let's find your Muse']

    WELCOME --> VIBE1[Vibe: Harlem Soul<br/>Dark, soulful,<br/>jazz-inspired]
    WELCOME --> VIBE2[Vibe: K-Dreamer<br/>Pastel, ethereal,<br/>K-pop influenced]
    WELCOME --> VIBE3[Vibe: Orchid Noir<br/>Deep purple, mysterious,<br/>gothic romance]
    WELCOME --> VIBE4[Vibe: Cosmic Bloom<br/>Space, stars,<br/>celestial wonder]

    VIBE1 --> COLOR
    VIBE2 --> COLOR
    VIBE3 --> COLOR
    VIBE4 --> COLOR

    COLOR[Pick Favorite Color<br/>Color wheel + presets<br/>Default: Purple] --> DONE[Setup Complete<br/>'Your Muse awaits']

    DONE --> HOME[Home / Gallery]
```

---

## 3. User Journey Map — "Maya" (Aspiring Poet)

| Stage | Awareness | Consideration | Onboarding | First Use | Habit | Advocacy |
|-------|-----------|---------------|------------|-----------|-------|----------|
| **Action** | Sees TikTok of Living Page | Downloads app | Selects "Harlem Soul" vibe | Creates first Living Page | Creates 3+ pages/week | Shares on Instagram |
| **Touchpoint** | TikTok Reel | App Store | Onboarding flow | Create flow | Gallery + notifications | Social export |
| **Emotion** | 😮 "Wow, what is this?" | 🤔 "Can I make this?" | 😊 "This feels like me" | 🤩 "My poem came to life!" | 💜 "I can't stop creating" | 🎉 "Everyone needs to see this" |
| **Pain Point** | — | "Is this free?" | "Too many steps?" | "Will the poem be good?" | "I'm out of free pages" | "Watermark is annoying" |
| **Opportunity** | Viral hook | Clear free tier | 4-step onboarding | Quality AI output | Pro upsell | Remove watermark = Pro |

---

## 4. User Journey Map — "Kai" (Social Creative)

| Stage | Awareness | Consideration | First Use | Conversion | Retention |
|-------|-----------|---------------|-----------|------------|-----------|
| **Action** | Influencer post with Muse tag | Visits landing page | Creates Living Page | Upgrades to Pro for 4K | Daily creator |
| **Touchpoint** | Instagram | Website | App | In-app purchase | Push + email |
| **Emotion** | 😍 "This is so aesthetic" | 🤔 "Better than Prisma?" | 🎨 "Way more unique" | 💰 "Worth it for 4K" | 🔄 "Part of my workflow" |
| **Key Metric** | Impression → click rate | Visit → download rate | Download → first create | Free → Pro conversion | D7 / D30 retention |
| **Target** | 5% click rate | 30% download rate | 60% activation | 5% conversion | 40% D7, 25% D30 |

---

## 5. Pro Upgrade Flow

```mermaid
flowchart TD
    TRIGGER{Upgrade Trigger} -->|Hit free limit| LIMIT["You've used 3/3<br/>Living Pages this month"]
    TRIGGER -->|Tap Pro feature| LOCKED["This feature requires Pro"]
    TRIGGER -->|Settings| SETTINGS[Account Settings]

    LIMIT --> UPSELL
    LOCKED --> UPSELL
    SETTINGS --> UPSELL

    UPSELL[Pro Upgrade Screen<br/>• Unlimited Living Pages<br/>• 4K unwatermarked export<br/>• Live Conversational Mode<br/>• Background music<br/>• Avatar performances<br/><br/>$9.99/month] --> DECIDE{Decision}

    DECIDE -->|Subscribe| PAYMENT[Payment Flow<br/>Apple Pay / Google Pay /<br/>Stripe]
    DECIDE -->|Not now| DISMISS[Dismiss<br/>Show again after<br/>next trigger]
    DECIDE -->|Living Book| ONETIME[One-Time Purchase<br/>$14.99 for 10-poem export]

    PAYMENT --> CONFIRM[Confirmation<br/>'Welcome to Pro!'<br/>Unlock all features]
    ONETIME --> BOOKFLOW[Select 10 Poems<br/>Generate Living Book]

    style UPSELL fill:#9333ea,color:#fff
    style CONFIRM fill:#22c55e,color:#fff
```

---

## 6. Export & Share Flow

```mermaid
flowchart TD
    VIEW[Viewing Living Page] --> EXPORT[Tap Export]

    EXPORT --> TYPE{Export Type?}
    TYPE -->|Video| VIDEO{Pro User?}
    TYPE -->|Image| IMAGE[Download Avatar + Poem<br/>as image]
    TYPE -->|Link| LINK[Copy shareable link]

    VIDEO -->|Free| WATERMARK[SD Video<br/>with watermark +<br/>'Made with The Living Muse']
    VIDEO -->|Pro| CLEAN[4K Video<br/>No watermark]

    WATERMARK --> DEST{Destination?}
    CLEAN --> DEST

    DEST -->|TikTok| TIKTOK[Open TikTok<br/>with video pre-loaded]
    DEST -->|Instagram| INSTA[Open Instagram<br/>Reels / Stories]
    DEST -->|Save| SAVE[Save to Camera Roll]
    DEST -->|Other| SHARESHEET[System Share Sheet]

    style EXPORT fill:#9333ea,color:#fff
    style CLEAN fill:#22c55e,color:#fff
    style WATERMARK fill:#f59e0b,color:#000
```

---

## 7. Screen Inventory

| # | Screen | Route | Auth Required | Notes |
|---|--------|-------|---------------|-------|
| 1 | Splash | `/` | No | Animated orchid + tagline |
| 2 | Sign In | `/auth` | No | Google / Apple / Email |
| 3 | Onboarding — Vibe | `/onboard/vibe` | Yes | First-time only |
| 4 | Onboarding — Color | `/onboard/color` | Yes | First-time only |
| 5 | Home / Gallery | `/gallery` | Yes | Grid of Living Pages |
| 6 | Create — Photo | `/create/photo` | Yes | Camera or upload |
| 7 | Create — Processing | `/create/processing` | Yes | Orchid bloom animation |
| 8 | Create — Result | `/create/result` | Yes | Avatar + poem display |
| 9 | Living Page View | `/page/:id` | Yes | Full multimedia view |
| 10 | Performance Player | `/page/:id/play` | Yes (Pro) | Video + music playback |
| 11 | Conversational Verse | `/page/:id/converse` | Yes (Pro) | Real-time chat mode |
| 12 | Collections | `/collections` | Yes | List of collections |
| 13 | Collection Detail | `/collections/:id` | Yes | Poems in collection |
| 14 | Living Book Editor | `/book/:id` | Yes | 10-poem layout editor |
| 15 | Settings | `/settings` | Yes | Profile, subscription, vibe |
| 16 | Pro Upgrade | `/upgrade` | Yes | Subscription prompt |
| 17 | Export | `/export/:id` | Yes | Export options |
