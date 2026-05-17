export const compareProductToPlan = (product, plan) => {
  const result = {};

  // Budget
  result.budget = {
    ok: product.price <= plan.weeklyBudget,
    value: product.price,
    target: plan.weeklyBudget,
    difference: plan.weeklyBudget - product.price,
  };

  // Nutrition
  const nutrients = ["calories", "protein", "carbs", "fat"];

  nutrients.forEach((key) => {
    const productValue = product.nutrition[key];
    const targetValue = plan.nutritionTargets[key];

    result[key] = {
      ok: productValue <= targetValue,
      value: productValue,
      target: targetValue,
      difference: targetValue - productValue,
    };
  });

  return result;
};