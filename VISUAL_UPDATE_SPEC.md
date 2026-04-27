# Visual Update Spec — Revised Pics for Pavlo

Based on client PDF: **Phase 1 Visual Direction (Simple Implementation)**

## Overview

Replace current AI-looking images with consistent, human, calm illustrations. Use Blush (Humaaans) or Storyset. Style: whimsical but not childish, clean, modern, slightly abstract.

---

## 1. Home Screen (Situation Images)

**Current:** `h_1.webp`–`h_6.webp` (6 situations)  
**Location:** `src/features/main/home/HomeScreen.jsx`

**New direction:** Simple symbolic objects per situation (no people or full scenes).
- Clean, minimal objects with subtle shadow, glow, or floating effect
- Soft, rounded, lightly expressive
- Search: "meeting", "presentation", "conversation"
- Use Storyset or Blush scene-based illustrations

| Current Key | Title                    | Suggested Symbol/Object                 |
|------------|--------------------------|----------------------------------------|
| daily      | Just Give Me a Daily Boost | sunrise / refresh / calm object        |
| pitch      | Pitch                    | megaphone or presenting object          |
| interview  | Interview                | handshake / professional               |
| performance| Performance              | stage / spotlight                      |
| negotiation| Negotiation              | balance / handshake                    |
| presentation| Presentation            | microphone / podium                    |

**Optional new situations (from PDF):**
- High-Stakes Moment
- Difficult Conversation

---

## 2. Step Flow Images (Inside Flow)

**Current:** Single `PLACEHOLDER_IMAGE` for all 6 steps in `LookupScreen.jsx`  
**API fields:** `_mantra_sc`, `_body_reset_sc`, `_grounding_belief_sc`, `_mental_reframe_sc`, `_ending_ritual_sc`, `_bonus_tip_sc`

**New direction:** One illustration per step type, reused across all situations. Simple human-adjacent figure, calm, not cartoonish.

| Step             | Search Idea                                      | Communicates                  |
|------------------|--------------------------------------------------|-------------------------------|
| Body Reset       | "standing upright relaxed posture illustration"  | Adjust your body              |
| Grounding Belief | "person calm eyes closed breathing illustration" | You're safe / grounded        |
| Mental Reframe  | "person thinking upward idea illustration"       | Shift perspective             |
| Mantra          | "person centered confident calm illustration"     | Internal voice                |
| Ending Ritual   | "person standing confident forward illustration" | I've got this                 |
| Bonus Tip       | (similar to Mental Reframe or lightbulb/insight) | Extra boost                   |

**Implementation:** 5–7 core images tied to step types, reused everywhere. No unique images per situation.

---

## 3. Style Guidelines

- Neutral colors, simple poses, minimal expressions
- Human and relatable, not generic
- Avoid: childish, startup-generic, weird AI-feeling visuals
- Keep images mostly static; subtle transitions only
- Use existing illustration libraries (Blush/Humaaans, Storyset) — no custom design yet

---

## 4. File Mapping

| Asset Type     | Current Files                          | Action                                  |
|----------------|----------------------------------------|-----------------------------------------|
| Home situations| `h_1.webp` … `h_6.webp`               | Replace with new symbolic-object images |
| Step: Mantra  | `PLACEHOLDER_IMAGE`                    | Dedicated Mantra illustration           |
| Step: Body Reset | `PLACEHOLDER_IMAGE`                 | Dedicated Body Reset illustration       |
| Step: Grounding Belief | `PLACEHOLDER_IMAGE`             | Dedicated Grounding Belief illustration |
| Step: Mental Reframe | `PLACEHOLDER_IMAGE`             | Dedicated Mental Reframe illustration   |
| Step: Ending Ritual | `PLACEHOLDER_IMAGE`              | Dedicated Completion illustration       |
| Step: Bonus Tip | `PLACEHOLDER_IMAGE`                 | Dedicated Bonus Tip illustration        |

---

## 5. Next Steps

1. Source 6 situation images (symbolic objects) from Blush/Storyset.
2. Source 6 step images (one per type) from Blush/Humaaans.
3. Replace `h_1.webp`–`h_6.webp` in `src/assets/images/`.
4. Update `MOCK_CONFIDENCE_DATA` and API response mapping with final image URLs.
5. Ensure step images are used consistently in `LookupScreen` and `StepFlowScreen`.
