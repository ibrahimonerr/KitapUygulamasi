import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function ReportBugModal({ isVisible, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen hata başlığını ve açıklamasını doldurun.');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Mock Backend Saving
      const newReport = {
        id: Date.now().toString(),
        title,
        description,
        timestamp: new Date().toISOString(),
      };

      const existingReportsStr = await AsyncStorage.getItem('bug_reports');
      const existingReports = existingReportsStr ? JSON.parse(existingReportsStr) : [];
      const updatedReports = [newReport, ...existingReports];
      
      await AsyncStorage.setItem('bug_reports', JSON.stringify(updatedReports));

      // Visual delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsSubmitting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Geri Bildirim Alındı', 
        'Hatayı bildirdiğiniz için teşekkür ederiz. Ekibimize iletildi.',
        [{ text: 'Tamam', onPress: onClose }]
      );
      setTitle('');
      setDescription('');
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Hata', 'Rapor kaydedilirken bir sorun oluştu.');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View 
            style={[styles.content, { backgroundColor: isDark ? 'rgba(30, 30, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)' }]}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Vazgeç</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Hata Bildir</Text>
              <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={styles.submitButton}>
                <Text style={[styles.submitText, { color: isSubmitting ? colors.textMuted : colors.primary }]}>
                  {isSubmitting ? '...' : 'Gönder'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>
                  Uygulamada karşılaştığınız hataları bildirerek deneyimi iyileştirmemize yardımcı olabilirsiniz.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BAŞLIK</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Kısa bir özet (Örn: Sayfa yüklenmiyor)"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>AÇIKLAMA</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Hata nasıl gerçekleşti? Adım adım anlatabilirsiniz."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  content: {
    width: '100%',
    height: 520,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    width: 60,
  },
  cancelText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
  modalTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  submitButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  submitText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  form: {
    padding: SPACING.l,
  },
  infoBox: {
    flexDirection: 'row',
    padding: SPACING.m,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.s,
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  inputLabel: {
    fontFamily: FONTS.primary.bold,
    fontSize: 12,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  input: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.m,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
