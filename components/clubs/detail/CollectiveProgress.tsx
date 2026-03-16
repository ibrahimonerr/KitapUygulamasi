import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FONTS, SPACING } from '../../../constants/theme';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  FadeInDown,
  Layout
} from 'react-native-reanimated';

interface CollectiveProgressProps {
  colors: any;
  isDark: boolean;
}

const MEMBERS: any[] = [];

export const CollectiveProgress: React.FC<CollectiveProgressProps> = ({ colors, isDark }) => {
  
  // Me Indicator Pulse Animation
  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true) }],
      opacity: withRepeat(withSequence(withTiming(0.8, { duration: 1000 }), withTiming(0.4, { duration: 1000 })), -1, true),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Okuma Yolculuğu v2</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Üyelerin anlık konumları ve ortak hedef</Text>
      </View>

      <View style={styles.barContainer}>
        {/* Background Track with Glow */}
        <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={[styles.progressLine, { backgroundColor: colors.primary, width: '45%', opacity: 0.3 }]} />
        </View>
        
        {/* Progress Markers (Avatars) */}
        {MEMBERS.map((member, index) => (
          <Animated.View 
            key={member.id} 
            entering={FadeInDown.delay(index * 150).springify()}
            layout={Layout.springify()}
            style={[
              styles.markerWrapper, 
              { left: `${member.progress}%` }
            ]}
          >
            {member.isMe && (
              <Animated.View style={[styles.glowRing, { borderColor: colors.primary }, pulseStyle]} />
            )}
            
            <View style={[
              styles.avatarContainer, 
              { 
                borderColor: member.isMe ? colors.primary : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                backgroundColor: colors.background
              }
            ]}>
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              {member.isMe && <View style={[styles.meIndicator, { backgroundColor: colors.primary }]} />}
            </View>
            
            <Text style={[
              styles.memberName, 
              { 
                color: member.isMe ? colors.primary : colors.textMuted,
                fontFamily: member.isMe ? FONTS.primary.bold : FONTS.primary.semiBold
              }
            ]}>
              {member.isMe ? 'Sen' : member.name}
            </Text>
          </Animated.View>
        ))}

        {/* Target Milestone */}
        <View style={[styles.milestone, { left: '100%' }]}>
          <Ionicons name="flag" size={14} color={colors.primary} />
          <Text style={[styles.milestoneText, { color: colors.textMuted }]}>BİTİŞ</Text>
        </View>
      </View>
    </View>
  );
};

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.m,
    marginBottom: 20,
  },
  header: {
    marginBottom: 45,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  barContainer: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
  },
  track: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressLine: {
    height: '100%',
    borderRadius: 2,
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -15 }], 
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    top: -6,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 4,
    position: 'relative',
    overflow: 'visible',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  meIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  memberName: {
    fontSize: 10,
    position: 'absolute',
    top: 34,
    textAlign: 'center',
    width: 40,
  },
  milestone: {
    position: 'absolute',
    alignItems: 'center',
    top: 15,
  },
  milestoneText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 8,
    marginTop: 2,
  }
});
