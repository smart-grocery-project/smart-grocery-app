import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const sampleProduct = {
  id: 'scan-1',
  name: 'Chicken breast',
  price: '$8.99',
  protein: '31g',
  carbs: '0g',
  fats: '3.6g',
  calories: '165 kcal',
  expiryDate: 'May 4, 2026',
  category: 'Protein',
  recommendation:
    'A strong high-protein option for meal prep and balanced lunches this week.',
  statuses: ['Good choice', 'High protein', 'Within budget', 'Expiring soon'],
};

const scanActions = [
  { title: 'Camera', subtitle: 'Simulate scanning with your camera' },
  { title: 'Gallery', subtitle: 'Choose a saved product image' },
  { title: 'Manual Entry', subtitle: 'Type product details yourself' },
];

const recentScans = [
  {
    id: '1',
    name: 'Chicken breast',
    subtitle: 'Protein - Last scan 2 min ago',
    product: sampleProduct,
  },
  {
    id: '2',
    name: 'Greek yogurt',
    subtitle: 'Dairy - Suggested for breakfast',
    product: {
      name: 'Greek yogurt',
      price: '$4.20',
      protein: '10g',
      carbs: '6g',
      fats: '4g',
      calories: '120 kcal',
      expiryDate: 'May 6, 2026',
      category: 'Dairy',
      recommendation: 'A balanced snack choice with good protein for breakfast or post-workout.',
      statuses: ['Good choice', 'High protein', 'Within budget'],
    },
  },
  {
    id: '3',
    name: 'Brown rice',
    subtitle: 'Carbs - Pantry restock idea',
    product: {
      name: 'Brown rice',
      price: '$3.80',
      protein: '5g',
      carbs: '45g',
      fats: '1.8g',
      calories: '216 kcal',
      expiryDate: 'Sep 12, 2026',
      category: 'Carbs',
      recommendation: 'A reliable pantry staple that fits meal prep and budget-conscious shopping.',
      statuses: ['Good choice', 'Within budget'],
    },
  },
];

export default function ScanProductScreen({ navigation }) {
  const openAnalysis = (product = sampleProduct) => {
    navigation.navigate('ProductAnalysis', { product });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Smart Grocery</Text>
          <Text style={styles.title}>Scan Product</Text>
          <Text style={styles.subtitle}>Scan barcode or product details quickly.</Text>
        </View>

        <View style={styles.scanCard}>
          <View style={styles.scanFrame}>
            <View style={styles.scanInner}>
              <Text style={styles.scanIcon}>[]</Text>
              <Text style={styles.scanTitle}>Scanner Placeholder</Text>
              <Text style={styles.scanText}>
                Camera and barcode tools can be connected later. For now, tap any option below to
                simulate a scan.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          {scanActions.map((action) => (
            <Pressable
              key={action.title}
              style={styles.actionCard}
              onPress={() => openAnalysis()}
            >
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.helperText}>
          This screen is currently a frontend placeholder. It simulates a scan flow using sample
          product data only.
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent scans</Text>
          <Text style={styles.sectionNote}>Tap any item to view analysis</Text>
        </View>

        {recentScans.map((item) => (
          <Pressable
            key={item.id}
            style={styles.recentCard}
            onPress={() => openAnalysis(item.product)}
          >
            <View>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.recentSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.recentArrow}>{'>'}</Text>
          </Pressable>
        ))}
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
    paddingVertical: 24,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.badge,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.surface,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.92,
  },
  scanCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  scanFrame: {
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: 18,
  },
  scanInner: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanIcon: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  scanTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  scanText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actionRow: {
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionNote: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recentName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  recentSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  recentArrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '500',
  },
});
