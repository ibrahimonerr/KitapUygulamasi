import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import Animated, { FadeInDown } from 'react-native-reanimated';

const DAYS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
const ACTIVITY_DATA = [45, 120, 0, 60, 90, 150, 30]; // Dakika cinsinden örnek veri

export default function WeeklyHeatmap() {
  const { colors } = useTheme();

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return 0.1;
    if (minutes < 30) return 0.3;
    if (minutes < 60) return 0.6;
    return 1;
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(300)}
      style={[styles.container, { backgroundColor: colors.surfaceLight }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Haftalık Okuma Isısı</Text>
      <View style={styles.grid}>
        {DAYS.map((day, index) => (
          <View key={index} style={styles.dayColumn}>
            <View 
              style={[
                styles.block, 
                { 
                  backgroundColor: colors.primary, 
                  opacity: getIntensity(ACTIVITY_DATA[index]) 
                }
              ]} 
            />
            <Text style={[styles.dayText, { color: colors.textMuted }]}>{day}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.l,
    borderRadius: 24,
    marginBottom: SPACING.m,
  },
  title: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginBottom: SPACING.m,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dayColumn: {
    alignItems: 'center',
  },
  block: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
});
