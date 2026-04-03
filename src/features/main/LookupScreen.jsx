import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  ImageBackground,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {DIMENSIONS} from '@constants/dimensions';
import {getConfirmVibeSubtitle} from '@constants/confirmVibeSubtitles';
import {FadeInView} from '@components/ui/FadeInView';
import {navigate} from '@utils/NavigationUtils';
import {PersistentBottomNav, PERSISTENT_NAV_HEIGHT} from '@components/ui/PersistentBottomNav';
import {useConfidenceLookupMutation} from '@store/api/confidenceApi';
import {mergePdfStepTextsIntoKit} from '@constants/kitStepTexts/mergeKitStepTexts';
import {preloadUrls} from '@utils/imagePreload';
import FastImage from '@d11/react-native-fast-image';
import RNFetchBlob from 'rn-fetch-blob';

// local, instant
const HERO = require('@assets/images/lookupHero.webp');
const LETSGOICON = require('@assets/images/letsgoIcon.png');

// Step illustrations per PDF spec - one image per step type, calm & human
// Replace with Blush/Humaaans assets when ready (see VISUAL_UPDATE_SPEC.md)
const STEP_IMAGES = {
  mantra: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80&auto=format&fit=crop', // calm (replaced dead Unsplash id)
  body: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop', // posture, relaxed
  grounding: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80&auto=format&fit=crop', // calm, breathing
  reframe: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&auto=format&fit=crop', // thinking, reflective
  ritual: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&auto=format&fit=crop', // confident, standing
  bonus: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop', // insight, idea
};

const MOCK_AUDIO_URL = 'https://drive.google.com/uc?export=download&id=1RM2s4fBz7ujOed4c5cpej_-F8UZYIlTn';
const MOCK_CONFIDENCE_DATA = {
  kit_name: 'Daily Dose',
  kit_audio: MOCK_AUDIO_URL,
  _situation_sc: [{name: 'Daily Boost'}],
  _vibes_sc: [{title: 'Any'}],
  _mantra_sc: [
    {quote: "I've earned my seat here. I belong.", mantra_step_image: {url: STEP_IMAGES.mantra}},
  ],
  _body_reset_sc: [
    {quote: 'Take three deep breaths. Ground yourself in this moment.', bodyreset_step_images: {url: STEP_IMAGES.body}},
  ],
  _grounding_belief_sc: [
    {quote: 'I am prepared. I am capable. I am enough.', groundingbelief_step_image: {url: STEP_IMAGES.grounding}},
  ],
  _mental_reframe_sc: [
    {quote: 'This is an opportunity to share my value, not a test to pass.', mentalreframe_step_image: {url: STEP_IMAGES.reframe}},
  ],
  _ending_ritual_sc: [
    {quote: 'Stand tall. Smile. You are ready.', endingritual_step_image: {url: STEP_IMAGES.ritual}},
  ],
  _bonus_tip_sc: [
    {quote: 'Remember: They want you to succeed. Show up fully.', bonustip_step_image: {url: STEP_IMAGES.bonus}},
  ],
};

/**
 * Lookup Screen (Loading/Preparation)
 *
 * Fetches and prepares the confidence kit content.
 *
 * Logic:
 * - Calls `useConfidenceLookupMutation` to get the customized steps.
 * - Preloads assets (Large images, Audio files) into cache for smooth playback.
 * - Displays a 'Let's Go' CTA once data is ready.
 * - Passes all step data to `StepFlowScreen`.
 */
const PRELOAD_TIMEOUT_MS = 5000; // Don't block user; allow proceed after this
/** Space between Let's Go CTA and PersistentBottomNav */
const CTA_GAP_ABOVE_NAV = 20;

export default function LookupScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const situation_key = route?.params?.situation_key;
  const vibe_key = route?.params?.vibe_key;

  const [confidenceLookup, {isLoading}] = useConfidenceLookupMutation();
  const [confidenceData, setConfidenceData] = useState({});
  const [audioPath, setAudioPath] = useState('');

  // single flag for preloading (images + audio)
  const [cachedLoading, setCachedLoading] = useState(true);

  const confirmVibeSubtitle = getConfirmVibeSubtitle(situation_key, vibe_key);

  const onPrimary = () => {
    navigate('Main', {
      screen: 'StepFlowScreen',
      params: {
        hero: {uri: ''},
        initialIndex: 0,
        audio: audioPath || confidenceData?.kit_audio,
        audioCached: !!audioPath,
        steps: [
          {
            key: 'mantra',
            title: 'Mantra',
            text: confidenceData?._mantra_sc?.[0]?.quote,
            hero: confidenceData?._mantra_sc?.[0]?.mantra_step_image?.url,
          },
          {
            key: 'body',
            title: 'Body Reset',
            text: confidenceData?._body_reset_sc?.[0]?.quote,
            hero: confidenceData?._body_reset_sc?.[0]?.bodyreset_step_images
              ?.url,
          },
          {
            key: 'belief',
            title: 'Grounding Belief',
            text: confidenceData?._grounding_belief_sc?.[0]?.quote,
            hero: confidenceData?._grounding_belief_sc?.[0]
              ?.groundingbelief_step_image?.url,
          },
          {
            key: 'reframe',
            title: 'Mental Reframe',
            text: confidenceData?._mental_reframe_sc?.[0]?.quote,
            hero: confidenceData?._mental_reframe_sc?.[0]
              ?.mentalreframe_step_image?.url,
          },
          {
            key: 'ritual',
            title: 'Ending Ritual',
            text: confidenceData?._ending_ritual_sc?.[0]?.quote,
            hero: confidenceData?._ending_ritual_sc?.[0]
              ?.endingritual_step_image?.url,
          },
          {
            key: 'bonus',
            title: 'Bonus Tip',
            text: confidenceData?._bonus_tip_sc?.[0]?.quote,
            hero: confidenceData?._bonus_tip_sc?.[0]?.bonustip_step_image?.url,
          },
        ],
        finishRoute: {name: 'HomeScreen'},
      },
    });
  };

  const getConfidenceStepData = async () => {
    try {
      const res = await confidenceLookup({
        situation_key: situation_key || undefined,
        vibe_key: vibe_key || undefined,
      }).unwrap();
      const data = res?.[0] ?? res;
      if (data?._mantra_sc) {
        setConfidenceData(data);
      } else {
        setConfidenceData(
          mergePdfStepTextsIntoKit(
            MOCK_CONFIDENCE_DATA,
            situation_key,
            vibe_key,
          ) ?? MOCK_CONFIDENCE_DATA,
        );
      }
    } catch (error) {
      console.log('confidenceLookup (offline), using mock data', error);
      setConfidenceData(
        mergePdfStepTextsIntoKit(
          MOCK_CONFIDENCE_DATA,
          situation_key,
          vibe_key,
        ) ?? MOCK_CONFIDENCE_DATA,
      );
    }
  };

  useEffect(() => {
    getConfidenceStepData();
  }, [situation_key, vibe_key]);

  // safe mp3 filename
  const toMp3Name = u => {
    try {
      const base = decodeURIComponent((u || '').split('?')[0]);
      const name = base.split('/').pop() || `audio_${Date.now()}.mp3`;
      return name.toLowerCase().endsWith('.mp3') ? name : `${name}.mp3`;
    } catch {
      return `audio_${Date.now()}.mp3`;
    }
  };

  // preload images + audio once we have data (with timeout so we never block forever)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!confidenceData || !confidenceData._mantra_sc) return;
      setCachedLoading(true);

      const finish = () => {
        if (!cancelled) setCachedLoading(false);
      };

      try {
        // images - with timeout; don't block user on slow network
        const urls = [
          confidenceData?._mantra_sc?.[0]?.mantra_step_image?.url,
          confidenceData?._body_reset_sc?.[0]?.bodyreset_step_images?.url,
          confidenceData?._grounding_belief_sc?.[0]?.groundingbelief_step_image
            ?.url,
          confidenceData?._mental_reframe_sc?.[0]?.mentalreframe_step_image
            ?.url,
          confidenceData?._ending_ritual_sc?.[0]?.endingritual_step_image?.url,
          confidenceData?._bonus_tip_sc?.[0]?.bonustip_step_image?.url,
        ].filter(Boolean);

        if (urls.length) {
          FastImage.preload(urls.map(uri => ({uri})));
          const preloadPromise = Promise.allSettled(urls.map(u => Image.prefetch(u)));
          const timeoutPromise = new Promise(resolve => setTimeout(resolve, PRELOAD_TIMEOUT_MS));
          await Promise.race([preloadPromise, timeoutPromise]);
          preloadUrls(urls);
        }

        // audio (non-blocking: download in background; don't delay finish)
        const url = confidenceData?.kit_audio;
        if (url) {
          const fileName = toMp3Name(url);
          const destPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`;
          RNFetchBlob.config({fileCache: true, path: destPath})
            .fetch('GET', url)
            .then(res => {
              if (cancelled) return;
              const rawPath = res.path();
              return RNFetchBlob.fs.exists(rawPath).then(exists => {
                if (exists) {
                  const uri = Platform.OS === 'ios' ? `file://${rawPath}` : rawPath;
                  setAudioPath(uri);
                }
              });
            })
            .catch(() => {});
        }
      } catch (e) {
        console.log('prefetch error', e);
      } finally {
        finish();
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [confidenceData]);

  // derived: full-screen loading instead of skeletons
  const showFullLoader = cachedLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* HERO with overlay (image020 layout) */}
      <View
        style={[
          styles.heroWrap,
          {paddingTop: insets.top + DIMENSIONS.verticalScale(6)},
        ]}>
        <ImageBackground
          source={HERO}
          style={styles.heroImage}
          imageStyle={styles.heroRadius}>
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.15)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </View>

      {/* CONTENT — flex:1 gives a bounded height so the list scrolls above the absolute bottom nav */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.cardScroll,
          {
            paddingBottom:
              (insets.bottom || 0) +
              PERSISTENT_NAV_HEIGHT +
              CTA_GAP_ABOVE_NAV,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        bounces>
        <View style={styles.card}>
          <FadeInView delay={0} duration={300}>
            <Text style={styles.sparkTitle}>
              {"Here's Your"}
              {'\n'}
              {'Confidence Spark'}
            </Text>
          </FadeInView>
          <FadeInView delay={100} duration={300}>
            <Text style={styles.vibeSubtitle}>{confirmVibeSubtitle}</Text>
          </FadeInView>

          <FadeInView delay={150} duration={300}>
          <Pressable
            onPress={onPrimary}
            disabled={showFullLoader}
            style={({pressed}) => [pressed && {opacity: 0.9}]}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              colors={
                !showFullLoader
                  ? ['#8EC6EA', '#234B67']
                  : ['#C9D7E1', '#C9D7E1']
              }
              style={styles.cta}>
              <Image source={LETSGOICON} style={styles.thumbIcon} />
                <Text style={styles.ctaText}>
                  {showFullLoader ? 'Please wait…' : 'Let’s Go!'}
                </Text>
            </LinearGradient>
          </Pressable>
          </FadeInView>
        </View>
      </ScrollView>

      <PersistentBottomNav
        navigation={navigation}
        onNext={onPrimary}
        nextDisabled={showFullLoader}
      />

      {/* FULL-SCREEN LOADER (replaces skeletons) */}
      {showFullLoader && (
        <View style={styles.blocker} pointerEvents="auto">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.blockerText}>Loading…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const THUMB = DIMENSIONS.moderateScale(40);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  heroWrap: {paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL},
  heroImage: {
    height: DIMENSIONS.verticalScale(220),
    borderRadius: DIMENSIONS.moderateScale(14),
    overflow: 'hidden',
  },
  heroRadius: {borderRadius: DIMENSIONS.moderateScale(14)},
  scroll: {flex: 1},
  sparkTitle: {
    fontSize: DIMENSIONS.moderateScale(24),
    lineHeight: DIMENSIONS.moderateScale(30),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: DIMENSIONS.verticalScale(12),
    textAlign: 'center',
    width: '100%',
  },
  vibeSubtitle: {
    textAlign: 'center',
    color: '#2B2B2B',
    fontWeight: '700',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.5,
    marginTop: DIMENSIONS.verticalScale(4),
    marginBottom: DIMENSIONS.verticalScale(20),
    width: '100%',
  },
  cardScroll: {
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
    paddingTop: DIMENSIONS.verticalScale(4),
    alignItems: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: DIMENSIONS.moderateScale(18),
    borderTopRightRadius: DIMENSIONS.moderateScale(18),
    marginTop: -DIMENSIONS.verticalScale(12),
    paddingTop: DIMENSIONS.verticalScale(16),
    paddingBottom: DIMENSIONS.verticalScale(16),
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
    width: '100%',
    alignItems: 'center',
  },
  ctaHint: {
    textAlign: 'center',
    color: '#8A93A1',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginTop: DIMENSIONS.verticalScale(12),
  },
  cta: {
    height: DIMENSIONS.BUTTON_HEIGHT,
    borderRadius: DIMENSIONS.moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    width: Math.min(DIMENSIONS.SCREEN_WIDTH * 0.82, 360),
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
  thumbIcon: {
    width: THUMB,
    height: THUMB,
    borderRadius: 5,
    marginRight: 20,
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
});
