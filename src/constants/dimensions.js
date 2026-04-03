/**
 * Dimension Scaling Constants
 *
 * Provides responsive scaling utilities (`scale`, `verticalScale`, `moderateScale`)
 * to ensure consistent layout across different screen sizes.
 *
 * Reference Device: avg 5" mobile screen (350x680)
 */
import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => (SCREEN_WIDTH / guidelineBaseWidth) * size;
const verticalScale = size => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const DIMENSIONS = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  scale,
  verticalScale,
  moderateScale,

  // Common spacing
  PADDING_HORIZONTAL: moderateScale(20),
  PADDING_VERTICAL: verticalScale(20),
  MARGIN_SMALL: moderateScale(8),
  MARGIN_MEDIUM: moderateScale(16),
  MARGIN_LARGE: moderateScale(24),

  // Button dimensions
  BUTTON_HEIGHT: verticalScale(50),
  BUTTON_RADIUS: moderateScale(25),

  // Input dimensions
  INPUT_HEIGHT: verticalScale(50),
  INPUT_RADIUS: moderateScale(8),

  // Icon sizes
  ICON_SMALL: moderateScale(16),
  ICON_MEDIUM: moderateScale(24),
  ICON_LARGE: moderateScale(32),

  // Font sizes
  FONT_SIZE_SMALL: moderateScale(12),
  FONT_SIZE_MEDIUM: moderateScale(14),
  FONT_SIZE_LARGE: moderateScale(16),
  FONT_SIZE_XLARGE: moderateScale(18),
  FONT_SIZE_TITLE: moderateScale(24),
  FONT_SIZE_HEADER: moderateScale(32),
};
