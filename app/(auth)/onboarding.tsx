import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
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
  const [activeBook, setActiveBook] = useState({ title: '', author: '' });
  const [finishedBook, setFinishedBook] = useState({ title: '', author: '' });
  const [targetBook, setTargetBook] = useState({ title: '', author: '' });

  const progress = useSharedValue(0.25);

  useEffect(() => {
    progress.value = withSpring((currentStep + 1) / STEPS.length);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Save taste
    setTaste({ authors: selectedAuthors, genres: selectedGenres });
    
    // Add books if provided
    if (activeBook.title) {
      addBook({
        title: activeBook.title,
        author: activeBook.author || 'Bilinmiyor',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
        progress: 10,
        pages: '300',
        status: 'active'
      }, 'active');
    }

    if (finishedBook.title) {
      addBook({
        title: finishedBook.title,
        author: finishedBook.author || 'Bilinmiyor',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        progress: 100,
        pages: '250',
        status: 'finished'
      }, 'finished');
    }

    if (targetBook.title) {
      addBook({
        title: targetBook.title,
        author: targetBook.author || 'Bilinmiyor',
        cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop',
        progress: 0,
        pages: '400',
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

  const renderBookInputStep = (book: any, setBook: any, icon: string) => (
    <Animated.View entering={FadeInDown} style={styles.stepContainer}>
      <View style={styles.inputCard}>
        <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={[styles.inputBlur, { borderColor: colors.border }]}>
          <Ionicons name={icon as any} size={48} color={colors.primary} style={{ marginBottom: SPACING.l }} />
          <TextInput
            placeholder="Kitap Adı"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
            value={book.title}
            onChangeText={text => setBook({ ...book, title: text })}
          />
          <TextInput
            placeholder="Yazar (Opsiyonel)"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, borderBottomColor: colors.border, marginTop: SPACING.m }]}
            value={book.author}
            onChangeText={text => setBook({ ...book, author: text })}
          />
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
});

import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = RNSafeAreaView;
