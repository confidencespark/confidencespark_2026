import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@unistyles/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import {goBack, navigate, resetAndNavigate} from '../../utils/NavigationUtils';
import CustomText from './CustomText';
import Icon from '@components/global/Icon';
import CustomButton from './CustomButton';

/**
 * Custom Navigation Header
 *
 * Replaces the default stack header.
 *
 * Props:
 * - title: Screen title.
 * - isBack: Checks if we should show the back chevron.
 * - search: Option to show search icon.
 */
const CustomHeader: FC<{title: string; search: boolean; isBack: Boolean}> = ({
  title,
  search,
  isBack,
}) => {
  return (
    <SafeAreaView>
      <View style={styles.flexRow}>
        {isBack && (
          <Pressable onPress={() => goBack()}>
            <Icon
              name="chevron-back"
              color={Colors.text}
              size={RFValue(16)}
              iconFamily="Ionicons"
            />
          </Pressable>
        )}

        <CustomText variant="h4" fontFamily={Fonts.Medium} style={styles.text}>
          {title}
        </CustomText>
        <View>
          {search && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigate('SearchScreen')}>
              <Icon
                name="search"
                color={Colors.text}
                size={RFValue(16)}
                iconFamily="Ionicons"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'space-between',
    padding: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 0.6,
    borderColor: Colors.border,
  },
  text: {
    textAlign: 'center',
  },
});
export default CustomHeader;
