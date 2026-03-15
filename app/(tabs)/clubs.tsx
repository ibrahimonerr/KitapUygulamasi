import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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
      
      <View style={styles.header}>
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
      </View>

      <ScrollView 
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
      </ScrollView>

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
  header: {
    paddingTop: 60,
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
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
    paddingTop: SPACING.l,
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
