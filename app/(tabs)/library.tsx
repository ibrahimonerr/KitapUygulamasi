import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal, Pressable, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary, Book } from '../../store/LibraryContext';
import { useTheme } from '../../hooks/useTheme';
import Animated, { 
  useAnimatedScrollHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate, 
  Extrapolation,
  withSpring,
  FadeInDown,
  FadeIn
} from 'react-native-reanimated';
import { ISBNSync } from '../../components/library/ISBNSync';
import EmptyState from '../../components/ui/EmptyState';

const { width, height } = Dimensions.get('window');

// Stacked Shelf Component
const StackedShelf = ({ books, onBookPress, colors, isDark }: { books: Book[], onBookPress: (book: Book) => void, colors: any, isDark: boolean }) => {
  const [focusedBookId, setFocusedBookId] = useState<string | null>(null);

  const handlePress = (book: Book) => {
    if (focusedBookId === book.id) {
      onBookPress(book);
    } else {
      setFocusedBookId(book.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[styles.shelfScroll, books.length === 0 && { paddingRight: 0 }]}
    >
        {books.length === 0 ? (
          <EmptyState 
            title="Rafınız Boş" 
            description="Yeni maceralara yelken açmak için arama yapın." 
            iconName="library-outline" 
            style={{ marginTop: 0, paddingVertical: SPACING.l }}
          />
        ) : (
          books.map((book, index) => {
              const isFocused = focusedBookId === book.id;
              return (
                  <Animated.View key={book.id} entering={FadeInDown.delay(index * 100).springify().damping(15)}>
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        onPress={() => handlePress(book)}
                        style={[
                            styles.stackedShelfItem,
                            { 
                                marginLeft: index === 0 ? 0 : -45, // Slightly tighter overlap
                                zIndex: isFocused ? 100 : books.length - index,
                                transform: [
                                    { translateY: isFocused ? -15 : 0 },
                                    { scale: isFocused ? 1.08 : 1 }
                                ],
                                shadowOpacity: isFocused ? 0.6 : 0.3,
                            }
                        ]}
                    >
                        <Image source={{ uri: book.cover }} style={styles.stackedShelfCover} />
                        <View style={[styles.stackedShelfTitleBlur, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }]}>
                            <Text style={[styles.stackedShelfTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
                        </View>
                    </TouchableOpacity>
                  </Animated.View>
              );
          })
        )}
    </ScrollView>
  );
};



export default function LibraryTab() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { activeBooks, finishedBooks, waitlistBooks, finishBook, reorderActiveBooks, addBook, addQuoteToBook, addNoteToBook } = useLibrary();
  const scrollY = useSharedValue(0);
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'notes'>('quotes');
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newContentText, setNewContentText] = useState('');
  const [newContentPage, setNewContentPage] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);

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

  const handleBookPress = (index: number) => {
    if (index === 0) {
      // Top book clicked - open details
      setIsAddingQuote(false);
      setIsAddingNote(false);
      setSelectedBook(activeBooks[0]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Bottom book is clicked - logic would be move to top
      reorderActiveBooks(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleFinishBook = (bookId: string) => {
      finishBook(bookId);
      setSelectedBook(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const readBooks = finishedBooks;
  const toReadBooks = waitlistBooks;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={[colors.background, isDark ? '#13151a' : '#FFFFFF']} 
        style={StyleSheet.absoluteFill} 
      />
      
      <Animated.View style={headerStyle}>
        <View style={styles.headerContentLine}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kitaplığım</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{paddingTop: 120, paddingBottom: 150}}
      >


          {/* Raf Bölümleri */}
          <View style={styles.shelvesContainer}>
              <View style={styles.shelfRow}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.shelfLabel, { color: colors.text, marginBottom: 0 }]}>Biten Yolculuklar</Text>
                  <TouchableOpacity 
                    style={[styles.scanButtonMini, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                    onPress={() => setIsScannerVisible(true)}
                  >
                    <Ionicons name="barcode-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <StackedShelf books={readBooks} onBookPress={setSelectedBook} colors={colors} isDark={isDark} />
              </View>

              <View style={[styles.shelfRow, { marginTop: SPACING.l }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.shelfLabel, { color: colors.text, marginBottom: 0 }]}>Bekleyen Maceralar</Text>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity 
                      style={[styles.scanButtonMini, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                      onPress={() => setIsScannerVisible(true)}
                    >
                      <Ionicons name="barcode-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sectionAddButton} onPress={() => handleAddBook('waitlist')}>
                      <Ionicons name="add-circle" size={26} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <StackedShelf books={toReadBooks} onBookPress={setSelectedBook} colors={colors} isDark={isDark} />
              </View>
          </View>
      </Animated.ScrollView>

      {/* Book Details Modal */}
      <Modal visible={selectedBook !== null} transparent animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
              <Pressable style={styles.modalBackdrop} onPress={() => setSelectedBook(null)} />
              <Animated.View entering={FadeInDown.duration(400)} style={styles.modalSheet}>
                  <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={styles.modalBlur}>
                      <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderInfo}>
                          <Text style={[styles.modalBookTitle, { color: colors.text }]}>{selectedBook?.title}</Text>
                          <Text style={[styles.modalBookAuthor, { color: colors.textMuted }]}>{selectedBook?.author}</Text>
                        </View>
                        <TouchableOpacity 
                    onPress={() => {
                      setSelectedBook(null);
                      setIsAddingQuote(false);
                      setIsAddingNote(false);
                    }} 
                    style={styles.closeButton}
                  >
                          <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>

                      {/* Tabs */}
                      <View style={styles.tabContainer}>
                        <TouchableOpacity 
                          style={[styles.tabButton, activeTab === 'quotes' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} 
                          onPress={() => setActiveTab('quotes')}
                        >
                          <Text style={[styles.tabText, { color: activeTab === 'quotes' ? colors.primary : colors.textMuted }]}>Alıntılar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.tabButton, activeTab === 'notes' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} 
                          onPress={() => setActiveTab('notes')}
                        >
                          <Text style={[styles.tabText, { color: activeTab === 'notes' ? colors.primary : colors.textMuted }]}>Notlar</Text>
                        </TouchableOpacity>
                      </View>

                      <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                        {activeTab === 'quotes' ? (
                          <View style={styles.tabContent}>
                            {isAddingQuote && (
                              <Animated.View entering={FadeInDown} style={[styles.premiumAddPanel, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)' }]}>
                                <View style={styles.panelHeader}>
                                  <Text style={[styles.panelTitle, { color: colors.text }]}>Alıntı</Text>
                                  <TouchableOpacity onPress={() => setIsAddingQuote(false)}>
                                    <Ionicons name="close" size={20} color={colors.textMuted} />
                                  </TouchableOpacity>
                                </View>
                                
                                <TextInput 
                                  placeholder="Okuduğun etkileyici cümleyi buraya not et..." 
                                  placeholderTextColor={colors.textMuted}
                                  style={[styles.premiumInput, { color: colors.text, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }]}
                                  multiline
                                  autoFocus
                                  value={newContentText}
                                  onChangeText={setNewContentText}
                                />
                                
                                <View style={styles.premiumActionRow}>
                                  <View style={[styles.premiumPageBox, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }]}>
                                    <Ionicons name="bookmark-outline" size={16} color={colors.textMuted} style={{marginRight: 6}} />
                                    <TextInput 
                                      placeholder="Sayfa" 
                                      placeholderTextColor={colors.textMuted} 
                                      keyboardType="numeric"
                                      style={[styles.premiumPageInput, { color: colors.text }]}
                                      value={newContentPage}
                                      onChangeText={setNewContentPage}
                                    />
                                  </View>
                                </View>

                                <TouchableOpacity 
                                  style={[styles.premiumSaveButton, { backgroundColor: colors.primary }]}
                                  onPress={() => {
                                    if (selectedBook && newContentText.trim()) {
                                      addQuoteToBook(selectedBook.id, { text: newContentText, page: parseInt(newContentPage) || 0 });
                                      setNewContentText('');
                                      setNewContentPage('');
                                      setIsAddingQuote(false);
                                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    }
                                  }}
                                >
                                  <Text style={styles.premiumSaveButtonText}>Kaydet</Text>
                                </TouchableOpacity>
                              </Animated.View>
                            )}
                            
                            {selectedBook && selectedBook.quotes.length > 0 ? selectedBook.quotes.map((q: any) => (
                              <View key={q.id} style={[styles.quoteItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                <Text style={[styles.quoteText, { color: colors.text }]}>"{q.text}"</Text>
                                <View style={styles.itemFooter}>
                                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>Sayfa {q.page} • {q.date}</Text>
                                </View>
                              </View>
                            )) : !isAddingQuote ? (
                              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz alıntı eklenmemiş.</Text>
                            ) : null}
                          </View>
                        ) : (
                          <View style={styles.tabContent}>
                            {isAddingNote && (
                              <Animated.View entering={FadeInDown} style={[styles.premiumAddPanel, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,1)', borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                                <View style={styles.panelHeader}>
                                  <Text style={[styles.panelTitle, { color: colors.text }]}>Düşüncelerini Not Al</Text>
                                  <TouchableOpacity onPress={() => setIsAddingNote(false)}>
                                    <Ionicons name="close" size={20} color={colors.textMuted} />
                                  </TouchableOpacity>
                                </View>
                                
                                <TextInput 
                                  placeholder="Kitap hakkında önemli bir detay veya düşünceni yaz..." 
                                  placeholderTextColor={colors.textMuted}
                                  style={[styles.premiumInput, { color: colors.text, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }]}
                                  multiline
                                  autoFocus
                                  value={newContentText}
                                  onChangeText={setNewContentText}
                                />
                                
                                <TouchableOpacity 
                                  style={[styles.premiumSaveButton, { backgroundColor: colors.primary, marginTop: 12 }]}
                                  onPress={() => {
                                    if (selectedBook && newContentText.trim()) {
                                      addNoteToBook(selectedBook.id, newContentText);
                                      setNewContentText('');
                                      setIsAddingNote(false);
                                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    }
                                  }}
                                >
                                  <Text style={styles.premiumSaveButtonText}>Notu Kaydet</Text>
                                </TouchableOpacity>
                              </Animated.View>
                            )}

                            {selectedBook && selectedBook.notes.length > 0 ? selectedBook.notes.map((n: any) => (
                              <View key={n.id} style={[styles.noteItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderLeftColor: colors.primary }]}>
                                <Text style={[styles.noteText, { color: colors.text }]}>{n.text}</Text>
                                <View style={styles.itemFooter}>
                                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>{n.date}</Text>
                                </View>
                              </View>
                            )) : !isAddingNote ? (
                              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz not eklenmemiş.</Text>
                            ) : null}
                          </View>
                        )}
                      </ScrollView>

                      {/* Add Content Buttons */}
                      <View style={styles.modalQuickActions}>
                        <TouchableOpacity 
                          style={[styles.quickActionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                          onPress={() => { setIsAddingQuote(true); setIsAddingNote(false); setActiveTab('quotes'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        >
                          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                          <Text style={[styles.quickActionText, { color: colors.text }]}>Alıntı Ekle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.quickActionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                          onPress={() => { setIsAddingNote(true); setIsAddingQuote(false); setActiveTab('notes'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        >
                          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                          <Text style={[styles.quickActionText, { color: colors.text }]}>Not Ekle</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Kitabı Bitir Button (Only for currently reading) */}
                      {activeBooks.some(b => b.id === selectedBook?.id) && (
                        <TouchableOpacity 
                          style={styles.finishBookButton} 
                          onPress={() => selectedBook && handleFinishBook(selectedBook.id)}
                        >
                          <LinearGradient colors={[colors.primary, '#8a2be2']} style={styles.finishButtonGradient}>
                            <Text style={styles.finishButtonText}>Kitabı Bitir</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                  </BlurView>
              </Animated.View>
          </KeyboardAvoidingView>
      </Modal>

      <ISBNSync
        isVisible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onBookFound={(bookData) => {
          addBook(bookData, 'waitlist');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Kitap Eklendi", `"${bookData.title}" kütüphaneye eklendi.`);
        }}
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
  headerContentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonMini: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelvesContainer: {
    paddingHorizontal: SPACING.xl,
  },
  shelfRow: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  shelfLabel: {
    fontFamily: FONTS.serif.bold,
    fontSize: 20,
  },
  sectionAddButton: {
    padding: 4,
  },
  shelfScroll: {
    paddingRight: SPACING.xl,
    paddingVertical: 10,
  },
  stackedShelfItem: {
    width: 130,
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginRight: SPACING.m,
  },
  stackedShelfCover: {
    width: '100%',
    height: '100%',
  },
  stackedShelfTitleBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  stackedShelfTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    height: height * 0.75,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  modalBlur: {
    flex: 1,
    padding: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.l,
  },
  modalHeaderInfo: {
    flex: 1,
    marginRight: 20,
  },
  modalBookTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  modalBookAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
  },
  tabText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  modalScroll: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: 40,
  },
  quoteItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  quoteText: {
    fontFamily: FONTS.serif.regular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  noteItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  noteText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  itemFooter: {
    alignItems: 'flex-end',
  },
  itemMeta: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
  },
  emptyText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  premiumAddPanel: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  premiumInput: {
    fontFamily: FONTS.serif.regular,
    fontSize: 15,
    padding: 16,
    borderRadius: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  premiumActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  premiumPageBox: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  premiumPageInput: {
    flex: 1,
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
  },
  premiumScanButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumScanText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
  },
  premiumSaveButton: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumSaveButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  modalQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  quickActionText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    marginLeft: 8,
  },
  finishBookButton: {
    marginTop: 20,
    marginBottom: 20,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
    marginLeft: 10,
  },
  stackContainer: {
    height: 220,
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  bookCardWrapper: {
    position: 'absolute',
    width: '100%',
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
  },
  bookCardBlur: {
    flex: 1,
  },
  bookCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  bookCardCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  bookCardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  bookCardTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  bookCardAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
  },
  addBookSlot: {
    position: 'absolute',
    width: '100%',
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addBookText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  addInlinePanel: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  inlineInput: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inlineActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  inlinePageInput: {
    width: 60,
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 12,
    justifyContent: 'center',
  },
  smallSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  smallSaveButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
  },
});
