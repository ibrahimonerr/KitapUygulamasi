import { Redirect, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';
import { FONTS, SPACING } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const isLoggedIn = false;

  const blob1Opactiy = useSharedValue(0.4);
  const blob2Opactiy = useSharedValue(0.3);

  useEffect(() => {
    blob1Opactiy.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 4000 }), withTiming(0.3, { duration: 4000 })),
      -1,
      true
    );
    blob2Opactiy.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 5000 }), withTiming(0.2, { duration: 5000 })),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: blob1Opactiy.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: blob2Opactiy.value,
  }));

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/active" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[colors.background, isDark ? '#11131a' : '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <Animated.View style={[
        styles.blob1, 
        animatedStyle1, 
        { backgroundColor: isDark ? colors.primary : 'rgba(94, 156, 255, 0.3)' }
      ]} />
      <Animated.View style={[
        styles.blob2, 
        animatedStyle2, 
        { backgroundColor: isDark ? '#8a2be2' : 'rgba(138, 43, 226, 0.2)' }
      ]} />

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(1000).springify()} style={styles.logoContainer}>
          <BlurView intensity={20} tint={isDark ? "light" : "dark"} style={[styles.logoBlur, { borderColor: colors.border }]}>
             <Text style={[styles.title, { color: colors.text }]}>Bilge<Text style={{color: colors.primary}}>Okur</Text></Text>
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600).duration(1000)} style={styles.taglineContainer}>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Kitaplar sadece okunmaz,{'\n'}yaşanır.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1000).duration(800).springify()} style={styles.buttonWrapper}>
          <TouchableOpacity 
             activeOpacity={0.8}
             onPress={() => router.push('/(auth)/login')}
             style={styles.button}
          >
             <LinearGradient
               colors={isDark ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
               style={[styles.buttonGradient, { borderColor: colors.border }]}
             >
               <BlurView intensity={30} tint={isDark ? "light" : "dark"} style={styles.buttonBlur}>
                  <Text style={[styles.buttonText, { color: colors.text }]}>Yolculuğa Başla</Text>
               </BlurView>
             </LinearGradient>
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
  blob1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    top: -height * 0.1,
    left: -width * 0.2,
    filter: 'blur(70px)',
  },
  blob2: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    bottom: -height * 0.1,
    right: -width * 0.3,
    filter: 'blur(80px)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: SPACING.xxl,
    borderRadius: 30,
    overflow: 'hidden',
  },
  logoBlur: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderWidth: 1,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 48,
    letterSpacing: -1,
  },
  taglineContainer: {
    marginBottom: height * 0.15,
  },
  tagline: {
    fontFamily: FONTS.primary.regular,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: SPACING.xl,
    position: 'absolute',
    bottom: height * 0.1,
  },
  button: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  buttonGradient: {
    borderRadius: 35,
    borderWidth: 1,
  },
  buttonBlur: {
    paddingVertical: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 18,
    letterSpacing: 1,
  },
});
