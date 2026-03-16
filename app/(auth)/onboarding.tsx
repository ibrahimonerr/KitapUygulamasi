import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { id: 'taste', title: 'Zevklerini Keşfedelim', subtitle: 'İlgini çeken yazarları ve türleri seç.' },
  { id: 'active', title: 'Şu An Ne Okuyorsun?', subtitle: 'Aktif okuma listene hemen ekleyelim.' },
  { id: 'finished', title: 'Biten Maceralar', subtitle: 'En son hangi kitabı bitirdin?' },
  { id: 'target', title: 'Sıradaki Hedef', subtitle: 'Okumayı planladığın bir kitap var mı?' }
];

const AUTHORS_POOL = [
  "Oğuz Atay", "Sabahattin Ali", "Albert Camus", "Franz Kafka", 
  "Dostoyevski", "Stefan Zweig", "Virginia Woolf", 
  "Marquez", "İhsan Oktay Anar", "Yaşar Kemal", "Ursula Le Guin", "George Orwell",
  "Italo Calvino", "Haruki Murakami", "J.L. Borges", "Umberto Eco",
  "Proust", "Tolstoy", "Nietzsche", "Sartre", "Hesse", "Sylvia Plath"
];

const GENRES_POOL = [
  "Klasik", "Bilim Kurgu", "Psikoloji", "Felsefe", 
  "Tarih", "Macera", "Polisiye", "Edebiyat",
  "Distopya", "Şiir", "Biyografi", "Sanat", "Mitoloji"
];

export default function Onboarding() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBook, setTaste } = useLibrary();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  // Dynamic visible lists
  const [visibleAuthors, setVisibleAuthors] = useState<string[]>(AUTHORS_POOL.slice(0, 8));
  const [visibleGenres, setVisibleGenres] = useState<string[]>(GENRES_POOL.slice(0, 6));

  // Book Inputs
  const [activeBook, setActiveBook] = useState<any>(null);
  const [finishedBook, setFinishedBook] = useState<any>(null);
  const [targetBook, setTargetBook] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const progress = useSharedValue(0.25);

  useEffect(() => {
    progress.value = withSpring((currentStep + 1) / STEPS.length);
  }, [currentStep]);

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

  const searchBooks = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
      const data = await response.json();
      if (data.items) {
        const mapped = data.items.map((item: any) => ({
          id: item.id,
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Bilinmeyen Yazar',
          cover: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
          pages: item.volumeInfo.pageCount?.toString() || '300'
        }));
        setSearchResults(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) searchBooks(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const completeOnboarding = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Save taste
    setTaste({ authors: selectedAuthors, genres: selectedGenres });
    
    // Add books if provided
    if (activeBook) {
      addBook({
        title: activeBook.title,
        author: activeBook.author,
        cover: activeBook.cover,
        progress: 10,
        pages: activeBook.pages,
        status: 'active'
      }, 'active');
    }

    if (finishedBook) {
      addBook({
        title: finishedBook.title,
        author: finishedBook.author,
        cover: finishedBook.cover,
        progress: 100,
        pages: finishedBook.pages,
        status: 'finished'
      }, 'finished');
    }

    if (targetBook) {
      addBook({
        title: targetBook.title,
        author: targetBook.author,
        cover: targetBook.cover,
        progress: 0,
        pages: targetBook.pages,
        status: 'waitlist'
      }, 'waitlist');
    }

    router.replace('/(tabs)/active');
  };

  const handleTasteSelect = (item: string, type: 'author' | 'genre') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (type === 'author') {
      setSelectedAuthors(prev => [...prev, item]);
      // Replace in visible list
      const pool = AUTHORS_POOL.filter(a => ![...visibleAuthors, ...selectedAuthors, item].includes(a));
      if (pool.length > 0) {
        const nextItem = pool[Math.floor(Math.random() * pool.length)];
        setVisibleAuthors(prev => prev.map(a => a === item ? nextItem : a));
      } else {
        // If pool is empty, just remove the item
        setVisibleAuthors(prev => prev.filter(a => a !== item));
      }
    } else {
      setSelectedGenres(prev => [...prev, item]);
      const pool = GENRES_POOL.filter(g => ![...visibleGenres, ...selectedGenres, item].includes(g));
      if (pool.length > 0) {
        const nextItem = pool[Math.floor(Math.random() * pool.length)];
        setVisibleGenres(prev => prev.map(g => g === item ? nextItem : g));
      } else {
        setVisibleGenres(prev => prev.filter(g => g !== item));
      }
    }
  };

  const renderTasteStep = () => (
    <Animated.View entering={FadeInDown} style={styles.stepContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Sana Hitap Edenleri Seç</Text>
      
      <View style={styles.tasteGrid}>
        <Text style={[styles.subSectionTitle, { color: colors.textMuted }]}>YAZARLAR</Text>
        <View style={styles.chipContainer}>
          {visibleAuthors.map((author, index) => (
            <Animated.View 
              key={`${author}-${index}`} 
              entering={FadeIn.delay(index * 50)} 
              exiting={FadeOut.duration(200)}
            >
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => handleTasteSelect(author, 'author')}
                style={[styles.chip, { backgroundColor: colors.surfaceLight }]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{author}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Text style={[styles.subSectionTitle, { color: colors.textMuted, marginTop: SPACING.xl }]}>TÜRLER</Text>
        <View style={styles.chipContainer}>
          {visibleGenres.map((genre, index) => (
            <Animated.View 
              key={`${genre}-${index}`} 
              entering={FadeIn.delay(index * 50)} 
              exiting={FadeOut.duration(200)}
            >
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => handleTasteSelect(genre, 'genre')}
                style={[styles.chip, { backgroundColor: colors.surfaceLight }]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{genre}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Selected Items Indicator (Subtle) */}
      {(selectedAuthors.length > 0 || selectedGenres.length > 0) && (
        <Animated.View entering={FadeIn} style={styles.selectionCounter}>
          <Text style={[styles.counterText, { color: colors.primary }]}>
            {selectedAuthors.length + selectedGenres.length} tercih yapıldı • Keşfetmeye devam et
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );

  const renderBookInputStep = (selectedBook: any, setBook: any, icon: string) => (
    <Animated.View entering={FadeInDown} style={styles.stepContainer}>
      <View style={styles.inputCard}>
        <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={[styles.inputBlur, { borderColor: colors.border, padding: SPACING.m }]}>
          <Ionicons name={icon as any} size={32} color={colors.primary} style={{ marginBottom: SPACING.m }} />
          
          <View style={[styles.searchContainer, { backgroundColor: colors.surfaceLight }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              placeholder="Kitap ara..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: SPACING.m }} />
          )}

          <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
            {searchResults.map((item) => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => {
                  setBook(item);
                  setSearchQuery('');
                  setSearchResults([]);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.resultItem, { backgroundColor: selectedBook?.id === item.id ? colors.highlight : 'transparent' }]}
              >
                <ExpoImage source={{ uri: item.cover }} style={styles.resultCover} contentFit="cover" />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.resultAuthor, { color: colors.textMuted }]}>{item.author}</Text>
                </View>
                {selectedBook?.id === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedBook && !searchQuery && (
            <Animated.View entering={FadeIn} style={styles.selectedBookCard}>
              <Text style={[styles.selectedLabel, { color: colors.primary }]}>Seçilen:</Text>
              <Text style={[styles.selectedTitle, { color: colors.text }]}>{selectedBook.title}</Text>
            </Animated.View>
          )}
        </BlurView>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, isDark ? '#1a1f2e' : '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${(currentStep + 1) * 25}%` }]} />
          </View>
          <Text style={[styles.stepTitle, { color: colors.text }]}>{STEPS[currentStep].title}</Text>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{STEPS[currentStep].subtitle}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {currentStep === 0 && renderTasteStep()}
          {currentStep === 1 && renderBookInputStep(activeBook, setActiveBook, 'book-outline')}
          {currentStep === 2 && renderBookInputStep(finishedBook, setFinishedBook, 'checkmark-circle-outline')}
          {currentStep === 3 && renderBookInputStep(targetBook, setTargetBook, 'bookmark-outline')}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleNext} style={styles.nextButton}>
            <LinearGradient colors={[colors.primary, '#4A90FF']} style={styles.nextGradient}>
              <Text style={styles.nextText}>{currentStep === STEPS.length - 1 ? 'Başlayalım' : 'Devam Et'}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
          {currentStep > 0 && (
            <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Geri Git</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: SPACING.xl, paddingTop: 40 },
  progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: SPACING.xl },
  progressBar: { height: 4, borderRadius: 2 },
  stepTitle: { fontFamily: FONTS.serif.bold, fontSize: 32, marginBottom: SPACING.s },
  stepSubtitle: { fontFamily: FONTS.primary.regular, fontSize: 16, lineHeight: 24 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingBottom: 100 },
  stepContainer: { flex: 1, paddingTop: SPACING.m },
  sectionTitle: { fontFamily: FONTS.serif.bold, fontSize: 24, marginBottom: SPACING.m },
  subSectionTitle: { fontFamily: FONTS.primary.bold, fontSize: 13, letterSpacing: 1, marginBottom: SPACING.m },
  tasteGrid: { flex: 1 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { fontFamily: FONTS.primary.semiBold, fontSize: 14 },
  selectionCounter: { marginTop: SPACING.xl, paddingVertical: SPACING.m, alignItems: 'center' },
  counterText: { fontFamily: FONTS.primary.semiBold, fontSize: 14 },
  inputCard: { borderRadius: 30, overflow: 'hidden', marginTop: SPACING.xl },
  inputBlur: { padding: SPACING.xl, alignItems: 'center', borderWidth: 1 },
  input: { width: '100%', paddingVertical: 12, fontSize: 18, fontFamily: FONTS.primary.regular, borderBottomWidth: 1 },
  footer: { position: 'absolute', bottom: 40, width: '100%', paddingHorizontal: SPACING.xl, alignItems: 'center' },
  nextButton: { width: '100%', borderRadius: 25, overflow: 'hidden', elevation: 5 },
  nextGradient: { paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  nextText: { color: '#FFF', fontFamily: FONTS.primary.bold, fontSize: 18 },
  skipButton: { marginTop: SPACING.m },
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

import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = RNSafeAreaView;
