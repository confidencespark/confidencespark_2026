/**
 * Fetches confidence kit data and builds StepFlowScreen route params.
 * Replaces the removed LookupScreen UI while preserving behavior.
 */
import {Image} from 'react-native';
import {navigate} from '@utils/NavigationUtils';
import {mergePdfStepTextsIntoKit} from '@constants/kitStepTexts/mergeKitStepTexts';
import {
  applyStepHeroImagesToKit,
  getStepHeroUrls,
} from '@constants/stepHeroImages';
import {getMantraAudioUrl} from '@constants/mantraAudioUrls';

const STEP_IMAGES = {
  mantra:
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80&auto=format&fit=crop',
  body: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop',
  grounding:
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80&auto=format&fit=crop',
  reframe:
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop',
  ritual:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop',
  bonus:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop',
};

const MOCK_CONFIDENCE_DATA = {
  kit_name: 'Daily Dose',
  kit_audio: '',
  _situation_sc: [{name: 'Daily Boost'}],
  _vibes_sc: [{title: 'Any'}],
  _mantra_sc: [
    {
      quote: "I've earned my seat here. I belong.",
      mantra_step_image: {url: STEP_IMAGES.mantra},
    },
  ],
  _body_reset_sc: [
    {
      quote: 'Take three deep breaths. Ground yourself in this moment.',
      bodyreset_step_images: {url: STEP_IMAGES.body},
    },
  ],
  _grounding_belief_sc: [
    {
      quote: 'I am prepared. I am capable. I am enough.',
      groundingbelief_step_image: {url: STEP_IMAGES.grounding},
    },
  ],
  _mental_reframe_sc: [
    {
      quote: 'This is an opportunity to share my value, not a test to pass.',
      mentalreframe_step_image: {url: STEP_IMAGES.reframe},
    },
  ],
  _ending_ritual_sc: [
    {
      quote: 'Stand tall. Smile. You are ready.',
      endingritual_step_image: {url: STEP_IMAGES.ritual},
    },
  ],
  _bonus_tip_sc: [
    {
      quote: 'Remember: They want you to succeed. Show up fully.',
      bonustip_step_image: {url: STEP_IMAGES.bonus},
    },
  ],
};

function applyMantraAudioToKit(data, situationKey, vibeKey) {
  if (!data) return data;
  const url = getMantraAudioUrl(situationKey || 'daily', vibeKey || 'any');
  if (!url) return data;
  return {...data, kit_audio: url};
}

function finalizeOfflineKit(data, situationKey, vibeKey) {
  if (!data) return data;
  const sk = situationKey || 'daily';
  const vk = vibeKey || 'any';
  const merged = mergePdfStepTextsIntoKit(data, sk, vk) ?? data;
  return applyStepHeroImagesToKit(merged, sk, vk);
}

/**
 * Prefetch the six step hero images and mantra audio for this situation × vibe
 * before opening StepFlowScreen (warms disk/network cache).
 */
export async function preloadStepFlowAssets(
  situationKey,
  vibeKey,
  kitAudio,
) {
  const sk = situationKey ?? 'daily';
  const vk = vibeKey ?? 'any';
  const heroes = getStepHeroUrls(sk, vk);
  const imageUrls = Object.values(heroes).filter(Boolean);
  const trimmed = kitAudio && String(kitAudio).trim();
  const audioUrl = trimmed || getMantraAudioUrl(sk, vk);

  await Promise.all([
    ...imageUrls.map(uri =>
      Image.prefetch(uri).catch(() => undefined),
    ),
    audioUrl
      ? fetch(audioUrl).catch(() => undefined)
      : Promise.resolve(),
  ]);
}

export function buildStepFlowRouteParams(confidenceData, audioPath, situation_key, vibe_key) {
  return {
    hero: {uri: ''},
    initialIndex: 0,
    audio: audioPath || confidenceData?.kit_audio,
    audioCached: !!audioPath,
    steps: [
      {
        key: 'body',
        title: 'Body Reset',
        text: confidenceData?._body_reset_sc?.[0]?.quote,
        hero: confidenceData?._body_reset_sc?.[0]?.bodyreset_step_images?.url,
      },
      {
        key: 'belief',
        title: 'Grounding Belief',
        text: confidenceData?._grounding_belief_sc?.[0]?.quote,
        hero: confidenceData?._grounding_belief_sc?.[0]?.groundingbelief_step_image?.url,
      },
      {
        key: 'reframe',
        title: 'Mental Reframe',
        text: confidenceData?._mental_reframe_sc?.[0]?.quote,
        hero: confidenceData?._mental_reframe_sc?.[0]?.mentalreframe_step_image?.url,
      },
      {
        key: 'ritual',
        title: 'Ending Ritual',
        text: confidenceData?._ending_ritual_sc?.[0]?.quote,
        hero: confidenceData?._ending_ritual_sc?.[0]?.endingritual_step_image?.url,
      },
      {
        key: 'mantra',
        title: 'Mantra',
        text: confidenceData?._mantra_sc?.[0]?.quote,
        hero: confidenceData?._mantra_sc?.[0]?.mantra_step_image?.url,
      },
      {
        key: 'bonus',
        title: 'Bonus Tip',
        text: confidenceData?._bonus_tip_sc?.[0]?.quote,
        hero: confidenceData?._bonus_tip_sc?.[0]?.bonustip_step_image?.url,
      },
    ],
    finishRoute: {name: 'HomeScreen'},
  };
}

/**
 * @param {function} unwrapLookup - RTK mutation unwrap, e.g. `(body) => confidenceLookup(body).unwrap()`
 */
export async function fetchConfidenceKit(unwrapLookup, situation_key, vibe_key) {
  try {
    const res = await unwrapLookup({
      situation_key: situation_key || undefined,
      vibe_key: vibe_key || undefined,
    });
    const data = res?.[0] ?? res;
    if (data?._mantra_sc) {
      return applyMantraAudioToKit(data, situation_key, vibe_key);
    }
    return applyMantraAudioToKit(
      finalizeOfflineKit(MOCK_CONFIDENCE_DATA, situation_key, vibe_key),
      situation_key,
      vibe_key,
    );
  } catch (error) {
    console.log('confidenceLookup (offline), using mock data', error);
    return applyMantraAudioToKit(
      finalizeOfflineKit(MOCK_CONFIDENCE_DATA, situation_key, vibe_key),
      situation_key,
      vibe_key,
    );
  }
}

export async function navigateToConfidenceStepFlow(unwrapLookup, situation_key, vibe_key) {
  const confidenceData = await fetchConfidenceKit(unwrapLookup, situation_key, vibe_key);
  await preloadStepFlowAssets(
    situation_key,
    vibe_key,
    confidenceData?.kit_audio,
  );
  const params = buildStepFlowRouteParams(confidenceData, '', situation_key, vibe_key);
  navigate('Main', {
    screen: 'StepFlowScreen',
    params,
  });
}
