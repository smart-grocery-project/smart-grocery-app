import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const filters = ['All', 'Protein', 'Carbs', 'Expiring'];

const inventoryItems = [
  {
    id: '1',
    name: 'Chicken breast',
    category: 'Protein',
    expiryDate: 'Apr 23, 2026',
    quantity: '2 packs',
    status: 'Expiring',
  },
  {
    id: '2',
    name: 'Greek yogurt',
    category: 'Protein',
    expiryDate: 'Apr 19, 2026',
    quantity: '1 cup',
    status: 'Expired',
  },
  {
    id: '3',
    name: 'Brown rice',
    category: 'Carbs',
    expiryDate: 'Sep 12, 2026',
    quantity: '1 bag',
    status: 'Good',
  },
  {
    id: '4',
    name: 'Whole milk',
    category: 'Dairy',
    expiryDate: 'Apr 25, 2026',
    quantity: '1 bottle',
    status: 'Expiring',
  },
  {
    id: '5',
    name: 'Eggs',
    category: 'Protein',
    expiryDate: 'May 1, 2026',
    quantity: '10 left',
    status: 'Good',
  },
];

const statusStyles = {
  Good: {
    badge: '#e3f7df',
    text: colors.primary,
  },
  Expiring: {
    badge: '#fff1cf',
    text: '#9b6b00',
  },
  Expired: {
    badge: '#fde4e6',
    text: colors.error,
  },
};

export default function InventoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      item.category === activeFilter ||
      (activeFilter === 'Expiring' && item.status === 'Expiring');

    return matchesSearch && matchesFilter;
  });

  const totalItems = inventoryItems.length;
  const expiringSoon = inventoryItems.filter((item) => item.status === 'Expiring').length;
  const expired = inventoryItems.filter((item) => item.status === 'Expired').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Smart Grocery</Text>
          <Text style={styles.title}>Home Inventory</Text>
          <Text style={styles.subtitle}>Track what you have before your next grocery trip.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalItems}</Text>
            <Text style={styles.summaryLabel}>Total items</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{expiringSoon}</Text>
            <Text style={styles.summaryLabel}>Expiring soon</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{expired}</Text>
            <Text style={styles.summaryLabel}>Expired</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          placeholderTextColor={colors.placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Grocery items</Text>
          <Text style={styles.itemCount}>{filteredItems.length} shown</Text>
        </View>

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const badgeStyle = statusStyles[item.status];

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.category}</Text>
                  <Text style={styles.expiryText}>Expires: {item.expiryDate}</Text>
                  {item.quantity ? <Text style={styles.quantityText}>Quantity: {item.quantity}</Text> : null}
                </View>

                <View style={[styles.statusBadge, { backgroundColor: badgeStyle.badge }]}>
                  <Text style={[styles.statusText, { color: badgeStyle.text }]}>{item.status}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>Try a different search or category filter.</Text>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  filterRow: {
    gap: 10,
    paddingBottom: 18,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  activeFilterText: {
    color: colors.surface,
  },
  listHeader: {
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
  itemCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  itemSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  expiryText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  quantityText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
