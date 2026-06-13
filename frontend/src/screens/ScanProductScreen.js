import React, { useState, useRef } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { scanBarcodeImage, lookupBarcode, addHistoryItem, createHistory, getHistory } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// Maps backend product to the format ProductAnalysisScreen expects
function mapProduct(p) {
  const n = p.nutrition || {};
  const category = (n.protein || 0) >= (n.carbs || 0) ? 'Protein' : 'Carbs';
  return {
    id:         p._id,
    name:       p.name || 'Scanned product',
    store:      p.store || 'Unknown store',
    price:      `$${(p.price || 0).toFixed(2)}`,
    protein:    `${n.protein || 0}g`,
    carbs:      `${n.carbs || 0}g`,
    fats:       `${n.fat || 0}g`,
    calories:   `${n.calories || 0} kcal`,
    category,
    quantity:   '1 unit',
    expiryDate: 'TBD',
    recommendation: 'Scanned successfully — review nutrition before adding.',
    statuses:   ['Scanned'],
  };
}

export default function ScanProductScreen({ navigation }) {
  const [scanning, setScanning]       = useState(false);
  const [scanned, setScanned]         = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const [permission, requestPermission] = useCameraPermissions();

  // Synchronous lock to prevent multiple callbacks firing before state updates
  const scanLockRef = useRef(false);

  // Reset scan lock + refresh recent scans whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      scanLockRef.current = false;
      setScanned(false);
      loadRecentScans();
    }, [])
  );

  // Build the "Recently scanned" list from real scan history
  const loadRecentScans = async () => {
    try {
      const res   = await getHistory();
      const items = res.data?.items || [];
      const recent = items
        .filter((h) => h.product)          // skip entries with missing products
        .slice(-5)                         // last 5 scans
        .reverse()                         // most recent first
        .map((h) => {
          const product = mapProduct(h.product);
          return {
            id:       h._id,
            name:     product.name,
            subtitle: `${product.category} · ${product.calories}`,
            product,
          };
        });
      setRecentScans(recent);
    } catch (_) {
      // No history yet or request failed — show nothing
      setRecentScans([]);
    }
  };

  // Records a scan in the user's history (creates history if needed)
  const recordToHistory = async (productId) => {
    if (!productId || String(productId).startsWith('p')) return;
    try {
      await addHistoryItem(productId);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          await createHistory();
          await addHistoryItem(productId);
        } catch (_) {}
      }
    }
  };

  const openAnalysis = (product) => {
    recordToHistory(product.id);
    navigation.navigate('ProductAnalysis', { product });
  };

  // Called automatically when the live camera detects a barcode
  const handleBarcodeScanned = async ({ data }) => {
    // Synchronous guard — blocks duplicate fires from the camera
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    setScanned(true);
    setScanning(true);
    try {
      const response = await lookupBarcode(data);
      openAnalysis(mapProduct(response.data));
    } catch (error) {
      const message = error.response?.data?.message ||
        'Could not find this product. Try again.';
      Alert.alert('Scan failed', message, [
        {
          text: 'OK',
          onPress: () => {
            scanLockRef.current = false;
            setScanned(false);
          },
        },
      ]);
    } finally {
      setScanning(false);
    }
  };

  // Uploads an image to the backend scanner and opens the analysis screen
  const uploadAndScan = async (asset) => {
    setScanning(true);

    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const formData = new FormData();

      formData.append('image', blob, 'scan.jpg');

      const result = await scanBarcodeImage(formData);

      openAnalysis(mapProduct(result.data));
    } catch (error) {
      console.log(error);
      Alert.alert('Scan failed', 'Web upload failed');
    } finally {
      setScanning(false);
    }
  };

  // Picks an image from the gallery and uploads it (fallback when live scan fails)
  const handleGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Gallery access', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      uploadAndScan(result.assets[0]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Scan product</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Live camera viewfinder */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            {permission?.granted ? (
              <CameraView
                style={styles.cameraView}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              />
            ) : (
              <Pressable
                style={styles.permissionBox}
                onPress={requestPermission}
              >
                <Ionicons name="camera-outline" size={28} color={colors.primary} />
                <Text style={styles.permissionTitle}>Camera access needed</Text>
                <Text style={styles.permissionSubtitle}>Tap to allow scanning</Text>
              </Pressable>
            )}

            {/* Green corner brackets overlay */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.scanHintOverlay}>
                <Text style={styles.viewfinderHint}>
                  {scanning ? 'Looking up product...' : 'Point at a barcode'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Photo upload fallback (for when live scanner can't read a barcode) */}
        <Pressable
          style={[styles.fallbackButton, scanning && { opacity: 0.6 }]}
          onPress={handleGallery}
          disabled={scanning}
        >
          <Ionicons name="image-outline" size={18} color={colors.primary} />
          <Text style={styles.fallbackButtonText}>
            Can't scan? Upload a photo of the barcode
          </Text>
        </Pressable>

        {/* Recently scanned */}
        <Text style={styles.sectionLabel}>RECENTLY SCANNED</Text>
        {recentScans.length > 0 ? (
          <View style={styles.recentList}>
            {recentScans.map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  styles.recentCard,
                  index < recentScans.length - 1 && styles.recentCardBorder,
                ]}
                onPress={() => openAnalysis(item.product)}
              >
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{item.name}</Text>
                  <Text style={styles.recentMacros}>{item.subtitle}</Text>
                </View>
                <Text style={styles.recentPrice}>{item.product.price}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.recentEmpty}>
            <Text style={styles.recentEmptyText}>
              No scans yet — scan a product to see it here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 38,
  },

  // Viewfinder
  viewfinderWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  viewfinder: {
    height: 260,
    backgroundColor: '#0a0f0c',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraView: {
    ...StyleSheet.absoluteFillObject,
  },
  permissionBox: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 20,
  },
  permissionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  permissionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  scanHintOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
  },
  cornerTL: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    width: '60%',
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.7,
    borderRadius: 999,
  },
  viewfinderHint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },

  // Photo upload fallback
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '12',
    marginBottom: 28,
  },
  fallbackButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Flash / Scan / Gallery
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 28,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionLabelActive: {
    color: colors.primary,
  },

  // Manual search
  orLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.textPrimary,
  },

  // Recently scanned
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  recentList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recentEmpty: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    alignItems: 'center',
  },
  recentEmptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recentCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentInfo: {
    flex: 1,
    paddingRight: 12,
  },
  recentName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  recentMacros: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  recentPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
