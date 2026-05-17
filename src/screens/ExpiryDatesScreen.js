import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MOCK_INVENTORY } from '../data/mockData';

// Derived from the shared inventory — same source as InventoryScreen
const allItems = MOCK_INVENTORY.map((p) => ({
  id: p.id,
  name: p.name,
  detail: `${p.quantity} · ${p.category}`,
  expiryDate: p.expiryDate,
}));

// Returns days remaining + display info
function getExpiry(expiryDateStr) {
  const expiry = new Date(expiryDateStr);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diff = Math.round((expiry - today) / (1000 * 60 * 60 * 24));

  if (diff < 0)   return { group: 'expired',  diff, label: `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} ago`, color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' };
  if (diff === 0) return { group: 'soon',     diff, label: 'Today',        color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' };
  if (diff <= 7)  return { group: 'soon',     diff, label: `${diff} day${diff === 1 ? '' : 's'}`, color: '#f5a623', bg: 'rgba(245,166,35,0.15)' };
  return               { group: 'good',     diff, label: `${diff} days`,  color: '#2ecc71', bg: 'rgba(46,204,113,0.15)' };
}

export default function ExpiryDatesScreen({ navigation }) {
  const enriched = allItems.map((item) => ({
    ...item,
    expiry: getExpiry(item.expiryDate),
  }));

  const expiredItems = enriched.filter((i) => i.expiry.group === 'expired');
  const soonItems    = enriched.filter((i) => i.expiry.group === 'soon');
  const goodItems    = enriched.filter((i) => i.expiry.group === 'good');

  const handleRemove = (name) =>
    Alert.alert(
      'Remove Item',
      `Removing "${name}" will be available once the backend is connected.`
    );

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
          <Text style={styles.headerTitle}>View items & expiry dates</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statRed]}>
            <Text style={[styles.statNumber, { color: '#ff6b6b' }]}>
              {expiredItems.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#ff6b6b' }]}>Expired</Text>
          </View>
          <View style={[styles.statCard, styles.statAmber]}>
            <Text style={[styles.statNumber, { color: '#f5a623' }]}>
              {soonItems.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#f5a623' }]}>Soon</Text>
          </View>
          <View style={[styles.statCard, styles.statGreen]}>
            <Text style={[styles.statNumber, { color: '#2ecc71' }]}>
              {goodItems.length}
            </Text>
            <Text style={[styles.statLabel, { color: '#2ecc71' }]}>Good</Text>
          </View>
        </View>

        {/* EXPIRED section */}
        {expiredItems.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.sectionHeaderRed]}>
              <Ionicons name="warning-outline" size={14} color="#ff6b6b" />
              <Text style={[styles.sectionLabel, { color: '#ff6b6b' }]}>
                EXPIRED — REMOVE IMMEDIATELY
              </Text>
            </View>
            <View style={styles.sectionCard}>
              {expiredItems.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>
                        {item.detail} · Expired {item.expiryDate}
                      </Text>
                      <Text style={styles.itemAgo}>{item.expiry.label}</Text>
                    </View>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemove(item.name)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                  {index < expiredItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* EXPIRING SOON section */}
        {soonItems.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.sectionHeaderAmber]}>
              <Ionicons name="time-outline" size={14} color="#f5a623" />
              <Text style={[styles.sectionLabel, { color: '#f5a623' }]}>
                EXPIRING SOON
              </Text>
            </View>
            <View style={styles.sectionCard}>
              {soonItems.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>
                        {item.detail} · Expires {item.expiryDate}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: item.expiry.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: item.expiry.color },
                        ]}
                      >
                        {item.expiry.label}
                      </Text>
                    </View>
                  </View>
                  {index < soonItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* GOOD section */}
        {goodItems.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.sectionHeaderGreen]}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#2ecc71" />
              <Text style={[styles.sectionLabel, { color: '#2ecc71' }]}>
                GOOD — NO ACTION NEEDED
              </Text>
            </View>
            <View style={styles.sectionCard}>
              {goodItems.map((item, index) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>
                        {item.detail} · Expires {item.expiryDate}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: item.expiry.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: item.expiry.color },
                        ]}
                      >
                        {item.expiry.label}
                      </Text>
                    </View>
                  </View>
                  {index < goodItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
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
    fontSize: 16,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 38,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statRed: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderColor: 'rgba(255,107,107,0.25)',
  },
  statAmber: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderColor: 'rgba(245,166,35,0.25)',
  },
  statGreen: {
    backgroundColor: 'rgba(46,204,113,0.12)',
    borderColor: 'rgba(46,204,113,0.25)',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  sectionHeaderRed: {
    backgroundColor: 'rgba(255,107,107,0.12)',
  },
  sectionHeaderAmber: {
    backgroundColor: 'rgba(245,166,35,0.12)',
  },
  sectionHeaderGreen: {
    backgroundColor: 'rgba(46,204,113,0.12)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Item rows
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  itemDetail: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  itemAgo: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  // Remove button
  removeButton: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  removeText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '800',
  },

  // Expiry badge
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
