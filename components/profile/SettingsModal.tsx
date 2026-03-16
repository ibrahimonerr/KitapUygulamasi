import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Switch,
  Platform,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../store/ThemeContext';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import ReportBugModal from './ReportBugModal';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isVisible, onClose }: Props) {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [isBugModalVisible, setIsBugModalVisible] = useState(false);

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            onClose();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, label, rightElement, onPress, destructive = false }: any) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: destructive ? 'rgba(255, 65, 54, 0.1)' : colors.surfaceMedium }]}>
          <Ionicons name={icon} size={20} color={destructive ? '#FF4136' : colors.text} />
        </View>
        <Text style={[styles.settingLabel, { color: destructive ? '#FF4136' : colors.text }]}>{label}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

        <View
          style={[styles.content, { backgroundColor: isDark ? 'rgba(25, 25, 35, 0.98)' : 'rgba(255, 255, 255, 0.98)' }]}
        >
          <View style={styles.header}>
            <View style={{ width: 44 }} />
            <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>UYGULAMA AYARLARI</Text>
              <SettingItem
                icon="moon-outline"
                label="Koyu Tema"
                rightElement={
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ 
                      false: isDark ? '#3e3e3e' : '#D1D1D6', 
                      true: colors.primary 
                    }}
                    ios_backgroundColor="#D1D1D6"
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : (isDark ? colors.primary : '#FFFFFF')}
                  />
                }
              />
              <SettingItem
                icon="bug-outline"
                label="Hata Bildir"
                rightElement={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
                onPress={() => {
                  setIsBugModalVisible(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            </View>

            <View style={styles.section}>
              <SettingItem
                icon="log-out-outline"
                label="Çıkış Yap"
                destructive
                onPress={handleLogout}
              />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.versionText, { color: colors.textMuted }]}>Versiyon 1.0.0 (Beta)</Text>
            </View>
          </ScrollView>
        </View>

        <ReportBugModal
          isVisible={isBugModalVisible}
          onClose={() => setIsBugModalVisible(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.l,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.l,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: SPACING.m,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  settingLabel: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  footer: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
 versionText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
    opacity: 0.5,
  }
});
