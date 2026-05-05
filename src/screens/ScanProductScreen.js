import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MOCK_RECENT_SCANS } from '../data/mockData';

const recentScans = MOCK_RECENT_SCANS;

export default function ScanProductScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  const openAnalysis = (product) => {
    navigation.navigate('ProductAnalysis', { product });
  };

  const handleSimulateScan = () => {
    // Simulate a scan using the chicken breast product
    openAnalysis(recentScans[0].product);
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

        {/* Viewfinder */}
        <View style={styles.viewfinderWrapper}>
          <View style={styles.viewfinder}>
            {/* Green corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scan line */}
            <View style={styles.scanLine} />

            <Text style={styles.viewfinderHint}>Position barcode in frame</Text>
          </View>
        </View>

        {/* Flash / Scan / Gallery buttons */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              Alert.alert(
                'Flash',
                'Flash control will be available with real camera integration.'
              )
            }
          >
            <View style={styles.actionCircle}>
              <Ionicons name="flash-outline" size={22} color={colors.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>Flash</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleSimulateScan}>
            <View style={[styles.actionCircle, styles.actionCircleActive]}>
              <Ionicons name="scan" size={26} color={colors.textOnPrimary} />
            </View>
            <Text style={[styles.actionLabel, styles.actionLabelActive]}>Scan</Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              Alert.alert(
                'Gallery',
                'Picking from gallery will be available with real camera integration.'
              )
            }
          >
            <View style={styles.actionCircle}>
              <Ionicons name="image-outline" size={22} color={colors.textPrimary} />
            </View>
            <Text style={styles.actionLabel}>Gallery</Text>
          </Pressable>
        </View>

        {/* Manual search */}
        <Text style={styles.orLabel}>OR SEARCH MANUALLY</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product name..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Recently scanned */}
        <Text style={styles.sectionLabel}>RECENTLY SCANNED</Text>
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
    height: 210,
    backgroundColor: '#0a0f0c',
    borderRadius: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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
    position: 'absolute',
    bottom: 14,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '500',
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
