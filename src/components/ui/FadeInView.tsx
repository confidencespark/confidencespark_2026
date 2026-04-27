/**
 * FadeInView
 *
 * Wraps children with a subtle fade-in + slight slide-up animation on mount.
 * "Whimsical but not childish" - gentle, professional.
 */
import React, {useEffect} from 'react';
import {ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const springConfig = {
  damping: 20,
  stiffness: 300,
};

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
};

export function FadeInView({
  children,
  delay = 0,
  duration = 400,
  style,
}: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {duration});
      translateY.value = withSpring(0, springConfig);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
