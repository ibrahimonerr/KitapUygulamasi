import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Dimensions, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FONTS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface ISBNSyncProps {
  isVisible: boolean;
  onClose: () => void;
  onBookFound: (bookData: any) => void;
  colors: any;
  isDark: boolean;
}

export const ISBNSync: React.FC<ISBNSyncProps> = ({
  isVisible,
  onClose,
  onBookFound,
  colors,
  isDark
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && !permission?.granted) {
      requestPermission();
    }
  }, [isVisible]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Fetch from Google Books API
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${data}`);
      const json = await response.json();

      if (json.totalItems > 0) {
        const book = json.items[0].volumeInfo;
        const processedBook = {
          id: data,
          title: book.title,
          author: book.authors ? book.authors[0] : 'Unknown Author',
          cover: book.imageLinks ? book.imageLinks.thumbnail.replace('http:', 'https:') : 'https://images.unsplash.com/photo-1543004086-c28c4779d20c?q=80&w=1000&auto=format&fit=crop',
          pages: book.pageCount || 0,
          description: book.description || '',
          progress: 0,
          notes: [],
          quotes: []
        };
        onBookFound(processedBook);
        onClose();
      } else {
        alert("Kitap bulunamadı. Lütfen tekrar deneyin veya manuel ekleyin.");
        setScanned(false);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
      setScanned(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.container}>
        {!permission?.granted ? (
          <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="camera-outline" size={64} color={colors.primary} />
            <Text style={[styles.permissionText, { color: colors.text }]}>Kameraya erişim izni gerekiyor</Text>
            <TouchableOpacity 
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>İzin Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
              <Text style={{ color: colors.textMuted }}>İptal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "upc_a"],
            }}
          >
            <View style={styles.overlay}>
              <BlurView intensity={20} tint="dark" style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Barkod Tara</Text>
                <View style={{ width: 28 }} />
              </BlurView>

              <View style={styles.scannerWrapper}>
                <View style={[styles.scannerFrame, { borderColor: colors.primary }]}>
                  <View style={styles.scanLine} />
                </View>
                <Text style={styles.helperText}>Kitap barkodunu çerçevenin içine hizala</Text>
              </View>

              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <BlurView intensity={80} tint="dark" style={styles.loadingCard}>
                    <Text style={styles.loadingText}>Kitap Aranıyor...</Text>
                  </BlurView>
                </View>
              )}
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionText: {
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: SPACING.l,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  scannerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.4,
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#FF3B30',
    position: 'absolute',
    top: '50%',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  helperText: {
    color: '#FFF',
    fontFamily: FONTS.primary.semiBold,
    fontSize: 14,
    marginTop: 24,
    opacity: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingCard: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  loadingText: {
    color: '#FFF',
    fontFamily: FONTS.primary.bold,
    fontSize: 16,
  },
});
