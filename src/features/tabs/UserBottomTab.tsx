// UserBottomTab.jsx
import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import LinearGradient from 'react-native-linear-gradient'; // if you want gradient bg

import Icon from '@components/global/Icon'; // must forward the `color` prop!
import {DIMENSIONS} from '@constants/dimensions';
import HomeScreen from '@features/main/home/HomeScreen';
import ProfileScreen from '@features/profile/ProfileScreen';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {logout} from '@store/slices/authSlice';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import UserIcon from '../../assets/images/user_icon.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@constants/storageKeys';

const Tab = createBottomTabNavigator();

const BLUE = '#73A9C9'; // bar bg (like your mock)
const ACTIVE = '#0E3753'; // focused label/icon (dark navy)
const INACT = '#FFFFFF'; // inactive label/icon (white)

const Empty = () => null; // used if you want Logout to be an action, not a screen

/**
 * User Bottom Tab Navigator
 *
 * The main dashboard for authenticated users.
 *
 * Logic:
 * - Displays 'Home' and 'Profile' tabs.
 * - Profile Tab Interception:
 *   Verifies the auth token before allowing navigation to Profile.
 *   Redirects to the Auth flow if the user is not logged in.
 */
export default function UserBottomTab() {
  const dispatch = useDispatch();

  const {bottom} = useSafeAreaInsets();
  // const dispatch = useDispatch();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        // Let RN Navigation drive colors
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACT,

        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: DIMENSIONS.FONT_SIZE_MEDIUM,
        },
        tabBarItemStyle: {
          paddingVertical: DIMENSIONS.verticalScale(6),
        },
        tabBarStyle: {
          backgroundColor: BLUE,
          borderTopWidth: 0,
          height: DIMENSIONS.verticalScale(72),
          // paddingTop: DIMENSIONS.verticalScale(2),
          paddingBottom: bottom + DIMENSIONS.verticalScale(10),
          elevation: 8, // Android shadow
        },

        // If you prefer a gradient bar:
        // tabBarBackground: () => (
        //   <LinearGradient
        //     colors={['#7FB4D1', '#5E94B8']}
        //     start={{x: 0, y: 0}} end={{x: 1, y: 1}}
        //     style={StyleSheet.absoluteFill}
        //   />
        // ),
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused, size}) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              iconFamily="Ionicons"
              size={25}
              color={color} // <- IMPORTANT: use the provided color
            />
          ),
          tabBarLabel: 'Home',
        }}
      />

      {/* Option A: Logout is just a screen */}
      {/* <Tab.Screen
        name="Logout"
        component={PanScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon
              name="logout-variant"
              iconFamily="MaterialCommunityIcons"
              size={26}
              color={color}
            />
          ),
          tabBarLabel: 'Logout',
        }}
      /> */}

      {/* Option B (like many apps): Logout triggers an action, no screen */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon
              name="person-sharp"
              iconFamily="Ionicons"
              size={25}
              color={color}
            />
          ),
          tabBarLabel: 'Profile',
        }}
        listeners={({navigation}) => ({
          tabPress: e => {
            // Always stop the default tab switch first
            e.preventDefault();

            // Then decide where to go
            AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
              .then(token => {
                if (token) {
                  // Focus the Profile tab (since we prevented default)
                  navigation.jumpTo('Profile'); // use jumpTo for tab navigators
                } else {
                  // Send to auth flow
                  resetAndNavigate('Auth', {screen: 'SignInScreen'});
                }
              })
              .catch(() => {
                // On any storage error, be safe and send to auth
                resetAndNavigate('Auth', {screen: 'SignInScreen'});
              });
          },
        })}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});
