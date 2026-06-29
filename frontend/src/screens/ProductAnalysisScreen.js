import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { colors } from '../theme/colors';
import { addInventoryItem, createInventory, getWeeklyPlan, getInventory, updateProduct } from '../api/api';

// Neutral default if the screen is somehow opened without a product
const fallbackProduct = {
  id: 'unknown',
  name: 'Product',
  store: '',
  price: '$0.00',
  protein: '0g',
  carbs: '0g',
  fats: '0g',
  calories: '0 kcal',
  category: 'Other',
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
  const initialProduct = route.params?.product || fallbackProduct;
  const [product, setProduct] = useState(initialProduct);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Real remaining budget = weekly budget - sum of all items in inventory
  const [remainingBudget, setRemainingBudget] = useState(0);

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const [planRes, invRes] = await Promise.all([
          getWeeklyPlan(),
          getInventory(),
        ]);
        const total = planRes.data?.weeklyBudget || 0;
        const items = invRes.data?.items || [];
        const spent = items.reduce(
          (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 1),
          0
        );
        setRemainingBudget(Math.max(0, total - spent));
      } catch (_) {
        // Keep default
      }
    };
    loadBudget();
  }, []);

  const productPrice  = parseFloat(product.price?.replace('$', '') || '0');
  const afterPurchase = remainingBudget - productPrice;

  const openPriceModal = () => {
    setPriceInput(productPrice ? String(productPrice) : '');
    setPriceModalVisible(true);
  };

  const savePrice = () => {
    const cleaned = priceInput.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned) || 0;
    setProduct({ ...product, price: `$${num.toFixed(2)}` });
    setPriceModalVisible(false);
  };

  const openNameModal = () => {
    setNameInput(product.name === 'Unknown Product' ? '' : product.name);
    setNameModalVisible(true);
  };

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setProduct({ ...product, name: trimmed });
    setNameModalVisible(false);
  };

  const [adding, setAdding] = useState(false);
  const [expiryModalVisible, setExpiryModalVisible] = useState(false);
  const [expiryDays, setExpiryDays] = useState('7');

  // Opens the expiry picker (after checking it's a real product)
  const openAddModal = () => {
    if (!product.id || String(product.id).startsWith('p')) {
      Alert.alert(
        'Demo product',
        'This is a sample product — scan a real barcode to add it to your inventory.'
      );
      return;
    }
    setExpiryDays('7');
    setExpiryModalVisible(true);
  };

  const handleAddToInventory = async () => {
    setExpiryModalVisible(false);
    // Convert the chosen days into an expiration date
    const days = parseInt(expiryDays) || 7;
    const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    setAdding(true);
    try {
      // First — persist any edits the user made to name or price
      try {
        await updateProduct(product.id, {
          name:  product.name,
          price: productPrice,
        });
      } catch (_) {
        // If update fails, continue anyway — the user can still add the item
      }

      // Then add it to the inventory with the chosen expiry
      try {
        await addInventoryItem(product.id, 1, expirationDate);
      } catch (error) {
        // Inventory doesn't exist yet — create it then retry
        if (error.response?.status === 404) {
          await createInventory();
          await addInventoryItem(product.id, 1, expirationDate);
        } else {
          throw error;
        }
      }
      Alert.alert('Added!', `${product.name} was added to your inventory.`, [
        { text: 'View inventory', onPress: () => navigation.navigate('InventoryTab') },
        { text: 'OK' },
      ]);
    } catch (error) {
      const message = error.response?.data?.message ||
        'Could not add item. Try again.';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

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
          <Pressable style={styles.heroLeft} onPress={openNameModal}>
            <View style={styles.nameRow}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Ionicons name="pencil" size={13} color={colors.primary} style={{ marginLeft: 6 }} />
            </View>
            <Text style={styles.productCategory}>{product.category}</Text>
          </Pressable>
          <Pressable style={styles.priceWrapper} onPress={openPriceModal}>
            <Text style={styles.productPrice}>{product.price}</Text>
            <Ionicons name="pencil" size={12} color={colors.primary} style={{ marginLeft: 4 }} />
          </Pressable>
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
              ${remainingBudget.toFixed(2)}
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
            style={[styles.addButton, adding && { opacity: 0.7 }]}
            onPress={openAddModal}
            disabled={adding}
          >
            <Text style={styles.addButtonText}>
              {adding ? 'Adding...' : 'Add to inventory'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Expiry picker modal */}
      <Modal
        visible={expiryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExpiryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>When does it expire?</Text>
            <Text style={styles.modalSubtitle}>
              Choose how long until this item expires.
            </Text>
            <View style={styles.presetRow}>
              {[
                { label: '1 week',   days: '7' },
                { label: '1 month',  days: '30' },
                { label: '6 months', days: '180' },
                { label: '1 year',   days: '365' },
              ].map((p) => (
                <Pressable
                  key={p.days}
                  style={[styles.presetChip, expiryDays === p.days && styles.presetChipActive]}
                  onPress={() => setExpiryDays(p.days)}
                >
                  <Text style={[styles.presetText, expiryDays === p.days && styles.presetTextActive]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.nameInput}
              value={expiryDays}
              onChangeText={(v) => setExpiryDays(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Or enter custom days"
              placeholderTextColor={colors.placeholder}
            />
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setExpiryModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleAddToInventory}
              >
                <Text style={styles.modalButtonSaveText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Name input modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit product name</Text>
            <Text style={styles.modalSubtitle}>
              Update the name if the database returned an incorrect or missing one.
            </Text>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Coca Cola 330ml"
              placeholderTextColor={colors.placeholder}
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveName}
              >
                <Text style={styles.modalButtonSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Price input modal */}
      <Modal
        visible={priceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter product price</Text>
            <Text style={styles.modalSubtitle}>
              Public databases don't track prices, so add it manually.
            </Text>
            <View style={styles.priceInputRow}>
              <Text style={styles.priceCurrency}>$</Text>
              <TextInput
                style={styles.priceInput}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                autoFocus
              />
            </View>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setPriceModalVisible(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={savePrice}
              >
                <Text style={styles.modalButtonSaveText}>Save</Text>
              </Pressable>
            </View>
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
  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  nameInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },

  // Price modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
  },
  priceCurrency: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonCancelText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonSaveText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
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
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  presetTextActive: {
    color: colors.textOnPrimary,
  },
});
