import React from 'react';
import { View, Text, StyleSheet, Modal, SafeAreaView, TouchableOpacity, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { getColors } from 'react-native-image-colors';
import { FONTS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface ReadingTimerModalProps {
  isReading: boolean;
  currentBookTitle: string;
  currentBookCoverUrl?: string;
  activeSeconds: number;
  formatTime: (seconds: number) => string;
  isPaused: boolean;
  onTogglePause: () => void;
  onStopTimer: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
  currentTrack: { title: string; artist: string; progress: number };
  isQuoteMenuOpen: boolean;
  setIsQuoteMenuOpen: (val: boolean) => void;
  isNoteMenuOpen: boolean;
  setIsNoteMenuOpen: (val: boolean) => void;
  quoteText: string;
  setQuoteText: (text: string) => void;
  quotePage: string;
  setQuotePage: (page: string) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  onSaveQuote: () => void;
  onSaveNote: () => void;
  colors: any;
  isDark: boolean;
}

export const ReadingTimerModal: React.FC<ReadingTimerModalProps> = ({
  isReading,
  currentBookTitle,
  currentBookCoverUrl,
  activeSeconds,
  formatTime,
  isPaused,
  onTogglePause,
  onStopTimer,
  isPlayingMusic,
  onToggleMusic,
  currentTrack,
  isQuoteMenuOpen,
  setIsQuoteMenuOpen,
  isNoteMenuOpen,
  setIsNoteMenuOpen,
  quoteText,
  setQuoteText,
  quotePage,
  setQuotePage,
  noteText,
  setNoteText,
  onSaveQuote,
  onSaveNote,
  colors,
  isDark
}) => {
  const [ambientColor, setAmbientColor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isReading && currentBookCoverUrl) {
      getColors(currentBookCoverUrl, {
        fallback: colors.primary,
        cache: true,
        key: currentBookCoverUrl,
      }).then(res => {
        if (res.platform === 'android') {
          setAmbientColor(res.dominant || colors.primary);
        } else if (res.platform === 'ios') {
          setAmbientColor(res.background || colors.primary);
        } else {
          setAmbientColor(colors.primary);
        }
      }).catch(err => console.log('Color extraction error:', err));
    }
  }, [isReading, currentBookCoverUrl, colors.primary]);

  return (
    <Modal visible={isReading} transparent animationType="fade">
      <View style={[styles.modalOverlay, ambientColor ? { backgroundColor: ambientColor } : undefined]}>
        <BlurView intensity={isDark ? 85 : 95} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        
        <SafeAreaView style={styles.modalContent} pointerEvents="box-none">
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.timerHeader}>
            <Text style={[styles.timerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Odak Modu</Text>
            <Text style={[styles.timerBookTitle, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>{currentBookTitle}</Text>
          </Animated.View>

          <View style={styles.centerContentWrapper} pointerEvents="box-none">
            <Animated.View entering={FadeIn.delay(200)} style={styles.timerDisplay}>
              <View style={styles.timerWrapper}>
                <Text style={[styles.timerNumber, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>{formatTime(activeSeconds)}</Text>
                <TouchableOpacity style={styles.pauseButtonMini} onPress={onTogglePause}>
                  <Ionicons name={isPaused ? "play" : "pause"} size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.timerUnit, { color: colors.primary }]}>
                {isPaused ? 'Zaman Durduruldu' : 'Süreniz Akıyor'}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350).springify().damping(15)} style={styles.musicController}>
              <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={StyleSheet.absoluteFill} />
              <View style={styles.musicBlur}>
                <View style={styles.musicTopRow}>
                  <View style={styles.musicInfo}>
                    <Text style={[styles.musicTrackTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]} numberOfLines={1}>{currentTrack.title}</Text>
                    <Text style={[styles.musicArtistName, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]} numberOfLines={1}>{currentTrack.artist}</Text>
                  </View>
                  <Ionicons name="musical-notes" size={16} color={colors.primary} />
                </View>

                <View style={styles.musicMainControls}>
                  <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Ionicons name="play-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.musicPlayPause, { backgroundColor: colors.primary }]}
                    onPress={onToggleMusic}
                  >
                    <Ionicons name={isPlayingMusic ? "pause" : "play"} size={24} color="#FFF" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Ionicons name="play-forward" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
                  </TouchableOpacity>
                </View>

                <View style={styles.musicProgressBarContainer}>
                  <View style={[styles.musicProgressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[styles.musicProgressBarFill, { width: `${currentTrack.progress * 100}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <View style={styles.musicTimeRow}>
                    <Text style={[styles.musicTimeText, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>1:24</Text>
                    <Text style={[styles.musicTimeText, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>3:45</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(500).springify().damping(15)} style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.addQuoteButtonLarge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}
              onPress={() => { setIsQuoteMenuOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            >
              <Ionicons name="add" size={20} color={isDark ? '#FFFFFF' : '#1A1A1A'} style={{ marginRight: 8 }} />
              <Text style={[styles.addQuoteButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Alıntı Ekle</Text>
            </TouchableOpacity>

            <View style={styles.timerFooter}>
              <TouchableOpacity
                style={[styles.secondaryFooterButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                onPress={() => { setIsNoteMenuOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              >
                <Ionicons name="pencil-outline" size={20} color={isDark ? '#FFFFFF' : '#1A1A1A'} style={{ marginRight: 8 }} />
                <Text style={[styles.footerButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Not Ekle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryFooterButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                onPress={onStopTimer}
              >
                <Ionicons name="stop" size={20} color={isDark ? "#FF4B4B" : "#D32F2F"} style={{ marginRight: 8 }} />
                <Text style={[styles.footerButtonText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Bitir</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>

        {/* Inline Quote Modal */}
        <Modal visible={isQuoteMenuOpen} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.modalBackdropBlur}>
              <Animated.View entering={FadeInDown.duration(300).springify().damping(15)} style={styles.quoteBubbleCentered}>
                <BlurView intensity={isDark ? 90 : 100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={styles.bubbleBlurLarge}>
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.bubbleTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Hızlı Alıntı</Text>
                    <TouchableOpacity onPress={() => setIsQuoteMenuOpen(false)}>
                      <Ionicons name="close" size={24} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Okuduğun etkileyici cümleyi buraya not et..."
                    placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                    multiline
                    style={[styles.bubbleInput, { color: isDark ? '#FFFFFF' : '#1A1A1A', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}
                    autoFocus
                    value={quoteText}
                    onChangeText={setQuoteText}
                  />

                  <View style={styles.quoteExtraRow}>
                    <View style={[styles.pageInputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                      <Ionicons name="bookmark-outline" size={16} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} style={{ marginRight: 6 }} />
                      <TextInput
                        placeholder="Sayfa"
                        placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                        keyboardType="numeric"
                        value={quotePage}
                        onChangeText={setQuotePage}
                        style={[styles.pageInput, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={onSaveQuote}>
                    <Text style={styles.saveText}>Kaydet ve Devam Et</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Inline Note (Pen Note) Modal */}
        <Modal visible={isNoteMenuOpen} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <View style={styles.modalBackdropBlur}>
              <Animated.View entering={FadeInDown.duration(300).springify().damping(15)} style={styles.quoteBubbleCentered}>
                <BlurView intensity={isDark ? 90 : 100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.bubbleBlurLarge, { borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 }]}>
                  <View style={styles.bubbleHeader}>
                    <Text style={[styles.bubbleTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>Cam Not (Pen Note)</Text>
                    <TouchableOpacity onPress={() => setIsNoteMenuOpen(false)}>
                      <Ionicons name="close" size={24} color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Aklına gelenleri buraya karala..."
                    placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                    multiline
                    style={[styles.bubbleInput, { 
                      color: isDark ? '#FFFFFF' : '#1A1A1A', 
                      backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                      fontFamily: FONTS.serif.regular, 
                      fontSize: 16
                    }]}
                    autoFocus
                    value={noteText}
                    onChangeText={setNoteText}
                  />

                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary, marginTop: 12 }]} onPress={onSaveNote}>
                    <Text style={styles.saveText}>Cam Notu Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  centerContentWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  timerTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
    marginBottom: 8,
  },
  timerBookTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timerNumber: {
    fontFamily: FONTS.primary.bold,
    fontSize: 84,
    letterSpacing: -2,
  },
  pauseButtonMini: {
    position: 'absolute',
    right: -25,
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerUnit: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    marginTop: -10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  musicController: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
  },
  musicBlur: {
    padding: 20,
  },
  musicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  musicInfo: {
    flex: 1,
  },
  musicTrackTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  musicArtistName: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
  },
  musicMainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 30,
  },
  musicPlayPause: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicProgressBarContainer: {
    width: '100%',
  },
  musicProgressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: 8,
  },
  musicProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  musicTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  musicTimeText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 10,
  },
  modalFooter: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  addQuoteButtonLarge: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addQuoteButtonText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 15,
  },
  timerFooter: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  secondaryFooterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 35,
    marginHorizontal: 5,
  },
  footerButtonText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  modalBackdropBlur: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  quoteBubbleCentered: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  bubbleBlurLarge: {
    padding: 24,
    width: '100%',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bubbleTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  bubbleInput: {
    fontFamily: FONTS.serif.regular,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  quoteExtraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  pageInput: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    flex: 1,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cameraButtonText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    color: '#FFF',
    marginLeft: 8,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    color: '#FFF',
  },
});
