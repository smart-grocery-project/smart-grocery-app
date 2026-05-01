import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const fallbackProduct = {
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

export default function ProductAnalysisScreen({ navigation, route }) {
  const product = route.params?.product || fallbackProduct;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Smart Grocery</Text>
          <Text style={styles.title}>Product Analysis</Text>
          <Text style={styles.subtitle}>Frontend preview of a scanned product breakdown.</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{product.protein}</Text>
            <Text style={styles.metricLabel}>Protein</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{product.carbs}</Text>
            <Text style={styles.metricLabel}>Carbs</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{product.fats}</Text>
            <Text style={styles.metricLabel}>Fats</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{product.calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiry date</Text>
            <Text style={styles.infoValue}>{product.expiryDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Text style={styles.recommendationText}>{product.recommendation}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {product.statuses.map((status) => (
              <View key={status} style={styles.statusChip}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Inventory')}>
          <Text style={styles.primaryButtonText}>Add to Inventory</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            Alert.alert(
              'Compare Product',
              'This is a frontend placeholder. You can connect real comparison logic later.'
            )
          }
        >
          <Text style={styles.secondaryButtonText}>Compare Product</Text>
        </Pressable>

        <Pressable style={styles.textButton} onPress={() => navigation.navigate('ScanProduct')}>
          <Text style={styles.textButtonText}>Back to Scan</Text>
        </Pressable>
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  productCategory: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  productPrice: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  recommendationText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusChip: {
    backgroundColor: colors.secondary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  statusText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
