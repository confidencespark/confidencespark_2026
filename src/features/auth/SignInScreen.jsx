// src/features/auth/SignupScreen.jsx
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import CurvedBackground from '@components/ui/CurvedHeader';
import {navigate} from '@utils/NavigationUtils';
import {useSignInMutation} from '@store/api/authApi';
import {extractErrorMessage, toFormData} from '@utils/commonFn';
import {useDispatch} from 'react-redux';
import {setToken} from '@store/slices/authSlice';
import {useAlert} from '@components/ui/AlertProvider';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants/storageKeys';

// ---------- validation ----------
const Schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string(),
});

/**
 * Sign In Screen
 *
 * Allows existing users to authenticate with their email and password.
 *
 * Features:
 * - Form Validation (Zod + React Hook Form).
 * - Secure password entry toggle.
 * - API Integration: Calls `useSignInMutation` to fetch auth token.
 * - Updates global Redux auth state upon success.
 */
export default function SignInScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {alert, confirm} = useAlert();

  const [signIn, {isLoading, data, isSuccess, isError, error}] =
    useSignInMutation();

  const frozenBottom = React.useRef(insets.bottom || 0).current;

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [showPass, setShowPass] = useState(false);

  // focus chain
  const emailRef = useRef();
  const passRef = useRef();

  const onSubmit = async values => {
    // TODO: call your RTK Query signup mutation here
    // await dispatch(signUpMutation(values)).unwrap()
    // console.log('signup ->', values);
    // navigate('Auth', {screen: 'SignInScreen'});
    // navigation?.navigate?.('Login');

    try {
      const body = await toFormData({
        email: values.email || '',
        password: values?.password || '',
      });
      console.log('signIn body', body);

      const res = await signIn(body).unwrap();
      console.log('res', res);
      if (res?.authToken) {
        AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, String(values.email));
        Toast.show({
          type: 'success',
          text1: 'Welcome Back!',
          text2: 'You have successfully logged in..',
        });
        dispatch(setToken(res?.authToken));

        navigate('UserBottomTab');
      } else
        alert({
          title: 'Login failed',
          message: extractErrorMessage(err),
          variant: 'danger',
          actions: [{text: 'Try again', style: 'primary'}],
        });
      // Alert.alert('Login failed', extractErrorMessage(err));
    } catch (error) {}
  };

  useEffect(() => {
    if (isError) {
      // Alert.alert('Login failed', extractErrorMessage(error));
      alert({
        title: 'Login failed',
        message: extractErrorMessage(error),
        variant: 'danger',
        actions: [{text: 'Try again', style: 'primary'}],
      });
    }
  }, [isError, error]);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <CurvedBackground />

      {/* FORM */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: frozenBottom + DIMENSIONS.verticalScale(24),
        }}>
        <Text style={styles.title}>Log in</Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  errors.email && styles.inputWrapError,
                ]}>
                <TextInput
                  ref={emailRef}
                  placeholder="Email*"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                />
              </View>
              {errors.email && (
                <Text style={styles.err}>{errors.email.message}</Text>
              )}
            </>
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  {paddingRight: DIMENSIONS.moderateScale(44)},
                  errors.password && styles.inputWrapError,
                ]}>
                <TextInput
                  ref={passRef}
                  placeholder="Password*"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowPass(s => !s)}
                  activeOpacity={0.7}>
                  <Ionicons
                    name={showPass ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#2B2B2B"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.err}>{errors.password.message}</Text>
              )}
            </>
          )}
        />
        <View style={styles.forgotContainer}>
          <TouchableOpacity
            onPress={() =>
              navigate?.('Auth', {screen: 'ForgotPasswordScreen'})
            }>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          style={{marginTop: DIMENSIONS.verticalScale(18)}}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={isValid ? ['#8EC6EA', '#234B67'] : ['#C9D7E1', '#C9D7E1']}
            style={styles.button}>
            <Text style={styles.btnText}>
              {isLoading ? 'Please wait…' : 'Log in'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>New User?</Text>
          <TouchableOpacity
            onPress={() => navigate?.('Auth', {screen: 'SignUpScreen'})}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.skipContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'demo-token');
            dispatch(setToken('demo-token'));
            navigate('UserBottomTab');
          }}
          disabled={isLoading}>
          <View style={styles.skipButton}>
            <Text style={styles.btnText}>Continue without account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------- styles ----------
const R = DIMENSIONS.moderateScale(26);
const INPUT_H = Math.max(DIMENSIONS.INPUT_HEIGHT, 54);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},
  skipContainer: {
    position: 'absolute',
    top: '6%',
    right: '5%',
  },
  skipButton: {
    height: 50,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 25,
    // borderRadius: DIMENSIONS.moderateScale(34),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    // backgroundColor: 'white',
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZE_TITLE,
    fontWeight: '800',
    color: '#111827',
    marginBottom: DIMENSIONS.verticalScale(12),
    marginTop: DIMENSIONS.verticalScale(8),
  },

  inputWrap: {
    height: INPUT_H,
    borderRadius: R,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: DIMENSIONS.verticalScale(13),
    paddingHorizontal: DIMENSIONS.moderateScale(18),
    justifyContent: 'center',
  },
  inputWrapError: {
    borderColor: '#DC2626', // red border on error
  },
  input: {
    fontSize: DIMENSIONS.FONT_SIZE_LARGE,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  eye: {
    position: 'absolute',
    right: DIMENSIONS.moderateScale(16),
    height: INPUT_H,
    justifyContent: 'center',
  },
  err: {
    color: '#DC2626',
    fontSize: DIMENSIONS.FONT_SIZE_SMALL,
    marginTop: DIMENSIONS.verticalScale(-10),
    marginBottom: DIMENSIONS.verticalScale(12),
    marginLeft: DIMENSIONS.moderateScale(6),
  },

  button: {
    height: DIMENSIONS.BUTTON_HEIGHT + DIMENSIONS.verticalScale(6),
    borderRadius: DIMENSIONS.moderateScale(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
    fontWeight: '700',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    color: '#2E6C94',
  },
  footer: {
    alignItems: 'center',
    marginTop: DIMENSIONS.verticalScale(16),
  },
  footerMuted: {
    color: '#C0C7CE',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginBottom: DIMENSIONS.verticalScale(6),
  },
  footerLink: {
    color: '#2E6C94',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
});
