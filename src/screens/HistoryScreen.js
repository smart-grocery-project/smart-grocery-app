import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { MOCK_HISTORY } from '../data/mockData';

const filters = ['All', 'Added', 'Scanned', 'Recommended'];

const historyRecords = MOCK_HISTORY;

const actionStyles = {
  Added: {
    badge: '#e3f7df',
    text: colors.primary,
  },
  Scanned: {
    badge: '#e8f1ff',
    text: '#2f65a7',
  },
  Recommended: {
    badge: '#fff1cf',
    text: '#9b6b00',
  },
};

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredRecords = historyRecords.filter(
    (record) => activeFilter === 'All' || record.actionType === activeFilter
  );

  const totalRecords = historyRecords.length;
  const addedItems = historyRecords.filter((record) => record.actionType === 'Added').length;
  const scannedItems = historyRecords.filter((record) => record.actionType === 'Scanned').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Smart Grocery</Text>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Review recent grocery activity.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalRecords}</Text>
            <Text style={styles.summaryLabel}>Total records</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{addedItems}</Text>
            <Text style={styles.summaryLabel}>Added items</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{scannedItems}</Text>
            <Text style={styles.summaryLabel}>Scanned items</Text>
          </View>
        </View>

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
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.recordCount}>{filteredRecords.length} shown</Text>
        </View>

        {filteredRecords.map((record) => {
          const badgeStyle = actionStyles[record.actionType];

          return (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordTopRow}>
                <View style={styles.recordDetails}>
                  <Text style={styles.productName}>{record.productName}</Text>
                  <Text style={styles.categoryText}>{record.category}</Text>
                </View>

                <View style={[styles.actionBadge, { backgroundColor: badgeStyle.badge }]}>
                  <Text style={[styles.actionText, { color: badgeStyle.text }]}>
                    {record.actionType}
                  </Text>
                </View>
              </View>

              <Text style={styles.noteText}>{record.note}</Text>
              <Text style={styles.dateText}>{record.date}</Text>
            </View>
          );
        })}
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
    color: colors.textOnPrimary,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textOnPrimary,
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
    color: colors.textOnPrimary,
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
  recordCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  recordTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordDetails: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
