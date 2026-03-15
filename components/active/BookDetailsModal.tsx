import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../constants/theme';

const { height } = Dimensions.get('window');

interface BookDetailsModalProps {
  selectedBook: any;
  onClose: () => void;
  activeTab: 'quotes' | 'notes';
  setActiveTab: (tab: 'quotes' | 'notes') => void;
  isAddingQuote: boolean;
  setIsAddingQuote: (val: boolean) => void;
  isAddingNote: boolean;
  setIsAddingNote: (val: boolean) => void;
  newContentText: string;
  setNewContentText: (text: string) => void;
  newContentPage: string;
  setNewContentPage: (page: string) => void;
  onAddQuote: () => void;
  onAddNote: () => void;
  onFinishBook: (bookId: string) => void;
  isCurrentlyReading: boolean;
  colors: any;
  isDark: boolean;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  selectedBook,
  onClose,
  activeTab,
  setActiveTab,
  isAddingQuote,
  setIsAddingQuote,
  isAddingNote,
  setIsAddingNote,
  newContentText,
  setNewContentText,
  newContentPage,
  setNewContentPage,
  onAddQuote,
  onAddNote,
  onFinishBook,
  isCurrentlyReading,
  colors,
  isDark
}) => {
  if (!selectedBook) return null;

  return (
    <Modal visible={selectedBook !== null} transparent animationType="slide">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <Animated.View entering={FadeInDown.duration(400)} style={styles.modalSheet}>
          <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={styles.modalBlur}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderInfo}>
                <Text style={[styles.modalBookTitle, { color: colors.text }]}>{selectedBook.title}</Text>
                <Text style={[styles.modalBookAuthor, { color: colors.textMuted }]}>{selectedBook.author}</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
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
                        <TouchableOpacity 
                          style={styles.premiumScanButton}
                          onPress={() => alert("OCR modülü yakında!")}
                        >
                          <Ionicons name="camera" size={18} color="#FFF" style={{marginRight: 6}} />
                          <Text style={styles.premiumScanText}>Tara</Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity 
                        style={[styles.premiumSaveButton, { backgroundColor: colors.primary }]}
                        onPress={onAddQuote}
                      >
                        <Text style={styles.premiumSaveButtonText}>Kaydet</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  
                  {selectedBook.quotes && selectedBook.quotes.length > 0 ? selectedBook.quotes.map((q: any) => (
                    <View key={q.id} style={[styles.quoteItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                      <Text style={[styles.quoteTextItem, { color: colors.text }]}>"{q.text}"</Text>
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
                        onPress={onAddNote}
                      >
                        <Text style={styles.premiumSaveButtonText}>Notu Kaydet</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}

                  {selectedBook.notes && selectedBook.notes.length > 0 ? selectedBook.notes.map((n: any) => (
                    <View key={n.id} style={[styles.noteItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderLeftColor: colors.primary }]}>
                      <Text style={[styles.noteTextItem, { color: colors.text }]}>{n.text}</Text>
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
            {isCurrentlyReading && (
              <TouchableOpacity 
                style={styles.finishBookButton} 
                onPress={() => onFinishBook(selectedBook.id)}
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
  );
};

const styles = StyleSheet.create({
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
  quoteTextItem: {
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
    borderLeftWidth: 4,
  },
  noteTextItem: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
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
    lineHeight: 22,
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
    backgroundColor: '#007AFF',
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
    marginTop: 20,
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
    marginTop: 10,
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
});
