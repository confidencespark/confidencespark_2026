// src/components/CurvedHeader.js
import React from 'react';
import {View, Image, StyleSheet, Text} from 'react-native';
import Svg, {G, Path} from 'react-native-svg';

import LinearGradient from 'react-native-linear-gradient';
import {DIMENSIONS} from '@constants/dimensions';
import {COLORS} from '@constants/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const logo = require('@assets/images/logo.png');

/**
 * Curved Header Background
 *
 * Renders a decorative header with a linear gradient and SVG wave bottom edge.
 * Used in onboarding and auth screens for visual flair.
 *
 * Props:
 * - text: Optional {title, desc} object to overlay text instead of Logo.
 */
const CurvedBackground = ({text}) => {
  const screenWidth = DIMENSIONS.SCREEN_WIDTH;
  const curveHeight = DIMENSIONS.verticalScale(40);
  const insets = useSafeAreaInsets();

  const frozenTop = React.useRef(insets.top || 0).current;

  return (
    <View
      style={[
        styles.header,
        {paddingTop: frozenTop + DIMENSIONS.verticalScale(12)},
      ]}>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={['#87C1E9', '#123D5C']}
        style={StyleSheet.absoluteFillObject}
      />
      {text ? (
        <View
          style={{
            paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          }}>
          <Text style={styles.title}>{text?.title}</Text>

          <Text style={styles.subTitle}>{text?.desc}</Text>
        </View>
      ) : (
        <Image source={logo} resizeMode="contain" style={styles.logo} />
      )}
      {/* SAME path, flipped vertically and anchored at the TOP */}
      <Svg
        style={styles.waveTop}
        width="100%"
        height={DIMENSIONS.verticalScale(120)}
        viewBox="0 0 375 120"
        preserveAspectRatio="none"
        pointerEvents="none">
        <G transform="translate(0,120) scale(1,-1)">
          <Path fill="#FFFFFF" d="M0,70 C110,130 240,20 375,90 L375,0 L0,0 Z" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: DIMENSIONS.FONT_SIZE_TITLE,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: DIMENSIONS.verticalScale(6),
  },
  subTitle: {
    marginTop: DIMENSIONS.verticalScale(8),
    color: COLORS.white,
    fontSize: DIMENSIONS.FONT_SIZE_LARGE,
    lineHeight: DIMENSIONS.FONT_SIZE_LARGE * 1.4,
  },
  header: {
    // height: DIMENSIONS.verticalScale(220),
    // alignItems: 'center',
    // justifyContent: 'flex-start',

    height: DIMENSIONS.verticalScale(220),
    overflow: 'hidden', // <- important so the wave is clipped
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: DIMENSIONS.moderateScale(86),
    height: DIMENSIONS.moderateScale(86),
    marginTop: DIMENSIONS.verticalScale(12),
  },
  wave: {
    position: 'absolute',
    top: 0, // <- put the wave at the TOP edge
    left: 0,
    right: 0,
  },
});

export default CurvedBackground;
