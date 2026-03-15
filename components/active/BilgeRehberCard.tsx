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
}

export const BilgeRehberCard: React.FC<BilgeRehberCardProps> = ({
  isExpanded,
  onToggle,
  onShowOptions,
  currentBookTitle,
  currentBook,
  colors,
  isDark
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
                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="compass-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Odak Alanları</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.text }]}>
                    {currentBook ? `Okurken yazarın temel argümanlarına, alt metindeki gizli temalara ve metaforlara odaklanın. Zihninizi yeni perspektiflere açarak yazarın dünyasına bir bilge gibi süzülün.` : "Okumak, zihnin en asil yolculuğudur. Bugün bu yolculuğa başlamaya ne dersiniz?"}
                  </Text>
                </View>

                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medal-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Eserin Önemi</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textMuted }]}>
                    {currentBook ? `${currentBook.author}'ın bu eseri, hem kendi düşünsel evriminde bir dönüm noktası hem de edebi dünyada sarsılmaz bir yere sahip. Kişisel gelişiminiz için bu eserin derinliklerini keşfedin.` : "Kütüphanenize kitap ekleyerek Bilge Rehber'in analizlerini görün."}
                  </Text>
                </View>
              </Animated.View>
            )}

            {!isExpanded && (
              <View style={styles.briefSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="compass-outline" size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Odak Alanları</Text>
                </View>
                <Text style={[styles.sectionText, { color: colors.text }]} numberOfLines={2}>
                  {currentBook ? `Okurken yazarın temel argümanlarına ve alt metindeki gizli temalara odaklanın...` : "Okumak, zihnin en asil yolculuğudur..."}
                </Text>
              </View>
            )}

            {isExpanded && (
              <Animated.View entering={FadeInUp.duration(400)}>
                <View style={styles.briefSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="library-outline" size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tarihsel Bağlam</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textMuted }]}>
                    {currentBook ? `Eserin yazıldığı dönemin siyasi ve sosyal yapısı, yazarın kalemini doğrudan şekillendirmiş. Tarihsel arka planı anlamak, metni daha derinden kavramanızı sağlayacak.` : "Yeni bir kitap ekleyerek tarihsel analizleri aktif edin."}
                  </Text>
                </View>
              </Animated.View>
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
