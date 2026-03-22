import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { FONTS, SPACING } from '../../constants/theme';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({ iconName = 'book-outline', title, description, style }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(600).springify().damping(15)} style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceMedium }]}>
        <Ionicons name={iconName} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.l,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  description: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '85%',
  },
});
