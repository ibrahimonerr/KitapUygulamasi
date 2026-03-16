import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const BADGES = [
  { id: '1', icon: 'bonfire', label: '7 Gün Seri', color: '#FF4136' },
  { id: '2', icon: 'moon', label: 'Gece Kuşu', color: '#B10DC9' },
  { id: '3', icon: 'trophy', label: '500 Sayfa', color: '#FFD700' },
  { id: '4', icon: 'library', label: 'Bilge', color: '#39CCCC' },
];

export default function Achievements() {
  const { colors } = useTheme();

  return (
    <Animated.View 
      entering={FadeInDown.delay(500)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Başarı Kupası</Text>
      <View style={styles.grid}>
        {BADGES.map((badge, index) => (
          <View key={badge.id} style={styles.badgeWrapper}>
            <View style={[styles.badgeCircle, { backgroundColor: colors.surfaceMedium }]}>
              <Ionicons name={badge.icon as any} size={28} color={badge.color} />
            </View>
            <Text style={[styles.badgeLabel, { color: colors.text }]}>{badge.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.l,
  },
  title: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 18,
    marginBottom: SPACING.m,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  badgeWrapper: {
    alignItems: 'center',
    width: '22%',
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeLabel: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
    textAlign: 'center',
  },
});
