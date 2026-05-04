import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Static budget remaining — will come from global state / backend later
const WEEKLY_BUDGET_REMAINING = 42.5;

const fallbackProduct = {
  name: 'Chicken breast',
  price: '$5.99',
  protein: '31g',
  carbs: '0g',
  fats: '3.6g',
  calories: '165 kcal',
  expiryDate: 'May 24, 2026',
  category: 'Protein',
  recommendation:
    'Great match for your protein goal — fits your $80 budget.',
  statuses: ['Good choice', 'High protein', 'Within budget'],
};

// Returns a quality label + color based on nutrient type and amount
function getNutritionQuality(label, valueStr) {
  const num = parseFloat(valueStr) || 0;

  if (label === 'Protein') {
    if (num >= 20) return { label: 'High',   color: '#4a9eff' };
    if (num >= 10) return { label: 'Medium', color: '#f5a623' };
    return               { label: 'Low',    color: colors.textSecondary };
  }
  if (label === 'Carbs') {
    if (num === 0) return { label: 'None', color: colors.textSecondary };
    if (num <= 20) return { label: 'Low',  color: '#2ecc71' };
    return               { label: 'High', color: '#ff6b6b' };
  }
  if (label === 'Fats') {
    if (num < 5)  return { label: 'Low',    color: '#2ecc71' };
    if (num < 15) return { label: 'Medium', color: '#f5a623' };
    return               { label: 'High',   color: '#ff6b6b' };
  }
  return { label: '', color: colors.textSecondary };
}

export default function ProductAnalysisScreen({ navigation, route }) {
  const product = route.params?.product || fallbackProduct;

  const productPrice = parseFloat(product.price?.replace('$', '') || '0');
  const afterPurchase = WEEKLY_BUDGET_REMAINING - productPrice;

  const nutritionMetrics = [
    { label: 'Protein', value: product.protein },
    { label: 'Carbs',   value: product.carbs },
    { label: 'Fats',    value: product.fats },
  ];

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
          <Text style={styles.headerTitle}>Product analysis</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>

        {/* Recommendation banner */}
        <View style={styles.recommendBanner}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={colors.primary}
            style={styles.recommendIcon}
          />
          <Text style={styles.recommendText}>{product.recommendation}</Text>
        </View>

        {/* Nutrition per 100g */}
        <Text style={styles.sectionLabel}>NUTRITION PER 100G</Text>
        <View style={styles.nutritionRow}>
          {nutritionMetrics.map((metric) => {
            const quality = getNutritionQuality(metric.label, metric.value);
            return (
              <View key={metric.label} style={styles.metricCard}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <View
                  style={[
                    styles.qualityBadge,
                    { backgroundColor: quality.color + '28' },
                  ]}
                >
                  <Text style={[styles.qualityText, { color: quality.color }]}>
                    {quality.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Budget impact */}
        <Text style={styles.sectionLabel}>BUDGET IMPACT</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Remaining budget</Text>
            <Text style={styles.infoValue}>
              ${WEEKLY_BUDGET_REMAINING.toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>This product</Text>
            <Text style={styles.deductValue}>−{product.price}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>After purchase</Text>
            <Text
              style={[
                styles.infoValue,
                afterPurchase < 10 && styles.infoValueLow,
              ]}
            >
              ${afterPurchase.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Details */}
        <Text style={styles.sectionLabel}>DETAILS</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Calories</Text>
            <Text style={styles.infoValue}>{product.calories}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{product.category}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiry date</Text>
            <Text style={styles.infoValue}>{product.expiryDate}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.compareButton}
            onPress={() => navigation.navigate('Comparison', { product })}
          >
            <Text style={styles.compareButtonText}>Compare</Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate('InventoryTab')}
          >
            <Text style={styles.addButtonText}>Add to inventory</Text>
          </Pressable>
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

  // Hero card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 5,
  },
  productCategory: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  productPrice: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },

  // Recommendation banner
  recommendBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  recommendIcon: {
    marginTop: 1,
  },
  recommendText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  // Section label
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Nutrition metrics
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  qualityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Info card (budget impact + details)
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
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
  infoValueLow: {
    color: '#ff6b6b',
  },
  deductValue: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '700',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compareButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  compareButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  addButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
