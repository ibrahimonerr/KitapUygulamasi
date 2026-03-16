import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function IntellectualIdentity() {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View 
      entering={FadeInDown.delay(200)}
      style={styles.container}
    >
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.blurCard}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.highlight }]}>
            <Ionicons name="infinite" size={24} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Entelektüel Kimlik</Text>
            <Text style={[styles.identityTitle, { color: colors.text }]}>Edebi Kaşif</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Derinlikli romanlar ve varoluşçu felsefeye olan ilgin seni bir kaşif kılıyor.
            </Text>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.m,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurCard: {
    padding: SPACING.l,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  identityTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
