import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import BounceButton from '../../components/ui/BounceButton';
import { FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { BookSearchResult, searchBooksCatalog, toLibraryBookInput } from '../../services/bookSearch';

const STEPS = [
  { id: 'taste', title: 'Zevklerini Keşfedelim', subtitle: 'İlgini çeken yazarları ve türleri seç.' },
  { id: 'active', title: 'Şu An Ne Okuyorsun?', subtitle: 'Aktif okuma listene hemen ekleyelim.' }
];

const AUTHORS_POOL = [
  'Oğuz Atay', 'Sabahattin Ali', 'Albert Camus', 'Franz Kafka', 'Dostoyevski', 'Stefan Zweig',
  'Virginia Woolf', 'Marquez', 'İhsan Oktay Anar', 'Yaşar Kemal', 'Ursula Le Guin', 'George Orwell',
  'Haruki Murakami', 'J.L. Borges', 'Umberto Eco', 'Proust', 'Tolstoy', 'Nietzsche', 'Sartre', 'Hesse',
  'Murathan Mungan', 'Orhan Pamuk', 'Elif Şafak', 'Zülfü Livaneli', 'Agatha Christie', 'Stephen King'
];

const GENRES_POOL = [
  'Klasik', 'Bilim Kurgu', 'Psikoloji', 'Felsefe', 'Tarih', 'Macera', 'Polisiye', 'Edebiyat', 
  'Distopya', 'Şiir', 'Biyografi', 'Sanat', 'Din', 'Mitoloji', 'Kişisel Gelişim', 'Fantastik'
];

import { useUser } from '../../store/UserContext';

export default function Onboarding() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBook, setTaste } = useLibrary();
  const { updateProfile } = useUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [activeBook, setActiveBook] = useState<BookSearchResult | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const progress = useSharedValue(0.5);

  useEffect(() => {
    progress.value = withSpring((currentStep + 1) / STEPS.length);
  }, [currentStep, progress]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      completeOnboarding();
    }
  };

  const skipStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchBooksCatalog(searchQuery, 6);
        setSearchResults(results);
      } catch (error) {
        console.error(error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const completeOnboarding = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const tasteProfile = { authors: selectedAuthors, genres: selectedGenres };
    setTaste(tasteProfile);
    
    // Save to user profile via Supabase
    try {
      await updateProfile({ taste_profile: tasteProfile });
    } catch (e) {
      console.error("Failed to sync taste profile during onboarding:", e);
    }

    if (activeBook) {
      const book = toLibraryBookInput(activeBook);
      addBook(
        {
          ...book,
          progress: 0.1,
          pages: activeBook.pageCount > 0 ? `0/${activeBook.pageCount}` : '0/300',
          status: 'active',
        },
        'active'
      );
    }

    router.replace('/(tabs)/active');
  };

  const handleTasteSelect = (item: string, type: 'author' | 'genre') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (type === 'author') {
      setSelectedAuthors((prev) => 
        prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
      );
    } else {
      setSelectedGenres((prev) => 
        prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
      );
    }
  };

  const renderTasteStep = () => (
    <Animated.View entering={FadeInDown} style={styles.stepContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Sana Hitap Edenleri Seç</Text>

      <View style={styles.tasteGrid}>
        <Text style={[styles.subSectionTitle, { color: colors.textMuted }]}>YAZARLAR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl }}>
          <View style={[styles.chipContainer, { paddingHorizontal: SPACING.xl }]}>
            {AUTHORS_POOL.reduce((resultArray, item, index) => { 
                const chunkIndex = Math.floor(index/2);
                if(!resultArray[chunkIndex]) { resultArray[chunkIndex] = []; }
                resultArray[chunkIndex].push(item);
                return resultArray;
              }, [] as string[][]).map((column, colIndex) => (
              <View key={colIndex} style={styles.chipColumn}>
                {column.map((author) => {
                  const isSelected = selectedAuthors.includes(author);
                  return (
                    <TouchableOpacity 
                      key={author} 
                      activeOpacity={0.7} 
                      onPress={() => handleTasteSelect(author, 'author')} 
                      style={[
                        styles.chip, 
                        { 
                          backgroundColor: isSelected ? colors.primary : colors.surfaceLight,
                          borderColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                        }
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{author}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.subSectionTitle, { color: colors.textMuted, marginTop: SPACING.xl }]}>TÜRLER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.xl }}>
          <View style={[styles.chipContainer, { paddingHorizontal: SPACING.xl }]}>
            {GENRES_POOL.reduce((resultArray, item, index) => { 
                const chunkIndex = Math.floor(index/2);
                if(!resultArray[chunkIndex]) { resultArray[chunkIndex] = []; }
                resultArray[chunkIndex].push(item);
                return resultArray;
              }, [] as string[][]).map((column, colIndex) => (
              <View key={colIndex} style={styles.chipColumn}>
                {column.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <TouchableOpacity 
                      key={genre} 
                      activeOpacity={0.7} 
                      onPress={() => handleTasteSelect(genre, 'genre')} 
                      style={[
                        styles.chip, 
                        { 
                          backgroundColor: isSelected ? colors.primary : colors.surfaceLight,
                          borderColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                        }
                      ]}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{genre}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {selectedAuthors.length > 0 || selectedGenres.length > 0 ? (
        <Animated.View entering={FadeIn} style={styles.selectionCounter}>
          <Text style={[styles.counterText, { color: colors.primary }]}>
            {selectedAuthors.length + selectedGenres.length} tercih yapıldı
          </Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );

  const renderBookInputStep = () => (
    <Animated.View entering={FadeInDown} style={styles.stepContainer}>
      <View style={styles.inputCard}>
        <BlurView 
            intensity={60} 
            tint={isDark ? 'dark' : 'light'} 
            style={[styles.inputBlur, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: SPACING.m }]}
        >
          <Ionicons name="book-outline" size={32} color={colors.primary} style={{ marginBottom: SPACING.m }} />

          <View style={[styles.searchContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              placeholder="Kitap ara (örn: 1984)..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isSearching ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: SPACING.m }} /> : null}

          <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setActiveBook(item);
                  setSearchQuery('');
                  setSearchResults([]);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                    styles.resultItem, 
                    { backgroundColor: activeBook?.id === item.id ? colors.highlight : 'transparent' }
                ]}
              >
                <ExpoImage source={{ uri: item.cover || undefined }} style={styles.resultCover} contentFit="cover" />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.resultAuthor, { color: colors.textMuted }]}>{item.author}</Text>
                </View>
                {activeBook?.id === item.id ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} /> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {activeBook && !searchQuery ? (
            <Animated.View entering={FadeIn} style={styles.selectedBookCard}>
              <Text style={[styles.selectedLabel, { color: colors.primary }]}>Şu An Okunuyor:</Text>
              <Text style={[styles.selectedTitle, { color: colors.text }]}>{activeBook.title}</Text>
            </Animated.View>
          ) : null}
        </BlurView>
      </View>
    </Animated.View>
  );

  const progBarBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, isDark ? '#1a1f2e' : '#F8FAFC']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={[styles.progressBarBg, { backgroundColor: progBarBg }]}>
            <Animated.View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${(currentStep + 1) * 50}%` }]} />
          </View>
          <View style={styles.titleRow}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{STEPS[currentStep].title}</Text>
            <TouchableOpacity onPress={skipStep}>
                <Text style={[styles.skipHeaderText, { color: colors.textMuted }]}>Atla</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{STEPS[currentStep].subtitle}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View key={currentStep} entering={SlideInRight.springify().damping(20)} exiting={FadeOut}>
            {currentStep === 0 ? renderTasteStep() : null}
            {currentStep === 1 ? renderBookInputStep() : null}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Animated.View style={styles.nextButtonContainer}>
            <BounceButton onPress={handleNext}>
              <LinearGradient colors={[colors.primary, '#4A90FF']} style={styles.nextGradient}>
                <Text style={styles.nextText}>{currentStep === STEPS.length - 1 ? 'Uygulamaya Başla' : 'Devam Et'}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </BounceButton>
          </Animated.View>
          {currentStep > 0 ? (
            <Animated.View entering={FadeIn.delay(200)}>
              <BounceButton onPress={() => setCurrentStep(currentStep - 1)}>
                <View style={[styles.skipButton, { padding: 10 }]}>
                  <Text style={[styles.skipText, { color: colors.textMuted }]}>Geri Dön</Text>
                </View>
              </BounceButton>
            </Animated.View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: SPACING.xl, paddingTop: 20 },
  progressBarBg: { height: 4, borderRadius: 2, marginBottom: SPACING.xl },
  progressBar: { height: 4, borderRadius: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepTitle: { flex: 1, fontFamily: FONTS.serif.bold, fontSize: 32, marginBottom: SPACING.s },
  skipHeaderText: { fontFamily: FONTS.primary.semiBold, fontSize: 16, marginTop: 10 },
  stepSubtitle: { fontFamily: FONTS.primary.regular, fontSize: 16, lineHeight: 24, marginTop: 4 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  stepContainer: { flex: 1, paddingTop: SPACING.m },
  sectionTitle: { fontFamily: FONTS.serif.bold, fontSize: 24, marginBottom: SPACING.xl },
  subSectionTitle: { fontFamily: FONTS.primary.bold, fontSize: 13, letterSpacing: 1, marginBottom: SPACING.m, marginLeft: SPACING.xl },
  tasteGrid: { flex: 1 },
  chipContainer: { flexDirection: 'row' },
  chipColumn: {  },
  chip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, marginRight: 10, marginBottom: 10, borderWidth: 1 },
  chipText: { fontFamily: FONTS.primary.semiBold, fontSize: 14 },
  selectionCounter: { marginTop: SPACING.xl, paddingVertical: SPACING.m, alignItems: 'center' },
  counterText: { fontFamily: FONTS.primary.semiBold, fontSize: 14 },
  inputCard: { borderRadius: 30, overflow: 'hidden', marginTop: SPACING.xl },
  inputBlur: { padding: SPACING.xl, alignItems: 'center', borderWidth: 1 },
  footer: { position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: SPACING.xl, alignItems: 'center' },
  nextButtonContainer: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15 },
  nextGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  nextText: { color: '#FFF', fontFamily: FONTS.primary.bold, fontSize: 18 },
  skipButton: { marginTop: SPACING.m, backgroundColor: 'transparent' },
  skipText: { fontFamily: FONTS.primary.semiBold, fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: SPACING.m },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontFamily: FONTS.primary.regular },
  resultsList: { width: '100%', maxHeight: 250 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 8 },
  resultCover: { width: 40, height: 60, borderRadius: 4 },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultTitle: { fontFamily: FONTS.primary.bold, fontSize: 14 },
  resultAuthor: { fontFamily: FONTS.primary.regular, fontSize: 12, marginTop: 2 },
  selectedBookCard: { marginTop: SPACING.m, alignItems: 'center', padding: SPACING.m, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' },
  selectedLabel: { fontFamily: FONTS.primary.bold, fontSize: 12, marginBottom: 4 },
  selectedTitle: { fontFamily: FONTS.primary.semiBold, fontSize: 15, textAlign: 'center' },
});
