import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, Platform, Share } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface QuoteShareEditorProps {
  isVisible: boolean;
  onClose: () => void;
  quoteText: string;
  author: string;
  bookTitle?: string;
  colors: any;
  isDark: boolean;
}

type StyleMode = 'glass' | 'gradient' | 'minimal' | 'neon';
type TextAlign = 'left' | 'center' | 'right';

export const QuoteShareEditor: React.FC<QuoteShareEditorProps> = ({
  isVisible,
  onClose,
  quoteText,
  author,
  bookTitle,
  colors,
  isDark
}) => {
  const [mode, setMode] = useState<StyleMode>('glass');
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [useSerif, setUseSerif] = useState(true);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${quoteText}\n\n— ${author}${bookTitle ? ` (${bookTitle})` : ''}\n\nBilgeOkur ile paylaşıldı.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderPreview = () => {
    const textStyle = [
      styles.previewText,
      { 
        textAlign, 
        fontFamily: useSerif ? FONTS.serif.regular : FONTS.primary.regular,
        color: mode === 'neon' ? '#000' : colors.text
      }
    ];

    const authorStyle = [
      styles.previewAuthor,
      { 
        textAlign,
        fontFamily: FONTS.primary.semiBold,
        color: mode === 'neon' ? '#333' : colors.textMuted
      }
    ];

    if (mode === 'glass') {
      return (
        <View style={styles.previewContainer}>
          <LinearGradient colors={['#6366f1', '#a855f7', '#ec4899']} style={styles.decorationGradient} />
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.glassCard}>
            <Ionicons name="chatbox-ellipses-outline" size={32} color={colors.primary} style={{ marginBottom: SPACING.m, opacity: 0.5 }} />
            <Text style={textStyle}>{quoteText}</Text>
            <Text style={authorStyle}>— {author}</Text>
          </BlurView>
        </View>
      );
    }

    if (mode === 'gradient') {
      return (
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.previewContainer}>
          <View style={styles.cardContent}>
            <Ionicons name="chatbox-ellipses-outline" size={32} color="#FFF" style={{ marginBottom: SPACING.m, opacity: 0.5 }} />
            <Text style={[textStyle, { color: '#FFF' }]}>{quoteText}</Text>
            <Text style={[authorStyle, { color: 'rgba(255,255,255,0.7)' }]}>— {author}</Text>
          </View>
        </LinearGradient>
      );
    }

    if (mode === 'neon') {
      return (
        <View style={[styles.previewContainer, { backgroundColor: '#fef08a' }]}>
          <View style={[styles.cardContent, { borderColor: '#000', borderWidth: 2, margin: 20 }]}>
            <Ionicons name="chatbox-ellipses-outline" size={32} color="#000" style={{ marginBottom: SPACING.m }} />
            <Text style={textStyle}>{quoteText}</Text>
            <Text style={authorStyle}>— {author}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.previewContainer, { backgroundColor: colors.background }]}>
        <View style={styles.cardContent}>
          <Ionicons name="chatbox-ellipses-outline" size={32} color={colors.primary} style={{ marginBottom: SPACING.m, opacity: 0.3 }} />
          <Text style={textStyle}>{quoteText}</Text>
          <Text style={authorStyle}>— {author}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Alıntıyı Giydir</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.previewWrapper}>
            {renderPreview()}
          </View>

          <ScrollView style={styles.controls} showsVerticalScrollIndicator={false}>
            <Text style={[styles.controlLabel, { color: colors.textMuted }]}>STİL</Text>
            <View style={styles.modeGrid}>
              {(['glass', 'gradient', 'minimal', 'neon'] as StyleMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeButton,
                    { backgroundColor: mode === m ? colors.primary : colors.surfaceLight }
                  ]}
                >
                  <Text style={[styles.modeButtonText, { color: mode === m ? '#FFF' : colors.text }]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.configRow}>
              <View style={styles.configItem}>
                <Text style={[styles.controlLabel, { color: colors.textMuted }]}>HİZALAMA</Text>
                <View style={styles.toggleRow}>
                  {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
                    <TouchableOpacity
                      key={a}
                      onPress={() => setTextAlign(a)}
                      style={[styles.toggleIcon, textAlign === a && { backgroundColor: colors.primary + '20' }]}
                    >
                      <Ionicons 
                        name={`align-${a}` as any} 
                        size={20} 
                        color={textAlign === a ? colors.primary : colors.textMuted} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.configItem}>
                <Text style={[styles.controlLabel, { color: colors.textMuted }]}>YAZI TİPİ</Text>
                <TouchableOpacity
                  onPress={() => setUseSerif(!useSerif)}
                  style={[styles.fontToggle, { backgroundColor: colors.surfaceLight }]}
                >
                  <Text style={[styles.fontToggleText, { color: colors.text, fontFamily: useSerif ? FONTS.serif.regular : FONTS.primary.regular }]}>
                    {useSerif ? 'Klasik (Serif)' : 'Modern (Sans)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.mainButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
            >
              <Text style={styles.mainButtonText}>Görsel Olarak Paylaş</Text>
              <Ionicons name="image-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'transparent',
    height: height * 0.9,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.l,
    paddingTop: SPACING.xl,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  previewWrapper: {
    padding: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
    height: width,
  },
  previewContainer: {
    width: width - SPACING.l * 2,
    height: width - SPACING.l * 2,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  decorationGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  glassCard: {
    ...StyleSheet.absoluteFillObject,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 22,
    lineHeight: 32,
    fontStyle: 'italic',
    marginBottom: SPACING.l,
  },
  previewAuthor: {
    fontSize: 16,
    opacity: 0.8,
  },
  controls: {
    flex: 1,
    padding: SPACING.xl,
  },
  controlLabel: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: SPACING.m,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xl,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modeButtonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
  },
  configRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: SPACING.xxl,
  },
  configItem: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontToggle: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fontToggleText: {
    fontSize: 13,
  },
  mainButton: {
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  mainButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
});
