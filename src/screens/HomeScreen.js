import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const quickActions = [
  { title: 'Scan Product', subtitle: 'Scan barcode details quickly', screen: 'ScanProduct' },
  { title: 'Inventory', subtitle: 'See what you already have', screen: 'Inventory' },
  { title: 'Budget & Goals', subtitle: 'Track spending limits and targets' },
  { title: 'History', subtitle: 'Review recent grocery activity', screen: 'History' },
];

export default function HomeScreen({ navigation, route }) {
  const userName = route.params?.userName || 'Smart Shopper';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.greeting}>Welcome, {userName}</Text>
          <Text style={styles.headerTitle}>Smart Grocery</Text>
          <Text style={styles.headerSubtitle}>
            Keep your shopping list, nutrition, and budget in one place.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.budgetCard]}>
            <Text style={styles.summaryLabel}>Budget Summary</Text>
            <Text style={styles.summaryValue}>$128 left</Text>
            <Text style={styles.summaryNote}>Weekly grocery goal: $200</Text>
          </View>

          <View style={[styles.summaryCard, styles.nutritionCard]}>
            <Text style={styles.summaryLabel}>Nutrition Summary</Text>
            <Text style={styles.summaryValue}>82%</Text>
            <Text style={styles.summaryNote}>Healthy choices this week</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Quick Actions</Text>

        {quickActions.map((action) => (
          <Pressable
            key={action.title}
            style={styles.actionCard}
            onPress={() =>
              action.screen ? navigation.navigate(action.screen) : console.log(`${action.title} pressed`)
            }
          >
            <View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Text style={styles.actionArrow}>{'>'}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutText}>Sign Out</Text>
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
    paddingVertical: 24,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  greeting: {
    color: colors.badge,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerTitle: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.surface,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.92,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
  },
  budgetCard: {
    backgroundColor: '#e8f7e8',
  },
  nutritionCard: {
    backgroundColor: '#f1f8d8',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  summaryNote: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionArrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
