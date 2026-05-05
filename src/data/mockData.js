// ─────────────────────────────────────────────────────────────────────────────
// mockData.js  —  Single source of truth for all static demo data
//
// WHY THIS FILE EXISTS:
//   While the backend is not yet connected, every screen imports its data from
//   here so all screens show the same consistent products, prices, and dates.
//
// HOW TO REMOVE IT LATER:
//   1. Delete this file
//   2. In each screen, replace the import with a real API call (fetch/axios)
//   3. The screen UI code stays exactly the same — only the data source changes
// ─────────────────────────────────────────────────────────────────────────────


// ─── Budget ───────────────────────────────────────────────────────────────────
export const MOCK_BUDGET = {
  remaining: 42.50,
  total: 80,
  period: 'Weekly',
};


// ─── Products ─────────────────────────────────────────────────────────────────
// Full product objects — used by Scan, Analysis, Comparison, Inventory, History
export const MOCK_PRODUCTS = {
  chickenBreast: {
    id: 'p1',
    name: 'Chicken breast',
    store: 'FreshFarm',
    price: '$5.99',
    protein: '31g',
    carbs: '0g',
    fats: '3.6g',
    calories: '165 kcal',
    category: 'Protein',
    quantity: '2 packs',
    expiryDate: 'May 6, 2026',
    recommendation: 'A strong high-protein option — great for meal prep and balanced lunches.',
    statuses: ['Good choice', 'High protein', 'Within budget'],
  },
  greekYogurt: {
    id: 'p2',
    name: 'Greek yogurt',
    store: 'FreshFarm',
    price: '$4.20',
    protein: '10g',
    carbs: '6g',
    fats: '4g',
    calories: '120 kcal',
    category: 'Dairy',
    quantity: '1 cup',
    expiryDate: 'May 8, 2026',
    recommendation: 'A balanced snack with good protein — great for breakfast or post-workout.',
    statuses: ['Good choice', 'Within budget'],
  },
  brownRice: {
    id: 'p3',
    name: 'Brown rice',
    store: 'PantryPlus',
    price: '$3.80',
    protein: '5g',
    carbs: '45g',
    fats: '1.8g',
    calories: '216 kcal',
    category: 'Carbs',
    quantity: '1 bag',
    expiryDate: 'Sep 12, 2026',
    recommendation: 'A reliable pantry staple that fits meal prep and budget-conscious shopping.',
    statuses: ['Good choice', 'Within budget'],
  },
  wholeMilk: {
    id: 'p4',
    name: 'Whole milk',
    store: 'DairyFresh',
    price: '$3.50',
    protein: '3g',
    carbs: '5g',
    fats: '4g',
    calories: '65 kcal',
    category: 'Dairy',
    quantity: '1 bottle',
    expiryDate: 'Apr 30, 2026',
    recommendation: 'A daily essential — check expiry date before use.',
    statuses: ['Good choice'],
  },
  eggs: {
    id: 'p5',
    name: 'Eggs',
    store: 'FreshFarm',
    price: '$5.50',
    protein: '6g',
    carbs: '0g',
    fats: '5g',
    calories: '70 kcal',
    category: 'Protein',
    quantity: '10 left',
    expiryDate: 'May 20, 2026',
    recommendation: 'Versatile and protein-rich — works for any meal throughout the day.',
    statuses: ['Good choice', 'Within budget'],
  },
  turkeyBreast: {
    id: 'p6',
    name: 'Turkey breast 500g',
    store: 'NaturalYou',
    price: '$4.99',
    protein: '95g',
    carbs: '0g',
    fats: '8g',
    calories: '189 kcal',
    category: 'Protein',
    quantity: '1 pack',
    expiryDate: 'May 28, 2026',
    recommendation: 'A budget-friendly protein option — lower cost per serving than chicken breast.',
    statuses: ['Good choice', 'High protein'],
  },
};


// ─── Inventory ────────────────────────────────────────────────────────────────
// Used by: InventoryScreen, ExpiryDatesScreen
export const MOCK_INVENTORY = [
  MOCK_PRODUCTS.chickenBreast,
  MOCK_PRODUCTS.greekYogurt,
  MOCK_PRODUCTS.brownRice,
  MOCK_PRODUCTS.wholeMilk,
  MOCK_PRODUCTS.eggs,
];


// ─── Recent scans ─────────────────────────────────────────────────────────────
// Used by: ScanProductScreen
export const MOCK_RECENT_SCANS = [
  {
    id: 's1',
    name: MOCK_PRODUCTS.chickenBreast.name,
    subtitle: 'Protein · Last scan 2 min ago',
    product: MOCK_PRODUCTS.chickenBreast,
  },
  {
    id: 's2',
    name: MOCK_PRODUCTS.greekYogurt.name,
    subtitle: 'Dairy · Suggested for breakfast',
    product: MOCK_PRODUCTS.greekYogurt,
  },
  {
    id: 's3',
    name: MOCK_PRODUCTS.brownRice.name,
    subtitle: 'Carbs · Pantry restock idea',
    product: MOCK_PRODUCTS.brownRice,
  },
];


// ─── History records ──────────────────────────────────────────────────────────
// Used by: HistoryScreen
export const MOCK_HISTORY = [
  {
    id: 'h1',
    productName: MOCK_PRODUCTS.chickenBreast.name,
    category: MOCK_PRODUCTS.chickenBreast.category,
    actionType: 'Scanned',
    date: 'May 4, 2026',
    note: 'Barcode scanned and nutrition reviewed before adding to grocery plan.',
  },
  {
    id: 'h2',
    productName: MOCK_PRODUCTS.greekYogurt.name,
    category: MOCK_PRODUCTS.greekYogurt.category,
    actionType: 'Added',
    date: 'May 3, 2026',
    note: 'Added to inventory with an upcoming expiry date.',
  },
  {
    id: 'h3',
    productName: MOCK_PRODUCTS.brownRice.name,
    category: MOCK_PRODUCTS.brownRice.category,
    actionType: 'Recommended',
    date: 'May 2, 2026',
    note: 'Suggested as a budget-friendly pantry staple.',
  },
  {
    id: 'h4',
    productName: MOCK_PRODUCTS.wholeMilk.name,
    category: MOCK_PRODUCTS.wholeMilk.category,
    actionType: 'Scanned',
    date: 'May 1, 2026',
    note: 'Nutrition and expiry details reviewed before purchase.',
  },
  {
    id: 'h5',
    productName: MOCK_PRODUCTS.eggs.name,
    category: MOCK_PRODUCTS.eggs.category,
    actionType: 'Added',
    date: 'Apr 30, 2026',
    note: 'Added to inventory for weekly meal planning.',
  },
];


// ─── Home screen ──────────────────────────────────────────────────────────────
// Used by: HomeScreen
export const MOCK_NUTRITION_SUMMARY = [
  { label: 'Protein', value: '68g',  color: '#4a9eff' },
  { label: 'Carbs',   value: '142g', color: '#f5a623' },
  { label: 'Fats',    value: '38g',  color: '#ff6b6b' },
];

export const MOCK_EXPIRING_SOON = [
  {
    id: MOCK_PRODUCTS.chickenBreast.id,
    name: MOCK_PRODUCTS.chickenBreast.name,
    meta: `${MOCK_PRODUCTS.chickenBreast.quantity} · ${MOCK_PRODUCTS.chickenBreast.category}`,
    label: '1 day',
    urgent: true,
  },
  {
    id: MOCK_PRODUCTS.greekYogurt.id,
    name: MOCK_PRODUCTS.greekYogurt.name,
    meta: `${MOCK_PRODUCTS.greekYogurt.quantity} · ${MOCK_PRODUCTS.greekYogurt.category}`,
    label: '3 days',
    urgent: false,
  },
];
