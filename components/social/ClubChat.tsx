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
  const flatListRef = useRef<FlatList>(null);
  const MY_USER_ID = 'user_unique_id_123'; // Logic would come from Auth

  // Mock messages for display until Supabase Realtime is connected
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        user_id: 'other_user_1',
        user_name: 'Ahmet Y.',
        user_avatar: 'https://i.pravatar.cc/150?u=ahmet',
        text: 'Arkadaşlar 120. sayfadaki o tahlil beni bitirdi. Oğuz Atay gerçekten insanın içini okuyor.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        type: 'page',
        page_number: 120
      },
      {
        id: '2',
        user_id: 'other_user_2',
        user_name: 'Zeynep K.',
        user_avatar: 'https://i.pravatar.cc/150?u=zeynep',
        text: 'Kesinlikle katılıyorum. "Kelimeler, albayım, bazı anlamlara gelmiyor." alıntısı tam da o hissi özetliyor.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: 'quote'
      },
      {
        id: '3',
        user_id: MY_USER_ID,
        user_name: 'Ben',
        user_avatar: 'https://i.pravatar.cc/150?u=me',
        text: 'Dönüp dönüp tekrar okuyorum o kısımları.',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      }
    ];
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Math.random().toString(),
      user_id: MY_USER_ID,
      user_name: 'Ben',
      user_avatar: 'https://i.pravatar.cc/150?u=me',
      text: inputText,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // In production, this would be a supabase.from('messages').insert(...) call
  };

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isMe = item.user_id === MY_USER_ID;
    
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

          <Text style={[
            styles.messageText,
            { color: isMe ? '#FFF' : colors.text }
          ]}>
            {item.text}
          </Text>
          
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
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>3 üye aktif</Text>
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
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
          placeholder="Düşüncelerini paylaş..."
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
