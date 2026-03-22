import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { FONTS, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { useLibrary } from '../store/LibraryContext';
import { searchBooksSemantically } from '../services/semanticSearch';
import { BookSearchResult, searchBooksBySuggestions, searchBooksCatalog, toLibraryBookInput } from '../services/bookSearch';
import Skeleton from '../components/ui/Skeleton';

export default function SearchModal() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { section } = useLocalSearchParams<{ section: 'active' | 'waitlist' }>();
  const { addBook } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);

  const searchBooks = async (searchTerm: string) => {
    if (searchTerm.trim().length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      if (isAiMode) {
        const suggestions = await searchBooksSemantically(searchTerm);
        const aiResults = await searchBooksBySuggestions(suggestions, 8);
        setResults(aiResults);
      } else {
        const catalogResults = await searchBooksCatalog(searchTerm, 12);
        setResults(catalogResults);
      }
    } catch (error) {
      console.error('Arama Hatası:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      searchBooks(query);
    }, 450);

    return () => clearTimeout(handler);
  }, [query, isAiMode]);

  const handleAddBook = (book: BookSearchResult) => {
    const baseBook = toLibraryBookInput(book);

    addBook(
      {
        ...baseBook,
        status: section || 'waitlist',
        progress: section === 'active' ? 5 : 0,
        pages: book.pageCount > 0 ? `0/${book.pageCount}` : '0/200',
      },
      section || 'waitlist'
    );
    router.back();
  };

  const renderItem = ({ item, index }: { item: BookSearchResult; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
      <TouchableOpacity style={[styles.resultItem, { borderBottomColor: colors.surfaceLight }]}>
        <View style={[styles.coverWrapper, { backgroundColor: colors.surfaceMedium }]}>
          {item.cover ? (
            <Image source={{ uri: item.cover }} style={styles.coverImage} contentFit="cover" />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: colors.surfaceMedium, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="book" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.resultInfo}>
          <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.resultAuthor, { color: colors.textMuted }]} numberOfLines={1}>
            {item.author}
          </Text>

          <View style={styles.resultMeta}>
            {item.publishYear ? (
              <Text style={[styles.metaText, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>{item.publishYear}</Text>
            ) : null}
            {item.pageCount ? (
              <Text style={[styles.metaText, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}> • {item.pageCount} Sayfa</Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.surfaceLight }]} onPress={() => handleAddBook(item)}>
          <Ionicons name="add" size={20} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, isDark ? '#11131a' : '#FFFFFF']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kitap Ara</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchBarContainer}>
        <BlurView intensity={30} tint={isDark ? 'light' : 'dark'} style={[styles.searchBarInner, { borderColor: colors.surfaceGlass }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Kitap veya yazar ara..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            keyboardAppearance={isDark ? 'dark' : 'light'}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </BlurView>

        <TouchableOpacity
          style={[styles.aiToggle, isAiMode && { backgroundColor: colors.highlight, borderColor: colors.primary }]}
          onPress={() => {
            setIsAiMode(!isAiMode);
            setResults([]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons name="sparkles" size={18} color={isAiMode ? colors.primary : colors.textMuted} />
          <Text style={[styles.aiToggleText, { color: isAiMode ? colors.primary : colors.textMuted }]}>
            {isAiMode ? 'Bilge Arama Aktif' : 'Bilge Arama'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ padding: SPACING.l, paddingTop: SPACING.m }}>
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <Animated.View key={idx} entering={FadeInUp.delay(idx * 80).duration(400)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l }}>
                <Skeleton width={50} height={75} borderRadius={6} />
                <View style={{ flex: 1, marginLeft: SPACING.m }}>
                  <Skeleton width="70%" height={16} style={{ marginBottom: 10 }} />
                  <Skeleton width="40%" height={14} />
                </View>
                <Skeleton width={36} height={36} borderRadius={18} style={{ marginLeft: SPACING.m }} />
              </Animated.View>
            ))}
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: SPACING.l, paddingBottom: 100 }}
          />
        ) : query.length > 2 ? (
          <View style={styles.centerContent}>
            <Ionicons name="sad-outline" size={48} color={colors.surfaceMedium} />
            <Text style={[styles.noResultText, { color: colors.textMuted }]}>Sonuç bulunamadı.</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="library-outline" size={48} color={colors.surfaceMedium} />
            <Text style={[styles.noResultText, { color: colors.textMuted }]}>OpenLibrary öncelikli katalogdan{`\n`}yeni maceranı bul.</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 20,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  searchBarContainer: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: Platform.OS === 'ios' ? SPACING.m : SPACING.s,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
  },
  coverWrapper: {
    width: 50,
    height: 75,
    borderRadius: 6,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
    marginLeft: SPACING.m,
  },
  resultTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  resultAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.m,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    fontFamily: FONTS.primary.regular,
    marginTop: SPACING.m,
  },
  noResultText: {
    fontFamily: FONTS.primary.regular,
    marginTop: SPACING.m,
    textAlign: 'center',
    lineHeight: 24,
  },
  aiToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  aiToggleText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 13,
    marginLeft: 6,
  },
});
