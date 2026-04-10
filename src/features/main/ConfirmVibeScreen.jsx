// src/features/mood/ConfirmVibeScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DIMENSIONS} from '@constants/dimensions';
import {navigate} from '@utils/NavigationUtils';
import {PersistentBottomNav, PERSISTENT_NAV_HEIGHT} from '@components/ui/PersistentBottomNav';
import {FadeInView} from '@components/ui/FadeInView';
import {useEditMoodMutation} from '@store/api/confidenceApi';
import {getConfirmVibeSubtitle} from '@constants/confirmVibeSubtitles';

const calm_bg = require('@assets/images/Confirm_calm.png');
const calm_hero = require('@assets/images/Calm_Grounded.png');
const pumped_bg = require('@assets/images/Confirm_Pumped.png');
const pumped_hero = require('@assets/images/Pumped_Powerful.png');
const playful_bg = require('@assets/images/Confirm_Playful.png');
const playful_hero = require('@assets/images/Playful_Loose.png');

const THEMES = {
  calm: {
    // tint: 'rgba(191, 230, 204, 0.88)',
    accent: '#2E6C94',
    bg: calm_bg,
    hero: calm_hero,
    title: 'Calm & Grounded',
  },
  power: {
    // tint: 'rgba(195, 225, 255, 0.9)',
    accent: '#2E6C94',
    bg: pumped_bg,
    hero: pumped_hero,
    title: 'Pumped & Powerful',
  },
  playful: {
    // tint: 'rgba(255, 205, 205, 0.9)',
    accent: '#2E6C94',
    bg: playful_bg,
    hero: playful_hero,
    title: 'Playful & Loose',
  },
};

/**
 * Confirm Vibe Screen
 *
 * Validates the user's chosen mood/vibe.
 *
 * Logic:
 * - Renders a themed background based on the selected mood.
 * - 'Start' confirms the mood via API (`useEditMoodMutation`).
 * - Initiates the content lookup via `LookupScreen`.
 */
export default function ConfirmVibeScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const [editMood, {isLoading}] = useEditMoodMutation();

  const moodKey = route?.params?.mood || 'calm';
  const situationKey = route?.params?.situationKey;
  const theme = THEMES[moodKey] || THEMES.calm;
  const subtitleText = getConfirmVibeSubtitle(situationKey, moodKey);

  const onStart = async () => {
    try {
      const body = {
        mood: theme?.title,
        confidence_id: 0,
      };
      await editMood(body).unwrap();
    } catch (error) {
      console.log('editMood (offline)', error);
    }
    navigate('Main', {
      screen: 'LookupScreen',
      params: {
        situation_key: situationKey,
        vibe_key: moodKey,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Patterned background + tint */}
      <ImageBackground source={theme.bg} style={StyleSheet.absoluteFill}>
        <View
          style={[
            StyleSheet.absoluteFill,
            // {backgroundColor: theme.tint}
          ]}
        />
      </ImageBackground>

      {/* Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: (insets.bottom || 0) + PERSISTENT_NAV_HEIGHT + DIMENSIONS.verticalScale(24),
          flex: 1,
          justifyContent: 'center',
        }}>
        <FadeInView delay={0} duration={400}>
          <Image source={theme.hero} style={styles.hero} />
        </FadeInView>

        {/* Title with accent like mock */}
        <Text style={[styles.title, {color: theme.accent}]}>
          {theme.title}{' '}
          {/* <Text style={{color: '#2B6AA8'}}>& Grounded</Text> */}
        </Text>

        <Text style={styles.subtitle}>{subtitleText}</Text>
      </ScrollView>

      <PersistentBottomNav
        navigation={navigation}
        onNext={onStart}
        nextDisabled={isLoading}
      />
    </SafeAreaView>
  );
}

const HERO = DIMENSIONS.moderateScale(230);
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},

  header: {
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
  },
  backBtn: {
    width: DIMENSIONS.moderateScale(40),
    height: DIMENSIONS.moderateScale(40),
    borderRadius: DIMENSIONS.moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    width: HERO,
    height: HERO,
    borderRadius: DIMENSIONS.moderateScale(14),
    marginTop: DIMENSIONS.verticalScale(16),
    marginBottom: DIMENSIONS.verticalScale(22),
    // soft depth
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },

  title: {
    fontSize: DIMENSIONS.moderateScale(30),
    lineHeight: DIMENSIONS.moderateScale(36),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: DIMENSIONS.verticalScale(30),
    marginBottom: DIMENSIONS.verticalScale(30),
  },
  subtitle: {
    textAlign: 'center',
    color: '#2B2B2B',
    fontWeight: '700',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.5,
    marginBottom: DIMENSIONS.verticalScale(30),
  },

  button: {
    height: DIMENSIONS.BUTTON_HEIGHT,
    width: Math.min(DIMENSIONS.SCREEN_WIDTH * 0.62, 300),
    borderRadius: DIMENSIONS.moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
});
// ConfidenceSpark workspace batch
