import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useLibrary } from '../../store/LibraryContext';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  FadeIn,
  FadeOut,
  SlideInUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

import { analyzeContentWithAI } from '../../services/ai';

const IdeaNode = ({ item, isSelected, onPress }: { item: any, isSelected: boolean, onPress: () => void }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const { colors } = useTheme();
  
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 3000 + Math.random() * 1000 }),
        withTiming(6, { duration: 3000 + Math.random() * 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: withTiming(isSelected ? 1.15 : scale.value) }
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View 
      style={[
        styles.nodeContainer, 
        { top: item.top, left: item.left },
        animatedStyle
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handlePress}
        style={[
          styles.nodeCapsule, 
          { 
            backgroundColor: isSelected ? colors.primary : '#FFD700',
            borderColor: isSelected ? '#FFF' : 'rgba(255,255,255,0.4)',
            borderWidth: isSelected ? 2 : 1.5,
          }
        ]}
      >
        <Text style={[
          styles.nodeText, 
          { 
            fontSize: 13 * (item.weight || 1),
            color: isSelected ? '#FFF' : '#000'
          }
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function IdeaGraph() {
  const { colors, isDark } = useTheme();
  const { activeBooks, finishedBooks } = useLibrary();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [distilledIdeas, setDistilledIdeas] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    performAnalysis();
  }, [activeBooks, finishedBooks]);

  const performAnalysis = async () => {
    const allBooks = [...activeBooks, ...finishedBooks];
    const combinedContent = allBooks.flatMap(b => [
      ...b.quotes.map(q => q.text),
      ...b.notes.map(n => n.text)
    ]).join("\n");

    if (!combinedContent) {
      setDistilledIdeas([]);
      return;
    }

    setIsAnalyzing(true);
    const results = await analyzeContentWithAI(combinedContent);
    
    const mappedResults = results.map((result: any, index: number) => {
      // Find related content from your library for this theme
      const relatedContent = allBooks.flatMap(b => [
        ...b.quotes.map(q => ({ text: q.text, book: b.title })),
        ...b.notes.map(n => ({ text: n.text, book: b.title }))
      ]).filter(c => 
        result.label.toLowerCase().split(' ').some((word: string) => 
          word.length > 3 && c.text.toLowerCase().includes(word)
        )
      );

      return {
        ...result,
        content: relatedContent,
        top: 40 + (index * 85) % (height * 0.5),
        left: 20 + (index * 130) % (width - 160)
      };
    });

    setDistilledIdeas(mappedResults);
    setIsAnalyzing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.graphArea}>
        {isAnalyzing && (
          <Animated.View entering={FadeIn} style={styles.loadingContainer}>
            <Ionicons name="sparkles" size={40} color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Zihin Haritan Analiz Ediliyor...</Text>
          </Animated.View>
        )}

        {!isAnalyzing && distilledIdeas.map(item => (
          <IdeaNode 
            key={item.id || item.label} 
            item={item} 
            isSelected={selectedIdea?.id === item.id}
            onPress={() => setSelectedIdea(item.id === selectedIdea?.id ? null : item)}
          />
        ))}

        {selectedIdea && (
          <Animated.View 
            entering={SlideInUp.duration(400)}
            exiting={FadeOut}
            style={styles.detailCard}
          >
            <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={styles.detailBlur}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="sparkles" size={14} color="#FFF" />
                  <Text style={styles.detailBadgeText}>FİKİR ANALİZİ</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedIdea(null)}>
                  <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.detailTitle, { color: colors.text }]}>{selectedIdea.label}</Text>
              <Text style={[styles.detailDescription, { color: colors.textMuted }]}>{selectedIdea.description}</Text>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <Text style={[styles.relatedTitle, { color: colors.text }]}>İlgili Alıntılar & Notlar</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.quoteScroll}>
                {selectedIdea.content.length > 0 ? (
                  selectedIdea.content.map((item: any, i: number) => (
                    <View key={i} style={[styles.quoteItem, { borderLeftColor: colors.primary }]}>
                      <Text style={[styles.quoteText, { color: colors.text }]}>"{item.text}"</Text>
                      <Text style={[styles.quoteBook, { color: colors.textMuted }]}>{item.book}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.noContentText, { color: colors.textMuted }]}>
                    Bu tema henüz zihninde filizleniyor. Okumaya devam ettikçe burası dolacak.
                  </Text>
                )}
              </ScrollView>
            </BlurView>
          </Animated.View>
        )}
        
        {distilledIdeas.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Analiz edilebilecek kadar fikir birikmedi. Biraz daha okumaya ne dersin?
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  graphArea: {
    flex: 1,
    position: 'relative',
  },
  nodeContainer: {
    position: 'absolute',
    borderRadius: 30,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  nodeCapsule: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: {
    fontFamily: FONTS.primary.bold,
    textAlign: 'center',
  },
  detailCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 100,
  },
  detailBlur: {
    flex: 1,
    padding: SPACING.xl,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: FONTS.primary.bold,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  detailTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 24,
    marginBottom: SPACING.s,
  },
  detailDescription: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.l,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: SPACING.l,
    opacity: 0.1,
  },
  relatedTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
    marginBottom: SPACING.m,
  },
  quoteScroll: {
    flex: 1,
  },
  quoteItem: {
    paddingLeft: SPACING.m,
    borderLeftWidth: 3,
    marginBottom: SPACING.l,
  },
  quoteText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 4,
  },
  quoteBook: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  noContentText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: SPACING.m,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginTop: SPACING.m,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
