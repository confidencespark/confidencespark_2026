// src/features/steps/StepFlowScreen.jsx
import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {DIMENSIONS} from '@constants/dimensions';
import {resetAndNavigate} from '@utils/NavigationUtils';
import {PersistentBottomNav, PERSISTENT_NAV_HEIGHT} from '@components/ui/PersistentBottomNav';
import AudioWaveformLine from '@components/ui/AudioWaveformLine';

// ------- assets -------
const HERO_FALLBACK = {
  uri: 'https://images.unsplash.com/photo-1520975922074-3b2c7b1e46b9?q=80&w=1600&auto=format&fit=crop',
};
const CARD_BG = require('@assets/images/stepBackground.png');

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const AnimatedImageBackground =
  Animated.createAnimatedComponent(ImageBackground);

// min overlay time so the transition feels intentional
const MIN_LOADER_MS = 300; // set 200–400 to taste
const HERO_LOAD_TIMEOUT_MS = 5000; // don't block forever if hero image fails to load
const AUDIO_PULSE_MS = 2400;

function buildAudioPulseLoop(scaleAnim, opacityAnim) {
  return Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 2.38,
          duration: AUDIO_PULSE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: AUDIO_PULSE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.42,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]),
  );
}

/**
 * Step Flow Screen (The Core Experience)
 *
 * Guides the user through the 5-step confidence routine.
 *
 * Features:
 * - Dynamic Hero Images: Smooth transitions/preloading between step images.
 * - Audio Playback: Integrated player for the guided voiceover (Mantra step).
 * - Step Navigation: Next/Back logic with index tracking.
 * - Completion: Returns to Home or designated finish route on end.
 */
export default function StepFlowScreen({navigation, route}) {
  const insets = useSafeAreaInsets();

  const {
    steps = [],
    initialIndex = 0,
    hero = HERO_FALLBACK,
    audio = '',
    finishRoute = {name: 'HomeScreen'},
  } = route?.params || {};

  const [index, setIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [waveformWidth, setWaveformWidth] = useState(0);

  // ---- hero/state for no-flicker swap ----
  const [displayedHero, setDisplayedHero] = useState(
    steps[initialIndex]?.hero ||
      steps[initialIndex]?.image ||
      hero?.uri ||
      hero,
  );
  const [incomingHero, setIncomingHero] = useState(null);
  const [pendingIndex, setPendingIndex] = useState(null);
  const [isBlocking, setIsBlocking] = useState(true);
  const loaderStartRef = useRef(null);
  const heroLoadTimeoutRef = useRef(null);

  // ---- audio setup (unchanged) ----
  const playerRef = useRef(AudioRecorderPlayer).current;
  const hasStartedRef = useRef(false);
  const pausedRef = useRef(false);
  const lastPosRef = useRef(0);
  const durationRef = useRef(0);
  const endedRef = useRef(false);
  const endTimerRef = useRef(null);

  // subtle content fade
  const contentAnim = useRef(new Animated.Value(1)).current;
  /** Outer pulse rings while audio plays (staggered loops; button stays scale 1) */
  const pulseRingScale = useRef(new Animated.Value(1)).current;
  const pulseRingOpacity = useRef(new Animated.Value(0)).current;
  const pulseRingScale2 = useRef(new Animated.Value(1)).current;
  const pulseRingOpacity2 = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef(null);
  const pulseLoopRef2 = useRef(null);
  const pulseStaggerTimerRef = useRef(null);
  /** One-shot ripple on each Play press */
  const clickRippleScale = useRef(new Animated.Value(1)).current;
  const clickRippleOpacity = useRef(new Animated.Value(0)).current;

  const step = steps[index] || {};
  const stepHero = displayedHero || HERO_FALLBACK.uri;

  /* ---------- audio helpers ---------- */
  const attachListener = useCallback(() => {
    try {
      playerRef.removePlayBackListener();
    } catch {}
    playerRef.addPlayBackListener(async e => {
      const pos = Number(e?.current_position ?? 0);
      const dur = Number(e?.duration ?? 0);
      if (!Number.isNaN(pos)) lastPosRef.current = pos;
      if (!Number.isNaN(dur) && dur > 0) {
        const wasZero = durationRef.current === 0;
        durationRef.current = dur;
        if (wasZero || isPlaying) scheduleEndGuard();
      }
      const looksEnded = dur > 0 && pos >= Math.max(0, dur - 250);
      if (looksEnded && !endedRef.current) {
        endedRef.current = true;
        await onNaturalEnd();
      }
      return;
    });
  }, [playerRef, isPlaying]);

  const clearEndTimer = () => {
    if (endTimerRef.current) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  };

  const onNaturalEnd = async () => {
    try {
      await playerRef.stopPlayer();
    } catch {}
    try {
      playerRef.removePlayBackListener();
    } catch {}
    hasStartedRef.current = false;
    pausedRef.current = false;
    lastPosRef.current = 0;
    durationRef.current = 0;
    endedRef.current = true;
    clearEndTimer();
    setIsPlaying(false);
  };

  const scheduleEndGuard = () => {
    clearEndTimer();
    const pos = lastPosRef.current || 0;
    const dur = durationRef.current || 0;
    if (dur > 0 && dur > pos) {
      const remaining = Math.max(0, dur - pos) + 300;
      endTimerRef.current = setTimeout(onNaturalEnd, remaining);
    }
  };

  const stopAndRelease = useCallback(async () => {
    clearEndTimer();
    try {
      await playerRef.stopPlayer();
    } catch {}
    try {
      playerRef.removePlayBackListener();
    } catch {}
    hasStartedRef.current = false;
    pausedRef.current = false;
    lastPosRef.current = 0;
    durationRef.current = 0;
    endedRef.current = false;
    setIsPlaying(false);
  }, [playerRef]);

  const pausePlayback = async () => {
    clearEndTimer();
    await playerRef.pausePlayer();
    pausedRef.current = true;
    setIsPlaying(false);
  };

  React.useEffect(() => {
    try {
      playerRef.setSubscriptionDuration(0.1);
    } catch {}
    return () => {
      clearEndTimer();
      stopAndRelease();
    };
  }, [playerRef, stopAndRelease]);

  const startFromBeginning = async url => {
    endedRef.current = false;
    clearEndTimer();
    setIsLoadingAudio(true);
    try {
      await playerRef.startPlayer(url);
      await playerRef.setVolume(1.0);
    } catch (e) {
      console.log('startPlayer error', e);
    }
    hasStartedRef.current = true;
    pausedRef.current = false;
    attachListener();
    setIsPlaying(true);
    setIsLoadingAudio(false);
    if (durationRef.current > 0) scheduleEndGuard();
  };

  const resumePlayback = async url => {
    clearEndTimer();
    setIsLoadingAudio(true);
    try {
      await playerRef.resumePlayer();
    } catch {
      await playerRef.startPlayer(url);
      attachListener();
      setTimeout(() => {
        playerRef.seekToPlayer(Math.max(0, lastPosRef.current));
      }, 120);
    }
    pausedRef.current = false;
    setIsPlaying(true);
    setIsLoadingAudio(false);
    if (durationRef.current > 0) scheduleEndGuard();
  };

  const triggerPlayClickRipple = () => {
    clickRippleScale.setValue(0.92);
    clickRippleOpacity.setValue(0.62);
    Animated.parallel([
      Animated.timing(clickRippleScale, {
        toValue: 2.35,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(clickRippleOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayPress = async () => {
    if (!audio) return;
    if (isPlaying) {
      await pausePlayback();
      return;
    }
    triggerPlayClickRipple();
    if (hasStartedRef.current && pausedRef.current) {
      await resumePlayback(audio);
    } else {
      await startFromBeginning(audio);
    }
  };

  // Soft outer rings: two staggered loops so waves overlap smoothly
  React.useEffect(() => {
    if (!isPlaying) {
      if (pulseStaggerTimerRef.current) {
        clearTimeout(pulseStaggerTimerRef.current);
        pulseStaggerTimerRef.current = null;
      }
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      if (pulseLoopRef2.current) {
        pulseLoopRef2.current.stop();
        pulseLoopRef2.current = null;
      }
      Animated.timing(pulseRingScale, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      Animated.timing(pulseRingOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      Animated.timing(pulseRingScale2, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      Animated.timing(pulseRingOpacity2, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }
    pulseRingScale.setValue(1);
    pulseRingOpacity.setValue(0.42);
    pulseRingScale2.setValue(1);
    pulseRingOpacity2.setValue(0.42);

    pulseLoopRef.current = buildAudioPulseLoop(pulseRingScale, pulseRingOpacity);
    pulseLoopRef.current.start();

    pulseStaggerTimerRef.current = setTimeout(() => {
      pulseStaggerTimerRef.current = null;
      pulseLoopRef2.current = buildAudioPulseLoop(
        pulseRingScale2,
        pulseRingOpacity2,
      );
      pulseLoopRef2.current.start();
    }, Math.floor(AUDIO_PULSE_MS / 2));

    return () => {
      if (pulseStaggerTimerRef.current) {
        clearTimeout(pulseStaggerTimerRef.current);
        pulseStaggerTimerRef.current = null;
      }
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
        pulseLoopRef.current = null;
      }
      if (pulseLoopRef2.current) {
        pulseLoopRef2.current.stop();
        pulseLoopRef2.current = null;
      }
    };
  }, [isPlaying]);

  const isLast = index >= (steps?.length || 1) - 1;

  /* ---------- step change gated by decode + min loader ---------- */
  const goToStep = nextIdx => {
    if (nextIdx === index || isBlocking) return;

    const nextHero =
      steps[nextIdx]?.hero || steps[nextIdx]?.image || hero?.uri || hero;

    loaderStartRef.current = Date.now();
    setIsBlocking(true);
    setPendingIndex(nextIdx);
    setIncomingHero(nextHero);

    // hint cache
    if (nextHero) Image.prefetch(nextHero);

    // fade out content under overlay (optional)
    contentAnim.setValue(0);
  };

  const onNext = async () => {
    if (isLast) {
      await stopAndRelease();
      if (finishRoute?.name) resetAndNavigate('UserBottomTab');
      else navigation.goBack();
      return;
    }
    goToStep(index + 1);
  };

  const onBack = async () => {
    if (index > 0) {
      goToStep(index - 1);
    } else {
      await stopAndRelease();
      navigation?.goBack?.();
    }
  };

  // warm cache for all heroes
  React.useEffect(() => {
    if (steps.length > 0)
      steps.forEach(s => {
        const uri = s?.hero || s?.image;
        if (uri) Image.prefetch(uri);
      });
  }, [steps]);

  // safety: if hero never loads, don't block user forever
  React.useEffect(() => {
    if (!isBlocking) return;
    heroLoadTimeoutRef.current = setTimeout(() => {
      setIsBlocking(false);
      heroLoadTimeoutRef.current = null;
    }, HERO_LOAD_TIMEOUT_MS);
    return () => {
      if (heroLoadTimeoutRef.current) {
        clearTimeout(heroLoadTimeoutRef.current);
        heroLoadTimeoutRef.current = null;
      }
    };
  }, [isBlocking]);

  const finishAfterMinDuration = fn => {
    const elapsed = Date.now() - (loaderStartRef.current || 0);
    const wait = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(() => {
      fn?.();
      loaderStartRef.current = null;
    }, wait);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ---------- HERO ---------- */}
      <View style={styles.heroContainer}>
        <AnimatedImageBackground
          source={{uri: stepHero}}
          style={[styles.heroFull, {height: HERO_H}]}
          imageStyle={styles.heroImageNoRadius}
          resizeMode="cover"
          fadeDuration={0} // <-- remove Android default 300ms fade
          // onLoad={() => {
          //   setIsBlocking(true);
          // }}
          onLoadEnd={() => {
            if (heroLoadTimeoutRef.current) {
              clearTimeout(heroLoadTimeoutRef.current);
              heroLoadTimeoutRef.current = null;
            }
            setIsBlocking(false);
          }}>
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)']}
            style={StyleSheet.absoluteFill}
          />
        </AnimatedImageBackground>

        {/* full-size hidden preloader ensures decode at target size */}
        {incomingHero ? (
          <Image
            source={{uri: incomingHero}}
            resizeMode="cover"
            fadeDuration={0}
            style={styles.preloaderFull} // full width & HERO_H height
            onLoad={() => {
              finishAfterMinDuration(() => {
                if (heroLoadTimeoutRef.current) {
                  clearTimeout(heroLoadTimeoutRef.current);
                  heroLoadTimeoutRef.current = null;
                }
                setDisplayedHero(incomingHero);
                if (typeof pendingIndex === 'number') setIndex(pendingIndex);
                setPendingIndex(null);
                setIncomingHero(null);
                setIsBlocking(false);
                Animated.timing(contentAnim, {
                  toValue: 1,
                  duration: 160,
                  useNativeDriver: true,
                }).start();
              });
            }}
            onError={() => {
              // advance anyway after min time; keep old hero
              finishAfterMinDuration(() => {
                if (heroLoadTimeoutRef.current) {
                  clearTimeout(heroLoadTimeoutRef.current);
                  heroLoadTimeoutRef.current = null;
                }
                if (typeof pendingIndex === 'number') setIndex(pendingIndex);
                setPendingIndex(null);
                setIncomingHero(null);
                setIsBlocking(false);
                Animated.timing(contentAnim, {
                  toValue: 1,
                  duration: 160,
                  useNativeDriver: true,
                }).start();
              });
            }}
          />
        ) : null}
      </View>

      {/* ---------- CARD ---------- */}
      <ImageBackground source={CARD_BG} style={styles.card} resizeMode="cover">
        {!isBlocking && (
          <ScrollView
            contentContainerStyle={{paddingBottom: PERSISTENT_NAV_HEIGHT + (insets.bottom || 0) + DIMENSIONS.verticalScale(24)}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.cardInner, {opacity: contentAnim}]}>
              <Text style={styles.stepIndex}>
                Step {Math.min(index + 1, steps.length || 1)}
              </Text>
              <Text style={styles.stepTitle}>{step?.title || '—'}</Text>
              <Text style={styles.stepText}>
                {step?.text || 'Text to show'}
              </Text>

              {/* play + minimalist waveform (step 1 / Mantra only) */}
              {index === 0 && (
                <View style={styles.playRow}>
                  <View style={styles.playColumn}>
                    {isLoadingAudio ? (
                      <View style={styles.playOuter}>
                        <Pressable style={styles.playWrap} disabled>
                          <LinearGradient
                            colors={['#8EC6EA', '#234B67']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.playBtn}>
                            <ActivityIndicator size="large" color="#fff" />
                          </LinearGradient>
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.playOuter}>
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.pulseRing,
                            {
                              opacity: pulseRingOpacity,
                              transform: [{scale: pulseRingScale}],
                            },
                          ]}
                        />
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.pulseRing,
                            {
                              opacity: pulseRingOpacity2,
                              transform: [{scale: pulseRingScale2}],
                            },
                          ]}
                        />
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.clickRipple,
                            {
                              opacity: clickRippleOpacity,
                              transform: [{scale: clickRippleScale}],
                            },
                          ]}
                        />
                        <Pressable
                          onPress={handlePlayPress}
                          style={styles.playWrap}>
                          <LinearGradient
                            colors={['#8EC6EA', '#234B67']}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={styles.playBtn}>
                            <Ionicons
                              name={isPlaying ? 'pause' : 'play'}
                              size={28}
                              color="#fff"
                            />
                          </LinearGradient>
                        </Pressable>
                      </View>
                    )}
                  </View>
                  <View
                    style={styles.waveformSlot}
                    onLayout={e => {
                      const w = Math.floor(e.nativeEvent.layout.width);
                      if (w > 0 && w !== waveformWidth) {
                        setWaveformWidth(w);
                      }
                    }}>
                    {waveformWidth > 0 && (
                      <AudioWaveformLine
                        isPlaying={isPlaying && !isLoadingAudio}
                        width={waveformWidth}
                        height={DIMENSIONS.verticalScale(44)}
                        strokeColor="#2E6C94"
                        strokeWidth={2}
                      />
                    )}
                  </View>
                </View>
              )}

              <Text style={styles.ctaHint}>
                {isLast ? 'Tap below to return to menu' : 'Tap Next below to continue'}
              </Text>
            </Animated.View>
          </ScrollView>
        )}
      </ImageBackground>

      <PersistentBottomNav
        navigation={navigation}
        onBack={onBack}
        onHome={() => resetAndNavigate('UserBottomTab')}
        onNext={onNext}
      />

      {/* ---------- MIN-DURATION FULL-PAGE LOADER ---------- */}
      {isBlocking && (
        <View style={styles.blocker} pointerEvents="auto">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.blockerText}>Loading…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const HERO_H = DIMENSIONS.verticalScale(260);
const CARD_R = DIMENSIONS.moderateScale(26);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},

  /* HERO */
  heroContainer: {width: SCREEN_WIDTH, height: HERO_H},
  heroFull: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  heroImageNoRadius: {borderRadius: 0},
  /* CARD */
  card: {flex: 1},
  cardRadius: {
    borderTopLeftRadius: CARD_R,
    borderTopRightRadius: CARD_R,
  },
  cardInner: {
    flex: 1,
    paddingTop: DIMENSIONS.verticalScale(25),
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
    alignItems: 'center',
    rowGap: 10,
  },
  stepIndex: {
    color: '#2B6AA8',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginBottom: DIMENSIONS.verticalScale(6),
  },
  stepTitle: {
    color: '#2E6C94',
    fontWeight: '800',
    fontSize: DIMENSIONS.moderateScale(20),
    marginBottom: DIMENSIONS.verticalScale(6),
  },
  stepText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: DIMENSIONS.moderateScale(18),
    textAlign: 'center',
    marginBottom: DIMENSIONS.verticalScale(18),
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: DIMENSIONS.verticalScale(12),
  },
  playColumn: {
    flexShrink: 0,
  },
  waveformSlot: {
    flex: 1,
    minHeight: DIMENSIONS.verticalScale(44),
    marginLeft: DIMENSIONS.moderateScale(12),
    justifyContent: 'center',
  },
  playOuter: {
    width: DIMENSIONS.moderateScale(160),
    height: DIMENSIONS.moderateScale(160),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playWrap: {
    zIndex: 2,
    elevation: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: DIMENSIONS.moderateScale(66),
    height: DIMENSIONS.moderateScale(66),
    borderRadius: DIMENSIONS.moderateScale(33),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.92)',
    backgroundColor: 'transparent',
  },
  clickRipple: {
    position: 'absolute',
    width: DIMENSIONS.moderateScale(66),
    height: DIMENSIONS.moderateScale(66),
    borderRadius: DIMENSIONS.moderateScale(33),
    borderWidth: 2,
    borderColor: 'rgba(142,198,234,0.95)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  playBtn: {
    width: DIMENSIONS.moderateScale(66),
    height: DIMENSIONS.moderateScale(66),
    borderRadius: DIMENSIONS.moderateScale(33),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  cta: {
    height: DIMENSIONS.BUTTON_HEIGHT,
    borderRadius: DIMENSIONS.moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    width: Math.min(DIMENSIONS.SCREEN_WIDTH * 0.8, 360),
    marginBottom: DIMENSIONS.verticalScale(18),
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
  ctaHint: {
    textAlign: 'center',
    color: '#8A93A1',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginTop: DIMENSIONS.verticalScale(24),
  },

  /* full-page loader */
  blocker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockerText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '700',
    fontSize: 16,
  },

  /* FULL-SIZE hidden preloader (forces full decode) */
  preloaderFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: HERO_H,
    opacity: 0.01, // tiny alpha so it still lays out/composes
  },
});
