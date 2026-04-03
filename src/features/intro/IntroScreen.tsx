// src/features/intro/IntroScreen.jsx
import React, {useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';

// import { useNavigation } from '@react-navigation/native';

import splashImg from '@assets/images/splash.png';
import logoImg from '@assets/images/logo.png';

import CustomButton from '@components/ui/CustomButton';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import {STRINGS} from '@constants/strings';
import {navigate} from '@utils/NavigationUtils';
import {useGetStartedMutation} from '@store/api/confidenceApi';
import {useSelector, useDispatch} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {hideNavBar, showNavBar} from '@utils/androidNavBar';
import Toast from 'react-native-toast-message';
import {setToken} from '@store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@constants/storageKeys';

/**
 * Introduction Screen
 *
 * The first screen a user sees after the Splash screen.
 * - Displays the brand message.
 * - 'Get Started' initiates the app session (no device tracking).
 * - Routes to Home (if already auth'd) or Sign In based on state.
 */
const IntroScreen = () => {
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector(state => state.auth);

  // const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Freeze the top inset ONCE so it won't change after minimize/resume
  const frozenTopInset = useRef(insets.top || 0).current;

  const [getStarted, {isLoading}] = useGetStartedMutation();

  const handleGetStarted = async () => {
    try {
      await getStarted().unwrap();
      if (isAuthenticated) navigate('UserBottomTab');
      else navigate('Auth', {screen: 'SignInScreen'});
    } catch (error) {
      // No backend: skip Sign In, go straight to app (demo mode)
      console.log('handleGetStarted (offline)', error);
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'demo-token');
      dispatch(setToken('demo-token'));
      navigate('UserBottomTab');
    }
  };

  useFocusEffect(
    useCallback(() => {
      hideNavBar();
      return () => showNavBar();
    }, []),
  );

  return (
    // Use SafeAreaView, but DO NOT include 'top' — we apply frozen inset manually
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Transparent status bar over content */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
        hidden={false}
      />
      <ImageBackground source={splashImg} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.40)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.60)']}
          style={styles.gradient}>
          <ScrollView
            style={styles.scroll} // grow the ScrollView, not the content
            contentContainerStyle={{
              // stable top space = frozen inset + design spacing
              paddingTop: frozenTopInset + DIMENSIONS.verticalScale(24),
              paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
              paddingBottom: DIMENSIONS.PADDING_VERTICAL,
              // fill the screen height without using flexGrow (avoids jump on resume)
              minHeight: DIMENSIONS.SCREEN_HEIGHT - DIMENSIONS.PADDING_VERTICAL,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}>
            {/* Inner column → space-between without flexGrow on content */}
            <View style={styles.column}>
              {/* Logo */}
              <View style={styles.logoWrap}>
                <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                  <Image source={logoImg} style={styles.logo} />
                </Animated.View>
              </View>

              {/* Text block */}
              <View style={styles.content}>
                <Text style={styles.title}>{STRINGS.CONFIDENCE_ON_DEMAND}</Text>
                <Text style={styles.subtitle}>{STRINGS.WELCOME_MESSAGE}</Text>
                <Text style={styles.desc}>{STRINGS.PICK_VIBE_MESSAGE}</Text>
              </View>

              {/* CTA */}
              <View style={styles.ctaWrap}>
                <CustomButton
                  title={STRINGS.GET_STARTED}
                  onPress={handleGetStarted}
                  style={styles.cta}
                  variant="h4"
                  fontW="bold"
                  loading={isLoading}
                />
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.black},
  bg: {flex: 1, width: '100%', height: '100%'},
  gradient: {flex: 1},

  scroll: {flex: 1}, // IMPORTANT: no flexGrow on contentContainer

  column: {
    flex: 1,
    justifyContent: 'space-between',
  },

  logoWrap: {
    alignItems: 'center',
    marginBottom: DIMENSIONS.verticalScale(32),
  },
  logo: {
    width: DIMENSIONS.moderateScale(90),
    height: DIMENSIONS.moderateScale(90),
    borderRadius: DIMENSIONS.moderateScale(45),
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE_HEADER,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: DIMENSIONS.MARGIN_LARGE,
  },
  subtitle: {
    fontSize: DIMENSIONS.FONT_SIZE_LARGE,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: DIMENSIONS.MARGIN_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_LARGE * 1.4,
  },
  desc: {
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.4,
    opacity: 0.9,
  },

  ctaWrap: {
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
  },
  cta: {
    marginTop: DIMENSIONS.MARGIN_LARGE,
    backgroundColor: COLORS.primary,
    width: DIMENSIONS.moderateScale(250),
    height: DIMENSIONS.moderateScale(60),
    borderRadius: 35,
  },
});

export default IntroScreen;
