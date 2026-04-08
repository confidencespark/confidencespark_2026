/**
 * Mantra step audio: Google Drive file IDs → direct download URLs for playback.
 * Keys align with HomeScreen / step flow: situation_key × vibe_key.
 *
 * @see mergeKitStepTexts — normalizeSituationKey maps interview_career → interview
 */

/** `https://drive.google.com/file/d/<id>/view` → streamable URL for react-native-audio-recorder-player */
export function driveDirectDownloadUrl(fileId) {
  if (!fileId) return '';
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

const DAILY = '1RM2s4fBz7ujOed4c5cpej_-F8UZYIlTn';

/** Google Drive file IDs by situation_key → vibe_key (calm | power | playful | any) */
const MANTRA_AUDIO_IDS = {
  daily: {
    any: DAILY,
    calm: DAILY,
    power: DAILY,
    playful: DAILY,
  },
  pitch: {
    calm: '1H09KaOi4kxYKWFi-YH7wV_FQCUPt_AXR',
    power: '1e5E_iaI6rgOsjkqGdv-cEJr6jk7vsi6a',
    playful: '1xoqnyRRP0JDD40ZynPfS2KqqR54P4fwx',
  },
  interview: {
    calm: '1ETrtCNjGhKx6oa0efHd7-cmhWkQo1dWu',
    power: '1pK5QxlXLyiMYdlNWK4GJ6TTHad8oSWg0',
    playful: '19Oyaj0JrN0geV9IYvZImpmfcAa_0rs3e',
  },
  performance: {
    calm: '19GsM3RmaoM2dHrLZbU6V9Ptqxe7Bky_g',
    power: '1d1uQPha27TfH0ZuPTzkYupdWPwvveR0E',
    playful: '1VbFA1ZPmLBa6BKjj7ytN8rxUYjuVZdjc',
  },
  negotiation: {
    calm: '10QpcGfccPoTm-AIGhCdpWAaG4b2nGxI4',
    power: '1v6pe4EDKwEBfD0jiRES6wllTf2fcPxQn',
    playful: '1v5xfD2vFrT-8XtiPza2_cMptyGHFjAXu',
  },
  presentation: {
    calm: '19ZWONlFnVcPFlsMJmn24noXPqefysfpN',
    power: '12Uya9bR1O1HZJwuKgXgtZY83i-zPgbtf',
    playful: '1b_jU6LnIUdr59ZSd3nkI2MAD18rAoU-Z',
  },
  difficult: {
    calm: '1tWh5u6cyLUMf6Cvwj896D_1xYez5tcm3',
    power: '1yK5limQkHMSc3TIuJJ9m97acrdi1Bvv5',
    playful: '1vxpW6oLOwJ98c7myUKy4C0lo0RganQ7k',
  },
};

function normalizeSituationKey(key) {
  if (!key) return 'daily';
  const k = String(key).toLowerCase();
  if (k === 'interview_career') return 'interview';
  return k;
}

function resolveVibeKey(vibeKey, situationKey) {
  const sk = normalizeSituationKey(situationKey);
  let vk = (vibeKey || 'any').toLowerCase();
  if (sk === 'daily') return 'any';
  if (vk === 'any') return 'calm';
  return vk;
}

/**
 * @param {string} [situationKey] e.g. daily, pitch, interview, performance, negotiation, presentation, difficult
 * @param {string} [vibeKey] e.g. any, calm, power, playful
 * @returns {string} direct download URL or '' if unknown
 */
export function getMantraAudioUrl(situationKey, vibeKey) {
  const sk = normalizeSituationKey(situationKey);
  const vk = resolveVibeKey(vibeKey, situationKey);
  const row = MANTRA_AUDIO_IDS[sk];
  if (!row) return '';
  const id = row[vk] ?? row.calm ?? row.any;
  return id ? driveDirectDownloadUrl(id) : '';
}
