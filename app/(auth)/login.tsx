import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../store/AuthContext';
import * as Haptics from 'expo-haptics';
import BounceButton from '../../components/ui/BounceButton';
import { supabaseUrl } from '../../services/supabase';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { signInWithGoogle, signInWithApple, signInAsGuest, connectionError } = useAuth();

  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'guest' | null>(null);
  const [statusText, setStatusText] = useState('');

  const blobOpacity = useSharedValue(0.2);

  useEffect(() => {
    blobOpacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 5000 }), withTiming(0.2, { duration: 5000 })),
      -1,
      true
    );

    if (!supabaseUrl) {
      Alert.alert('Konfigürasyon Hatası', 'Supabase URL bulunamadı. Lütfen .env dosyasını kontrol edin.');
    }
  }, [blobOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: blobOpacity.value,
  }));

  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setStatusText(provider === 'google' ? 'Google ile giriş başlatılıyor...' : 'Apple ile giriş başlatılıyor...');

    try {
      const isCompleted = provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      if (!isCompleted) {
        setStatusText('Sosyal giriş iptal edildi.');
        return;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)/active');
    } catch (error: any) {
      if (error?.message) {
        Alert.alert('Sosyal Giriş Hatası', error.message);
      }
      setStatusText('Giriş başarısız.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    setSocialLoading('guest');
    setStatusText('Misafir olarak giriş yapılıyor...');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
        await signInAsGuest();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(auth)/onboarding');
    } catch (error: any) {
        setStatusText('Misafir girişi başarısız.');
        Alert.alert('Hata', error.message);
    } finally {
        setSocialLoading(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.background, isDark ? '#1a1f2e' : '#FFFFFF']} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.backgroundBlob,
          animatedStyle,
          { backgroundColor: isDark ? colors.primary : 'rgba(94, 156, 255, 0.2)' },
        ]}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BlurView intensity={30} tint={isDark ? 'light' : 'dark'} style={[styles.backButtonInner, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.springify().damping(15)}>
          <Text style={[styles.title, { color: colors.text }]}>
            Yolculuğa Başlıyoruz
          </Text>
        </Animated.View>

        {connectionError && (
          <Animated.View
            entering={FadeInDown.delay(50)}
            style={[
              styles.errorBox,
              { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.3)', marginTop: 10 },
            ]}
          >
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>Bağlantı Hatası: {connectionError}</Text>
          </Animated.View>
        )}

        {statusText !== '' && (
          <Animated.View
            entering={FadeInDown.delay(50)}
            style={[
              styles.statusBox,
              { backgroundColor: statusText.startsWith('HATA') ? 'rgba(255, 59, 48, 0.1)' : 'rgba(94, 156, 255, 0.1)', marginTop: 10 },
            ]}
          >
            <Text style={[styles.statusText, { color: statusText.startsWith('HATA') ? '#FF3B30' : colors.primary }]}>
              {statusText}
            </Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(100).springify().damping(15)}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Tek dokunuşla sosyal hesaplarınla ya da misafir olarak giriş yap ve hemen okuma dünyana adım at.
          </Text>
        </Animated.View>

        <View style={styles.socialSection}>
          <Animated.View entering={FadeInDown.delay(200).springify().damping(15)}>
            <BounceButton
              style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              onPress={() => handleSocialAuth('google')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color={colors.text} />
                  <Text style={[styles.socialButtonText, { color: colors.text }]}>Google ile Devam Et</Text>
                </>
              )}
            </BounceButton>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify().damping(15)}>
            <BounceButton
              style={[styles.socialButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
              onPress={() => handleSocialAuth('apple')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={18} color={colors.text} />
                  <Text style={[styles.socialButtonText, { color: colors.text }]}>Apple ile Devam Et</Text>
                </>
              )}
            </BounceButton>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(450).springify().damping(15)} style={styles.actions}>
          <BounceButton onPress={handleGuestLogin} disabled={socialLoading !== null}>
            <View style={[styles.secondaryButton, { borderColor: colors.border, width: '100%' }]}>
               {socialLoading === 'guest' ? (
                <ActivityIndicator color={colors.textMuted} />
              ) : (
                 <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>Misafir Olarak Devam Et</Text>
              )}
            </View>
          </BounceButton>
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
  socialSection: {
    gap: 12,
    marginBottom: SPACING.l,
    marginTop: height * 0.05,
  },
  socialButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  socialButtonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 15,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: FONTS.primary.semiBold,
    fontSize: 13,
    flex: 1,
  },
  statusBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    textAlign: 'center',
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
