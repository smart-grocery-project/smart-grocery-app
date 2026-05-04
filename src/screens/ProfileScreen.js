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

const BUDGET_PERIODS = ['Weekly', 'Bi-weekly', 'Monthly'];

const NUTRITION_GOALS = [
  {
    key: 'protein_rich',
    label: 'Protein rich',
    subtitle: 'High protein, low fat diet',
    macros: { protein: 120, carbs: 200, fats: 55 },
  },
  {
    key: 'carb_rich',
    label: 'Carb rich',
    subtitle: 'High carbs for energy',
    macros: { protein: 80, carbs: 280, fats: 55 },
  },
  {
    key: 'balanced',
    label: 'Balanced',
    subtitle: 'Equal macro distribution',
    macros: { protein: 100, carbs: 230, fats: 70 },
  },
];

// Max values used to calculate bar widths
const MACRO_MAX   = { protein: 150, carbs: 300, fats: 90 };
const MACRO_COLOR = { protein: '#4a9eff', carbs: '#f5a623', fats: '#ff6b6b' };

const MACRO_ROWS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs',   label: 'Carbs'   },
  { key: 'fats',    label: 'Fats'    },
];

export default function ProfileScreen({ navigation }) {
  const [budgetAmount, setBudgetAmount] = useState('80');
  const [budgetPeriod, setBudgetPeriod] = useState('Weekly');
  const [selectedGoal, setSelectedGoal] = useState('protein_rich');
  const [justSaved, setJustSaved]       = useState(false);

  const currentGoal = NUTRITION_GOALS.find((g) => g.key === selectedGoal);

  const handleSave = () => {
    // Will POST to backend settings endpoint once connected
    Alert.alert(
      'Settings saved',
      'Your budget and nutrition preferences have been saved locally. They will sync to the backend once it\'s connected.',
      [{ text: 'OK' }]
    );
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleSignOut = () =>
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>Budget & nutrition{'\n'}settings</Text>
        </View>

        {/* ── BUDGET SETTINGS ── */}
        <Text style={styles.sectionLabel}>BUDGET SETTINGS</Text>
        <View style={styles.card}>
          {/* Amount row */}
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>
              {budgetPeriod} budget
            </Text>
            <View style={styles.budgetAmountBox}>
              <Text style={styles.budgetCurrency}>$</Text>
              <TextInput
                style={styles.budgetInput}
                value={budgetAmount}
                onChangeText={(v) => setBudgetAmount(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={5}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Period selector */}
          <View style={styles.periodRow}>
            {BUDGET_PERIODS.map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.periodTab,
                  budgetPeriod === period && styles.periodTabActive,
                ]}
                onPress={() => setBudgetPeriod(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    budgetPeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── NUTRITION GOAL ── */}
        <Text style={styles.sectionLabel}>NUTRITION GOAL</Text>
        <View style={styles.card}>
          {NUTRITION_GOALS.map((goal, index) => (
            <View key={goal.key}>
              <Pressable
                style={styles.goalRow}
                onPress={() => setSelectedGoal(goal.key)}
              >
                <View
                  style={[
                    styles.radio,
                    selectedGoal === goal.key && styles.radioActive,
                  ]}
                >
                  {selectedGoal === goal.key && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <View style={styles.goalTextBox}>
                  <Text style={styles.goalLabel}>{goal.label}</Text>
                  <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                </View>
              </Pressable>
              {index < NUTRITION_GOALS.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>

        {/* ── DAILY MACRO TARGETS ── */}
        <Text style={styles.sectionLabel}>DAILY MACRO TARGETS</Text>
        <View style={styles.card}>
          {MACRO_ROWS.map((macro, index) => {
            const value   = currentGoal.macros[macro.key];
            const percent = Math.min((value / MACRO_MAX[macro.key]) * 100, 100);
            const barColor = MACRO_COLOR[macro.key];

            return (
              <View key={macro.key}>
                <View style={styles.macroRow}>
                  <View style={styles.macroTopRow}>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                    <Text style={[styles.macroValue, { color: barColor }]}>
                      {value}g/day
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${percent}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
                {index < MACRO_ROWS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </View>

        {/* Save button */}
        <Pressable
          style={[styles.saveButton, justSaved && styles.saveButtonSaved]}
          onPress={handleSave}
        >
          {justSaved ? (
            <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.saveButtonText}>
            {justSaved ? 'Saved!' : 'Save settings'}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.bottomDivider} />

        {/* Account section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.accountRow}
            onPress={() =>
              Alert.alert('History', 'Tap History from the Home screen to view your activity.')
            }
          >
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.accountRowText}>View history</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.accountRow}
            onPress={() =>
              Alert.alert(
                'Edit Profile',
                'Profile editing will be available once the backend is connected.'
              )
            }
          >
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.accountRowText}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.accountRow} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#ff6b6b" />
            <Text style={[styles.accountRowText, { color: '#ff6b6b' }]}>Sign out</Text>
            <Ionicons name="chevron-forward" size={16} color="#ff6b6b" />
          </Pressable>
        </View>
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
    paddingBottom: 48,
  },

  // Title
  titleRow: {
    marginBottom: 24,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
  },

  // Section label
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  // Budget settings
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  budgetLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  budgetAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  budgetCurrency: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 2,
  },
  budgetInput: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 44,
    textAlign: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  periodTextActive: {
    color: colors.textOnPrimary,
  },

  // Nutrition goal
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  goalTextBox: {
    flex: 1,
  },
  goalLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Macro targets
  macroRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  macroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    height: 7,
    backgroundColor: colors.background,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },

  // Save button
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  saveButtonSaved: {
    backgroundColor: '#27ae60',
  },
  saveButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },

  // Bottom divider
  bottomDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },

  // Account rows
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  accountRowText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
