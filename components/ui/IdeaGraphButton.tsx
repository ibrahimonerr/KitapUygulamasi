import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import IdeaGraph from '../profile/IdeaGraph';

const { width, height } = Dimensions.get('window');

const FloatingBlob = ({ color, size, delay, initialPos }: any) => {
  const tx = useSharedValue(initialPos.x);
  const ty = useSharedValue(initialPos.y);

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(
        withTiming(initialPos.x + 50, { duration: 10000 + delay }),
        withTiming(initialPos.x - 50, { duration: 10000 + delay })
      ),
      -1,
      true
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(initialPos.y + 50, { duration: 8000 + delay }),
        withTiming(initialPos.y - 50, { duration: 8000 + delay })
      ),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.1,
    // Blur is handled via native styles if possible or just opacity
  }));

  return <Animated.View style={style} />;
};

export default function IdeaGraphButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const toggleModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVisible(!isVisible);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedButtonStyle}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => { scale.value = withTiming(0.97); }}
          onPressOut={() => { scale.value = withTiming(1); }}
          onPress={toggleModal}
          style={styles.buttonWrapper}
        >
          <BlurView intensity={isDark ? 20 : 40} tint={isDark ? 'dark' : 'light'} style={styles.blurButton}>
            <View style={[styles.iconContainer, { backgroundColor: colors.highlight }]}>
              <Ionicons name="git-network-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Zihin Haritamı Aç</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Fikirlerinin bağlantı atlası</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          {/* Background is handled by BlurView and Blobs */}
          <BlurView 
            intensity={isDark ? 60 : 80} 
            tint={isDark ? 'dark' : 'extraLight'} 
            style={StyleSheet.absoluteFill} 
          />
          
          <FloatingBlob color="#FFD700" size={300} delay={0} initialPos={{ x: -100, y: 100 }} />
          <FloatingBlob color={colors.primary} size={400} delay={2000} initialPos={{ x: width - 200, y: height - 300 }} />
          <FloatingBlob color="#FF00FF" size={250} delay={4000} initialPos={{ x: width / 2, y: height / 2 }} />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Zihin Haritası</Text>
                  <Text style={[styles.modalSub, { color: colors.textMuted }]}>Entelektüel ayak izlerin</Text>
                </View>
                <TouchableOpacity 
                  onPress={toggleModal}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceMedium }]}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.graphContainer}>
                <IdeaGraph />
              </View>

              <View style={styles.footer}>
                <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.footerBlur}>
                  <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    Balonlara dokunarak o fikri oluşturan derin bağları keşfet.
                  </Text>
                </BlurView>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.m,
  },
  buttonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  blurButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 28,
  },
  modalSub: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphContainer: {
    flex: 1,
  },
  footer: {
    padding: SPACING.xl,
    marginBottom: Platform.OS === 'ios' ? 0 : SPACING.l,
  },
  footerBlur: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
});
