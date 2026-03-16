import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Recommendation } from '../../services/forYouService';

interface ForYouSectionProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ForYouSection({ recommendations, isLoading, onRefresh }: ForYouSectionProps) {
  const { colors, isDark } = useTheme();

  if (isLoading && recommendations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Sana özel içerikler hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sana Özel</Text>
        <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
          <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInRight.delay(index * 150)}
            style={styles.cardWrapper}
          >
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? 'dark' : 'light'} style={styles.card}>
              <View style={[styles.tag, { backgroundColor: colors.highlight }]}>
                <Ionicons 
                  name={item.type === 'book' ? 'book' : item.type === 'author' ? 'person' : 'bulb'} 
                  size={12} 
                  color={colors.primary} 
                />
                <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
              </View>
              
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              
              <Text style={[styles.cardReason, { color: colors.textMuted }]} numberOfLines={3}>
                {item.reason}
              </Text>

              <View style={styles.footer}>
                <View style={[styles.intensityBadge, { borderColor: colors.border }]}>
                  <Text style={[styles.intensityText, { color: colors.textMuted }]}>
                    {item.intensity === 'deep' ? 'Derin Analiz' : 'Hafif Okuma'}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.readButton, { backgroundColor: colors.primary }]}>
                  <Text style={styles.readButtonText}>İncele</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.m,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
  },
  scrollContent: {
    paddingLeft: SPACING.l,
    paddingRight: SPACING.xl,
  },
  cardWrapper: {
    width: 280,
    marginRight: SPACING.m,
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    padding: SPACING.l,
    height: 200,
    justifyContent: 'space-between',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: SPACING.s,
  },
  tagText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  cardReason: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  intensityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  intensityText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 10,
  },
  readButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
  },
  loadingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  }
});
