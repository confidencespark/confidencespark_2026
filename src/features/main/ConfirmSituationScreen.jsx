// src/features/situation/ConfirmSituationScreen.jsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DIMENSIONS} from '@constants/dimensions';
import {navigate} from '@utils/NavigationUtils';
import {PersistentBottomNav, PERSISTENT_NAV_HEIGHT} from '@components/ui/PersistentBottomNav';
import {FadeInView} from '@components/ui/FadeInView';
import {useEditSituationMutation} from '@store/api/confidenceApi';

/**
 * Confirm Situation Screen
 *
 * Displays the selected high-stakes situation (e.g., Interview, Pitch).
 *
 * Logic:
 * - Shows a hero image and motivational subtitle for the context.
 * - 'Proceed' confirms the situation via API (`useEditSituationMutation`).
 * - Navigates to `MoodSelectScreen` to choose the emotional target.
 */
export default function ConfirmSituationScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const [editSituation, {isLoading}] = useEditSituationMutation();

  const {
    title = 'Interview',
    subtitle = 'You’re not here to impress.\nyou’re here to connect.',
    image = {
      uri: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800&auto=format&fit=crop',
    },
  } = route?.params || {};

  const onProceed = async () => {
    // if this lives under Main stack:
    // navigation.navigate('Main', {screen: 'MoodSelectScreen', params: {situationTitle: title}});
    // navigation.navigate('MoodSelect', {situationTitle: title});

    try {
      const body = {
        situation: route?.params?.title,
        confidence_id: 0,
      };
      await editSituation(body).unwrap();
    } catch (error) {
      console.log('editSituation (offline)', error);
    }
    navigate('Main', {
      screen: 'MoodSelectScreen',
      params: {...(route?.params || {})},
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Body */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          {paddingBottom: (insets.bottom || 0) + PERSISTENT_NAV_HEIGHT + DIMENSIONS.verticalScale(28)},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.body}>
          <FadeInView delay={0} duration={350}>
            <Image source={image} style={styles.hero} />
          </FadeInView>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.subtitle}>{subtitle}</Text>

          <Text style={styles.helper}>
            Tap Next below to{'\n'}select the vibe
          </Text>
        </View>
      </ScrollView>

      <PersistentBottomNav
        navigation={navigation}
        onNext={onProceed}
        nextDisabled={isLoading}
      />
    </SafeAreaView>
  );
}

const MAX_W = 380; // keep column width like your mock on larger phones
const HERO = DIMENSIONS.moderateScale(280); // bigger image
const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},

  header: {
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
  },
  backBtn: {
    width: DIMENSIONS.moderateScale(40),
    height: DIMENSIONS.moderateScale(40),
    borderRadius: DIMENSIONS.moderateScale(20),
    backgroundColor: '#EAF2F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollBody: {
    alignItems: 'center',
    paddingBottom: DIMENSIONS.verticalScale(28),
    paddingTop: DIMENSIONS.verticalScale(28),
  },

  body: {
    width: '100%',
    maxWidth: MAX_W,
    alignItems: 'center',
    // spacing tuned to screenshot
    paddingTop: DIMENSIONS.verticalScale(22), // big top white space
  },

  hero: {
    width: HERO,
    height: HERO,
    borderRadius: DIMENSIONS.moderateScale(12),
    marginBottom: DIMENSIONS.verticalScale(22), // space before title
  },

  title: {
    textAlign: 'center',
    fontSize: DIMENSIONS.moderateScale(28),
    lineHeight: DIMENSIONS.moderateScale(34),
    fontWeight: '800',
    color: '#2E6C94',
    marginBottom: DIMENSIONS.verticalScale(14), // space before subtitle
  },
  subtitle: {
    textAlign: 'center',
    color: '#2B2B2B',
    fontWeight: '600',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.45,
    marginBottom: DIMENSIONS.verticalScale(36), // larger gap like mock
  },
  helper: {
    textAlign: 'center',
    color: '#A6AFB7', // lighter gray
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginBottom: DIMENSIONS.verticalScale(14),
    marginTop: DIMENSIONS.verticalScale(14),
  },

  btnWrap: {alignSelf: 'center'},
  button: {
    height: DIMENSIONS.BUTTON_HEIGHT, // compact pill
    width: Math.min(DIMENSIONS.SCREEN_WIDTH * 0.58, 260), // smaller width like mock
    borderRadius: DIMENSIONS.moderateScale(30),
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
