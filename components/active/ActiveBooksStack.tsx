import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { FONTS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface ActiveBooksStackProps {
  activeBooks: any[];
  onBookPress: (index: number) => void;
  onAddBook: (section: 'active' | 'waitlist') => void;
  colors: any;
  isDark: boolean;
}

export const ActiveBooksStack: React.FC<ActiveBooksStackProps> = ({
  activeBooks,
  onBookPress,
  onAddBook,
  colors,
  isDark
}) => {
  return (
    <View style={[styles.activeSection, { marginTop: SPACING.l, width: '100%' }]}>
      <View style={styles.activeSectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="library" size={20} color={colors.primary} />
          <Text style={[styles.activeSectionTitle, { color: colors.text }]}>Aktif Okunan Kitaplar</Text>
        </View>
        <TouchableOpacity style={styles.sectionAddButton} onPress={() => onAddBook('active')}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.stackContainer}>
        {activeBooks.slice(0, 2).map((book: any, index: number) => {
          const zIndex = 10 - index;
          const scale = 1 - (index * 0.06);
          const translateY = index * 22;
          const opacity = 1 - (index * 0.18);
          
          return (
            <TouchableOpacity 
              key={book.id}
              activeOpacity={1}
              style={[
                styles.bookCardWrapper,
                { 
                  zIndex,
                  transform: [{ translateY }, { scale }],
                  opacity,
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                  borderWidth: 1.5,
                }
              ]}
              onPress={() => onBookPress(index)}
            >
              <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={styles.bookCardBlur}>
                <View style={styles.bookCardContent}>
                  <Image source={{ uri: book.cover }} style={styles.bookCardCover} />
                  <View style={styles.bookCardInfo}>
                    <Text style={[styles.bookCardTitle, { color: colors.text }]} numberOfLines={1}>{book.title}</Text>
                    <Text style={[styles.bookCardAuthor, { color: colors.textMuted }]}>{book.author}</Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={[styles.progressBarFill, { width: `${book.progress * 100}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.progressText, { color: colors.textMuted }]}>%{Math.round(book.progress * 100)} • {book.pages}</Text>
                    </View>
                  </View>
                  {index === 0 && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  )}
                </View>
              </BlurView>
            </TouchableOpacity>
          );
        })}

        {activeBooks.length < 2 && (
          <TouchableOpacity 
            style={[
                styles.addBookSlot, 
                { 
                    zIndex: 1, 
                    transform: [{ translateY: 22 }, { scale: 0.94 }],
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                }
            ]}
            onPress={() => onAddBook('active')}
          >
                <Ionicons name="add" size={32} color={colors.textMuted} />
                <Text style={[styles.addBookText, { color: colors.textMuted }]}>Kitap Ekle</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.m,
  },
  activeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.l,
  },
  activeSectionTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
    marginLeft: 10,
  },
  sectionAddButton: {
    padding: 4,
  },
  stackContainer: {
    height: 220,
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
  },
  bookCardWrapper: {
    position: 'absolute',
    width: '100%',
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  bookCardBlur: {
    flex: 1,
  },
  bookCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  bookCardCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  bookCardInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  bookCardTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  bookCardAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
  },
  addBookSlot: {
    position: 'absolute',
    width: '100%',
    height: 140,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  addBookText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    marginTop: 8,
  },
});
