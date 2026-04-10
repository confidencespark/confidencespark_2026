/**
 * AnimatedPressable
 *
 * A Pressable with subtle scale animation on press.
 * "Whimsical but not childish" - gentle spring, no bounce.
 */
import React from 'react';
import {Pressable, StyleProp, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig = {
  damping: 18,
  stiffness: 350,
};

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function AnimatedPressableComponent({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  scaleTo = 0.97,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: disabled ? 1 : scale.value}],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, springConfig);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springConfig);
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
// ConfidenceSpark workspace batch
