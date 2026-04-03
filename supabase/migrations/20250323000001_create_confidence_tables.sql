-- Confidence App Schema for Supabase
-- Run this migration in Supabase SQL Editor or via supabase db push

-- Situations: Pitch, Interview, Performance, etc.
CREATE TABLE IF NOT EXISTS situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vibes: Calm & Grounded, Pumped & Powerful, Playful & Loose, Any
CREATE TABLE IF NOT EXISTS vibes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kits: One per (situation, vibe) - full content
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  situation_id UUID REFERENCES situations(id) ON DELETE CASCADE,
  vibe_id UUID REFERENCES vibes(id) ON DELETE CASCADE,
  kit_name TEXT NOT NULL,
  body_reset TEXT NOT NULL,
  grounding_belief TEXT NOT NULL,
  mental_reframe TEXT NOT NULL,
  ending_ritual TEXT NOT NULL,
  mantra TEXT NOT NULL,
  bonus_tip TEXT NOT NULL,
  voice_audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(situation_id, vibe_id)
);

-- Device sessions: tracks current situation+vibe per device (for lookup)
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  situation_id UUID REFERENCES situations(id) ON DELETE SET NULL,
  vibe_id UUID REFERENCES vibes(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id)
);

-- RLS: Allow anonymous read for kits, situations, vibes; upsert for device_sessions
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for content tables (no auth required for confidence content)
CREATE POLICY "Allow public read on situations" ON situations
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on vibes" ON vibes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on kits" ON kits
  FOR SELECT USING (true);

-- Device sessions: allow insert/update by anyone (device_id is the identifier)
CREATE POLICY "Allow all on device_sessions" ON device_sessions
  FOR ALL USING (true) WITH CHECK (true);
