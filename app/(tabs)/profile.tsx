import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate, 
  Extrapolation 
} from 'react-native-reanimated';

// Yeni Bileşenler
import IntellectualIdentity from '../../components/profile/IntellectualIdentity';
import WeeklyHeatmap from '../../components/profile/WeeklyHeatmap';
import MentorReport from '../../components/profile/MentorReport';
import Achievements from '../../components/profile/Achievements';
import IdeaGraphButton from '../../components/ui/IdeaGraphButton';
import EditProfileModal from '../../components/profile/EditProfileModal';
import SettingsModal from '../../components/profile/SettingsModal';
import NotificationsModal from '../../components/profile/NotificationsModal';
import { useUser } from '../../store/UserContext';
import { useLibrary } from '../../store/LibraryContext';
import { useGamification } from '../../store/GamificationContext';

const { width } = Dimensions.get('window');

export default function ProfileTab() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile, isLoading } = useUser();
  const { activeBooks, finishedBooks, waitlistBooks } = useLibrary();
  const { data: gamification } = useGamification();
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = React.useState(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = React.useState(false);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isGuest = profile?.id === 'guest';
  const totalBooks = activeBooks.length + finishedBooks.length + waitlistBooks.length;
  const totalNotes = [...activeBooks, ...finishedBooks, ...waitlistBooks].reduce((sum, book) => sum + book.notes.length, 0);
  const totalQuotes = [...activeBooks, ...finishedBooks, ...waitlistBooks].reduce((sum, book) => sum + book.quotes.length, 0);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -100],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0],
      Extrapolation.CLAMP
    );

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={[colors.background, isDark ? '#1a1a2e' : '#FFFFFF']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <Animated.View style={headerStyle}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => {
                setIsNotifModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={[styles.actionButton, { backgroundColor: colors.surfaceLight }]}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setIsSettingsModalVisible(true)}
              style={[styles.actionButton, { backgroundColor: colors.surfaceLight, marginLeft: SPACING.s }]}
            >
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 130 }]}
      >
        <Animated.View entering={FadeInDown.delay(100)} style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceMedium }]}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={50} color={colors.textMuted} />
              )}
            </View>
            <View style={styles.premiumBadge}>
              <Ionicons name={isGuest ? "help-circle" : "sparkles"} size={12} color="#FFF" />
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{profile?.full_name}</Text>
          <Text style={[styles.userBio, { color: colors.textMuted }]}>{profile?.bio}</Text>
          
          {isGuest ? (
            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login')}
              style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.editProfileText, { color: '#FFF' }]}>Giriş Yap / Kayıt Ol</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(true)}
              style={[styles.editProfileButton, { backgroundColor: colors.surfaceLight }]}
            >
              <Text style={[styles.editProfileText, { color: colors.text }]}>Profili Düzenle</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={[styles.statItem]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalBooks}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Kitap</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={[styles.statItem]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalNotes}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Not</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={[styles.statItem]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalQuotes}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Alıntı</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={[styles.statItem]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{gamification?.streak || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Seri</Text>
          </View>
        </View>

        {/* Entelektüel Kimlik */}
        <IntellectualIdentity />

        {/* Haftalık Isı Haritası */}
        <WeeklyHeatmap />

        {/* AI Mentor Raporu (Analiz & Öneri) */}
        <MentorReport />

        {/* Başarı Kupası */}
        <Achievements />

        {/* Idea Graph - Fikirlerin Bağlantı Haritası */}
        <IdeaGraphButton />

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <EditProfileModal 
        isVisible={isEditModalVisible} 
        onClose={() => setIsEditModalVisible(false)} 
      />

      <SettingsModal 
        isVisible={isSettingsModalVisible} 
        onClose={() => setIsSettingsModalVisible(false)}
      />

      <NotificationsModal 
        isVisible={isNotifModalVisible} 
        onClose={() => setIsNotifModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    padding: 3,
    marginBottom: SPACING.m,
    position: 'relative',
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  emptyText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginTop: SPACING.m,
  },
  userName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  userBio: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  editProfileButton: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.s,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editProfileText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 13,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: SPACING.l,
    paddingVertical: SPACING.m,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  statValue: {
    fontFamily: FONTS.serif.bold,
    fontSize: 20,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});


