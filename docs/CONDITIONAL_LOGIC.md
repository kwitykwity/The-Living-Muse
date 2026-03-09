# 🌳 The Living Muse — Conditional Logic Trees

**Version:** 1.0
**Date:** March 8, 2026

---

## 1. Emotional Intelligence Engine — Core Decision Tree

The Muse doesn't generate poetry randomly. It follows a structured emotional logic system that analyzes user input and adapts the visual, textual, and auditory output in real-time.

```mermaid
flowchart TD
    INPUT[User Input<br/>Text or Speech] --> CLASSIFY[Gemini Sentiment<br/>Classification]

    CLASSIFY --> SAD{Sentiment: Sad?}
    CLASSIFY --> HAPPY{Sentiment: Happy?}
    CLASSIFY --> ANGRY{Sentiment: Angry?}
    CLASSIFY --> NEUTRAL{Sentiment: Neutral?}
    CLASSIFY --> INTERRUPT{User Interrupted?}
    CLASSIFY --> FINISH{User said<br/>'Finish it'?}

    SAD -->|Yes| SAD_R["🔵 Shift avatar to deep blues/purples<br/>🎵 Lyria: minor key, slow tempo<br/>📝 Generate melancholic haiku (5-7-5)<br/>🎤 Voice: soft, contemplative"]

    HAPPY -->|Yes| HAPPY_R["🟡 Shift avatar to warm golds/pinks<br/>🎵 Lyria: major key, upbeat<br/>📝 Generate celebratory free verse<br/>🎤 Voice: bright, energetic"]

    ANGRY -->|Yes| ANGRY_R["🔴 Shift avatar to deep reds/blacks<br/>🎵 Lyria: percussion-heavy, intense<br/>📝 Generate fierce spoken word<br/>🎤 Voice: powerful, rhythmic"]

    NEUTRAL -->|Yes| NEUTRAL_R["🟣 Keep current palette<br/>🎵 Lyria: ambient, atmospheric<br/>📝 Generate reflective quatrain<br/>🎤 Voice: calm, measured"]

    INTERRUPT -->|Yes| INT_R["⏸️ Pause current performance<br/>📝 Acknowledge with a rhyme:<br/>'You paused my verse mid-flight—<br/>what star shall we reach tonight?'<br/>🔄 Await new user prompt"]

    FINISH -->|Yes| FIN_R["✨ Take user's last sentence<br/>📝 Find perfect closing couplet<br/>🎵 Lyria: crescendo to resolution<br/>🎤 Voice: dramatic, final<br/>🏁 Mark poem as complete"]

    style SAD_R fill:#1e40af,color:#fff
    style HAPPY_R fill:#f59e0b,color:#000
    style ANGRY_R fill:#dc2626,color:#fff
    style NEUTRAL_R fill:#7c3aed,color:#fff
    style INT_R fill:#6b7280,color:#fff
    style FIN_R fill:#059669,color:#fff
```

---

## 2. Pro Tier Quota Logic

```mermaid
flowchart TD
    REQUEST[User Requests Creation] --> CHECK_TIER{Check user.isPro}

    CHECK_TIER -->|isPro == true| PRO_CHECK[Pro Tier Logic]
    CHECK_TIER -->|isPro == false| FREE_CHECK[Free Tier Logic]

    PRO_CHECK --> PRO_QUOTA{Monthly creations<br/>< 15?}
    PRO_QUOTA -->|Yes| PRO_ALLOW["✅ Allow creation<br/>• High-fidelity Veo 3.1 4K<br/>• Unlimited Gemini Live turns<br/>• Lyria background music<br/>• Unwatermarked export"]
    PRO_QUOTA -->|No| PRO_LIMIT["⚠️ Reached monthly cap<br/>Show: 'You've been prolific!<br/>Limit resets on [date]'<br/>Offer: Batch API option<br/>at reduced quality"]

    FREE_CHECK --> FREE_QUOTA{Monthly creations<br/>< 3?}
    FREE_QUOTA -->|Yes| FREE_ALLOW["✅ Allow creation<br/>• Standard resolution (1024px)<br/>• Gemini 3 Flash (draft quality)<br/>• No video performance<br/>• No background music<br/>• Watermarked export"]
    FREE_QUOTA -->|No| FREE_LIMIT["🔒 Free limit reached<br/>Show: 'You've used 3/3<br/>Living Pages this month'<br/>CTA: 'Upgrade to Pro'"]

    style PRO_ALLOW fill:#22c55e,color:#fff
    style FREE_ALLOW fill:#22c55e,color:#fff
    style PRO_LIMIT fill:#f59e0b,color:#000
    style FREE_LIMIT fill:#ef4444,color:#fff
```

---

## 3. Style Persistence Logic

```mermaid
flowchart TD
    GEN[Avatar Generation Request] --> COLOR{user.favoriteColor<br/>set?}

    COLOR -->|Yes: 'purple'| PURPLE["Append to Nano Banana prompt:<br/>'orchid and lavender hues,<br/>deep violet undertones'"]
    COLOR -->|Yes: 'blue'| BLUE["Append to prompt:<br/>'sapphire and azure tones,<br/>ocean-deep mystique'"]
    COLOR -->|Yes: 'gold'| GOLD["Append to prompt:<br/>'warm amber and gold leaf,<br/>sunlit radiance'"]
    COLOR -->|Yes: 'rose'| ROSE["Append to prompt:<br/>'blush pink and rose petals,<br/>soft romantic warmth'"]
    COLOR -->|No / default| DEFAULT["Use vibe preset<br/>default palette"]

    PURPLE --> VIBE
    BLUE --> VIBE
    GOLD --> VIBE
    ROSE --> VIBE
    DEFAULT --> VIBE

    VIBE{user.vibePreset?} --> |Harlem Soul| HS["Add: 'urban texture,<br/>jazz-era warmth,<br/>Harlem Renaissance spirit'"]
    VIBE --> |K-Dreamer| KD["Add: 'ethereal K-pop<br/>aesthetics, pastel dream,<br/>soft light flares'"]
    VIBE --> |Orchid Noir| ON["Add: 'dark botanical,<br/>gothic orchid motifs,<br/>shadow and mystery'"]
    VIBE --> |Cosmic Bloom| CB["Add: 'celestial flowers,<br/>nebula colors,<br/>cosmic garden'"]

    HS --> FINAL[Final Nano Banana Prompt:<br/>base style + color + vibe]
    KD --> FINAL
    ON --> FINAL
    CB --> FINAL

    style FINAL fill:#9333ea,color:#fff
```

---

## 4. Conversational Verse — Response Selection Logic

```mermaid
flowchart TD
    INPUT[User Utterance] --> PARSE[Parse Intent +<br/>Sentiment + Keywords]

    PARSE --> TYPE{Input Type?}

    TYPE -->|Statement| STMT[Generate responding verse<br/>that builds on user's theme]
    TYPE -->|Question| QUES[Answer in verse form<br/>incorporating user's curiosity]
    TYPE -->|Command| CMD{Command Type?}
    TYPE -->|Silence > 5s| SILENCE["Muse prompts gently:<br/>'The silence speaks—<br/>shall I give it words?'"]

    CMD -->|"Finish it"| CLOSE[Generate closing couplet<br/>from conversation context]
    CMD -->|"Change mood"| MOOD[Shift emotional palette<br/>Re-classify + regenerate]
    CMD -->|"Start over"| RESET[Clear conversation context<br/>Fresh prompt invitation]
    CMD -->|"Louder/Softer"| TONE[Adjust voice intensity<br/>Keep same content style]
    CMD -->|"Make it rhyme"| RHYME[Switch to strict rhyme scheme<br/>AABB or ABAB pattern]

    STMT --> TURN[Increment turn counter<br/>Update context window]
    QUES --> TURN
    CLOSE --> END[End Conversation<br/>Save to Gallery]
    MOOD --> TURN
    SILENCE --> TURN
    RHYME --> TURN

    TURN --> LIMIT{Turn count<br/>> max turns?}
    LIMIT -->|Pro user| CONTINUE[Continue<br/>Unlimited turns]
    LIMIT -->|Free user| CUTOFF["Conversation limit reached<br/>'To keep our verse alive,<br/>upgrade to Pro'"]

    style CLOSE fill:#059669,color:#fff
    style CUTOFF fill:#ef4444,color:#fff
    style CONTINUE fill:#22c55e,color:#fff
```

---

## 5. Content Safety — Moderation Logic

```mermaid
flowchart TD
    CONTENT[Generated Content<br/>Text / Image / Video] --> SAFETY[Vertex AI<br/>Safety Filters]

    SAFETY --> SCORE{Safety Score}

    SCORE -->|Safe| PASS["✅ Deliver to user"]
    SCORE -->|Low risk| WARN["⚠️ Deliver with note:<br/>'This content may contain<br/>sensitive themes'"]
    SCORE -->|Medium risk| BLOCK_SOFT["🔒 Block content<br/>Auto-regenerate with<br/>safer prompt constraints"]
    SCORE -->|High risk| BLOCK_HARD["🚫 Block + log<br/>Do not deliver<br/>Flag for review"]

    BLOCK_SOFT --> RETRY{Retry count < 3?}
    RETRY -->|Yes| REGEN[Regenerate with<br/>safety-enhanced prompt]
    RETRY -->|No| FAIL["'We couldn't create<br/>something safe this time.<br/>Try a different direction.'"]

    REGEN --> SAFETY

    style PASS fill:#22c55e,color:#fff
    style WARN fill:#f59e0b,color:#000
    style BLOCK_SOFT fill:#ef4444,color:#fff
    style BLOCK_HARD fill:#991b1b,color:#fff
```

---

## 6. Logic Reference Table

| Logic ID | Name | Condition | Action |
|----------|------|-----------|--------|
| L-A | Pro Quota Check | `user.isPro == true` | Allow Veo 3.1 4K + unlimited Gemini Live turns |
| L-B | Style Persistence | `user.favoriteColor == 'purple'` | Append "orchid and lavender hues" to all image prompts |
| L-C | Sad Sentiment | Sentiment classifier → negative | Shift blues/purples, haiku, minor key music |
| L-D | Interruption Handler | User speech during Muse performance | Pause, rhyme acknowledgment, await new prompt |
| L-E | Close Command | User says "finish it" | Generate closing couplet from context |
| L-F | Free Limit | `user.monthlyCreations >= 3 && !user.isPro` | Block creation, show upgrade prompt |
| L-G | Content Safety | Vertex AI safety score > threshold | Block, auto-regenerate, or flag for review |
| L-H | Vibe Injection | `user.vibePreset` set | Add vibe-specific style tokens to all prompts |
| L-I | Silence Detection | No user input > 5 seconds | Muse prompts gently in verse |
| L-J | Mood Change | User requests mood change | Re-classify sentiment, regenerate with new palette |
