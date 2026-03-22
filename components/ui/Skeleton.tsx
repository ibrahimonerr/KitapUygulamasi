import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export default function Skeleton({ width = '100%', height = 20, style, borderRadius = 8 }: SkeletonProps) {
  const { isDark } = useTheme();
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );
  }, [animation]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animation.value,
      [0, 1],
      isDark 
        ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.12)'] 
        : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.10)']
    );
    return { backgroundColor };
  });

  return (
    <Animated.View style={[
      { width, height, borderRadius },
      animatedStyle,
      style
    ]} />
  );
}
