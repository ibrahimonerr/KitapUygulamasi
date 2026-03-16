import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../../constants/theme';

interface FriendsActivityListProps {
  colors: any;
  isDark: boolean;
}

const FRIENDS_ACTIVITY: any[] = [];

export const FriendsActivityList: React.FC<FriendsActivityListProps> = ({ colors, isDark }) => {
  return (
    <View style={styles.container}>
      {FRIENDS_ACTIVITY.map((friend) => (
        <TouchableOpacity 
          key={friend.id} 
          style={[styles.friendCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}
          onPress={() => alert(`${friend.name}'in okuma detayları yakında!`)}
        >
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={{ uri: friend.avatar }} style={styles.avatar} />
              <Text style={[styles.userName, { color: colors.text }]}>{friend.name}</Text>
            </View>
            <View style={[styles.progressBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.progressText, { color: colors.primary }]}>%{friend.progress}</Text>
            </View>
          </View>

          <View style={styles.bookContent}>
            <Image source={{ uri: friend.cover }} style={styles.bookCover} />
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>{friend.currentBook}</Text>
              <Text style={[styles.bookAuthor, { color: colors.textMuted }]}>{friend.author}</Text>
              
              <View style={[styles.noteContainer, { backgroundColor: colors.surfaceLight }]}>
                <Ionicons name="chatbubble-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.noteText, { color: colors.textMuted }]} numberOfLines={2}>
                  {friend.lastNote}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  friendCard: {
    padding: SPACING.l,
    borderRadius: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 11,
  },
  bookContent: {
    flexDirection: 'row',
    gap: 16,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    marginBottom: 10,
  },
  noteContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
