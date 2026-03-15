import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { FONTS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleGuestLogin = () => {
    router.replace('/(tabs)/active');
  };

  const handleBack = () => {
    router.back();
  }

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
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                 <BlurView intensity={30} tint={isDark ? "light" : "dark"} style={[styles.backButtonInner, { borderColor: colors.border }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                 </BlurView>
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
           <Animated.View entering={FadeInDown.duration(800)}>
              <Text style={[styles.title, { color: colors.text }]}>Okurlar {'\n'}Burada Buluşur</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>İlerleyişinizi kaybetmemek ve kulüplere katılmak için hesabınızı açın.</Text>
           </Animated.View>

           <Animated.View entering={FadeIn.delay(400).duration(800)} style={styles.actions}>
              
              <TouchableOpacity activeOpacity={0.8} style={[styles.primaryButton, { backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                 <BlurView intensity={50} tint={isDark ? "light" : "dark"} style={styles.primaryButtonInner}>
                    <Ionicons name="logo-google" size={20} color={isDark ? colors.background : '#FFFFFF'} style={{marginRight: 10}} />
                    <Text style={[styles.primaryButtonText, { color: isDark ? colors.background : '#FFFFFF' }]}>Google ile Devam Et</Text>
                  </BlurView>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={handleGuestLogin} style={[styles.secondaryButton, { borderColor: colors.surfaceGlass }]}>
                 <Text style={[styles.secondaryButtonText, { color: colors.textMuted }]}>Misafir Olarak Keşfet</Text>
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
    paddingTop: height * 0.05,
    zIndex: 10,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 40,
    lineHeight: 48,
    marginBottom: SPACING.l,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.xxl,
  },
  actions: {
    marginTop: 'auto',
    marginBottom: height * 0.1,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: SPACING.m,
  },
  primaryButtonInner: {
    flexDirection: 'row',
    paddingVertical: SPACING.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: SPACING.m,
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
});
