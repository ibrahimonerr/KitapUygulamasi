import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGamification, BADGE_DEFINITIONS } from '../../store/GamificationContext';

export default function Achievements() {
  const { colors, isDark } = useTheme();
  const { data: gamification } = useGamification();

  return (
    <Animated.View 
      entering={FadeInDown.delay(500)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Başarı Kupası</Text>
      <View style={styles.grid}>
        {BADGE_DEFINITIONS.map((badge, index) => {
          const isEarned = gamification.badges.includes(badge.id);
          
          return (
            <View key={badge.id} style={styles.badgeWrapper}>
              <View style={[
                styles.badgeCircle, 
                { backgroundColor: isEarned ? colors.surfaceMedium : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                !isEarned && { borderColor: 'transparent' }
              ]}>
                <Ionicons 
                  name={badge.icon as any} 
                  size={28} 
                  color={isEarned ? badge.color : colors.textMuted} 
                  style={{ opacity: isEarned ? 1 : 0.3 }}
                />
              </View>
              <Text 
                style={[
                  styles.badgeLabel, 
                  { color: isEarned ? colors.text : colors.textMuted },
                  !isEarned && { opacity: 0.5 }
                ]}
              >
                {badge.label}
              </Text>
            </View>
          );
        })}
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
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  badgeWrapper: {
    alignItems: 'center',
    width: '30%',
    marginBottom: SPACING.m,
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
