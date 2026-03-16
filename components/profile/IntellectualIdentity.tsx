import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUser } from '../../store/UserContext';
import { useLibrary } from '../../store/LibraryContext';
import { analyzeIntellectualIdentity } from '../../services/identityAnalysis';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, TouchableOpacity } from 'react-native';

export default function IntellectualIdentity() {
  const { colors, isDark } = useTheme();
  const { profile, updateProfile } = useUser();
  const { activeBooks, finishedBooks, waitlistBooks } = useLibrary();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Collect all data for analysis
  const allBooks = [...activeBooks, ...finishedBooks, ...waitlistBooks];
  const allQuotes = allBooks.flatMap(b => b.quotes || []);
  const allNotes = allBooks.flatMap(b => b.notes || []);

  const handleRunAnalysis = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await analyzeIntellectualIdentity(allBooks, allQuotes, allNotes);
      await updateProfile({ intellectual_identity: result });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Analysis failed:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const identity = profile?.intellectual_identity || {
    title: "Edebi Kaşif",
    description: "Okuma verilerin analiz edilerek entelektüel karakterin burada şekillenecek.",
    traits: ["Keşif", "Analiz", "Derinlik"]
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(200)}
      style={styles.container}
    >
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.blurCard}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.highlight }]}>
            {isAnalyzing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons name="infinite" size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Entelektüel Kimlik</Text>
              {(allBooks.length > 0) && (
                <TouchableOpacity onPress={handleRunAnalysis} disabled={isAnalyzing}>
                  <Ionicons 
                    name="refresh" 
                    size={14} 
                    color={isAnalyzing ? colors.textMuted : colors.primary} 
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.identityTitle, { color: colors.text }]}>{identity.title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {identity.description}
            </Text>
            
            {identity.traits && (
              <View style={styles.traitsContainer}>
                {identity.traits.map((trait, idx) => (
                  <View key={idx} style={[styles.traitBadge, { backgroundColor: colors.surfaceLight }]}>
                    <Text style={[styles.traitText, { color: colors.textMuted }]}>{trait}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.m,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurCard: {
    padding: SPACING.l,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  identityTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  description: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  traitText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
  }
});
