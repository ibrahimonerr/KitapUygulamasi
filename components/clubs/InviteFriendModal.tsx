import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  TouchableOpacity, 
  TextInput, 
  Dimensions,
  FlatList,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FONTS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Mock friends data
const FRIENDS = [
  { id: '1', name: 'Zeynep Kaya', avatar: 'https://i.pravatar.cc/150?u=zeynep' },
  { id: '2', name: 'Can Demir', avatar: 'https://i.pravatar.cc/150?u=can' },
  { id: '3', name: 'Elif Yılmaz', avatar: 'https://i.pravatar.cc/150?u=elif' },
  { id: '4', name: 'Mert Akın', avatar: 'https://i.pravatar.cc/150?u=mert' },
  { id: '5', name: 'Selin Şahin', avatar: 'https://i.pravatar.cc/150?u=selin' },
];

interface InviteFriendModalProps {
  isVisible: boolean;
  onClose: () => void;
  clubName: string;
  colors: any;
  isDark: boolean;
}

export const InviteFriendModal: React.FC<InviteFriendModalProps> = ({
  isVisible,
  onClose,
  clubName,
  colors,
  isDark
}) => {
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleInvite = (id: string) => {
    if (!invitedIds.includes(id)) {
      setInvitedIds([...invitedIds, id]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `${clubName} okuma kulübüne katılmanı bekliyorum! Antigravity üzerinden katılabilirsin: https://antigravity.app/join/club123`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredFriends = FRIENDS.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <Animated.View 
          entering={FadeInDown.duration(400)} 
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.blurContent}>
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Arkadaş Davet Et</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>{clubName} kulübüne yeni üyeler ekle.</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                placeholder="Arkadaş ara..."
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity 
              style={[styles.shareLinkBtn, { borderColor: colors.primary }]}
              onPress={handleShareLink}
            >
              <Ionicons name="link-outline" size={20} color={colors.primary} />
              <Text style={[styles.shareLinkText, { color: colors.primary }]}>Davet Linkini Paylaş</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Arkadaşlar</Text>

            <FlatList
              data={filteredFriends}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInRight.delay(index * 100).duration(400)} style={styles.friendItem}>
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <View style={styles.friendInfo}>
                    <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.inviteButton, 
                      { 
                        backgroundColor: invitedIds.includes(item.id) ? colors.surfaceMedium : colors.primary 
                      }
                    ]}
                    onPress={() => handleInvite(item.id)}
                    disabled={invitedIds.includes(item.id)}
                  >
                    <Text style={[
                      styles.inviteButtonText, 
                      { color: invitedIds.includes(item.id) ? colors.textMuted : '#FFF' }
                    ]}>
                      {invitedIds.includes(item.id) ? 'Davet Edildi' : 'Davet Et'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
              ListEmptyComponent={() => (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Arkadaş bulunamadı.</Text>
              )}
              contentContainerStyle={styles.listContent}
            />
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '100%',
    height: height * 0.75,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
  },
  blurContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.l,
  },
  title: {
    fontFamily: FONTS.serif.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.primary.regular,
    fontSize: 14,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    marginBottom: SPACING.m,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: FONTS.primary.regular,
    fontSize: 16,
  },
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: SPACING.xl,
    gap: 8,
  },
  shareLinkText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.primary.bold,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.m,
  },
  listContent: {
    paddingBottom: 40,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    fontFamily: FONTS.primary.semiBold,
    fontSize: 16,
  },
  inviteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  inviteButtonText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: FONTS.primary.regular,
  }
});
