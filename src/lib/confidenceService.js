/**
 * Confidence Service (Supabase)
 *
 * Handles:
 * - getStarted: init (no persistent device tracking)
 * - editSituation / editMood: validate keys (no device_sessions)
 * - confidenceLookup: fetch kit by situation + vibe keys
 */
import {supabase} from './supabase';
import {mergePdfStepTextsIntoKit} from '@constants/kitStepTexts/mergeKitStepTexts';
import {getStepHeroUrls} from '@constants/stepHeroImages';

/** Convert Google Drive view URL to direct download URL for mobile playback */
function toDirectAudioUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  return url; // already direct or other host
}

/**
 * Transform kit row from Supabase into app-shaped response
 * @param {string} situationKey - request key (daily, pitch, …) for step hero art
 * @param {string} vibeKey - request key (any, calm, power, playful)
 */
function kitToAppShape(kit, situation, vibe, situationKey, vibeKey) {
  if (!kit) return null;
  const rawAudio = kit.voice_audio_url || '';
  const sk = situationKey || 'daily';
  const vk = vibeKey || 'any';
  const hero = getStepHeroUrls(sk, vk);
  return {
    kit_name: kit.kit_name,
    kit_audio: toDirectAudioUrl(rawAudio) || rawAudio,
    _situation_sc: situation ? [{name: situation.title}] : [],
    _vibes_sc: vibe ? [{title: vibe.title}] : [],
    _mantra_sc: [{quote: kit.mantra, mantra_step_image: {url: hero.mantra}}],
    _body_reset_sc: [{quote: kit.body_reset, bodyreset_step_images: {url: hero.body}}],
    _grounding_belief_sc: [
      {quote: kit.grounding_belief, groundingbelief_step_image: {url: hero.grounding}},
    ],
    _mental_reframe_sc: [
      {quote: kit.mental_reframe, mentalreframe_step_image: {url: hero.reframe}},
    ],
    _ending_ritual_sc: [{quote: kit.ending_ritual, endingritual_step_image: {url: hero.ritual}}],
    _bonus_tip_sc: [{quote: kit.bonus_tip, bonustip_step_image: {url: hero.bonus}}],
  };
}

/**
 * Get situation by key
 */
async function getSituationByKey(key) {
  if (!supabase) return null;
  const {data} = await supabase
    .from('situations')
    .select('*')
    .eq('key', key)
    .single();
  return data;
}

/**
 * Get vibe by key
 */
async function getVibeByKey(key) {
  if (!supabase) return null;
  const {data} = await supabase
    .from('vibes')
    .select('*')
    .eq('key', key)
    .single();
  return data;
}

/**
 * Direct lookup by situation + vibe keys
 */
async function lookupBySituationAndVibe(situationKey, vibeKey) {
  if (!supabase) return null;
  const sit = await getSituationByKey(situationKey);
  const vibe = await getVibeByKey(vibeKey);
  if (!sit || !vibe) return null;

  const {data: kit} = await supabase
    .from('kits')
    .select('*, situations(*), vibes(*)')
    .eq('situation_id', sit.id)
    .eq('vibe_id', vibe.id)
    .single();

  return kit
    ? kitToAppShape(kit, kit.situations, kit.vibes, situationKey, vibeKey)
    : null;
}

export const confidenceService = {
  /**
   * POST get_started — no device tracking; session is implicit per user flow.
   */
  async getStarted() {
    return {ok: true};
  },

  /**
   * PATCH situation — validate situation exists (no per-device storage).
   */
  async editSituation({situation, confidence_id}) {
    const situationKey = situationToKey(situation);
    const sit = await getSituationByKey(situationKey);
    if (!sit) return null;
    return {ok: true};
  },

  /**
   * PATCH mood — validate vibe exists (no per-device storage).
   */
  async editMood({mood, confidence_id}) {
    const vibeKey = moodToKey(mood);
    const vibe = await getVibeByKey(vibeKey);
    if (!vibe) return null;
    return {ok: true};
  },

  /**
   * GET Confidence_lookup — fetch kit by situation_key + vibe_key (defaults: daily / any).
   */
  async confidenceLookup({situation_key, vibe_key}) {
    const sk = situation_key || 'daily';
    const vk = vibe_key || 'any';
    if (!supabase) return null;

    const data = await lookupBySituationAndVibe(sk, vk);

    if (!data) {
      const {data: first} = await supabase
        .from('kits')
        .select('*, situations(*), vibes(*)')
        .limit(1)
        .single();
      if (first) {
        const shaped = kitToAppShape(first, first.situations, first.vibes, sk, vk);
        return mergePdfStepTextsIntoKit(shaped, sk, vk);
      }
      return null;
    }

    return mergePdfStepTextsIntoKit(data, sk, vk);
  },

  lookupBySituationAndVibe,
};

function situationToKey(s) {
  if (!s) return 'daily';
  const m = {
    'Daily Boost': 'daily',
    'Just Give Me a Daily Boost': 'daily',
    Pitch: 'pitch',
    Interview: 'interview',
    'Interview / Career Transition': 'interview_career',
    'Interview /Career Transition': 'interview_career',
    'Career Transition': 'interview_career',
    Performance: 'performance',
    'High Pressure Moments': 'performance',
    'Performance / High Pressure Moments': 'performance',
    Negotiation: 'negotiation',
    Presentation: 'presentation',
    'Difficult Conversations': 'difficult',
    'Difficult Conversation': 'difficult',
  };
  return m[s] || String(s).toLowerCase().replace(/\s+/g, '_');
}

function moodToKey(m) {
  if (!m) return 'any';
  const m2 = {
    'Calm & Grounded': 'calm',
    'Pumped & Powerful': 'power',
    'Playful & Loose': 'playful',
    Any: 'any',
  };
  return m2[m] || m.toLowerCase().replace(/\s+/g, '_');
}
