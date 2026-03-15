import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CircularProgress from 'react-native-circular-progress-indicator';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface TimerSectionProps {
  readingMinutes: number;
  dailyGoal: number;
  streak: number;
  isGoalReached: boolean;
  onStartTimer: () => void;
  onOpenGoalModal: () => void;
  onShowStreakDetails: () => void;
  colors: any;
  isDark: boolean;
}

export const TimerSection: React.FC<TimerSectionProps> = ({
  readingMinutes,
  dailyGoal,
  streak,
  isGoalReached,
  onStartTimer,
  onOpenGoalModal,
  onShowStreakDetails,
  colors,
  isDark
}) => {
  return (
    <View style={styles.dashboardContainer}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.streakHeader}>
        <TouchableOpacity
          style={[
            styles.streakBadge,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFF',
              borderColor: '#FF7A00',
              borderWidth: 1.5,
              shadowColor: "#FF7A00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4
            }
          ]}
          onPress={onShowStreakDetails}
        >
          <Ionicons name="flame" size={18} color="#FF7A00" style={{ marginRight: 6 }} />
          <Text style={[
            styles.streakText,
            {
              color: '#FF7A00',
              fontFamily: FONTS.primary.bold
            }
          ]}>
            {streak} Günlük Seri
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={[styles.arcContainer, { marginTop: -15 }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onOpenGoalModal} style={styles.progressTouch}>
          <CircularProgress
            value={readingMinutes}
            radius={width * 0.28}
            duration={1500}
            maxValue={dailyGoal}
            activeStrokeColor={colors.primary}
            activeStrokeSecondaryColor={'#8a2be2'}
            inActiveStrokeColor={isDark ? colors.surfaceMedium : '#E0E0E0'}
            inActiveStrokeOpacity={0.5}
            inActiveStrokeWidth={12}
            activeStrokeWidth={12}
            dashedStrokeConfig={{ count: 40, width: 3 }}
            showProgressValue={false}
          />
          <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }]}>
            <Text style={{ 
              fontFamily: FONTS.primary.regular, 
              fontSize: 13, 
              color: colors.textMuted,
              marginBottom: 2
            }}>Bugün Okunan</Text>
            
            <Text style={{ 
              fontFamily: FONTS.primary.bold, 
              fontSize: 56, 
              color: colors.text,
              lineHeight: 64
            }}>{readingMinutes}'</Text>
            
            <Text style={{ 
              fontFamily: FONTS.primary.semiBold, 
              fontSize: 14, 
              color: colors.textMuted,
              marginTop: 2
            }}>Hedef: {dailyGoal} dk</Text>
          </View>
          <View style={styles.editGoalBadge}>
            <Ionicons name="pencil" size={12} color="#FFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(800)} style={{ alignItems: 'center', marginTop: 35, width: '100%', paddingHorizontal: SPACING.xl }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onStartTimer}
          style={styles.startButtonContainer}
        >
          <LinearGradient
            colors={['#0066FF', '#8a2be2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Okumaya Devam Et</Text>
            <Ionicons name="play" size={18} color="#FFF" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
    width: '100%',
  },
  streakHeader: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
  },
  streakText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  arcContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.m,
  },
  progressTouch: {
    position: 'relative',
  },
  editGoalBadge: {
    position: 'absolute',
    right: 15,
    top: 15,
    backgroundColor: '#8a2be2',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  startButtonContainer: {
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
