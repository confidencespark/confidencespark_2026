import {FC} from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors, Fonts} from '../../utils/Constants';
import CustomText from './CustomText';

interface CustomButtonProps {
  onPress: () => void;
  title: string;
  disabled: boolean;
  loading: boolean;
}

/**
 * Custom Button Component
 *
 * Standard primary/secondary action button.
 * Supports loading state (spinner) and disabled state.
 */
const CustomButton: FC<CustomButtonProps> = ({
  onPress,
  title,
  disabled,
  loading,
  style,
  variant,
  fontW,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: disabled ? Colors.disabled : Colors.secondary,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={'white'} size={'small'} />
      ) : (
        <CustomText
          variant={variant || 'h6'}
          style={[styles?.text, {fontWeight: fontW || 'normal'}]}
          fontFamily={Fonts?.heading2}>
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    width: '100%',
  },
  text: {
    color: '#FFFFFF',
  },
});

export default CustomButton;
