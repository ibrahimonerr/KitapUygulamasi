import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { useLibrary } from '../../store/LibraryContext';

interface QuotesFeedProps {
  colors: any;
  onShare?: (quote: string, author: string) => void;
}

const TASTE_QUOTES: Record<string, string> = {
  "Oğuz Atay": "Kelimeler, albayım, bazı anlamlara gelmiyor.",
  "Sabahattin Ali": "Dünyada bana 'ne istiyorsun?' diye sorsalar hiç düşünmeden 'huzur' derim.",
  "Albert Camus": "Kışın en soğuk zamanında, içimde yenilmez bir yaz olduğunu öğrendim.",
  "Franz Kafka": "Bir kitap, içimizdeki donmuş deniz için bir balta olmalıdır.",
  "Dostoyevski": "İnsanın ruhunu yücelten acı, mutluluktan daha değerlidir.",
  "Stefan Zweig": "Bir kez kendini bulan kişinin bu yeryüzünde yitirecek hiçbir şeyi yoktur.",
  "Virginia Woolf": "Para kazanın, kendinize ait ayrı bir oda ve boş zaman yaratın. Ve yazın!",
  "Marquez": "Anlatmak için yaşamak gerek.",
  "Klasik": "Klasikler, insanların 'okuyorum' değil, genellikle 'yeniden okuyorum' dedikleri kitaplardır.",
  "Felsefe": "Sorgulanmamış bir hayat, yaşanmaya değmez.",
  "Psikoloji": "Zihin, kendi başına bir cennet ya da cehennem yaratabilir.",
  "Edebiyat": "Edebiyat, hayatın eksik kalan yanlarını tamamlar.",
  "Bilim Kurgu": "Gelecek, onu bugünden düşleyenlerin hayalleriyle şekillenir."
};

export const QuotesFeed: React.FC<QuotesFeedProps> = ({ colors, onShare }) => {
  const { taste } = useLibrary();

  const displayQuotes = useMemo(() => {
    const allTastes = [...taste.authors, ...taste.genres];
    if (allTastes.length === 0) {
      return [
        { text: "Okumak, zihnin en asil yolculuğudur.", author: "BilgeOkur", category: "Genel" },
        { text: "Her kitap yeni bir dünyanın kapısıdır.", author: "BilgeOkur", category: "Genel" }
      ];
    }

    return allTastes
      .filter(t => TASTE_QUOTES[t])
      .map(t => ({
        text: `"${TASTE_QUOTES[t]}"`,
        author: t,
        category: taste.authors.includes(t) ? 'Sevdiğin Yazar' : 'Sevdiğin Tür'
      }))
      .slice(0, 5); // Show top 5 matches
  }, [taste]);

  return (
    <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SENİN İÇİN SEÇTİKLERİMİZ</Text>
      
      {displayQuotes.map((quote, index) => (
        <View key={index} style={styles.quoteWrapper}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.quoteCard, { backgroundColor: colors.surfaceLight, borderLeftColor: colors.primary }]}
          >
            <Text style={[styles.quoteText, { color: colors.text }]}>{quote.text}</Text>
            <View style={styles.quoteFooter}>
              <View style={styles.quoteMeta}>
                <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.quoteCategory, { color: colors.primary }]}>{quote.category}</Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={[styles.quoteAuthor, { color: colors.textMuted, marginRight: 12 }]}>{quote.author}</Text>
                <TouchableOpacity 
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  onPress={() => onShare?.(quote.text, quote.author)}
                >
                  <Ionicons name="share-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.l,
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: SPACING.m,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  quoteWrapper: {
    marginBottom: SPACING.m,
  },
  quoteCard: {
    padding: SPACING.l,
    borderRadius: 20,
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
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteCategory: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
  },
  quoteAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
  },
});
