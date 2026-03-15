import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SPACING } from '../../constants/theme';

interface OptionsBubbleProps {
  isVisible: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onShowAnalysis: () => void;
  onShare: () => void;
  topPosition: number;
  rightPosition: number;
  colors: any;
  isDark: boolean;
}

export const OptionsBubble: React.FC<OptionsBubbleProps> = ({
  isVisible,
  onClose,
  onRefresh,
  onShowAnalysis,
  onShare,
  topPosition,
  rightPosition,
  colors,
  isDark
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <Pressable style={styles.modalBackdropTransparent} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[
            styles.bubbleMenu,
            {
              top: topPosition,
              right: rightPosition
            }
          ]}
        >
          <BlurView intensity={isDark ? 80 : 100} tint={isDark ? "dark" : "light"} style={styles.bubbleBlur}>
            <TouchableOpacity style={styles.bubbleItem} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.bubbleItemText, { color: colors.text }]}>Yenile</Text>
            </TouchableOpacity>

            <View style={[styles.bubbleDivider, { backgroundColor: colors.surfaceMedium }]} />

            <TouchableOpacity style={styles.bubbleItem} onPress={onShowAnalysis}>
              <Ionicons name="analytics-outline" size={18} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={[styles.bubbleItemText, { color: colors.text }]}>Analiz</Text>
            </TouchableOpacity>

            <View style={[styles.bubbleDivider, { backgroundColor: colors.surfaceMedium }]} />

            <TouchableOpacity style={styles.bubbleItem} onPress={() => { onShare(); onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              <Ionicons name="share-outline" size={18} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={[styles.bubbleItemText, { color: colors.text }]}>Paylaş</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdropTransparent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bubbleMenu: {
    position: 'absolute',
    width: 160,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  bubbleBlur: {
    padding: 6,
  },
  bubbleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bubbleDivider: {
    height: 1,
    width: '85%',
    alignSelf: 'center',
    opacity: 0.1,
  },
});
