import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../store/AuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { signIn, signUp } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password || (!isLoginMode && !fullName)) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    console.log("Starting auth in mode:", isLoginMode ? "Giriş" : "Kayıt");
    try {
      if (isLoginMode) {
        await signIn(username, password);
        console.log("Sign in successful");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)/active');
      } else {
        await signUp(username, password, fullName);
        console.log("Sign up successful");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(auth)/onboarding');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      Alert.alert("Hata", error.message || "Girdiğiniz bilgiler hatalı olabilir veya sunucu bağlantısı kurulamadı.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(auth)/onboarding');
  };

  const blobOpactiy = useSharedValue(0.2);

  useEffect(() => {
    blobOpactiy.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 5000 }), withTiming(0.2, { duration: 5000 })),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: blobOpactiy.value,
  }));

  return (
     <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
           colors={[colors.background, isDark ? '#1a1f2e' : '#FFFFFF']}
           style={StyleSheet.absoluteFill}
        />
        
        <Animated.View style={[
          styles.backgroundBlob, 
          animatedStyle, 
          { backgroundColor: isDark ? colors.primary : 'rgba(94, 156, 255, 0.2)' }
        ]} />

        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                 <BlurView intensity={30} tint={isDark ? "light" : "dark"} style={[styles.backButtonInner, { borderColor: colors.border }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                 </BlurView>
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
           <Animated.View entering={FadeInDown.duration(800)}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isLoginMode ? 'Tekrar Hoş Geldin' : 'Yeni Yolculuk Başlıyor'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {isLoginMode 
                  ? 'Kullanıcı adın ve şifrenle kaldığın yerden devam et.' 
                  : 'Sadece kullanıcı adı belirleyerek butik kütüphaneni oluştur.'}
              </Text>
           </Animated.View>

           <View style={styles.inputSection}>
              {!isLoginMode && (
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Ad Soyad"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              )}

              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="at-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Kullanıcı Adı"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={(val) => setUsername(val.toLowerCase())}
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Şifre"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.mainBtnText}>
                    {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsLoginMode(!isLoginMode)}
                style={styles.toggleBtn}
              >
                <Text style={{ color: colors.textMuted }}>
                  {isLoginMode ? 'Hesabın yok mu? ' : 'Zaten üye misin? '}
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
                    {isLoginMode ? 'Kayıt Ol' : 'Giriş Yap'}
                  </Text>
                </Text>
              </TouchableOpacity>
           </View>

           <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.actions}>
              <TouchableOpacity activeOpacity={0.7} onPress={handleGuestLogin} style={[styles.secondaryButton, { borderColor: colors.surfaceGlass }]}>
                 <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>Misafir Olarak Devam Et</Text>
              </TouchableOpacity>
           </Animated.View>
        </View>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundBlob: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    top: -height * 0.2,
    right: -width * 0.4,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.xl,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  backButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: height * 0.02,
    zIndex: 10,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 32,
    lineHeight: 40,
    marginBottom: SPACING.m,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  inputSection: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  mainBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  toggleBtn: {
    alignItems: 'center',
    padding: 10,
  },
  actions: {
    marginTop: 'auto',
    marginBottom: height * 0.05,
  },
  secondaryButton: {
    paddingVertical: SPACING.m,
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 15,
  },
});
