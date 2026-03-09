# Handover Documentation: The Living Muse

This document provides a technical matrix of all services, APIs, and patterns used in The Living Muse to facilitate a smooth team onboarding.

## 🛠️ Service Architecture Matrix

| Service | Technology | Role | Key File(s) |
| :--- | :--- | :--- | :--- |
| **Orchestrator** | Gemini 3.1 Pro | Logic & Intent Coordination | `orchestrator.ts` |
| **Poetry** | Gemini 3.1 Pro | Context-aware verse generation | `poem.service.ts` |
| **Visuals** | Veo 3.1 / Imagen 3 | Cinematic video & stylized avatars | `video.ts`, `muse.ts` |
| **Audio** | Lyria 3 | Sentiment-driven vocal synthesis | `audio.service.ts` |
| **Memory/RAG** | Firestore Vector | Embedding search & context retention | `vector.service.ts` |
| **Payments** | Stripe | Subscriptions & Credit System | `stripe.service.ts` |
| **Monitoring** | DeepChecks/GCP | AI Latency, Cost, & Safety auditing | `monitoring.service.ts` |

---

## 🔑 Secret & Config Management
We use **Firebase Secret Manager** for zero-trust security.
- **`STRIPE_SECRET_KEY`**: Production billing access.
- **`STRIPE_WEBHOOK_SECRET`**: Incoming payment verification.
- *Refer to `docs/deployment_guide.md` for setup.*

---

## 🏗️ Team Onboarding Notes

### 1. The "Double-Buffer" Prompting Pattern
All LLM calls use a "Double-Buffer" pattern:
1. **Buffer A**: Raw user intent -> Structural JSON analysis.
2. **Buffer B**: Structural JSON -> Soulful creative output.
*This ensures creativity never breaks the data architecture.*

### 2. The Manifestation Waterfall
Asset generation follows a strict sequence to minimize user wait-time:
`Poem (Instant) -> Avatar (Fast) -> Audio (Medium) -> Video (Long-running Job)`

### 3. Local Development Flow
To run the environment locally:
```bash
# Frontend
cd app && npm run dev
# Backend (Local Emulators)
cd functions && npm run serve
```

### 4. Verification Workflow
Always run the pre-flight check before significant production changes:
`npm run preflight` (in `functions` directory).

---
*The Living Muse — A technical manifestation of artistic soul.*
