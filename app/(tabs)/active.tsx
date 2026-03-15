import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  SlideInUp,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';

// Sub-components
import { TimerSection } from '../../components/active/TimerSection';
import { ActiveBooksStack } from '../../components/active/ActiveBooksStack';
import { BilgeRehberCard } from '../../components/active/BilgeRehberCard';
import { QuotesFeed } from '../../components/active/QuotesFeed';
import { GoalModal } from '../../components/active/GoalModal';
import { BookDetailsModal } from '../../components/active/BookDetailsModal';
import { ReadingTimerModal } from '../../components/active/ReadingTimerModal';
import { OptionsBubble } from '../../components/active/OptionsBubble';

const { width, height } = Dimensions.get('window');

export default function ActiveTab() {
  const { colors, isDark } = useTheme();
  const { activeBooks, addQuoteToBook, reorderActiveBooks, finishBook, addNoteToBook } = useLibrary();
  const router = useRouter();

  // State Management
  const [readingMinutes, setReadingMinutes] = useState(15);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [streak, setStreak] = useState(12);
  const [isGoalReached, setIsGoalReached] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuoteMenuOpen, setIsQuoteMenuOpen] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const [isBriefingExpanded, setIsBriefingExpanded] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'notes'>('quotes');
  const [isAddingQuoteInline, setIsAddingQuoteInline] = useState(false);
  const [isAddingNoteInline, setIsAddingNoteInline] = useState(false);
  const [newContentText, setNewContentText] = useState('');
  const [newContentPage, setNewContentPage] = useState('');
  const timerRef = useRef<any>(null);
  const scrollY = useSharedValue(0);

  const currentBook = activeBooks.length > 0 ? activeBooks[0] : null;
  const currentBookTitle = currentBook ? currentBook.title : "Okuma Zamanı";

  // Goal/Streak Logic
  useEffect(() => {
    if (readingMinutes >= dailyGoal && !isGoalReached) {
      setIsGoalReached(true);
      setStreak(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [readingMinutes, dailyGoal]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const toggleBriefing = () => {
    setIsBriefingExpanded(!isBriefingExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBriefingOptions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOptionsModalOpen(true);
  };

  const refreshBriefing = () => {
    setIsOptionsModalOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    alert("Brifing Gemini AI ile yenileniyor...");
  };

  const showDetailedAnalysis = () => {
    setIsOptionsModalOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    alert("Detaylı analiz ekranına yönlendiriliyor...");
  };

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
      paddingTop: 60,
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.m,
    };
  });

  // Timer Logic
  useEffect(() => {
    if (isReading && !isPaused) {
      timerRef.current = setInterval(() => {
        setActiveSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReading, isPaused]);

  // Music Control State (UI Mockup)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Deep Focus (Lo-Fi)",
    artist: "Reading Ambient",
    progress: 0.35,
  });

  const handleStartTimer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsReading(true);
  };

  const handleStopTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const addedMinutes = Math.floor(activeSeconds / 60);
    if (addedMinutes > 0) {
      setReadingMinutes(prev => prev + addedMinutes);
    }
    setIsReading(false);
    setIsPaused(false);
    setActiveSeconds(0);
  };

  const handleTogglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  const handleCamera = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      alert("Alıntı fotoğrafı başarıyla çekildi! (OCR modülü Phase 3'te eklenecek)");
    }
  };

  const toggleMusic = () => {
    setIsPlayingMusic(!isPlayingMusic);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Goal Update Logic
  const handleOpenGoalModal = () => {
    setTempGoal(dailyGoal);
    setIsGoalModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const saveGoal = () => {
    setDailyGoal(tempGoal);
    setIsGoalModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAddQuote = () => {
    if (selectedBook && newContentText.trim()) {
      addQuoteToBook(selectedBook.id, { 
        text: newContentText, 
        page: parseInt(newContentPage) || 0 
      });
      setNewContentText('');
      setNewContentPage('');
      setIsAddingQuoteInline(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleAddNote = () => {
    if (selectedBook && newContentText.trim()) {
      addNoteToBook(selectedBook.id, newContentText);
      setNewContentText('');
      setIsAddingNoteInline(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSaveInlineQuote = () => {
    if (currentBook && quoteText.trim()) {
      addQuoteToBook(currentBook.id, {
        text: quoteText,
        page: parseInt(quotePage) || 0
      });
      setIsQuoteMenuOpen(false);
      setQuoteText('');
      setQuotePage('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Alıntı kütüphanene eklendi!");
    } else {
      alert("Lütfen bir alıntı metni girin.");
    }
  };

  const handleShowStreakDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    alert(`Müthişsin! ${streak} gündür üst üste okuma yapıyorsun. Serini bozmamak için bugün hedefi tamamla!`);
  };

  const handleBookPress = (index: number) => {
    if (index === 0) {
      setIsAddingQuoteInline(false);
      setIsAddingNoteInline(false);
      setSelectedBook(activeBooks[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      reorderActiveBooks(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddBook = (section: 'active' | 'waitlist') => {
    if (section === 'active' && activeBooks.length >= 2) {
      Alert.alert(
        "Sınıra Ulaşıldı",
        "Aynı anda en fazla 2 kitabı aktif olarak okuyabilirsiniz. Yeni bir kitap eklemek için lütfen mevcut kitaplardan birini bitirin.",
        [{ text: "Tamam" }]
      );
    } else {
      router.push({
        pathname: '/search',
        params: { section }
      });
    }
  };

  const handleFinishBook = (bookId: string) => {
    finishBook(bookId);
    setSelectedBook(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, isDark ? '#13151a' : '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={headerStyle}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ana Sayfa</Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 120, paddingBottom: 120 }}
      >
        <View style={styles.dashboardContainer}>
          <TimerSection
            readingMinutes={readingMinutes}
            dailyGoal={dailyGoal}
            streak={streak}
            isGoalReached={isGoalReached}
            onStartTimer={handleStartTimer}
            onOpenGoalModal={handleOpenGoalModal}
            onShowStreakDetails={handleShowStreakDetails}
            colors={colors}
            isDark={isDark}
          />

          {/* Aktif Okuma Section */}
          <ActiveBooksStack
            activeBooks={activeBooks}
            onBookPress={handleBookPress}
            onAddBook={handleAddBook}
            colors={colors}
            isDark={isDark}
          />
        </View>

        <View style={styles.feedScroll}>
          {/* Bilge Rehber Card */}
          <BilgeRehberCard
            isExpanded={isBriefingExpanded}
            onToggle={toggleBriefing}
            onShowOptions={handleBriefingOptions}
            currentBookTitle={currentBookTitle}
            currentBook={currentBook}
            colors={colors}
            isDark={isDark}
          />

          {/* Quotes Feed */}
          <QuotesFeed colors={colors} />
        </View>
      </Animated.ScrollView>

      {/* Goal Setting Modal */}
      <GoalModal
        isVisible={isGoalModalVisible}
        onClose={() => setIsGoalModalVisible(false)}
        tempGoal={tempGoal}
        setTempGoal={setTempGoal}
        onSaveGoal={saveGoal}
        colors={colors}
        isDark={isDark}
      />

      {/* Reading Timer Modal */}
      <ReadingTimerModal
        isReading={isReading}
        currentBookTitle={currentBookTitle}
        activeSeconds={activeSeconds}
        formatTime={formatTime}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onStopTimer={handleStopTimer}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={toggleMusic}
        currentTrack={currentTrack}
        isQuoteMenuOpen={isQuoteMenuOpen}
        setIsQuoteMenuOpen={setIsQuoteMenuOpen}
        quoteText={quoteText}
        setQuoteText={setQuoteText}
        quotePage={quotePage}
        setQuotePage={setQuotePage}
        onSaveQuote={handleSaveInlineQuote}
        onCamera={handleCamera}
        colors={colors}
        isDark={isDark}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        selectedBook={selectedBook}
        onClose={() => setSelectedBook(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAddingQuote={isAddingQuoteInline}
        setIsAddingQuote={setIsAddingQuoteInline}
        isAddingNote={isAddingNoteInline}
        setIsAddingNote={setIsAddingNoteInline}
        newContentText={newContentText}
        setNewContentText={setNewContentText}
        newContentPage={newContentPage}
        setNewContentPage={setNewContentPage}
        onAddQuote={handleAddQuote}
        onAddNote={handleAddNote}
        onFinishBook={handleFinishBook}
        isCurrentlyReading={!!selectedBook && activeBooks.some(b => b.id === selectedBook.id)}
        colors={colors}
        isDark={isDark}
      />

      {/* Briefing Options Modal */}
      <OptionsBubble
        isVisible={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onRefresh={refreshBriefing}
        onShowAnalysis={showDetailedAnalysis}
        onShare={() => alert("Paylaşılıyor...")}
        topPosition={360}
        rightPosition={SPACING.l}
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
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
  },
  dashboardContainer: {
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
  },
  feedScroll: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    marginTop: -35,
  },
});
