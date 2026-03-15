import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={[colors.background, isDark ? '#1a1a2e' : '#FFFFFF']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.surfaceLight }]}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceMedium }]}>
            <Ionicons name="person" size={40} color={colors.textMuted} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>İbrahim Öner</Text>
          <Text style={[styles.userBio, { color: colors.textMuted }]}>Kitap aşığı ve mentor.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceGlass }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Bitirilen</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceGlass }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>450</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Not</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceGlass }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>128</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Alıntı</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.m,
  },
  userName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 22,
    marginBottom: 4,
  },
  userBio: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.l,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SPACING.l,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
