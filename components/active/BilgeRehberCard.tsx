import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';

interface BilgeRehberCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onShowOptions: () => void;
  currentBookTitle: string;
  currentBook: any;
  colors: any;
  isDark: boolean;
  briefingData?: {
    focus: string;
    importance: string;
    story: string;
    message: string;
  } | null;
}

export const BilgeRehberCard: React.FC<BilgeRehberCardProps> = ({
  isExpanded,
  onToggle,
  onShowOptions,
  currentBookTitle,
  currentBook,
  colors,
  isDark,
  briefingData
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(600).duration(800)} style={[styles.bookInfoCard, { borderColor: colors.surfaceGlass }]}>
      <TouchableOpacity activeOpacity={1} onPress={onToggle}>
        <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.blurCard}>
          <View style={styles.cardHeader}>
            <View style={styles.labelRow}>
              <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.bookLabel, { color: colors.primary }]}>BİLGE REHBER BRİFİNGİ</Text>
            </View>
            <TouchableOpacity onPress={onShowOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.bookTitle, { color: colors.text }]}>{currentBookTitle}</Text>

          <View style={styles.briefingContent}>
            {isExpanded && (
              <Animated.View entering={FadeInDown.duration(400)}>
                {/* 1. Odak */}
                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="compass-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Zihinsel Odak</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {briefingData ? briefingData.focus : "Okurken yazarın temel argümanlarına ve saklı temalara odaklanın."}
                  </Text>
                </View>

                {/* 2. Önem */}
                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medal-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Eserin Önemi</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textMuted }]}>
                    {briefingData ? briefingData.importance : "Bu eser düşünsel evriminizde bir dönüm noktası olabilir."}
                  </Text>
                </View>

                {/* 3. Hikaye */}
                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="book-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Ruhun Hikayesi</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textMuted }]}>
                    {briefingData ? briefingData.story : "Her kitabın bir ruhu vardır, bu ruhun peşinden gidin."}
                  </Text>
                </View>

                {/* 4. Mesaj */}
                <View style={[styles.briefSection, { marginBottom: 0 }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="mail-unread-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Sana Özel Mesaj</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.text, fontStyle: 'italic' }]}>
                    {briefingData ? briefingData.message : "Okuma yolculuğun değerli bir keşif süreci."}
                  </Text>
                </View>
              </Animated.View>
            )}

            {!isExpanded && (
              <View style={styles.briefSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="compass-outline" size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Zihinsel Odak</Text>
                </View>
                <Text style={[styles.sectionText, { color: colors.text }]} numberOfLines={2}>
                  {briefingData ? briefingData.focus : "Okurken yazarın temel argümanlarına ve saklı temalara odaklanın..."}
                </Text>
              </View>
            )}

            {!isExpanded && (
              <View style={{ alignItems: 'center', marginTop: 4, opacity: 0.6 }}>
                <Text style={{ color: colors.primary, fontSize: 11, fontFamily: FONTS.primary.semiBold }}>Tıkla ve Bilgece Derinleş ↓</Text>
              </View>
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bookInfoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: SPACING.m,
  },
  blurCard: {
    padding: SPACING.l,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookLabel: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  briefingContent: {
    marginTop: SPACING.m,
  },
  briefSection: {
    marginBottom: SPACING.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    marginLeft: 8,
  },
  sectionText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 24,
  },
  bookTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: SPACING.m,
  },
});
