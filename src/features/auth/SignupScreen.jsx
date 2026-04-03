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
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import CurvedBackground from '@components/ui/CurvedHeader';
import {navigate} from '@utils/NavigationUtils';
import {useAlert} from '@components/ui/AlertProvider';
import {useSignUpMutation} from '@store/api/authApi';
import {extractErrorMessage, toFormData} from '@utils/commonFn';
import {useDispatch} from 'react-redux';
import {setToken} from '@store/slices/authSlice';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants/storageKeys';

// ---------- validation ----------
const Schema = z.object({
  firstName: z.string().min(2, 'Please enter your first name'),
  lastName: z.string().min(2, 'Please enter your last name'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+()\-\s]*$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

/**
 * Sign Up Screen
 *
 * Registers a new user account.
 *
 * Features:
 * - Comprehensive Validation: Name, Phone (optional), Email, Password rules.
 * - API Integration: Calls `useSignUpMutation` to create user.
 * - Auto-Login: Automatically logs the user in and redirects to Home upon success.
 */
export default function SignupScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const {alert, confirm} = useAlert();

  const frozenBottom = React.useRef(insets.bottom || 0).current;
  const [signUp, {isLoading, data, isSuccess, isError, error}] =
    useSignUpMutation();
  const {
    control,
    handleSubmit,
    formState: {errors, isValid, isSubmitting},
  } = useForm({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const [showPass, setShowPass] = useState(false);

  // focus chain
  const lastRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const passRef = useRef();

  const onSubmit = async values => {
    // TODO: call your RTK Query signup mutation here
    // await dispatch(signUpMutation(values)).unwrap()
    // console.log('signup ->', values);
    // navigate('Auth', {screen: 'SignInScreen'});

    try {
      const body = await toFormData({
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        phoneNumber: values.phone || '',
        email: values.email || '',
        password: values?.password || '',
      });

      const res = await signUp(body).unwrap();
      console.log('res', res);
      if (res?.authToken) {
        AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, String(values.email));

        Toast.show({
          type: 'success',
          text1: 'Account Created',
          text2: 'Your account has been created successfully.',
        });
        dispatch(setToken(res?.authToken));

        navigate('UserBottomTab');
      } else
        alert({
          title: 'Sign up failed',
          message: extractErrorMessage(err),
          variant: 'danger',
          actions: [{text: 'Try again', style: 'primary'}],
        });
      // Alert.alert('Sign in failed', extractErrorMessage(err));
    } catch (error) {
      console.log('Signup error', error);
    }
  };

  useEffect(() => {
    if (isError) {
      // Alert.alert('Sign in failed', extractErrorMessage(error));
      alert({
        title: 'Sign up failed',
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
      {/* <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets // iOS 15+
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: frozenBottom + DIMENSIONS.verticalScale(24),
        }}> */}
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24} // nudge focused input above keyboard
        extraHeight={Platform.OS === 'android' ? 80 : 0} // sometimes needed on Android
        contentContainerStyle={{
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: frozenBottom + DIMENSIONS.verticalScale(24),
        }}>
        <Text style={styles.title}>Sign up</Text>

        {/* First name */}
        <Controller
          control={control}
          name="firstName"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  errors.firstName && styles.inputWrapError,
                ]}>
                <TextInput
                  placeholder="First name*"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => lastRef.current?.focus()}
                />
              </View>
              {errors.firstName && (
                <Text style={styles.err}>{errors.firstName.message}</Text>
              )}
            </>
          )}
        />

        {/* Last name */}
        <Controller
          control={control}
          name="lastName"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  errors.lastName && styles.inputWrapError,
                ]}>
                <TextInput
                  ref={lastRef}
                  placeholder="Last name*"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>
              {errors.lastName && (
                <Text style={styles.err}>{errors.lastName.message}</Text>
              )}
            </>
          )}
        />

        {/* Phone */}
        <Controller
          control={control}
          name="phone"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  errors.phone && styles.inputWrapError,
                ]}>
                <TextInput
                  ref={phoneRef}
                  placeholder="Phone number (optional)"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
              {errors.phone && (
                <Text style={styles.err}>{errors.phone.message}</Text>
              )}
            </>
          )}
        />

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
              {isLoading ? 'Please wait…' : 'Sign up'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMuted}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => navigate('Auth', {screen: 'SignInScreen'})}>
            <Text style={styles.footerLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {/* </ScrollView> */}
      <View style={styles.skipContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigate('UserBottomTab')}
          disabled={isLoading}>
          <View style={styles.skipButton}>
            <Text style={styles.btnText}>Skip</Text>
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
