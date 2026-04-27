// src/features/auth/ForgotPasswordScreen.jsx
import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import CurvedHeader from '@components/ui/CurvedHeader';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';
import {navigate} from '@utils/NavigationUtils';
import {extractErrorMessage, toFormData} from '@utils/commonFn';
import {useForgotPasswordMutation} from '@store/api/authApi';
import {useAlert} from '@components/ui/AlertProvider';

// --- validation ---
const Schema = z.object({
  email: z.string().email('Enter a valid email'),
});

/**
 * Forgot Password Screen
 *
 * Step 1 of Password Reset Flow.
 *
 * Logic:
 * - Collects user's registered email.
 * - Triggers an OTP request via `useForgotPasswordMutation`.
 * - Navigates to `OtpScreen` if the request is successful.
 */
export default function ForgotPasswordScreen({navigation}) {
  const insets = useSafeAreaInsets();

  const {alert, confirm} = useAlert();

  const [forgotPassword, {isLoading, data, isSuccess, isError, error}] =
    useForgotPasswordMutation();
  const frozenBottom = React.useRef(insets.bottom || 0).current;

  const {
    control,
    handleSubmit,
    formState: {errors, isValid, isSubmitting},
  } = useForm({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {email: ''},
  });

  const onSubmit = async ({email}) => {
    // TODO: call your RTK Query "request OTP" mutation here
    // await requestOtp({ email }).unwrap();
    // Alert.alert('Success', 'OTP sent to your email.');
    // navigate to OTP screen if you have one

    try {
      const body = {
        to: {
          name: email || '',
          email: email || '',
        },
        name: '',
        email: '',
      };
      console.log('body', body);

      const res = await forgotPassword(body).unwrap();
      console.log('forgotPassword', res);
      if (res?.messageId) {
        Toast.show({
          type: 'success',
          text1: 'Email Sent',
          text2: 'We’ve sent a OTP to your email address.',
        });
        navigate('Auth', {
          screen: 'OtpScreen',
          params: {
            body,
          },
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2: 'Unable to send OTP. Please check your email and try again.',
        });
      }

      // Alert.alert('Sign in failed', extractErrorMessage(err));
    } catch (error) {}
  };

  useEffect(() => {
    if (isError) {
      console.log('err', error);

      // Alert.alert('Sign in failed', extractErrorMessage(error));
      alert({
        title: 'Failed',
        // message: extractErrorMessage(error),
        message: 'Invalid email',

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

      {/* gradient header with wave at bottom to match your UI */}
      <CurvedHeader edge="bottom" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: DIMENSIONS.PADDING_HORIZONTAL,
          paddingBottom: frozenBottom + DIMENSIONS.verticalScale(24),
        }}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subTitle}>
          No worries! Enter email id to receive{'\n'}verification OTP
        </Text>

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({field: {onChange, onBlur, value}}) => (
            <>
              <View
                style={[
                  styles.inputWrap,
                  {marginTop: DIMENSIONS.verticalScale(18)},
                  errors.email && styles.inputWrapError,
                ]}>
                <TextInput
                  placeholder="Email*"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              </View>
              {errors.email && (
                <Text style={styles.err}>{errors.email.message}</Text>
              )}
            </>
          )}
        />

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
          style={{marginTop: DIMENSIONS.verticalScale(40)}}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={isValid ? ['#8EC6EA', '#234B67'] : ['#C9D7E1', '#C9D7E1']}
            style={styles.button}>
            <Text style={styles.btnText}>
              {isLoading ? 'Please wait…' : 'Get OTP'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back link */}
        <View style={styles.backWrap}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()}>
            <Text style={styles.backLink}>Back to log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---- styles ----
const R = DIMENSIONS.moderateScale(26);
const INPUT_H = Math.max(DIMENSIONS.INPUT_HEIGHT, 54);

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFFFFF'},

  title: {
    fontSize: DIMENSIONS.FONT_SIZE_TITLE,
    fontWeight: '600',
    color: '#111827',
    marginTop: DIMENSIONS.verticalScale(6),
  },
  subTitle: {
    marginTop: DIMENSIONS.verticalScale(8),
    color: COLORS.textSecondary || '#6B7280',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.4,
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
    fontWeight: '500',
  },

  backWrap: {alignItems: 'center', marginTop: DIMENSIONS.verticalScale(14)},
  backLink: {
    color: '#2E6C94',
    fontWeight: '600',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
  },
});
