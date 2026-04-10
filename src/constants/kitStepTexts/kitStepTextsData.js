import {dailySteps} from './daily';
import {pitchSteps} from './pitch';
import {interviewSteps} from './interview';
import {performanceSteps} from './performance';
import {negotiationSteps} from './negotiation';
import {presentationSteps} from './presentation';
import {difficultSteps} from './difficult';

/**
 * PDF-aligned step body copy by situation_key × vibe_key.
 * vibe_key: calm | power | playful | any (daily only)
 */
export const KIT_STEP_TEXTS = {
  daily: {
    any: dailySteps,
  },
  pitch: pitchSteps,
  interview: interviewSteps,
  performance: performanceSteps,
  negotiation: negotiationSteps,
  presentation: presentationSteps,
  difficult: difficultSteps,
};
// ConfidenceSpark workspace batch
