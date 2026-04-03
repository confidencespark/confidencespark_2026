import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {FC, useEffect, useRef} from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';
import {Colors} from '@unistyles/Constants';
const Tabs = ({selectedCategory, categories, onCategoryPress}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorPosition = useSharedValue(0);
  const animatedValues = categories?.map(() => useSharedValue(0));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: indicatorPosition.value}],
  }));

  useEffect(() => {
    let targetIndex = -1;
    categories?.forEach((category: any, index: number) => {
      const isSelected = selectedCategory?._id == category?._id;
      animatedValues[index].value = withTiming(isSelected ? 2 : -15, {
        duration: 500,
      });
      if (isSelected) targetIndex = index;
    });

    if (targetIndex !== -1) {
      indicatorPosition.value = withTiming(targetIndex * 130, {duration: 500});
      runOnJS(() => {
        scrollViewRef?.current?.scrollTo({
          x: targetIndex * 130,
          animated: true,
        });
      });
    }
  }, [selectedCategory]);
  return (
    <View style={styles.sidebar}>
      <ScrollView
        ref={scrollViewRef}
        // contentContainerStyle={{paddingBottom: 50}}
        // showsVerticalScrollIndicator={false}
        bounces={false}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <Animated.View style={{flexDirection: 'row'}}>
          {categories?.map((category: any, index: number) => {
            const animatedStyle = useAnimatedStyle(() => ({
              bottom: animatedValues[index].value,
            }));
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={styles.categoryButton}
                onPress={() => onCategoryPress(category)}>
                {/* <View
                  style={[
                    styles.imageContainer,
                    selectedCategory?._id == category?._id &&
                      styles.selectedImageContainer,
                  ]}>
                 
                </View> */}
                <CustomText
                  fontSize={RFValue(9)}
                  style={[
                    {textAlign: 'center', fontWeight: '500'},
                    selectedCategory?._id == category?._id && {
                      color: Colors.active,
                    },
                  ]}>
                  {category?.name}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    // width: '100%',
    backgroundColor: '#fff',
    borderRightWidth: 0.8,
    borderRightColor: '#eee',
    position: 'relative',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  categoryButton: {
    padding: 5,
    height: 50,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 3,
  },
  imageContainer: {
    borderRadius: 100,
    height: '52%',
    marginBottom: 10,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F7',
    overflow: 'hidden',
  },
  selectedImageContainer: {
    backgroundColor: '#CFFFDB',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 2,
    // top: 10,
    // alignSelf: 'center',
    backgroundColor: Colors.active,
    borderRadius: 50,
    width: '33.3%',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default Tabs;
