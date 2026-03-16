import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Image,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../store/UserContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isVisible, onClose }: Props) {
  const { profile, updateProfile } = useUser();
  const { colors, isDark } = useTheme();
  
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);

  useEffect(() => {
    if (isVisible) {
      setName(profile.name);
      setBio(profile.bio);
      setAvatar(profile.avatar);
    }
  }, [isVisible, profile]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Profil fotoğrafınızı değiştirmek için galeri erişim izni vermeniz gerekmektedir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateProfile({ name, bio, avatar });
      onClose();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <BlurView 
          intensity={80} 
          tint={isDark ? 'dark' : 'light'} 
          style={StyleSheet.absoluteFill} 
        />
        
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
              <Text style={[styles.title, { color: colors.text }]}>Profili Düzenle</Text>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={[styles.saveText, { color: colors.primary }]}>Bitti</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <View style={styles.avatarSection}>
                <TouchableOpacity 
                  onPress={pickImage}
                  activeOpacity={0.8}
                  style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceMedium }]}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={50} color={colors.textMuted} />
                  )}
                  <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.avatarTip, { color: colors.textMuted }]}>Profil Fotoğrafını Değiştir</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>İSİM</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
                  placeholder="İsminizi yazın"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BİO</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea, { color: colors.text, borderBottomColor: colors.border }]}
                  placeholder="Kendinizden bahsedin"
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
    height: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 17,
  },
  cancelButton: {
    padding: SPACING.s,
  },
  cancelText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  saveButton: {
    padding: SPACING.s,
  },
  saveText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  form: {
    padding: SPACING.l,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  avatarTip: {
    marginTop: SPACING.s,
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 12,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    paddingVertical: SPACING.s,
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  }
});
