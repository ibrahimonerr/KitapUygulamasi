import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface CreateClubModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (clubData: any) => void;
  colors: any;
  isDark: boolean;
}

export const CreateClubModal: React.FC<CreateClubModalProps> = ({
  isVisible,
  onClose,
  onCreate,
  colors,
  isDark
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<'book' | 'friends'>('book');
  const [selectedPrivacy, setSelectedPrivacy] = useState<'public' | 'private'>('private');

  const handleCreate = () => {
    if (name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCreate({ name, description, type: selectedType, privacy: selectedPrivacy });
      setName('');
      setDescription('');
      setSelectedType('book');
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          entering={FadeInDown.duration(400)} 
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={styles.blurContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Yeni Kulüp Oluştur</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>KULÜP ADI</Text>
                <TextInput
                  placeholder="Örn: Distopya Okurları"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceLight }]}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>KULÜP TİPİ</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity 
                    style={[
                      styles.typeOption, 
                      { backgroundColor: selectedType === 'book' ? colors.primary + '20' : colors.surfaceLight, borderColor: selectedType === 'book' ? colors.primary : 'transparent' }
                    ]}
                    onPress={() => {
                      setSelectedType('book');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons name="book" size={20} color={selectedType === 'book' ? colors.primary : colors.textMuted} />
                    <View style={styles.typeTextGroup}>
                      <Text style={[styles.typeTitle, { color: colors.text }]}>Kitap Kulübü</Text>
                      <Text style={[styles.typeDesc, { color: colors.textMuted }]}>Herkes aynı kitabı okur.</Text>
                    </View>
                    {selectedType === 'book' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.typeOption, 
                      { backgroundColor: selectedType === 'friends' ? colors.primary + '20' : colors.surfaceLight, borderColor: selectedType === 'friends' ? colors.primary : 'transparent' }
                    ]}
                    onPress={() => {
                      setSelectedType('friends');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons name="people" size={20} color={selectedType === 'friends' ? colors.primary : colors.textMuted} />
                    <View style={styles.typeTextGroup}>
                      <Text style={[styles.typeTitle, { color: colors.text }]}>Arkadaş Kulübü</Text>
                      <Text style={[styles.typeDesc, { color: colors.textMuted }]}>Bağımsız okumalar paylaşılır.</Text>
                    </View>
                    {selectedType === 'friends' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>AÇIKLAMA</Text>
                <TextInput
                  placeholder="Bu kulüpte neler okuyacağız?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.surfaceLight }]}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>GİZLİLİK</Text>
                <View style={styles.privacyRow}>
                  <View 
                    style={[
                      styles.privacyOption, 
                      { backgroundColor: colors.primary }
                    ]}
                  >
                    <Ionicons name="lock-closed" size={18} color={'#FFF'} />
                    <Text style={[styles.privacyText, { color: '#FFF' }]}>Sadece Davetli Üyeler</Text>
                  </View>
                </View>
                <Text style={[styles.privacyInfo, { color: colors.textMuted }]}>
                  Kulübünüz tamamen gizlidir ve sadece sizin eklediğiniz kişiler tarafından görülebilir.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.createBtn}
                disabled={!name.trim()}
                onPress={handleCreate}
              >
                <LinearGradient
                  colors={name.trim() ? [colors.primary, '#8a2be2'] : [colors.surfaceMedium, colors.surfaceMedium]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>Kulübü Başlat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: height * 0.7,
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  blurContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: SPACING.s,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  typeRow: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 16,
  },
  typeTextGroup: {
    flex: 1,
  },
  typeTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 15,
  },
  typeDesc: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
    marginTop: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  privacyText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
  },
  privacyInfo: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: SPACING.l,
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
});
