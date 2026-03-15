import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING } from '../../../constants/theme';

interface DeadlineCardProps {
  deadline: string;
  targetPage: number;
  colors: any;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ deadline, targetPage, colors }) => {
  return (
    <LinearGradient
      colors={['#FF7A00', '#FF4D00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="timer-outline" size={24} color="#FFF" />
        </View>
        <View>
          <Text style={styles.label}>SIRADAKİ HEDEF</Text>
          <Text style={styles.title}>{targetPage}. Sayfaya Ulaşın</Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.deadlineValue}>{deadline}</Text>
        <Text style={styles.deadlineLabel}>KALAN SÜRE</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.l,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FONTS.primary.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    color: '#FFF',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  deadlineValue: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    color: '#FFF',
  },
  deadlineLabel: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
