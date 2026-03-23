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
  ActivityIndicator,
  Modal
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { supabase } from '../../services/supabase';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AIDiscussionPartnerProps {
  isVisible: boolean;
  onClose: () => void;
  bookTitle: string;
  author: string;
  userNotes: string[];
  userQuotes: string[];
  colors: any;
  isDark: boolean;
}

export const AIDiscussionPartner: React.FC<AIDiscussionPartnerProps> = ({
  isVisible,
  onClose,
  bookTitle,
  author,
  userNotes,
  userQuotes,
  colors,
  isDark
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Keep track of the exact history format Gemini expects
  const apiHistoryRef = useRef<any[]>([]);

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      startInterview();
    }
  }, [isVisible]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const systemPrompt = `
        Sen "Bilge Rehber" isimli, Sokratik yöntemle konuşan bir edebiyat mentorüsün.
        Kullanıcı "${bookTitle}" (${author}) kitabını az önce bitirdi.
        Kullanıcının bu kitabı okurken aldığı notlar: ${JSON.stringify(userNotes)}
        Kullanıcının seçtiği alıntılar: ${JSON.stringify(userQuotes)}
        
        Görevin: Kullanıcıya kitabın ana fikirlerini içselleştirmesi için felsefi ve düşündürücü bir soru sormak. 
        Notlarından ve alıntılarından yola çıkarak kişiselleştirilmiş bir mülakat başlat. 
        Kısa, öz ve etkileyici konuş. İlk mesajına tebrik ederek başla.
      `;

      apiHistoryRef.current = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Harika bir yolculuğun sonuna geldin. Seninle bu eser üzerine derinleşmek için sabırsızlanıyorum." }],
        },
      ];

      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { 
          action: 'discussionChat', 
          payload: { 
            history: apiHistoryRef.current, 
            message: "Mülakatı başlat ve bana ilk sorunu sor." 
          } 
        }
      });

      if (error) throw error;
      
      const responseText = data.text;

      // Update history reference with user's invisible prompt and model's visible reply
      apiHistoryRef.current.push(
         { role: 'user', parts: [{ text: "Mülakatı başlat ve bana ilk sorunu sor." }] },
         { role: 'model', parts: [{ text: responseText }] }
      );
      
      setMessages([
        { id: '1', role: 'model', text: responseText }
      ]);
    } catch (error) {
      console.error("AI Partner error:", error);
      setMessages([{ id: 'err', role: 'model', text: "Şu an seninle derinleşmekte zorlanıyorum. Lütfen daha sonra tekrar deneyelim." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMsgText = inputText;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userMsgText };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: { 
          action: 'discussionChat', 
          payload: { 
            history: apiHistoryRef.current, 
            message: userMsgText 
          } 
        }
      });

      if (error) throw error;
      
      const responseText = data.text;

      // Push exactly what was exchanged to maintain context logic
      apiHistoryRef.current.push(
         { role: 'user', parts: [{ text: userMsgText }] },
         { role: 'model', parts: [{ text: responseText }] }
      );

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error) {
      console.error("AI Partner Send Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isModel = item.role === 'model';
    return (
      <Animated.View 
        entering={FadeInDown}
        style={[
          styles.messageRow,
          isModel ? styles.modelRow : styles.userRow
        ]}
      >
        <View style={[
          styles.bubble,
          isModel 
            ? { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderBottomLeftRadius: 4 } 
            : { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
        ]}>
          <Text style={[styles.messageText, { color: isModel ? colors.text : '#FFF' }]}>
            {item.text}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>Bilge Mülakat</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.bookInfo}>
             <Text style={[styles.bookTitle, { color: colors.text }]}>{bookTitle}</Text>
             <Text style={[styles.bookAuthor, { color: colors.textMuted }]}>{author}</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />

          {isLoading && messages.length > 0 && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
              placeholder="Düşünceni buraya yaz..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Ionicons name="arrow-up" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.m,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  bookInfo: {
    alignItems: 'center',
    paddingBottom: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.xl,
  },
  bookTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 18,
    textAlign: 'center',
  },
  bookAuthor: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    padding: SPACING.l,
    paddingBottom: 40,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  modelRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
  },
  messageText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  loaderContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 10,
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 120,
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
