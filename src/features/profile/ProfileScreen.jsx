import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import Toast from 'react-native-toast-message';
import {useDispatch} from 'react-redux';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import Icon from '@components/global/Icon'; // must forward the `color` prop!
import {logout} from '@store/slices/authSlice';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {
  useGetProfileMutation,
  useDeleteAccountMutation,
} from '@store/api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants/storageKeys';

/**
 * Profile Screen
 *
 * Displays user account information and account actions.
 *
 * Logic:
 * - Fetches user profile via `useGetProfileMutation` on mount.
 * - Displays Name, Email, and Phone (read-only).
 * - Actions: Logout (clears Redux/Storage), Delete Account (Permanently deletes user).
 */
export default function ProfileScreen() {
  const dispatch = useDispatch();

  const [getProfile, {isLoading, data, isSuccess, isError, error}] =
    useGetProfileMutation();

  const [deleteAccount] = useDeleteAccountMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBlocking, setIsBlocking] = useState(true);

  const handleLogout = () => {
    Toast.show({
      type: 'success',
      text1: 'Logout success!',
    });
    dispatch(logout());
    //    After logging out, reset to Auth stack (adjust to your route names)
    resetAndNavigate('Auth', {
      screen: 'SignInScreen',
    });
  };

  const handleDelete = async () => {
    setIsBlocking(true);

    try {
      const user_email = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const res = await deleteAccount({email: user_email});
      console.log(res);

      if (res?.data == null) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted!',
        });
        dispatch(logout());
        setShowConfirm(false);
        setIsBlocking(false);
        // After delete, reset to Auth stack (adjust to your route names)
        resetAndNavigate('Auth', {
          screen: 'SignInScreen',
        });
      } else if (res?.error) {
        handleLogout();
      }
    } catch (error) {
      console.log('error in deleteAccount');
    }
    setShowConfirm(false);

    setIsBlocking(false);
  };

  const getProfileData = async () => {
    try {
      const user_email = await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
      const res = await getProfile({email: user_email});
      console.log(res);
      if (res?.data) {
        const {firstName, lastName, phoneNumber, email} = res?.data || {};
        setName(`${firstName} ${lastName}`);
        setEmail(email);
        setPhone(phoneNumber ? `${phoneNumber}` : '');
      }
    } catch (error) {
      console.log('error in getProfile');
    }

    setIsBlocking(false);
  };

  useEffect(() => {
    getProfileData();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* avatar */}
        <View style={styles.avatar}>
          <UserIcon width={28} height={28} color="#9AA3AF" />
        </View>

        {/* form */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name*</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            style={[
              styles.input,
              //   {backgroundColor: '#F3F4F6', color: '#9CA3AF'}, // grayish look
            ]}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email*</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone"
            keyboardType="phone-pad"
            style={styles.input}
            editable={false}
          />
        </View>

        {/* actions */}
        <View style={styles.actionContainer}>
          <Text style={[styles.label, {marginTop: 12, fontSize: 16}]}>
            Actions
          </Text>

          <Pressable style={styles.rowAction} onPress={handleLogout}>
            {/* <LinkIcon /> */}
            <Icon
              name="logout"
              iconFamily="MaterialIcons"
              size={26}
              color={'#2F7CC0'}
            />
            <Text style={styles.linkText}>Logout</Text>
          </Pressable>

          <Pressable
            style={styles.rowAction}
            onPress={() => setShowConfirm(true)}
            accessibilityLabel="Delete account">
            <Icon
              name="delete-outline"
              iconFamily="MaterialIcons"
              size={26}
              color={'#DC2626'}
            />
            <Text style={styles.deleteText}>Delete Account</Text>
          </Pressable>
        </View>
      </View>

      {/* confirm modal */}
      <Modal
        visible={showConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.alertIconWrap}>
              <AlertIcon />
            </View>

            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete your account?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.btn, styles.btnOutline]}
                onPress={() => setShowConfirm(false)}
                disabled={isBlocking}>
                <Text style={[styles.btnText, styles.btnOutlineText]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={handleDelete}
                disabled={isBlocking}>
                <Text style={[styles.btnText, styles.btnPrimaryText]}>
                  {isBlocking ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    'Yes, Delete'
                  )}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

/* ---------------- Icons (inline SVG so no transformer needed) ---------------- */

function UserIcon({width = 24, height = 24, color = '#9AA3AF'}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24">
      <Path
        d="M12 12a5 5 0 100-10 5 5 0 000 10z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        d="M4 21a8 8 0 0116 0"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function AlertIcon() {
  return (
    <Svg width={50} height={50} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill="#DC2626" />
      <Path d="M12 7v6" stroke="#FFFF" strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="17" r="1.5" fill="#FFFF" />
    </Svg>
  );
}

/* ---------------- Styles ---------------- */

const COLORS = {
  bg: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#2F7CC0',
  danger: '#DC2626',
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
  },
  container: {
    // paddingVertical: 20,
    paddingHorizontal: 10,
  },
  header: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8},
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF2F7',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 30,
  },

  formGroup: {marginTop: 20},
  label: {fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  actionContainer: {
    marginTop: 20,
  },

  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  linkText: {color: COLORS.primary, fontSize: 16, fontWeight: '600'},
  deleteText: {color: COLORS.danger, fontSize: 16, fontWeight: '600'},

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    gap: 8,
    alignItems: 'center',
  },
  alertIconWrap: {
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalBody: {
    marginTop: 6,
    color: COLORS.subtext,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    width: '80%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  btnText: {fontWeight: '700', fontSize: 15},
  btnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  btnOutlineText: {color: COLORS.text},
  btnPrimary: {backgroundColor: COLORS.primary},
  btnPrimaryText: {color: 'white'},

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
