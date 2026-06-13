import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getProducts } from '../api/api';

const TABS = ['Protein', 'Carbs', 'Price'];

// Strips units and $ signs and returns a number
function parse(str) {
  return parseFloat(String(str ?? '').replace(/[^0-9.]/g, '') || '0');
}

// Maps a raw backend product to the display shape used by the cards
function mapDbProduct(p) {
  const n = p.nutrition || {};
  return {
    id:       p._id,
    name:     p.name || 'Unknown product',
    store:    (n.protein || 0) >= (n.carbs || 0) ? 'Protein' : 'Carbs',
    price:    `$${(p.price || 0).toFixed(2)}`,
    protein:  `${n.protein || 0}g`,
    carbs:    `${n.carbs || 0}g`,
    fats:     `${n.fat || 0}g`,
    calories: `${n.calories || 0} kcal`,
    category: (n.protein || 0) >= (n.carbs || 0) ? 'Protein' : 'Carbs',
  };
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

      {onSelect && (
        <View style={styles.selectHint}>
          <Text style={styles.selectHintText}>Tap to select</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ComparisonScreen({ navigation, route }) {
  const [activeTab, setActiveTab]       = useState('Protein');
  const [allProducts, setAllProducts]   = useState([]);
  const [compareWith, setCompareWith]   = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading]           = useState(true);

  // The product we came from (scanned product), already in display shape
  const scannedProduct = route.params?.product || {
    id: 'scanned',
    name: 'Scanned product',
    store: '',
    price: '$0.00',
    protein: '0g',
    carbs: '0g',
    fats: '0g',
    calories: '0 kcal',
    category: 'Other',
  };

  // Load real products to choose from
  useEffect(() => {
    (async () => {
      try {
        const res  = await getProducts();
        const list = (res.data || [])
          .map(mapDbProduct)
          // don't offer the scanned product as its own comparison
          .filter((p) => String(p.id) !== String(scannedProduct.id));
        setAllProducts(list);
      } catch (_) {
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const products     = compareWith ? [scannedProduct, compareWith] : [scannedProduct];
  const winnerIndex  = compareWith ? getWinnerIndex(products[0], products[1], activeTab) : 0;

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

        {/* Comparison tabs — only meaningful once a second product is chosen */}
        {compareWith && (
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
        )}

        {/* Scanned product card */}
        <ProductCard
          product={scannedProduct}
          isBest={compareWith ? winnerIndex === 0 : false}
          activeTab={activeTab}
          onSelect={compareWith ? () => navigation.navigate('SelectBestProduct', { product: scannedProduct }) : null}
        />

        {/* Second product: either the chosen one, or a "choose" prompt */}
        {compareWith ? (
          <ProductCard
            product={compareWith}
            isBest={winnerIndex === 1}
            activeTab={activeTab}
            onSelect={() => navigation.navigate('SelectBestProduct', { product: compareWith })}
          />
        ) : (
          <Pressable style={styles.choosePrompt} onPress={() => setPickerVisible(true)}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={styles.choosePromptText}>Choose a product to compare with</Text>
          </Pressable>
        )}

        {/* Change selection / hint */}
        {compareWith && (
          <>
            <Pressable style={styles.changeButton} onPress={() => setPickerVisible(true)}>
              <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
              <Text style={styles.changeButtonText}>Compare with a different product</Text>
            </Pressable>

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

            <Pressable
              style={styles.selectButton}
              onPress={() =>
                navigation.navigate('SelectBestProduct', { product: products[winnerIndex] })
              }
            >
              <Text style={styles.selectButtonText}>
                Select {products[winnerIndex].name.split(' ').slice(0, 2).join(' ')}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Product picker modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choose a product</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
            ) : allProducts.length === 0 ? (
              <Text style={styles.pickerEmpty}>
                No other products to compare with yet. Scan a few products first.
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {allProducts.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCompareWith(p);
                      setPickerVisible(false);
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.pickerItemName}>{p.name}</Text>
                      <Text style={styles.pickerItemMeta}>
                        P {p.protein} · C {p.carbs} · F {p.fats}
                      </Text>
                    </View>
                    <Text style={styles.pickerItemPrice}>{p.price}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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

  // Choose prompt (when no second product yet)
  choosePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary + '12',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary + '50',
    borderStyle: 'dashed',
    paddingVertical: 26,
    marginBottom: 14,
  },
  choosePromptText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  // Change selection button
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 20,
  },
  changeButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
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

  // Picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  pickerEmpty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 30,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  pickerItemName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  pickerItemMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  pickerItemPrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
