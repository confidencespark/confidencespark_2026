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
import FadeUpSentencesText from '@components/ui/FadeUpSentencesText';

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
/** Only if hero never fires onLoad/onLoadEnd (broken network / bad URL) */
const HERO_STUCK_FALLBACK_MS = 60000;

/** Breathing glow behind play button (fixed radius; opacity only) */
const GLOW_OPACITY_MIN = 0.01;
const GLOW_OPACITY_MAX = 0.45;
const GLOW_BREATH_HALF_MS = 2200;
const GLOW_FADE_OUT_MS = 510;

/** Subtle L/R “music” bars beside play (secondary to glow); height 0–1 → px */
const EQ_BAR_COUNT = 10;
const EQ_SETTLE_MS = 1000;
const EQ_OPACITY = 0.4;
const EQ_BAR_WIDTH = 4;
const EQ_BAR_GAP = 4;
const EQ_HALF_MS = 1050;
const EQ_BAR_MAX_PX = DIMENSIONS.moderateScale(18);

/**
 * Step Flow Screen (The Core Experience)
 *
 * Guides the user through the 6-step confidence routine.
 *
 * Features:
 * - Dynamic Hero Images: Smooth transitions/preloading between step images.
 * - Audio Playback: Integrated player for the guided voiceover (Mantra step only).
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
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef(null);

  const eqBarValuesRef = useRef(null);
  if (!eqBarValuesRef.current) {
    eqBarValuesRef.current = Array.from(
      {length: EQ_BAR_COUNT},
      () => new Animated.Value(0),
    );
  }
  const eqBarLoopRef = useRef(null);

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

  const stopEqBarLoopOnly = useCallback(() => {
    if (eqBarLoopRef.current) {
      eqBarLoopRef.current.stop();
      eqBarLoopRef.current = null;
    }
  }, []);

  const stopEqBarsImmediate = useCallback(() => {
    stopEqBarLoopOnly();
    eqBarValuesRef.current.forEach(v => v.setValue(0));
  }, [stopEqBarLoopOnly]);

  const settleEqBarsToZero = useCallback(() => {
    stopEqBarLoopOnly();
    const bars = eqBarValuesRef.current;
    Animated.parallel(
      bars.map(v =>
        Animated.timing(v, {
          toValue: 0,
          duration: EQ_SETTLE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [stopEqBarLoopOnly]);

  const onNaturalEnd = async () => {
    settleEqBarsToZero();
    setIsPlaying(false);
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
    stopEqBarsImmediate();
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
  }, [playerRef, stopEqBarsImmediate]);

  const pausePlayback = async () => {
    clearEndTimer();
    await playerRef.pausePlayer();
    settleEqBarsToZero();
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

  const handlePlayPress = async () => {
    if (!audio) return;
    if (isPlaying) {
      await pausePlayback();
      return;
    }
    if (hasStartedRef.current && pausedRef.current) {
      await resumePlayback(audio);
    } else {
      await startFromBeginning(audio);
    }
  };

  // Fixed-radius breathing glow: only while playing and not buffering
  React.useEffect(() => {
    const shouldGlow = isPlaying && !isLoadingAudio;

    if (glowLoopRef.current) {
      glowLoopRef.current.stop();
      glowLoopRef.current = null;
    }

    if (!shouldGlow) {
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: GLOW_FADE_OUT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      return;
    }

    glowOpacity.setValue(GLOW_OPACITY_MIN);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: GLOW_OPACITY_MAX,
          duration: GLOW_BREATH_HALF_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: GLOW_OPACITY_MIN,
          duration: GLOW_BREATH_HALF_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    glowLoopRef.current = loop;
    loop.start();

    return () => {
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
        glowLoopRef.current = null;
      }
    };
  }, [isPlaying, isLoadingAudio]);

  // Subtle L/R EQ bars beside play: slow sine-like loop while playing
  React.useEffect(() => {
    if (!isPlaying || isLoadingAudio) return undefined;
    const bars = eqBarValuesRef.current;
    const loops = bars.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: EQ_HALF_MS + i * 90,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: EQ_HALF_MS + i * 90,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    const main = Animated.parallel(loops);
    main.start();
    eqBarLoopRef.current = main;
    return () => {
      main.stop();
      eqBarLoopRef.current = null;
    };
  }, [isPlaying, isLoadingAudio]);

  const isLast = index >= (steps?.length || 1) - 1;

  /* ---------- step change gated by decode + min loader ---------- */
  const goToStep = nextIdx => {
    if (nextIdx === index || isBlocking) return;

    if (
      steps[index]?.key === 'mantra' &&
      steps[nextIdx]?.key !== 'mantra'
    ) {
      void stopAndRelease();
    }

    const nextHero =
      steps[nextIdx]?.hero || steps[nextIdx]?.image || hero?.uri || hero;

    // Already showing this URI — no decode wait; still respect min loader + fade
    if (nextHero === displayedHero) {
      loaderStartRef.current = Date.now();
      setIsBlocking(true);
      contentAnim.setValue(0);
      finishAfterMinDuration(() => {
        setIndex(nextIdx);
        setPendingIndex(null);
        setIncomingHero(null);
        setIsBlocking(false);
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    loaderStartRef.current = Date.now();
    setIsBlocking(true);
    setPendingIndex(nextIdx);
    setIncomingHero(nextHero);

    if (nextHero) Image.prefetch(nextHero);

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

  // Rare fallback: hero callbacks never fire (network / bad URL) — abandon pending step change
  React.useEffect(() => {
    if (!isBlocking) return undefined;
    const id = setTimeout(() => {
      setIncomingHero(null);
      setPendingIndex(null);
      setIsBlocking(false);
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }).start();
    }, HERO_STUCK_FALLBACK_MS);
    return () => clearTimeout(id);
  }, [isBlocking, contentAnim]);

  const finishAfterMinDuration = fn => {
    const elapsed = Date.now() - (loaderStartRef.current || 0);
    const wait = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(() => {
      fn?.();
      loaderStartRef.current = null;
    }, wait);
  };

  /**
   * Initial / static hero only. While `incomingHero` preloads the next step, the visible
   * ImageBackground still shows the previous URI — ignore its load events until preload finishes.
   */
  const onPrimaryHeroReady = useCallback(() => {
    if (incomingHero) return;
    setIsBlocking(false);
  }, [incomingHero]);

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
          onLoad={onPrimaryHeroReady}
          onLoadEnd={onPrimaryHeroReady}>
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
            onLoadEnd={() => {
              finishAfterMinDuration(() => {
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
              finishAfterMinDuration(() => {
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
              <View style={styles.stepTextOuter}>
                <FadeUpSentencesText
                  text={step?.text || ''}
                  textStyle={styles.stepText}
                  animateKey={index}
                />
              </View>

              {/* play / pause (Mantra step only) — breathing glow + L/R EQ bars */}
              {step?.key === 'mantra' && (
                <View style={styles.playRow}>
                  <View style={styles.eqClusterLeft}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <Animated.View
                        key={`eql-${i}`}
                        style={[
                          styles.eqBar,
                          i > 0 && {marginLeft: EQ_BAR_GAP},
                          {
                            opacity: EQ_OPACITY,
                            height: eqBarValuesRef.current[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, EQ_BAR_MAX_PX],
                            }),
                          },
                        ]}
                      />
                    ))}
                  </View>
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
                          style={[styles.playGlow, {opacity: glowOpacity}]}
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
                  <View style={styles.eqClusterRight}>
                    {[5, 6, 7, 8, 9].map(i => (
                      <Animated.View
                        key={`eqr-${i}`}
                        style={[
                          styles.eqBar,
                          i > 5 && {marginLeft: EQ_BAR_GAP},
                          {
                            opacity: EQ_OPACITY,
                            height: eqBarValuesRef.current[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, EQ_BAR_MAX_PX],
                            }),
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}

              <Text style={styles.ctaHint}>
                {isLast
                  ? 'Tap below to return to menu'
                  : 'Tap → below to continue'}
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
    fontWeight: '600',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginBottom: DIMENSIONS.verticalScale(6),
  },
  stepTitle: {
    color: '#2E6C94',
    fontWeight: '600',
    fontSize: DIMENSIONS.moderateScale(20),
    marginBottom: DIMENSIONS.verticalScale(6),
  },
  stepTextOuter: {
    width: '100%',
    marginBottom: DIMENSIONS.verticalScale(18),
  },
  stepText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: DIMENSIONS.moderateScale(18),
    lineHeight: Math.round(DIMENSIONS.moderateScale(18) * 1.45),
    textAlign: 'center',
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: DIMENSIONS.verticalScale(12),
    paddingHorizontal: DIMENSIONS.moderateScale(4),
  },
  eqClusterLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: DIMENSIONS.moderateScale(80),
    height: EQ_BAR_MAX_PX + 2,
    marginRight: DIMENSIONS.moderateScale(6),
  },
  eqClusterRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    width: DIMENSIONS.moderateScale(80),
    height: EQ_BAR_MAX_PX + 2,
    marginLeft: DIMENSIONS.moderateScale(6),
  },
  eqBar: {
    width: EQ_BAR_WIDTH,
    borderRadius: 2,
    backgroundColor: '#5BA3D4',
  },
  playColumn: {
    flexShrink: 0,
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
  playGlow: {
    position: 'absolute',
    width: DIMENSIONS.moderateScale(124),
    height: DIMENSIONS.moderateScale(124),
    borderRadius: DIMENSIONS.moderateScale(62),
    backgroundColor: 'rgba(142, 198, 234, 0.95)',
    shadowColor: '#5BA3D4',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 0},
    elevation: 12,
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
    fontWeight: '600',
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
    fontWeight: '500',
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
