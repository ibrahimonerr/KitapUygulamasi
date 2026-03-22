import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface BounceButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

/**
 * Pro Max UI Component: 
 * Adds physics-based interactive bounce effect to any button element.
 */
export default function BounceButton({ children, style, scaleTo = 0.95, ...rest }: BounceButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        {...rest}
        onPressIn={(e) => {
          scale.value = withSpring(scaleTo, { damping: 15, stiffness: 250 });
          rest.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 12, stiffness: 200 });
          rest.onPressOut?.(e);
        }}
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
