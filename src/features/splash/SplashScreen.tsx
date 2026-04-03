import {
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {FC, useEffect} from 'react';
import {useStyles} from 'react-native-unistyles';
import {splashStyles} from '@unistyles/authStyles';
import Animated, {FadeInDown} from 'react-native-reanimated';
import CustomText from '@components/ui/CustomText';
import {resetAndNavigate} from '@utils/NavigationUtils';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';

/**
 * Splash Screen
 *
 * Initial launch screen.
 *
 * Logic:
 * - Displays Logo with animation.
 * - Navigates to `IntroScreen` after 3 seconds.
 */
const SplashScreen: FC = () => {
  // const {styles} = useStyles(splashStyles);

  useEffect(() => {
    const timeoutUd = setTimeout(() => {
      resetAndNavigate('IntroScreen');
    }, 3000);

    return () => clearTimeout(timeoutUd);
  }, []);

  return (
    // <View style={styles.container}>
    //   <StatusBar hidden={Platform.OS !== 'android'} />
    //   <Image
    //     source={require('@assets/images/logo_t.png')}
    //     style={styles.logoImage}
    //   />

    //   <Animated.View
    //     style={styles.animatedContainer}
    //     entering={FadeInDown.delay(400).duration(800)}>
    //     <Image
    //       source={require('@assets/images/tree.png')}
    //       style={styles.treeImage}
    //     />

    //     <CustomText
    //       variant="h5"
    //       style={styles.msgText}
    //       fontFamily="Okra-Medium"
    //       color="#fff">
    //       Building Futures, One Share at a Time in India
    //     </CustomText>
    //   </Animated.View>
    // </View>

    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {/* <StatusBar hidden={Platform.OS !== 'android'} /> */}
      <ImageBackground
        source={require('@assets/images/splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
          style={styles.gradient}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              {/* <Icon name="flash" size={DIMENSIONS.moderateScale(40)} color={COLORS.white} /> */}

              <Animated.View
                // style={styles.animatedContainer}
                entering={FadeInDown.delay(400).duration(400)}>
                <ImageBackground
                  source={require('@assets/images/logo.png')}
                  // style={styles.backgroundImage}
                  style={{
                    width: DIMENSIONS.moderateScale(100),
                    height: DIMENSIONS.moderateScale(100),
                  }}
                  // resizeMode="cover"
                ></ImageBackground>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: DIMENSIONS.moderateScale(80),
    height: DIMENSIONS.moderateScale(80),
    borderRadius: DIMENSIONS.moderateScale(40),
    // backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 3,
    // borderColor: COLORS.white,
  },
});

export default SplashScreen;
