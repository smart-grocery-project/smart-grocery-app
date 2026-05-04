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

const FILTERS = ['All', 'Protein', 'Carbs', 'Expiring'];

// Updated dates relative to May 2026 so badges show realistic values
const inventoryItems = [
  {
    id: '1',
    name: 'Chicken breast',
    category: 'Protein',
    quantity: '2 packs',
    expiryDate: 'May 6, 2026',   // 1 day  → urgent
  },
  {
    id: '2',
    name: 'Greek yogurt',
    category: 'Dairy',
    quantity: '1 cup',
    expiryDate: 'May 8, 2026',   // 3 days → warning
  },
  {
    id: '3',
    name: 'Brown rice',
    category: 'Carbs',
    quantity: '1 bag',
    expiryDate: 'Sep 12, 2026',  // months away → good
  },
  {
    id: '4',
    name: 'Whole milk',
    category: 'Dairy',
    quantity: '1 bottle',
    expiryDate: 'Apr 30, 2026',  // already expired
  },
  {
    id: '5',
    name: 'Eggs',
    category: 'Protein',
    quantity: '10 left',
    expiryDate: 'May 20, 2026',  // 15 days → good
  },
];

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

  const enriched = inventoryItems.map((item) => ({
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Home inventory</Text>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              Alert.alert(
                'Add Item',
                'Manually adding items will be available once the backend is connected.'
              )
            }
          >
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
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} · {item.category}
                </Text>
                <Text style={styles.itemExpiry}>Expires: {item.expiryDate}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.badge.bg }]}>
                <Text style={[styles.badgeText, { color: item.badge.color }]}>
                  {item.badge.label}
                </Text>
              </View>
            </View>
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
});
