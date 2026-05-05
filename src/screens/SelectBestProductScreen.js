import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MOCK_BUDGET } from '../data/mockData';

const WEEKLY_BUDGET_REMAINING = MOCK_BUDGET.remaining;

// Strips units / $ and returns a number
function parse(str) {
  return parseFloat(str?.replace(/[^0-9.]/g, '') || '0');
}

// Generates a short AI-style recommendation sentence for the product
function buildRecommendation(product) {
  const protein = parse(product.protein);
  const price   = parse(product.price);

  if (protein >= 20) {
    return `${product.name} is your best choice — highest protein at lowest cost.`;
  }
  if (price < 3) {
    return `${product.name} is your best choice — great value well within your budget.`;
  }
  return `${product.name} is your best choice — the top match for your current goals.`;
}

// Generates "Why this product?" bullet points from the product's data
function buildReasons(product) {
  const reasons = [];
  const protein  = parse(product.protein);
  const price    = parse(product.price);
  const budgetOk = price <= WEEKLY_BUDGET_REMAINING;

  if (protein >= 20) reasons.push('Highest protein per dollar');
  if (protein >= 10) reasons.push('Supports your protein-rich goal');
  if (budgetOk)      reasons.push(`Fits your weekly $80 budget`);
  if (price < 6)     reasons.push('Best price among compared products');
  if (reasons.length < 3) reasons.push('Matches your current nutrition targets');

  return reasons.slice(0, 4);
}

// Compute a simple score out of 10 based on protein-per-dollar
function computeScore(product) {
  const protein = parse(product.protein);
  const price   = parse(product.price) || 1;
  const ratio   = protein / price; // g of protein per $
  // Normalise: ~18 ratio = 10/10, clamp between 1 and 10
  return Math.min(10, Math.max(1, Math.round(ratio / 2)));
}

export default function SelectBestProductScreen({ navigation, route }) {
  const product = route.params?.product || {
    name: 'Chicken breast 500g',
    store: 'FreshFarm',
    price: '$5.99',
    protein: '110g',
    carbs: '0g',
    fats: '6g',
    calories: '165 kcal',
    expiryDate: 'May 24, 2026',
    category: 'Protein',
    recommendation: 'Highest protein per dollar — fits your weekly $80 budget.',
    statuses: ['Good choice', 'High protein', 'Within budget'],
  };

  const productPrice  = parse(product.price);
  const budgetAfter   = WEEKLY_BUDGET_REMAINING - productPrice;
  const score         = computeScore(product);
  const reasons       = buildReasons(product);
  const aiText        = buildRecommendation(product);

  const macros = [
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
          <Text style={styles.headerTitle}>Select best product</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* AI recommendation banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiIconBox}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <View style={styles.aiTextBox}>
            <Text style={styles.aiLabel}>AI recommendation</Text>
            <Text style={styles.aiText}>{aiText}</Text>
          </View>
        </View>

        {/* Final selection label */}
        <Text style={styles.sectionLabel}>FINAL SELECTION</Text>

        {/* Product card */}
        <View style={styles.productCard}>
          {/* Best choice badge */}
          <View style={styles.bestBadge}>
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            <Text style={styles.bestBadgeText}>Best choice</Text>
          </View>

          {/* Name + price row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardName}>{product.name}</Text>
              <Text style={styles.cardStore}>{product.store || product.category}</Text>
            </View>
            <Text style={styles.cardPrice}>{product.price}</Text>
          </View>

          {/* Macro boxes */}
          <View style={styles.macrosRow}>
            {macros.map((macro) => (
              <View key={macro.label} style={styles.macroBox}>
                <Text style={styles.macroValue}>{macro.value}</Text>
                <Text style={styles.macroLabel}>{macro.label}</Text>
              </View>
            ))}
          </View>

          {/* Budget left + score */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Budget left</Text>
              <Text
                style={[
                  styles.footerValue,
                  budgetAfter < 10 && styles.footerValueLow,
                ]}
              >
                ${budgetAfter.toFixed(2)}
              </Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Score</Text>
              <Text style={styles.footerValue}>{score}/10</Text>
            </View>
          </View>
        </View>

        {/* Why this product */}
        <Text style={styles.sectionLabel}>WHY THIS PRODUCT?</Text>
        <View style={styles.reasonsCard}>
          {reasons.map((reason, index) => (
            <View key={index} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackText}>Go back</Text>
          </Pressable>

          <Pressable
            style={styles.confirmButton}
            onPress={() =>
              Alert.alert(
                '✓ Added to Inventory',
                `${product.name} has been added to your inventory.`,
                [
                  {
                    text: 'View Inventory',
                    onPress: () => navigation.navigate('InventoryTab'),
                  },
                ]
              )
            }
          >
            <Text style={styles.confirmText}>Confirm & add</Text>
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

  // AI banner
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '18',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary + '28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextBox: {
    flex: 1,
  },
  aiLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },

  // Section label
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Product card
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 16,
    marginBottom: 24,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '22',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  bestBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardStore: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },

  // Macros
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  macroBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  macroValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  macroLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Card footer
  cardFooter: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  footerItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
  },
  footerDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  footerLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  footerValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  footerValueLow: {
    color: '#ff6b6b',
  },

  // Reasons
  reasonsCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
    marginBottom: 28,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reasonDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  reasonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goBackButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  goBackText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
