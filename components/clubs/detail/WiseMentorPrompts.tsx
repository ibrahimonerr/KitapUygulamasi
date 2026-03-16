import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../../constants/theme';

interface WiseMentorPromptsProps {
  colors: any;
  isDark: boolean;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface Prompt {
  id: string;
  question: string;
  type: string;
  comments: Comment[];
}

const INITIAL_PROMPTS: Prompt[] = [];

export const WiseMentorPrompts: React.FC<WiseMentorPromptsProps> = ({ colors, isDark }) => {
  const [prompts, setPrompts] = useState<Prompt[]>(INITIAL_PROMPTS);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const activePrompt = prompts.find(p => p.id === activePromptId);

  const openCommentModal = (promptId: string) => {
    setActivePromptId(promptId);
    setIsModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const submitComment = () => {
    if (!commentText.trim() || !activePromptId) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: 'Sen',
      date: 'Az önce',
    };

    setPrompts(prev => prev.map(p => 
      p.id === activePromptId 
        ? { ...p, comments: [...p.comments, newComment] }
        : p
    ));
    setCommentText('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.title, { color: colors.text }]}>Bilgece Sorular</Text>
        </View>
        <Text style={[styles.aiBadge, { color: colors.primary }]}>AI Üretimi</Text>
      </View>

      {prompts.map((prompt) => (
        <View 
          key={prompt.id} 
          style={[
            styles.promptCard, 
            { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }
          ]}
        >
          <View style={[styles.typeBadge, { backgroundColor: colors.surfaceMedium }]}>
            <Text style={[styles.typeText, { color: colors.textMuted }]}>{prompt.type}</Text>
          </View>
          <Text style={[styles.promptText, { color: colors.text }]}>{prompt.question}</Text>
          
          {/* Show comment count */}
          {prompt.comments.length > 0 && (
            <View style={styles.commentPreview}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.commentCount, { color: colors.textMuted }]}>
                {prompt.comments.length} yorum
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.answerBtn}
            onPress={() => openCommentModal(prompt.id)}
          >
            <Text style={[styles.answerText, { color: colors.primary }]}>Düşünceni Paylaş</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Comment Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setIsModalVisible(false)} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Tartışma</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Question */}
              {activePrompt && (
                <View style={[styles.questionBox, { backgroundColor: colors.surfaceLight }]}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.questionText, { color: colors.text }]}>{activePrompt.question}</Text>
                </View>
              )}

              {/* Comments */}
              <FlatList
                data={activePrompt?.comments || []}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                ListEmptyComponent={
                  <View style={styles.emptyComments}>
                    <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={[styles.commentItem, { borderColor: colors.border }]}>
                    <View style={styles.commentHeader}>
                      <Text style={[styles.commentAuthor, { color: colors.text }]}>{item.author}</Text>
                      <Text style={[styles.commentDate, { color: colors.textMuted }]}>{item.date}</Text>
                    </View>
                    <Text style={[styles.commentBody, { color: colors.text }]}>{item.text}</Text>
                  </View>
                )}
              />

              {/* Input */}
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <TextInput
                  placeholder="Düşünceni yaz..."
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  aiBadge: {
    fontFamily: FONTS.primary.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  promptCard: {
    padding: SPACING.l,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  promptText: {
    fontFamily: FONTS.serif.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  commentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  commentCount: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  answerText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 13,
  },
  // Modal Styles
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '70%',
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
  questionBox: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderRadius: 16,
    gap: 10,
    marginBottom: SPACING.m,
  },
  questionText: {
    flex: 1,
    fontFamily: FONTS.serif.regular,
    fontSize: 14,
    lineHeight: 20,
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
    textAlign: 'center',
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
