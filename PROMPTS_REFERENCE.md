# 📋 AI Prompt Reference

This document captures the exact base prompts currently sent to OpenRouter from the Supabase Edge Functions. Dynamic placeholders (e.g., `${category}`) are filled at runtime with the users configuration values before the request is sent.

---

## 🎯 Viral Ideas Prompt (`generate-ideas`)

**Dynamic values:**
- `${category}`  business category selected by the user
- `${businessName}`  business name saved in configuration
- `${mainProduct}` / `${emotion}`  derived from the vision analysis response
- `${model}`  optional override (defaults to `openai/gpt-4o-mini`)

```text
Generate 6 viral content ideas for a ${category} business called "${businessName}" featuring "${mainProduct}" with ${emotion} vibe.

Each idea should be a complete JSON object in this format (respond ONLY with JSON array, no extra text):
[
  {
    "id": "idea_1",
    "title": "Short catchy title",
    "description": "2-3 sentence description of the video concept",
    "why_viral": "Why this idea would get engagement (use psychology/trend)",
    "cta_template": "Call-to-action text with {{contact}} placeholder",
    "estimated_duration_seconds": 15,
    "recommended_model": "Kling 1.6"
  },
  ...
]

Categories of ideas to explore: trending sounds, before-after transformations, testimonials, behind-the-scenes, quick tips, comparison videos.
Models available: Luma Ray 2, Kling 1.6, Runway Gen-3, Pika 2.1.
Keep ideas specific to ${category} industry best practices.
```

---

## 📝 Copy Prompt (`generate-copy`)

**Dynamic values:**
- `${category}`  business category
- `${businessName}`  business name
- `${mainProduct}`  main product detected/selected
- `${contactText}`  formatted WhatsApp/phone
- `${address}`  business address from config
- `${toneDescription}`  category-specific tone (handled in code)

```text
Create 5 viral short-form video copy variations for a ${category} business.

Business: "${businessName}"
Product: "${mainProduct}"
Contact: "${contactText}"
Address: "${address}"

Generate 5 DIFFERENT copy options in JSON format (ONLY JSON, no extra text):
[
  {
    "id": "copy_1",
    "text": "Complete 1-2 sentence copy with emojis integrated naturally, CTA included",
    "emoji_count": 2,
    "viral_score": 8,
    "style": "urgent",
    "audience_target": "impulse buyers"
  },
  ...
]

Requirements:
- Each copy 1-2 sentences max (short for TikTok/Reels)
- Include 1-3 relevant emojis naturally integrated
- Include CTA (call to action) with contact info
- Target different audiences: impulse buyers, quality seekers, price hunters, trend followers, loyalty seekers
- Vary the emotional angle: urgency, exclusivity, curiosity, aspiration, social proof
- Viral scores 6-9 based on engagement potential
- Copy must be in SPANISH for Latin American audience
- Keep tone ${toneDescription}
```

---

## 🎬 Style Prompt (`generate-styles`)

**Dynamic values:**
- `${category}`  business category
- `${mainProduct}`  focus product/service
- `${ideaTitle}`  selected viral idea title

```text
Generate 4 different video style options for a short-form video in a ${category} business context.

Idea concept: "${ideaTitle}"
Product focus: "${mainProduct}"

Generate 4 DIFFERENT style options as JSON (ONLY JSON, no extra text):
[
  {
    "id": "style_1",
    "name": "Style Name",
    "description": "How the video looks visually",
    "camera_movement": "static/zoom/pan/dynamic",
    "music_tempo_bpm": 120,
    "duration_seconds": 15,
    "mood": "energetic/elegant/playful/professional",
    "best_for": "what type of viewer"
  },
  ...
]

Requirements:
- Vary camera movements and visual treatments
- BPM should match mood: energetic (140+), professional (100-120), playful (110-130), elegant (80-100)
- Duration: mix of 15s, 20s, 25s, 30s options
- Styles should be production-ready descriptions
- Consider ${category} audience preferences
- Include both fast-paced and smooth visual options
```

---

Feel free to adapt these prompts if you need to experiment with different AI behaviors or tone adjustments.
