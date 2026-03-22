import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLibrary } from '../../store/LibraryContext';
import { useClubs } from '../../store/ClubsContext';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
  type?: 'standard' | 'quote' | 'page';
  reference_id?: string;
  page_number?: number;
}

interface ClubChatProps {
  clubId: string;
  colors: any;
  isDark: boolean;
  onClose: () => void;
}

export const ClubChat: React.FC<ClubChatProps> = ({
  clubId,
  colors,
  isDark,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList>(null);
  
  const { activeBooks } = useLibrary();
  const { myClubs } = useClubs();

  const club = myClubs.find(c => c.id === clubId);
  const MY_USER_ID = 'user_unique_id_123'; // Logic would come from Auth

  // Find user's progress in this club's reading book
  let myCurrentPage = 0;
  if (club && club.bookTitle) {
    const matchingBook = activeBooks.find(b => b.title === club.bookTitle);
    if (matchingBook && matchingBook.pages) {
      const parts = matchingBook.pages.split('/');
      const totalPages = parts.length === 2 ? parseInt(parts[1]) : 300;
      myCurrentPage = Math.floor(matchingBook.progress * totalPages);
    }
  }

  // To test the shield easily, let's hardcode myCurrentPage lower
  // For the demo:
  if (myCurrentPage === 0) myCurrentPage = 50;

  useEffect(() => {
    // Starting with mock messages to demonstrate Spoiler Shield
    setMessages([
      {
        id: "1",
        user_id: "other_user_1",
        user_name: "Ayşe",
        user_avatar: "https://i.pravatar.cc/150?u=ayse",
        text: "Kitaba yeni başladım, dilinin sadeliği harika.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        user_id: "other_user_2",
        user_name: "Burak",
        user_avatar: "https://i.pravatar.cc/150?u=burak",
        text: "Asıl şok edici olan kısmı sanırım 120. sayfaydı. Ana karakterin verdiği karar tüm algımı değiştirdi!",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        type: "page",
        page_number: 120
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    // Check if input looks like a page reference: e.g. "s.140 ..."
    let type: 'standard' | 'page' = 'standard';
    let pageNumber: number | undefined;

    const pageMatch = inputText.match(/^[s|p]\.?\s*(\d+)[:| -]?/i);
    if (pageMatch) {
      type = 'page';
      pageNumber = parseInt(pageMatch[1], 10);
    }

    const newMessage: Message = {
      id: Math.random().toString(),
      user_id: MY_USER_ID,
      user_name: 'Ben',
      user_avatar: 'https://i.pravatar.cc/150?u=me',
      text: inputText,
      created_at: new Date().toISOString(),
      type: type,
      page_number: pageNumber
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpoiler = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.user_id === MY_USER_ID;
    const isSpoiler = !isMe && item.type === 'page' && item.page_number && item.page_number > myCurrentPage && !revealedSpoilers.has(item.id);

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 50)}
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther
        ]}
      >
        {!isMe && (
          <Image source={{ uri: item.user_avatar }} style={styles.avatar} />
        )}
        
        <View style={[
          styles.messageBubble,
          isMe ? { backgroundColor: colors.primary } : { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
          isMe ? styles.bubbleMe : styles.bubbleOther
        ]}>
          {!isMe && (
            <Text style={[styles.senderName, { color: colors.primary }]}>{item.user_name}</Text>
          )}
          
          {item.type === 'page' && (
            <View style={styles.referenceBadge}>
              <Ionicons name="book-outline" size={12} color={isMe ? '#FFF' : colors.primary} />
              <Text style={[styles.referenceText, { color: isMe ? '#FFF' : colors.primary }]}>Sayfa {item.page_number}</Text>
            </View>
          )}

          {isSpoiler ? (
            <TouchableOpacity onPress={() => toggleSpoiler(item.id)} activeOpacity={0.8} style={styles.spoilerContainer}>
              <BlurView intensity={isDark ? 80 : 40} tint={isDark ? "dark" : "light"} style={styles.spoilerBlur}>
                <Ionicons name="eye-off-outline" size={24} color={colors.text} />
                <Text style={[styles.spoilerText, { color: colors.text }]}>Sürprizbozan Kalkanı</Text>
                <Text style={[styles.spoilerSubtext, { color: colors.textMuted }]}>Kitapta henüz sayfa {item.page_number}'e gelmediniz. Görmek için dokunun.</Text>
              </BlurView>
            </TouchableOpacity>
          ) : (
            <Text style={[
              styles.messageText,
              { color: isMe ? '#FFF' : colors.text }
            ]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[
            styles.timestamp,
            { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textMuted }
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kulüp Sohbeti</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{club?.bookTitle || club?.name}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setInputText("s. "); 
        }}>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
          placeholder="Sayfa no eklemek için 's. 120' yaz..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
  },
  headerInfo: {
    alignItems: 'center',
    maxWidth: '70%',
  },
  headerTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  headerSubtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: SPACING.l,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageRowOther: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  spoilerContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.1)',
  },
  spoilerBlur: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  spoilerText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  spoilerSubtext: {
    fontFamily: FONTS.primary.regular,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  timestamp: {
    fontFamily: FONTS.primary.regular,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  referenceText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 11,
    marginLeft: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.m,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginHorizontal: 12,
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
  },
  attachBtn: {
    padding: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
