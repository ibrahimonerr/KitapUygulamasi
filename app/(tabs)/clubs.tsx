import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// Components
import { ClubCard } from '../../components/clubs/ClubCard';
import { CreateClubModal } from '../../components/clubs/CreateClubModal';
import { InviteFriendModal } from '../../components/clubs/InviteFriendModal';

// Context
import { useClubs } from '../../store/ClubsContext';

const { width } = Dimensions.get('window');

export default function ClubsTab() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { myClubs, createClub } = useClubs();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 80], [0, -100], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
      opacity,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.m,
    };
  });

  const handleCreateClub = (data: any) => {
    createClub(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openInvite = (club: any) => {
    setSelectedClub(club);
    setIsInviteModalOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const openClubDetail = (clubId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={[colors.background, isDark ? '#1a1a2e' : '#FFFFFF']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <Animated.View style={headerStyle}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kulüpler</Text>
          <TouchableOpacity 
            style={[styles.createIconBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setIsCreateModalOpen(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {myClubs.length > 0 ? (
          myClubs.map((club: any, index: number) => (
            <ClubCard 
              key={club.id} 
              club={club} 
              index={index}
              colors={colors} 
              isDark={isDark}
              onInvite={() => openInvite(club)}
              onPress={() => openClubDetail(club.id)}
            />
          ))
        ) : (
          <Animated.View entering={FadeInDown} style={[styles.emptyState, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceGlass }]}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz bir kulübe üye değilsiniz</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Butik kitap kulüplerine katılarak okuma deneyiminizi paylaşmaya başlayın.
            </Text>
            <TouchableOpacity 
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => setIsCreateModalOpen(true)}
            >
              <Text style={styles.emptyBtnText}>Hemen Oluştur</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.ScrollView>

      {/* Modals */}
      <CreateClubModal 
        isVisible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateClub}
        colors={colors}
        isDark={isDark}
      />

      <InviteFriendModal 
        isVisible={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        clubName={selectedClub?.name || ''}
        colors={colors}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
  },
  createIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: 130,
    paddingBottom: 120,
  },
  emptyState: {
    padding: SPACING.xl,
    paddingVertical: 40,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: SPACING.s,
  },
  emptySubtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 15,
  }
});

