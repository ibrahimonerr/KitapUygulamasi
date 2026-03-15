import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FONTS, SPACING } from '../../../constants/theme';

interface CollectiveProgressProps {
  colors: any;
  isDark: boolean;
}

const MEMBERS = [
  { id: '1', name: 'Zeynep', progress: 85, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Can', progress: 62, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Sen', progress: 12, avatar: 'https://i.pravatar.cc/150?u=3', isMe: true },
  { id: '4', name: 'Elif', progress: 30, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Mert', progress: 50, avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const CollectiveProgress: React.FC<CollectiveProgressProps> = ({ colors, isDark }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Okuma Yolculuğu</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Tüm üyelerin konumu</Text>
      </View>

      <View style={styles.barContainer}>
        {/* Background Bar */}
        <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
        
        {/* Progress Markers (Avatars) */}
        {MEMBERS.map((member) => (
          <View 
            key={member.id} 
            style={[
              styles.markerWrapper, 
              { left: `${member.progress}%` }
            ]}
          >
            <View style={[
              styles.avatarContainer, 
              { borderColor: member.isMe ? colors.primary : colors.background }
            ]}>
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              {member.isMe && <View style={[styles.meIndicator, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[
              styles.memberName, 
              { color: member.isMe ? colors.primary : colors.textMuted }
            ]}>
              {member.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.m,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    marginTop: 2,
  },
  barContainer: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }], // Half of avatar width to center
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 4,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  meIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  memberName: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 10,
    position: 'absolute',
    top: 28,
  },
});
