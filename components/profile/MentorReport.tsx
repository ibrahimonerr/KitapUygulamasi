import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function MentorReport() {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View 
      entering={FadeInUp.delay(400)}
      style={styles.container}
    >
      <View style={[styles.section, { backgroundColor: colors.surfaceLight }]}>
        <View style={styles.header}>
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Haftalık Analiz</Text>
        </View>
        <Text style={[styles.reportContent, { color: colors.textMuted }]}>
          Okuma verilerin toplandıkça burada haftalık analizlerini görebilirsin.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surfaceLight, marginTop: SPACING.m }]}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={20} color="#FFD700" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ruhun İçin Önerilenler</Text>
        </View>
        <View style={styles.recommendationBox}>
          <View style={[styles.bookMiniature, { backgroundColor: colors.surfaceMedium }]}>
            <Ionicons name="book" size={24} color={colors.textMuted} />
          </View>
          <View style={styles.recommendationText}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>Henüz Öneri Yok</Text>
            <Text style={[styles.bookAuthor, { color: colors.textMuted }]}>Kitap okudukça sana özel öneriler sunacağız.</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.m,
  },
  section: {
    padding: SPACING.l,
    borderRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginLeft: SPACING.s,
  },
  reportContent: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.s,
  },
  bookMiniature: {
    width: 60,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  recommendationText: {
    flex: 1,
  },
  bookTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 18,
  },
  bookAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    marginBottom: 4,
  },
  reason: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
