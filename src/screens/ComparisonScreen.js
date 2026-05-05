import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MOCK_PRODUCTS } from '../data/mockData';

const TABS = ['Protein', 'Carbs', 'Price'];

// Comparison product pulled from shared mock data
const COMPARISON_PRODUCT = MOCK_PRODUCTS.turkeyBreast;

// Strips units and $ signs and returns a number
function parse(str) {
  return parseFloat(str?.replace(/[^0-9.]/g, '') || '0');
}

// Returns index (0 or 1) of the winning product for the active tab
function getWinnerIndex(p1, p2, tab) {
  if (tab === 'Protein') return parse(p1.protein) >= parse(p2.protein) ? 0 : 1;
  if (tab === 'Carbs')   return parse(p1.carbs)   <= parse(p2.carbs)   ? 0 : 1;
  if (tab === 'Price')   return parse(p1.price)   <= parse(p2.price)   ? 0 : 1;
  return 0;
}

function ProductCard({ product, isBest, activeTab, onSelect }) {
  const macros = [
    { label: 'Protein', value: product.protein },
    { label: 'Carbs',   value: product.carbs },
    { label: 'Fats',    value: product.fats },
  ];

  return (
    <Pressable style={[styles.productCard, isBest && styles.productCardBest]} onPress={onSelect}>
      {isBest && (
        <View style={styles.bestBadge}>
          <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
          <Text style={styles.bestBadgeText}>Best choice</Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardName}>{product.name}</Text>
          <Text style={styles.cardStore}>{product.store || product.category}</Text>
        </View>
        <Text style={[styles.cardPrice, isBest && styles.cardPriceBest]}>
          {product.price}
        </Text>
      </View>

      <View style={styles.macrosRow}>
        {macros.map((macro) => {
          const isActive = activeTab === macro.label;
          return (
            <View
              key={macro.label}
              style={[styles.macroBox, isActive && styles.macroBoxActive]}
            >
              <Text style={[styles.macroValue, isActive && styles.macroValueActive]}>
                {macro.value}
              </Text>
              <Text style={[styles.macroLabel, isActive && styles.macroLabelActive]}>
                {macro.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.selectHint}>
        <Text style={styles.selectHintText}>Tap to select</Text>
      </View>
    </Pressable>
  );
}

export default function ComparisonScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('Protein');

  // The product we came from (scanned product)
  const scannedProduct = route.params?.product || {
    name: 'Chicken breast 500g',
    store: 'FreshFarm',
    price: '$5.99',
    protein: '110g',
    carbs: '0g',
    fats: '6g',
    calories: '165 kcal',
    expiryDate: 'May 24, 2026',
    category: 'Protein',
    recommendation:
      'Highest protein per dollar — fits your weekly $80 budget.',
    statuses: ['Good choice', 'High protein', 'Within budget'],
  };

  const products = [scannedProduct, COMPARISON_PRODUCT];
  const winnerIndex = getWinnerIndex(products[0], products[1], activeTab);
  const winner = products[winnerIndex];

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
          <Text style={styles.headerTitle}>Product comparison</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Comparison tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Product cards */}
        {products.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            isBest={winnerIndex === index}
            activeTab={activeTab}
            onSelect={() => navigation.navigate('SelectBestProduct', { product })}
          />
        ))}

        {/* Winner hint */}
        <View style={styles.hintRow}>
          <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.hintText}>
            Winner based on{' '}
            <Text style={styles.hintBold}>
              {activeTab === 'Price' ? 'lowest price' : activeTab === 'Carbs' ? 'lowest carbs' : 'highest protein'}
            </Text>
            . Switch tabs to compare differently.
          </Text>
        </View>

        {/* Select button */}
        <Pressable
          style={styles.selectButton}
          onPress={() =>
            navigation.navigate('SelectBestProduct', { product: winner })
          }
        >
          <Text style={styles.selectButtonText}>
            Select {winner.name.split(' ').slice(0, 2).join(' ')}
          </Text>
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

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.textOnPrimary,
  },

  // Product card
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  productCardBest: {
    borderColor: colors.primary,
    borderWidth: 1.5,
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
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardStore: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardPrice: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  cardPriceBest: {
    color: colors.primary,
  },

  // Macros
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
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
  macroBoxActive: {
    backgroundColor: colors.primary + '18',
    borderColor: colors.primary + '60',
  },
  macroValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  macroValueActive: {
    color: colors.primary,
  },
  macroLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  macroLabelActive: {
    color: colors.primary,
    opacity: 0.8,
  },

  // Tap to select hint inside card
  selectHint: {
    marginTop: 12,
    alignItems: 'center',
  },
  selectHintText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Hint
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  hintText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  hintBold: {
    color: colors.textPrimary,
    fontWeight: '700',
  },

  // Select button
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
