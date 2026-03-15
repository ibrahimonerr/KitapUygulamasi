import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../../constants/theme';

interface ClubQuotesFeedProps {
  colors: any;
  isDark: boolean;
}

interface FeedComment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface FeedItem {
  id: string;
  user: { name: string; avatar: string };
  type: 'quote' | 'note';
  content: string;
  page?: number;
  date: string;
  likes: number;
  isLiked: boolean;
  comments: FeedComment[];
}

const INITIAL_ITEMS: FeedItem[] = [
  {
    id: '1',
    user: { name: 'Can Demir', avatar: 'https://i.pravatar.cc/150?u=2' },
    type: 'quote',
    content: 'Dünya bana karanlık geldiğinde, kendimden çıkıp kendime baktığımda anladım ki, karanlık benim içimdeymiş.',
    page: 45,
    date: 'Bugün',
    likes: 7,
    isLiked: false,
    comments: [
      { id: 'c1', text: 'Bu alıntı tam anlamıyla Selim Işık\'ın ruh halini özetliyor.', author: 'Zeynep', date: 'Bugün' }
    ]
  },
  {
    id: '2',
    user: { name: 'Sen', avatar: 'https://i.pravatar.cc/150?u=3' },
    type: 'note',
    content: 'Oğuz Atay\'ın bilinç akışı tekniği, okuyucuyu karakterin zihninin içine sokuyor. Turgut\'un mektupları özellikle çarpıcı.',
    date: 'Dün',
    likes: 3,
    isLiked: true,
    comments: []
  },
];

export const ClubQuotesFeed: React.FC<ClubQuotesFeedProps> = ({ colors, isDark }) => {
  const [items, setItems] = useState<FeedItem[]>(INITIAL_ITEMS);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const activeItem = items.find(i => i.id === activeItemId);

  const toggleLike = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
        : item
    ));
  };

  const openComments = (itemId: string) => {
    setActiveItemId(itemId);
    setIsCommentModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const submitComment = () => {
    if (!commentText.trim() || !activeItemId) return;

    const newComment: FeedComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: 'Sen',
      date: 'Az önce',
    };

    setItems(prev => prev.map(item =>
      item.id === activeItemId
        ? { ...item, comments: [...item.comments, newComment] }
        : item
    ));
    setCommentText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>İlham Duvarı</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Tümü</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View 
          key={item.id} 
          style={[
            styles.itemCard, 
            { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderColor: colors.border }
          ]}
        >
          <View style={styles.itemHeader}>
            <View style={styles.userInfo}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View>
                <Text style={[styles.userName, { color: colors.text }]}>{item.user.name}</Text>
                <Text style={[styles.itemDate, { color: colors.textMuted }]}>{item.date}</Text>
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: item.type === 'quote' ? 'rgba(94,156,255,0.1)' : 'rgba(138,43,226,0.1)' }]}>
              <Text style={[styles.typeText, { color: item.type === 'quote' ? colors.primary : '#8a2be2' }]}>
                {item.type === 'quote' ? 'ALINTI' : 'NOT'}
              </Text>
            </View>
          </View>

          <Text style={[
            item.type === 'quote' ? styles.quoteText : styles.noteText, 
            { color: colors.text }
          ]}>
            {item.type === 'quote' ? `"${item.content}"` : item.content}
          </Text>

          {item.page && (
            <Text style={[styles.pageText, { color: colors.textMuted }]}>Sayfa {item.page}</Text>
          )}

          {/* Like & Comment Actions */}
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => toggleLike(item.id)}
            >
              <Ionicons 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={item.isLiked ? '#FF3B30' : colors.textMuted} 
              />
              <Text style={[styles.actionText, { color: item.isLiked ? '#FF3B30' : colors.textMuted }]}>
                {item.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => openComments(item.id)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.actionText, { color: colors.textMuted }]}>
                {item.comments.length > 0 ? item.comments.length : 'Yorum'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Comment Modal */}
      <Modal visible={isCommentModalVisible} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setIsCommentModalVisible(false)} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Yorumlar</Text>
                <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Original Post Preview */}
              {activeItem && (
                <View style={[styles.originalPost, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.originalAuthor, { color: colors.text }]}>{activeItem.user.name}</Text>
                  <Text style={[styles.originalText, { color: colors.textMuted }]} numberOfLines={2}>
                    {activeItem.type === 'quote' ? `"${activeItem.content}"` : activeItem.content}
                  </Text>
                </View>
              )}

              <FlatList
                data={activeItem?.comments || []}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                ListEmptyComponent={
                  <View style={styles.emptyComments}>
                    <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz yorum yok.</Text>
                  </View>
                }
                renderItem={({ item: comment }) => (
                  <View style={[styles.commentItem, { borderColor: colors.border }]}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.author}</Text>
                      <Text style={[styles.commentDate, { color: colors.textMuted }]}>{comment.date}</Text>
                    </View>
                    <Text style={[styles.commentBody, { color: colors.text }]}>{comment.text}</Text>
                  </View>
                )}
              />

              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <TextInput
                  placeholder="Yorum yaz..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight }]}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.sendBtn, { backgroundColor: commentText.trim() ? colors.primary : colors.surfaceMedium }]}
                  onPress={submitComment}
                  disabled={!commentText.trim()}
                >
                  <Ionicons name="send" size={18} color={commentText.trim() ? '#FFF' : colors.textMuted} />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  seeAll: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 13,
  },
  itemCard: {
    padding: SPACING.l,
    borderRadius: 24,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
  },
  itemDate: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  quoteText: {
    fontFamily: FONTS.serif.regular,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
  },
  noteText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  pageText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 11,
    marginTop: 10,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 13,
  },
  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '65%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  modalTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 22,
  },
  originalPost: {
    padding: SPACING.m,
    borderRadius: 16,
    marginBottom: SPACING.m,
  },
  originalAuthor: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    marginBottom: 4,
  },
  originalText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  commentsList: {
    flex: 1,
  },
  emptyComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentAuthor: {
    fontFamily: FONTS.primary.bold,
    fontSize: 13,
  },
  commentDate: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
  },
  commentBody: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: SPACING.m,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
