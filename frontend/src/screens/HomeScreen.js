import React, { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getWeeklyPlan, getInventory } from '../api/api';

// Neutral defaults shown until real data loads
const DEFAULT_BUDGET    = { remaining: 0, total: 0, period: 'Weekly' };
const DEFAULT_NUTRITION = [
  { label: 'Protein', value: '0g', color: '#4a9eff' },
  { label: 'Carbs',   value: '0g', color: '#f5a623' },
  { label: 'Fats',    value: '0g', color: '#ff6b6b' },
];
import { useAuth } from '../context/AuthContext';

// Quick action tiles
const quickActions = [
  {
    title: 'Scan product',
    subtitle: 'Add to list',
    icon: 'scan-outline',
    screen: 'ScanTab',
  },
  {
    title: 'Inventory',
    subtitle: 'View all items',
    icon: 'cube-outline',
    screen: 'InventoryTab',
  },
  {
    title: 'Expiry dates',
    subtitle: '3 expiring soon',
    icon: 'time-outline',
    screen: 'InventoryTab',
    params: { screen: 'ExpiryDates' },
  },
  {
    title: 'Settings',
    subtitle: 'Budget & nutrition',
    icon: 'settings-outline',
    screen: 'ProfileTab',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Good night';
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const userName = user?.name || 'Smart Shopper';

  const [budget, setBudget]           = useState(DEFAULT_BUDGET);
  const [nutrition, setNutrition]     = useState(DEFAULT_NUTRITION);
  const [expiring, setExpiring]       = useState([]);

  // Refresh whenever this screen comes into focus
  // (so budget updates after adding/removing items in other tabs)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    let weeklyBudget = 0;

    // Load weekly plan → total budget + nutrition targets
    try {
      const planRes = await getWeeklyPlan();
      const plan    = planRes.data;
      if (plan?.weeklyBudget) {
        weeklyBudget = plan.weeklyBudget;
      }
      if (plan?.nutritionTargets) {
        const t = plan.nutritionTargets;
        setNutrition([
          { label: 'Protein', value: `${t.protein}g`,  color: '#4a9eff' },
          { label: 'Carbs',   value: `${t.carbs}g`,    color: '#f5a623' },
          { label: 'Fats',    value: `${t.fat}g`,      color: '#ff6b6b' },
        ]);
      }
    } catch (_) {
      // No plan yet — keep default nutrition values
    }

    // Load inventory → calculate spent + expiring soon
    let spent = 0;
    try {
      const invRes = await getInventory();
      const items  = invRes.data?.items || [];

      // Calculate total spent: sum of (price × quantity) for every item
      spent = items.reduce((sum, item) => {
        const price = item.product?.price || 0;
        const qty   = item.quantity       || 1;
        return sum + price * qty;
      }, 0);

      const today = new Date();
      const soon  = items
        .filter((item) => {
          const diff = Math.round(
            (new Date(item.expirationDate) - today) / (1000 * 60 * 60 * 24)
          );
          return diff >= 0 && diff <= 7;
        })
        .map((item) => {
          const diff = Math.round(
            (new Date(item.expirationDate) - today) / (1000 * 60 * 60 * 24)
          );
          return {
            id:     item._id,
            name:   item.product?.name || 'Unknown',
            meta:   `Qty: ${item.quantity}`,
            label:  diff === 0 ? 'Today' : `${diff} day${diff === 1 ? '' : 's'}`,
            urgent: diff <= 1,
          };
        });
      setExpiring(soon);
    } catch (_) {
      // Inventory empty or unavailable
    }

    // Set the budget with the calculated remaining
    setBudget({
      remaining: Math.max(0, weeklyBudget - spent),
      total:     weeklyBudget,
      period:    'Weekly',
    });
  };

  const budgetPercent = budget.total > 0 ? budget.remaining / budget.total : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Budget card */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>Weekly budget remaining</Text>
          <View style={styles.budgetAmountRow}>
            <Text style={styles.budgetAmount}>
              ${budget.remaining.toFixed(2)}
            </Text>
            <Text style={styles.budgetDivider}> / </Text>
            <Text style={styles.budgetTotal}>${budget.total}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(budgetPercent * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* Nutrition goals */}
        <Text style={styles.sectionLabel}>NUTRITION GOALS</Text>
        <View style={styles.nutritionRow}>
          {nutrition.map((item) => (
            <View key={item.label} style={styles.nutritionChip}>
              <Text style={[styles.nutritionValue, { color: item.color }]}>
                {item.value}
              </Text>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen, action.params)}
            >
              <View style={styles.actionIconBox}>
                <Ionicons name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* Expiring soon */}
        <Text style={styles.sectionLabel}>EXPIRING SOON</Text>
        {expiring.length > 0 ? (
          expiring.map((item) => (
            <View key={item.id} style={styles.expiryCard}>
              <View style={styles.expiryInfo}>
                <Text style={styles.expiryName}>{item.name}</Text>
                <Text style={styles.expiryMeta}>{item.meta}</Text>
              </View>
              <View
                style={[
                  styles.expiryBadge,
                  item.urgent ? styles.badgeUrgent : styles.badgeWarning,
                ]}
              >
                <Text
                  style={[
                    styles.expiryBadgeText,
                    item.urgent ? styles.badgeTextUrgent : styles.badgeTextWarning,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.expiryEmptyCard}>
            <Text style={styles.expiryEmptyText}>
              Nothing expiring soon.
            </Text>
          </View>
        )}

        {/* Sign out moved to Profile tab */}
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

  // Greeting
  greetingSection: {
    marginBottom: 20,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },

  // Budget card
  budgetCard: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },
  budgetLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  budgetAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  budgetAmount: {
    color: colors.textOnPrimary,
    fontSize: 32,
    fontWeight: '800',
  },
  budgetDivider: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
  },
  budgetTotal: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.textOnPrimary,
    borderRadius: 999,
  },

  // Section label
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Nutrition
  nutritionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  nutritionChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  nutritionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick actions grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Expiring soon
  expiryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiryEmptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  expiryEmptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  expiryInfo: {
    flex: 1,
    paddingRight: 12,
  },
  expiryName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  expiryMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  expiryBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeUrgent: {
    backgroundColor: 'rgba(255, 80, 80, 0.15)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  expiryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextUrgent: {
    color: '#ff5050',
  },
  badgeTextWarning: {
    color: '#f5a623',
  },

});
