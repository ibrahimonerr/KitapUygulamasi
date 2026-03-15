import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';

interface QuotesFeedProps {
  colors: any;
}

export const QuotesFeed: React.FC<QuotesFeedProps> = ({
  colors
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(800).duration(800)}>
      <TouchableOpacity activeOpacity={0.7} style={[styles.quoteCard, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.primary }]}>
        <Text style={[styles.quoteText, { color: colors.text }]}>"En büyük zafer, savaşmadan kazanılan zaferdir."</Text>
        <View style={styles.quoteFooter}>
          <View style={styles.quoteMeta}>
            <Ionicons name="bookmark-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.quotePage, { color: colors.primary }]}>Sayfa 45</Text>
          </View>
          <Text style={[styles.quoteDate, { color: colors.textMuted }]}>Bugün, 14:30</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} style={[styles.quoteCard, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.primary }]}>
        <Text style={[styles.quoteText, { color: colors.text }]}>"Yenilmezlik savunmaya, zafere ulaşmak ise saldırıya bağlıdır."</Text>
        <View style={styles.quoteFooter}>
          <View style={styles.quoteMeta}>
            <Ionicons name="bookmark-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.quotePage, { color: colors.primary }]}>Sayfa 42</Text>
          </View>
          <Text style={[styles.quoteDate, { color: colors.textMuted }]}>Bugün, 10:15</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quoteCard: {
    padding: SPACING.l,
    borderRadius: 20,
    marginBottom: SPACING.m,
    borderLeftWidth: 4,
  },
  quoteText: {
    fontFamily: FONTS.serif.regular,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: SPACING.m,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quotePage: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  quoteDate: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
  },
});
