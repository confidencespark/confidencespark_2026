import React, {createContext, useContext, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS} from '@constants/colors';
import {DIMENSIONS} from '@constants/dimensions';

const AlertCtx = createContext(null);

/**
 * Global Alert Provider
 *
 * Context provider that manages a global custom modal for Alerts and Confirmations.
 * Replaces the native `Alert.alert` with a themed UI implementation.
 *
 * Usage:
 * const { alert, confirm } = useAlert();
 */
export const AlertProvider = ({children}) => {
  const [state, setState] = useState({
    visible: false,
    title: '',
    message: '',
    actions: [],
    dismissible: true,
    variant: 'info', // 'success' | 'danger' | 'info' | 'warn'
    icon: null, // optional Ionicons name
  });

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const resolverRef = useRef(null);
  const backHandlerRef = useRef(null);
  const timeoutRef = useRef(null);

  const animateIn = () => {
    fade.setValue(0);
    scale.setValue(0.95);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {toValue: 1, friction: 7, useNativeDriver: true}),
    ]).start();
  };

  const animateOut = cb => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 120,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(cb);
  };

  const clearBH = () => {
    backHandlerRef.current?.remove?.();
    backHandlerRef.current = null;
  };

  const hide = result => {
    clearTimeout(timeoutRef.current);
    clearBH();
    animateOut(() => {
      setState(s => ({...s, visible: false}));
      if (resolverRef.current) {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        resolve(result);
      }
    });
  };

  const show = (opts = {}) =>
    new Promise(resolve => {
      resolverRef.current = resolve;

      const {
        title = '',
        message = '',
        actions,
        dismissible = true,
        variant = 'info',
        icon = null,
        autoCloseMs,
      } = opts;

      const normalizedActions =
        actions && actions.length ? actions : [{text: 'OK', style: 'primary'}];

      setState({
        visible: true,
        title,
        message,
        actions: normalizedActions,
        dismissible,
        variant,
        icon,
      });

      animateIn();

      clearBH();
      backHandlerRef.current = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (dismissible) hide({action: 'back'});
          return true;
        },
      );

      clearTimeout(timeoutRef.current);
      if (autoCloseMs) {
        timeoutRef.current = setTimeout(
          () => hide({action: 'auto'}),
          autoCloseMs,
        );
      }
    });

  const alert = options => show(options);

  const confirm = ({
    title,
    message,
    okText = 'OK',
    cancelText = 'Cancel',
    variant = 'info',
    dismissible = true,
  } = {}) =>
    show({
      title,
      message,
      variant,
      dismissible,
      actions: [
        {text: cancelText, style: 'secondary'},
        {text: okText, style: 'primary'},
      ],
    }).then(res => res?.index === 1); // true if OK tapped

  const value = {alert, confirm, hide};

  const variantIcon = v => {
    switch (v) {
      case 'success':
        return 'checkmark-circle';
      case 'danger':
        return 'alert-circle';
      case 'warn':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const onBackdropPress = () => {
    if (state.dismissible) hide({action: 'backdrop'});
  };

  return (
    <AlertCtx.Provider value={value}>
      {children}

      <Modal
        visible={state.visible}
        transparent
        animationType="none"
        onRequestClose={onBackdropPress}>
        <Animated.View style={[styles.backdrop, {opacity: fade}]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onBackdropPress}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={styles.centerWrap} pointerEvents="box-none">
          <Animated.View style={[styles.card, {transform: [{scale}]}]}>
            {/* Icon + Title */}
            <View style={styles.header}>
              <Ionicons
                name={state.icon || variantIcon(state.variant)}
                size={DIMENSIONS.ICON_LARGE}
                color={
                  state.variant === 'danger'
                    ? '#DC2626'
                    : state.variant === 'success'
                      ? '#059669'
                      : state.variant === 'warn'
                        ? '#D97706'
                        : COLORS.primary || '#2563EB'
                }
                // style={{marginRight: DIMENSIONS.moderateScale(8)}}
              />
              <Text style={styles.title} numberOfLines={2}>
                {state.title}
              </Text>
            </View>

            {!!state.message && (
              <Text style={styles.message}>{state.message}</Text>
            )}

            {/* Buttons */}
            <View
              style={[
                styles.actions,
                state.actions.length === 1 && {justifyContent: 'center'},
              ]}>
              {state.actions.map((a, idx) => {
                const isPrimary = a.style === 'primary';
                const isDanger =
                  a.style === 'destructive' || a.style === 'danger';
                const bg = isPrimary
                  ? COLORS.primary || '#2563EB'
                  : isDanger
                    ? '#DC2626'
                    : '#F3F4F6';
                const color = isPrimary || isDanger ? '#FFFFFF' : '#111827';

                return (
                  <TouchableOpacity
                    key={`${a.text}-${idx}`}
                    activeOpacity={0.85}
                    onPress={() => {
                      a?.onPress?.();
                      hide({action: 'button', index: idx, text: a.text});
                    }}
                    style={[
                      styles.btn,
                      {backgroundColor: bg},
                      state.actions.length > 1 &&
                        idx === 0 && {marginRight: DIMENSIONS.moderateScale(8)},
                    ]}>
                    <Text style={[styles.btnText, {color}]}>{a.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertCtx.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertCtx);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};

const CARD_RADIUS = DIMENSIONS.moderateScale(18);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: DIMENSIONS.moderateScale(24),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_RADIUS,
    paddingHorizontal: DIMENSIONS.moderateScale(18),
    paddingVertical: DIMENSIONS.verticalScale(16),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
    alignItems: 'center',
  },
  header: {
    // flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DIMENSIONS.verticalScale(8),
    // borderWidth: 2,
  },
  title: {
    // flex: 1,
    color: '#111827',
    fontWeight: '800',
    fontSize: DIMENSIONS.FONT_SIZE_XLARGE,
    alignItems: 'center',
    // borderWidth: 2,
  },
  message: {
    color: '#4B5563',
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    marginBottom: DIMENSIONS.verticalScale(16),
    lineHeight: DIMENSIONS.FONT_SIZE_MEDIUM * 1.35,
    marginLeft: DIMENSIONS.verticalScale(10),
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    minWidth: DIMENSIONS.moderateScale(96),
    height: DIMENSIONS.verticalScale(44),
    borderRadius: DIMENSIONS.moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DIMENSIONS.moderateScale(14),
  },
  btnText: {
    fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
    fontWeight: '700',
  },
});

//  const showError = () =>
//     alert({
//       title: 'Sign in failed',
//       message: 'Invalid email or password.',
//       variant: 'danger',
//       actions: [{text: 'Try again', style: 'primary'}],
//     });

//   const ask = async () => {
//     const ok = await confirm({
//       title: 'Delete item?',
//       message: 'This action cannot be undone.',
//       variant: 'warn',
//       okText: 'Delete',
//       cancelText: 'Cancel',
//     });
//     // ok === true if "Delete" pressed
//   };
