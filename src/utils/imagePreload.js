import {Image} from 'react-native';
import FastImage from '@d11/react-native-fast-image';

/**
 * Image Preloading Utilities
 *
 * - preloadUrls: Aggressively caches images using both FastImage and standard Image.prefetch.
 * - preloadNextStepHero: Predictive preloading for the next step's hero image in a flow.
 */
export const preloadUrls = (urls = []) => {
  const clean = urls.filter(Boolean);
  if (!clean.length) return;
  // FastImage cache
  FastImage.preload(clean.map(u => ({uri: u})));
  // RN fallback
  clean.forEach(u => Image.prefetch(u));
};

export const preloadNextStepHero = (steps = [], index = 0) => {
  const next =
    steps?.[index + 1]?.hero ||
    steps?.[index + 1]?.image ||
    steps?.[index + 1]?.stepHero;
  if (next) preloadUrls([next]);
};
