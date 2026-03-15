import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../constants/theme';

const { height } = Dimensions.get('window');

interface GoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  tempGoal: number;
  setTempGoal: (goal: number) => void;
  onSaveGoal: () => void;
  colors: any;
  isDark: boolean;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isVisible,
  onClose,
  tempGoal,
  setTempGoal,
  onSaveGoal,
  colors,
  isDark
}) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Animated.View entering={SlideInUp} style={styles.goalSheet}>
          <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={styles.sheetBlur}>
            <View style={[styles.sheetIndicator, { backgroundColor: colors.surfaceMedium }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Okuma Hedefini Ayarla</Text>

            <View style={styles.goalPickerContainer}>
              <TouchableOpacity
                onPress={() => { setTempGoal(Math.max(5, tempGoal - 5)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.goalStepButton, { backgroundColor: colors.surfaceLight }]}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.goalValueBox}>
                <Text style={[styles.goalValueText, { color: colors.text }]}>{tempGoal}</Text>
                <Text style={[styles.goalUnitText, { color: colors.textMuted }]}>dakika</Text>
              </View>

              <TouchableOpacity
                onPress={() => { setTempGoal(Math.min(300, tempGoal + 5)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.goalStepButton, { backgroundColor: colors.surfaceLight }]}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.presetsRow}>
              {[30, 60, 120].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => { setTempGoal(preset); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                  style={[
                    styles.presetChip,
                    { backgroundColor: tempGoal === preset ? colors.primary : colors.surfaceLight }
                  ]}
                >
                  <Text style={[
                    styles.presetChipText,
                    { color: tempGoal === preset ? '#FFF' : colors.text }
                  ]}>
                    {preset >= 60 ? `${preset / 60} Saat` : `${preset} dk`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveGoalButton} onPress={onSaveGoal}>
              <LinearGradient
                colors={[colors.primary, '#8a2be2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGoalGradient}
              >
                <Text style={styles.saveGoalText}>Hedefi Güncelle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  goalSheet: {
    width: '100%',
    height: height * 0.5,
    overflow: 'hidden',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sheetBlur: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
    alignItems: 'center',
  },
  sheetIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: SPACING.l,
  },
  sheetTitle: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: SPACING.xl,
  },
  goalPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  goalValueBox: {
    alignItems: 'center',
    marginHorizontal: 30,
    minWidth: 100,
  },
  goalValueText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 60,
  },
  goalUnitText: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    marginTop: -5,
  },
  goalStepButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  presetChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
  },
  presetChipText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
  },
  saveGoalButton: {
    width: '100%',
    borderRadius: 35,
    overflow: 'hidden',
  },
  saveGoalGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveGoalText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
