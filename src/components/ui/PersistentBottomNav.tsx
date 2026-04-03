/**
 * PersistentBottomNav
 *
 * A modern, fixed bottom navigation bar with Home, Back, and Next.
 * Stays visible while content scrolls. Uses Reanimated for subtle press animations.
 */
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Platform, Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {DIMENSIONS} from '@constants/dimensions';
import {resetAndNavigate} from '@utils/NavigationUtils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig = {
  damping: 15,
  stiffness: 400,
};

const navSpringConfig = {
  damping: 18,
  stiffness: 320,
};

type NavButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary';
};

function NavButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = 'default',
}: NavButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, springConfig);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const isPrimary = variant === 'primary';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.navBtn, animatedStyle]}
      hitSlop={12}>
      {isPrimary ? (
        <LinearGradient
          colors={disabled ? ['#C9D7E1', '#C9D7E1'] : ['#8EC6EA', '#234B67']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.primaryBtn}>
          <Ionicons name={icon} size={20} color="#fff" />
          {label ? (
            <Text style={styles.primaryLabel}>{label}</Text>
          ) : null}
        </LinearGradient>
      ) : (
        <View style={[styles.iconBtn, disabled && styles.iconBtnDisabled]}>
          <Ionicons
            name={icon}
            size={24}
            color={disabled ? '#B0BEC5' : '#2E6C94'}
          />
        </View>
      )}
    </AnimatedPressable>
  );
}

export type PersistentBottomNavProps = {
  onBack?: () => void;
  onHome?: () => void;
  onNext?: () => void;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  navigation?: any;
};

const NAV_HEIGHT = 64;

export function PersistentBottomNav({
  onBack,
  onHome,
  onNext,
  showBack = true,
  showNext = true,
  nextDisabled = false,
  navigation,
}: PersistentBottomNavProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom || 0;
  const totalHeight = NAV_HEIGHT + bottomInset;

  const slideUp = useSharedValue(20);
  const opacity = useSharedValue(0);
  useEffect(() => {
    slideUp.value = withSpring(0, navSpringConfig);
    opacity.value = withTiming(1, {duration: 220});
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      resetAndNavigate('UserBottomTab');
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{translateY: slideUp.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: bottomInset,
          height: totalHeight,
        },
        containerStyle,
      ]}>
      <View style={styles.inner}>
        {/* Back */}
        {showBack ? (
          <NavButton
            icon="chevron-back"
            onPress={handleBack}
            variant="default"
          />
        ) : (
          <View style={styles.navBtn} />
        )}

        {/* Home */}
        <NavButton
          icon="home-outline"
          onPress={handleHome}
          variant="default"
        />

        {/* Next */}
        {showNext ? (
          <NavButton
            icon="arrow-forward"
            onPress={onNext ?? (() => {})}
            disabled={nextDisabled}
            variant="default"
          />
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: DIMENSIONS.moderateScale(24),
    borderTopRightRadius: DIMENSIONS.moderateScale(24),
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
    paddingBottom: 0, // set dynamically for safe area
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    minWidth: DIMENSIONS.moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: DIMENSIONS.moderateScale(48),
    height: DIMENSIONS.moderateScale(48),
    borderRadius: DIMENSIONS.moderateScale(24),
    backgroundColor: '#EAF2F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: DIMENSIONS.moderateScale(20),
    height: DIMENSIONS.moderateScale(48),
    borderRadius: DIMENSIONS.moderateScale(24),
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
  },
});

/** Height to reserve for content padding so scroll content doesn't hide behind nav */
export const PERSISTENT_NAV_HEIGHT = 88;
