/**
 * Merges PDF-spec step body copy into kit-shaped API data (Lookup → StepFlow).
 * Keys: situation_key (daily, pitch, interview, performance, negotiation, presentation, difficult)
 *       vibe_key (any, calm, power, playful)
 */
import {KIT_STEP_TEXTS} from './kitStepTextsData';

export function getStepTextsForKit(situationKey, vibeKey) {
  const sk = normalizeSituationKey(situationKey || 'daily');
  const vk = vibeKey || 'any';
  if (sk === 'daily') {
    return KIT_STEP_TEXTS.daily?.any ?? null;
  }
  const row = KIT_STEP_TEXTS[sk];
  if (!row) return null;
  return row[vk] ?? null;
}

function normalizeSituationKey(key) {
  if (key === 'interview_career') return 'interview';
  return key;
}

/**
 * @param {object|null} data - kit from kitToAppShape
 * @param {string} situationKey
 * @param {string} vibeKey
 */
export function mergePdfStepTextsIntoKit(data, situationKey, vibeKey) {
  if (!data) return data;
  const t = getStepTextsForKit(situationKey, vibeKey);
  if (!t) return data;

  const m = (arr, quote) =>
    arr?.length
      ? [{...arr[0], quote}]
      : [{quote, mantra_step_image: {url: ''}}];

  return {
    ...data,
    _mantra_sc: m(data._mantra_sc, t.mantra),
    _body_reset_sc: m(data._body_reset_sc, t.bodyReset),
    _grounding_belief_sc: m(data._grounding_belief_sc, t.groundingBelief),
    _mental_reframe_sc: m(data._mental_reframe_sc, t.mentalReframe),
    _ending_ritual_sc: m(data._ending_ritual_sc, t.endingRitual),
    _bonus_tip_sc: m(data._bonus_tip_sc, t.bonusTip),
  };
}
