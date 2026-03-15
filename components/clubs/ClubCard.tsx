import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface ClubCardProps {
  club: any;
  onInvite: (club: any) => void;
  onPress: (club: any) => void;
  colors: any;
  isDark: boolean;
  index: number;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onInvite,
  onPress,
  colors,
  isDark,
  index
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(index * 150).duration(600)}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        style={[styles.card, { borderColor: colors.border }]}
        onPress={() => onPress(club)}
      >
        <Image source={{ uri: club.cover }} style={styles.cover} />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.badgeText}>{club.members} Üye</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: club.type === 'book' ? colors.primary + '40' : '#8a2be240' }]}>
                <Ionicons 
                  name={club.type === 'book' ? "book" : "people"} 
                  size={10} 
                  color={club.type === 'book' ? colors.primary : '#FFF'} 
                />
                <Text style={[styles.typeBadgeText, { color: club.type === 'book' ? colors.primary : '#FFF' }]}>
                  {club.type === 'book' ? 'Kitap Kulübü' : 'Arkadaş Kulübü'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => onInvite(club)}
              style={styles.inviteIconBtn}
            >
              <BlurView intensity={30} tint="light" style={styles.blurBtn}>
                <Ionicons name="person-add" size={18} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.clubName}>{club.name}</Text>
            {club.type === 'book' ? (
              <>
                <View style={styles.bookInfo}>
                  <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.7)" style={{marginRight: 6}} />
                  <Text style={styles.bookTitle} numberOfLines={1}>{club.bookTitle}</Text>
                </View>
                
                <View style={styles.progressSection}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${club.progress}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={styles.progressText}>%{club.progress}</Text>
                </View>
              </>
            ) : (
              <View style={styles.friendsInfo}>
                <Ionicons name="apps-outline" size={14} color="rgba(255,255,255,0.7)" style={{marginRight: 6}} />
                <Text style={styles.bookTitle}>Bağımsız Kitaplar • {club.members} Arkadaş</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: SPACING.m,
    borderWidth: 1,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  typeBadgeText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  inviteIconBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: 4,
  },
  clubName: {
    color: '#FFF',
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    minWidth: 30,
  }
});
