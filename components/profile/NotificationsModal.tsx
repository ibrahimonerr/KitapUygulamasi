import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, SPACING } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'badge' | 'club' | 'system' | 'mentor';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: keyof typeof Ionicons.prototype.props.name;
  color: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [];

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isVisible, onClose }: Props) {
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Bildirimler</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {notifications.map((notif, index) => (
              <Animated.View 
                key={notif.id}
                entering={FadeInDown.delay(index * 100)}
                style={[
                  styles.notifItem, 
                  { 
                    backgroundColor: notif.isRead 
                      ? 'transparent' 
                      : (isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 122, 255, 0.05)')
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.notifPressable} 
                  onPress={() => toggleRead(notif.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: notif.color + '20' }]}>
                    <Ionicons name={notif.icon as any} size={22} color={notif.color} />
                  </View>
                  
                  <View style={styles.notifBody}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                      <Text style={[styles.notifTime, { color: colors.textMuted }]}>{notif.time}</Text>
                    </View>
                    <Text style={[styles.notifMessage, { color: colors.textMuted }]} numberOfLines={2}>
                      {notif.message}
                    </Text>
                  </View>
                  
                  {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
              </Animated.View>
            ))}

            {notifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz bir bildirim yok.</Text>
              </View>
            )}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
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
    height: height * 0.85,
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
  title: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.m,
  },
  notifPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  notifItem: {
    flexDirection: 'row',
    padding: SPACING.l,
    borderRadius: 20,
    marginBottom: SPACING.s,
    alignItems: 'center',
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.m,
  },
  notifBody: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 15,
  },
  notifTime: {
    fontFamily: FONTS.primary.regular,
    fontSize: 12,
  },
  notifMessage: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
    marginTop: SPACING.m,
  }
});
