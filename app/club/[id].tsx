import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
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
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// Context
import { useClubs, Club } from '../../store/ClubsContext';

// Sub-components
import { CollectiveProgress } from '../../components/clubs/detail/CollectiveProgress';
import { WiseMentorPrompts } from '../../components/clubs/detail/WiseMentorPrompts';
import { ClubQuotesFeed } from '../../components/clubs/detail/ClubQuotesFeed';
import { DeadlineCard } from '../../components/clubs/detail/DeadlineCard';
import { FocusRoomCard } from '../../components/clubs/detail/FocusRoomCard';
import { FriendsActivityList } from '../../components/clubs/detail/FriendsActivityList';
import { ActionSheetIOS, Alert, Modal } from 'react-native';
import { ClubChat } from '../../components/social/ClubChat';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 380;
const MY_USER_ID = 'user_unique_id_123';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { myClubs, deleteClub, leaveClub, joinClub, isUserMember } = useClubs();
  const scrollY = useSharedValue(0);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isMember = isUserMember(id as string);

  // Find club in context
  const club = myClubs.find(c => c.id === id);

  if (!club) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Kulüp bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = club.adminId === MY_USER_ID;

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', isAdmin ? 'Kulübü Sil' : 'Kulüpten Ayrıl'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: club.name,
          message: isAdmin ? 'Bu kulübü tamamen silmek istediğine emin misin?' : 'Bu kulüpten ayrılmak istediğine emin misin?',
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            confirmAction();
          }
        }
      );
    } else {
      Alert.alert(
        club.name,
        isAdmin ? 'Bu kulübü tamamen silmek istediğine emin misin?' : 'Bu kulüpten ayrılmak istediğine emin misin?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: isAdmin ? 'Sil' : 'Ayrıl', style: 'destructive', onPress: confirmAction }
        ]
      );
    }
  };

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinClub(id as string);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Hata", "Kulübe katılırken bir sorun oluştu.");
    } finally {
      setIsJoining(false);
    }
  };

  const confirmAction = () => {
    if (isAdmin) {
      deleteClub(club.id);
    } else {
      leaveClub(club.id);
    }
    router.back();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerImageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, -50],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const backButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [1, 0.8], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Header Background */}
      <Animated.View style={[styles.headerImageContainer, headerImageStyle]}>
        <Image source={{ uri: club.cover }} style={styles.headerImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', colors.background]}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Navigation Buttons */}
      <Animated.View style={[styles.navContainer, backButtonStyle]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <BlurView intensity={30} tint="light" style={styles.blurBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
        
        {isMember && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleSettings}
          >
            <BlurView intensity={30} tint="light" style={styles.blurBtn}>
              <Ionicons name="settings-outline" size={22} color="#FFF" />
            </BlurView>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topContent}>
          <Animated.View entering={FadeInDown.duration(800)}>
            <Text style={styles.clubName}>{club.type === 'book' ? 'KİTAP KULÜBÜ' : 'ARKADAŞ KULÜBÜ'}</Text>
            <Text style={styles.bookTitle}>{club.name}</Text>
            <Text style={styles.authorName}>{club.type === 'book' ? `${club.author} • ${club.bookTitle}` : club.description}</Text>
          </Animated.View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{club.members}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Üye</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>28</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Alıntı</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>6</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tartışma</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainContainer}>
          {isMember ? (
            club.type === 'book' ? (
              <>
                {/* 1. Collective Progress */}
                <CollectiveProgress colors={colors} isDark={isDark} />

                {/* 2. Deadline & Next Goal */}
                <DeadlineCard 
                  deadline={club.deadline || 'Süre Yok'} 
                  targetPage={club.targetPage || 0}
                  colors={colors} 
                />

                {/* 3. Wise Mentor Discussion Prompts */}
                <WiseMentorPrompts colors={colors} isDark={isDark} />

                {/* 4. Focus Room Preview */}
                <FocusRoomCard colors={colors} isDark={isDark} />

                {/* 5. Club Specific Feed */}
                <ClubQuotesFeed colors={colors} isDark={isDark} />
              </>
            ) : (
              <>
                {/* Friends Club Specific Layout */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Arkadaşlar Ne Okuyor?</Text>
                <FriendsActivityList colors={colors} isDark={isDark} />
                
                <FocusRoomCard colors={colors} isDark={isDark} />
                
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Paylaşımlar</Text>
                <ClubQuotesFeed colors={colors} isDark={isDark} />
              </>
            )
          ) : club.privacy === 'public' ? (
            <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={styles.joinOverlay}>
              <Ionicons name="lock-closed" size={48} color={colors.primary} style={{ marginBottom: 20 }} />
              <Text style={[styles.joinTitle, { color: colors.text }]}>Genel Okuma Grubu</Text>
              <Text style={[styles.joinSubtitle, { color: colors.textMuted }]}>
                Bu genel bir gruptur. Tartışmalara katılmak için üye olmalısın.
              </Text>
              <TouchableOpacity 
                style={[styles.joinBtn, { backgroundColor: colors.primary }]}
                onPress={handleJoin}
                disabled={isJoining}
              >
                <Text style={styles.joinBtnText}>{isJoining ? 'Katılınıyor...' : 'Gruba Katıl'}</Text>
              </TouchableOpacity>
            </BlurView>
          ) : (
            <View style={styles.privateOverlay}>
              <Ionicons name="eye-off" size={60} color={colors.textMuted} style={{ marginBottom: 20, opacity: 0.5 }} />
              <Text style={[styles.joinTitle, { color: colors.text }]}>Bu Kulüp Gizlidir</Text>
              <Text style={[styles.joinSubtitle, { color: colors.textMuted }]}>
                Sadece davetli üyeler bu kulübün içeriğini görebilir ve mesajlaşabilir.
              </Text>
              <TouchableOpacity 
                style={[styles.backBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.backBtnText, { color: colors.text }]}>Geri Dön</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Floating Chat Button (Only for members) */}
      {isMember && (
        <Animated.View 
          entering={FadeIn.delay(1000)}
          style={styles.floatingChatBtnContainer}
        >
          <TouchableOpacity 
            style={[styles.floatingChatBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setIsChatVisible(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Ionicons name="chatbubbles" size={24} color="#FFF" />
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsChatVisible(false)}
      >
        <ClubChat 
          clubId={id as string}
          colors={colors}
          isDark={isDark}
          onClose={() => setIsChatVisible(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    height: HEADER_HEIGHT,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  navContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    zIndex: 100,
  },
  backButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT - 120,
    paddingBottom: 100,
  },
  topContent: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.l,
  },
  clubName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.8,
    marginBottom: 8,
  },
  bookTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 36,
    color: '#FFF',
    lineHeight: 42,
  },
  authorName: {
    fontFamily: FONTS.primary.regular,
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.primary.bold,
    fontSize: 20,
  },
  statLabel: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mainContainer: {
    paddingHorizontal: SPACING.l,
    gap: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: SPACING.m,
  },
  floatingChatBtnContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  floatingChatBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  joinOverlay: {
    marginTop: 20,
    padding: 30,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  joinTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 8,
  },
  joinSubtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  joinBtn: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
  },
  joinBtnText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  privateOverlay: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    marginTop: 10,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  backBtnText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  }
});
