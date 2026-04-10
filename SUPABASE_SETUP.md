# Supabase Setup for Confidence Catalyst

The app now uses **Supabase** as the backend for confidence content (situations, vibes, kits) instead of Xano.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public** key (Settings → API).

## 2. Run Migrations

In the Supabase SQL Editor, run the migration file:

`supabase/migrations/20250323000001_create_confidence_tables.sql`

Or use the Supabase CLI:

```bash
supabase db push
```

## 3. Seed the Data

Install `dotenv` if needed:

```bash
npm install dotenv
```

Add to your `.env` (or create one):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is in Supabase → Settings → API. Use it only for the seed script.

Run the seed script:

```bash
node scripts/seed-supabase.js
```

This populates:
- **situations**: Daily Boost, Pitch, Interview, Interview / Career Transition, Performance, Negotiation, Presentation, Difficult Conversations
- **vibes**: Any, Calm & Grounded, Pumped & Powerful, Playful & Loose
- **kits**: 22 kit combinations with full content (Body Reset, Grounding Belief, Mental Reframe, Ending Ritual, Mantra, Bonus Tip) from the client PDF

## 4. Configure the App

Ensure your `.env` has:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Rebuild the app after changing env vars:

```bash
npm run android
# or
npm run ios
```

## 5. Audio URLs

The seed script includes Google Drive links for kit voiceovers from the PDF. If you need to use direct MP3 URLs instead, update the `voice_audio_url` column in the `kits` table via Supabase dashboard or a migration.

---

ConfidenceSpark workspace batch.
