import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { MOCK_INVENTORY } from '../data/mockData';
import {
  getInventory,
  createInventory,
  addInventoryItem,
  createProduct,
  removeInventoryItem,
  updateInventoryItem,
  scanNutritionLabel,
} from '../api/api';
import * as ImagePicker from 'expo-image-picker';

const FILTERS = ['All', 'Protein', 'Carbs', 'Expiring'];

// Derives a category from backend nutrition data
function deriveCategory(nutrition) {
  if (!nutrition) return 'Other';
  const { protein = 0, carbs = 0 } = nutrition;
  return protein >= carbs ? 'Protein' : 'Carbs';
}

// Formats any date string to "May 25, 2026"
function formatDate(input) {
  if (!input) return '';
  const date = new Date(input);
  if (isNaN(date.getTime())) return input;
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Maps a backend inventory item to the format the screen expects
function mapItem(item) {
  return {
    id:         item._id,
    name:       item.product?.name       || 'Unknown',
    category:   deriveCategory(item.product?.nutrition),
    quantity:   String(item.quantity     || 1),
    expiryDate: item.expirationDate      || '',
  };
}

// Computes days until expiry and returns label + colors
function getExpiryBadge(expiryDateStr) {
  const expiry = new Date(expiryDateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0)  return { label: 'Expired',         color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)', isExpired: true };
  if (diffDays === 0) return { label: 'Today',           color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)', isExpired: false };
  if (diffDays <= 3)  return { label: `${diffDays} day${diffDays === 1 ? '' : 's'}`,  color: '#f5a623', bg: 'rgba(245,166,35,0.15)',  isExpired: false };
  if (diffDays <= 7)  return { label: `${diffDays} days`, color: '#f5a623', bg: 'rgba(245,166,35,0.15)',  isExpired: false };
  return               { label: `${diffDays} days`,       color: '#2ecc71', bg: 'rgba(46,204,113,0.15)',  isExpired: false };
}

// Derives a status string from the computed badge for filter matching
function getStatus(expiryDateStr) {
  const badge = getExpiryBadge(expiryDateStr);
  if (badge.isExpired)           return 'Expired';
  if (badge.label === 'Today' || badge.color === '#f5a623') return 'Expiring';
  return 'Good';
}

export default function InventoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm]     = useState('');
  const [items, setItems]               = useState(MOCK_INVENTORY);
  const [loading, setLoading]           = useState(true);

  // Manual add modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [adding, setAdding]                   = useState(false);
  const [newName, setNewName]                 = useState('');
  const [newQuantity, setNewQuantity]         = useState('1');
  const [newPrice, setNewPrice]               = useState('');
  const [newExpiryDays, setNewExpiryDays]     = useState('7');
  const [newCalories, setNewCalories]         = useState('');
  const [newProtein, setNewProtein]           = useState('');
  const [newCarbs, setNewCarbs]               = useState('');
  const [newFat, setNewFat]                   = useState('');
  const [aiScanning, setAiScanning]           = useState(false);

  // Edit/Remove modal state
  const [editItem, setEditItem]               = useState(null);
  const [editQuantity, setEditQuantity]       = useState('1');
  const [editBusy, setEditBusy]               = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const resetForm = () => {
    setNewName('');
    setNewQuantity('1');
    setNewPrice('');
    setNewExpiryDays('7');
    setNewCalories('');
    setNewProtein('');
    setNewCarbs('');
    setNewFat('');
  };

  // Open camera, take photo of label, send to AI, fill the form
  const handleAiScanLabel = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access', 'Please allow camera access to scan the label.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: false,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setAiScanning(true);
    try {
      const response  = await scanNutritionLabel(result.assets[0].uri);
      const nutrition = response.data;
      if (nutrition.name && !newName) setNewName(nutrition.name);
      if (nutrition.calories) setNewCalories(String(nutrition.calories));
      if (nutrition.protein)  setNewProtein(String(nutrition.protein));
      if (nutrition.carbs)    setNewCarbs(String(nutrition.carbs));
      if (nutrition.fat)      setNewFat(String(nutrition.fat));
    } catch (error) {
      const message = error.response?.data?.message ||
        'AI could not read this label. Try a clearer photo.';
      Alert.alert('Scan failed', message);
    } finally {
      setAiScanning(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setAddModalVisible(true);
  };

  // Open the edit modal for a tapped inventory item.
  // Skip mock items — they aren't in the real database.
  const openEditModal = (item) => {
    if (!item.id || String(item.id).startsWith('p')) {
      Alert.alert(
        'Demo item',
        'This is a sample item — only items added through scanning or manual add can be edited.'
      );
      return;
    }
    setEditItem(item);
    setEditQuantity(String(item.quantity || 1));
  };

  const handleUpdateQuantity = async () => {
    if (!editItem) return;
    const qty = parseInt(editQuantity) || 1;
    setEditBusy(true);
    try {
      await updateInventoryItem(editItem.id, qty);
      setEditItem(null);
      await fetchInventory();
    } catch (error) {
      Alert.alert('Error', 'Could not update item. Try again.');
    } finally {
      setEditBusy(false);
    }
  };

  const handleRemoveItem = () => {
    if (!editItem) return;
    Alert.alert(
      'Remove item',
      `Are you sure you want to remove ${editItem.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setEditBusy(true);
            try {
              await removeInventoryItem(editItem.id);
              setEditItem(null);
              await fetchInventory();
            } catch (error) {
              Alert.alert('Error', 'Could not remove item. Try again.');
            } finally {
              setEditBusy(false);
            }
          },
        },
      ]
    );
  };

  const handleManualAdd = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Missing name', 'Please enter a product name.');
      return;
    }

    setAdding(true);
    try {
      // 1. Create a synthetic product in the database
      const productRes = await createProduct({
        barcode: `manual_${Date.now()}`,
        name,
        price:   parseFloat(newPrice) || 0,
        nutrition: {
          calories: parseFloat(newCalories) || 0,
          protein:  parseFloat(newProtein)  || 0,
          carbs:    parseFloat(newCarbs)    || 0,
          fat:      parseFloat(newFat)      || 0,
        },
      });
      const productId = productRes.data._id;

      // 2. Calculate the expiry date from the days input
      const days       = parseInt(newExpiryDays) || 7;
      const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const quantity   = parseInt(newQuantity) || 1;

      // 3. Add it to the inventory (create inventory if it doesn't exist yet)
      try {
        await addInventoryItem(productId, quantity, expiryDate);
      } catch (error) {
        if (error.response?.status === 404) {
          await createInventory();
          await addInventoryItem(productId, quantity, expiryDate);
        } else {
          throw error;
        }
      }

      setAddModalVisible(false);
      await fetchInventory();
    } catch (error) {
      const message = error.response?.data?.message ||
        'Could not add item. Try again.';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await getInventory();
      const backendItems = response.data?.items || [];

      if (backendItems.length > 0) {
        // Real data exists — use it
        setItems(backendItems.map(mapItem));
      } else {
        // Empty inventory — keep mock data for demo
        setItems(MOCK_INVENTORY);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No inventory exists yet — create one then show mock data
        try { await createInventory(); } catch (_) {}
      }
      // Fall back to mock data so demo always looks good
      setItems(MOCK_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  const enriched = items.map((item) => ({
    ...item,
    badge:  getExpiryBadge(item.expiryDate),
    status: getStatus(item.expiryDate),
  }));

  const filtered = enriched.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      item.category === activeFilter ||
      (activeFilter === 'Expiring' && item.status === 'Expiring');
    return matchesSearch && matchesFilter;
  });

  const totalItems   = enriched.length;
  const expiringSoon = enriched.filter((i) => i.status === 'Expiring').length;
  const expired      = enriched.filter((i) => i.status === 'Expired').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Home inventory</Text>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={22} color={colors.textOnPrimary} />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statGreen]}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={[styles.statCard, styles.statAmber]}>
            <Text style={[styles.statNumber, styles.statNumberAmber]}>
              {expiringSoon}
            </Text>
            <Text style={[styles.statLabel, styles.statLabelAmber]}>Expiring</Text>
          </View>
          <View style={[styles.statCard, styles.statRed]}>
            <Text style={[styles.statNumber, styles.statNumberRed]}>{expired}</Text>
            <Text style={[styles.statLabel, styles.statLabelRed]}>Expired</Text>
          </View>
        </View>

        {/* Expiry dates shortcut */}
        <Pressable
          style={styles.expiryLink}
          onPress={() => navigation.navigate('ExpiryDates')}
        >
          <Ionicons name="time-outline" size={15} color={colors.primary} />
          <Text style={styles.expiryLinkText}>View items & expiry dates</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </Pressable>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={17}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.placeholder}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Grocery items</Text>
          <Text style={styles.listCount}>{filtered.length} shown</Text>
        </View>

        {/* Item cards */}
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Pressable
              key={item.id}
              style={styles.itemCard}
              onPress={() => openEditModal(item)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} · {item.category}
                </Text>
                <Text style={styles.itemExpiry}>Expires: {formatDate(item.expiryDate)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.badge.bg }]}>
                <Text style={[styles.badgeText, { color: item.badge.color }]}>
                  {item.badge.label}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons
              name="cube-outline"
              size={32}
              color={colors.textSecondary}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>
              Try a different search or filter.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Edit / Remove modal */}
      <Modal
        visible={!!editItem}
        transparent
        animationType="fade"
        onRequestClose={() => setEditItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editItem?.name}</Text>
            <Text style={styles.modalSubtitle}>
              Update the quantity or remove this item.
            </Text>

            <Text style={styles.fieldLabel}>Quantity</Text>
            <TextInput
              style={styles.modalInput}
              value={editQuantity}
              onChangeText={(v) => setEditQuantity(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />

            <Pressable
              style={[styles.removeButton, editBusy && { opacity: 0.7 }]}
              onPress={handleRemoveItem}
              disabled={editBusy}
            >
              <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
              <Text style={styles.removeButtonText}>Remove from inventory</Text>
            </Pressable>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditItem(null)}
                disabled={editBusy}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, editBusy && { opacity: 0.7 }]}
                onPress={handleUpdateQuantity}
                disabled={editBusy}
              >
                <Text style={styles.modalButtonSaveText}>
                  {editBusy ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manual add modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add item manually</Text>
            <Text style={styles.modalSubtitle}>
              For products without a barcode or not in the database.
            </Text>

            {/* AI Scan label button */}
            <Pressable
              style={[styles.aiScanButton, aiScanning && { opacity: 0.7 }]}
              onPress={handleAiScanLabel}
              disabled={aiScanning}
            >
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.aiScanButtonText}>
                {aiScanning ? 'Reading label...' : 'Scan nutrition label with AI'}
              </Text>
            </Pressable>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Product name *</Text>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Pasta sauce"
                placeholderTextColor={colors.placeholder}
              />

              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Quantity</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newQuantity}
                    onChangeText={(v) => setNewQuantity(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    placeholder="1"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newPrice}
                    onChangeText={(v) => setNewPrice(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Days until expiry</Text>
              <TextInput
                style={styles.modalInput}
                value={newExpiryDays}
                onChangeText={(v) => setNewExpiryDays(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="7"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.sectionDivider}>NUTRITION (per 100g)</Text>

              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Calories</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCalories}
                    onChangeText={(v) => setNewCalories(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newProtein}
                    onChangeText={(v) => setNewProtein(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCarbs}
                    onChangeText={(v) => setNewCarbs(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newFat}
                    onChangeText={(v) => setNewFat(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setAddModalVisible(false)}
                disabled={adding || aiScanning}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSave, adding && { opacity: 0.7 }]}
                onPress={handleManualAdd}
                disabled={adding || aiScanning}
              >
                <Text style={styles.modalButtonSaveText}>
                  {adding ? 'Adding...' : 'Add'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statGreen: {
    backgroundColor: colors.primary,
  },
  statAmber: {
    backgroundColor: 'rgba(245,166,35,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
  },
  statRed: {
    backgroundColor: 'rgba(255,107,107,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  statNumber: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  statNumberAmber: {
    color: '#f5a623',
  },
  statNumberRed: {
    color: '#ff6b6b',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
  },
  statLabelAmber: {
    color: '#f5a623',
    opacity: 0.8,
  },
  statLabelRed: {
    color: '#ff6b6b',
    opacity: 0.8,
  },

  // Expiry link
  expiryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  expiryLinkText: {
    flex: 1,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
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

  // Filters
  filterRow: {
    gap: 8,
    paddingBottom: 18,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.textOnPrimary,
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  listTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  listCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  // Item cards
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemMeta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemExpiry: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Empty state
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  // Manual add modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
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
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 18,
    lineHeight: 18,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 14,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
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
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.4)',
    backgroundColor: 'rgba(255,107,107,0.1)',
    marginBottom: 14,
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '700',
  },
  aiScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '15',
    marginBottom: 16,
  },
  aiScanButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionDivider: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 10,
  },
});
