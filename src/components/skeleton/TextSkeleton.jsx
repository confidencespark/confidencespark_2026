import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

export function TextSkeleton({width = 120, height = 20, borderRadius = 6}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeleton, {width, height, borderRadius, opacity}]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
});
