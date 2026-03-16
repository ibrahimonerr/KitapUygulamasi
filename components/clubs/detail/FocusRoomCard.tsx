import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../../constants/theme';

interface FocusRoomCardProps {
  colors: any;
  isDark: boolean;
}

const ACTIVE_MEMBERS: any[] = [];

export const FocusRoomCard: React.FC<FocusRoomCardProps> = ({ colors, isDark }) => {
  const [isInRoom, setIsInRoom] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isInRoom) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 1500 }), -1, true);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsedSeconds(0);
      pulseOpacity.value = 1;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInRoom]);

  const pulseDotStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleToggle = () => {
    setIsInRoom(!isInRoom);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const totalInRoom = ACTIVE_MEMBERS.length + (isInRoom ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={[styles.card, { 
        backgroundColor: isDark ? 'rgba(0,102,255,0.05)' : 'rgba(0,102,255,0.03)', 
        borderColor: isInRoom ? colors.primary + '40' : 'rgba(0,102,255,0.1)' 
      }]}>
        <View style={styles.infoRow}>
          <View style={styles.textGroup}>
            <View style={styles.liveBadge}>
              <Animated.View style={[styles.liveDot, pulseDotStyle]} />
              <Text style={styles.liveText}>{isInRoom ? 'ODADASIN' : 'CANLI OKUMA'}</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Sessiz Okuma Odası</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {totalInRoom} kişi şu an okuyor.
            </Text>
          </View>

          <View style={styles.avatarStack}>
            {ACTIVE_MEMBERS.map((member, index) => (
              <Image 
                key={member.id} 
                source={{ uri: member.avatar }} 
                style={[styles.avatar, { marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }]} 
              />
            ))}
            {isInRoom && (
              <Animated.View 
                entering={FadeIn.duration(300)}
                style={[styles.meAvatar, { backgroundColor: colors.primary, marginLeft: -10, zIndex: 1 }]}
              >
                <Text style={styles.meText}>Sen</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Timer when in room */}
        {isInRoom && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            style={[styles.timerBar, { backgroundColor: colors.surfaceLight }]}
          >
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
            <Text style={[styles.timerLabel, { color: colors.textMuted }]}>süredir okuyorsun</Text>
          </Animated.View>
        )}

        <TouchableOpacity 
          style={[styles.joinBtn, { backgroundColor: isInRoom ? '#FF3B30' : colors.primary }]}
          onPress={handleToggle}
        >
          <Ionicons 
            name={isInRoom ? "exit-outline" : "headset-outline"} 
            size={18} 
            color="#FFF" 
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.joinBtnText}>{isInRoom ? 'Odadan Ayrıl' : 'Odaya Katıl'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.s,
  },
  card: {
    padding: SPACING.l,
    borderRadius: 24,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  textGroup: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 10,
    color: '#FF3B30',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  meAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 9,
  },
  timerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  timerText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 20,
  },
  timerLabel: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  joinBtnText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 15,
    color: '#FFF',
  },
});
