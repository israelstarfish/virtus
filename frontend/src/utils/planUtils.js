// frontend/src/utils/planUtils.js

export const planOrder = ['no-plan', 'test', 'basic', 'pro', 'premium', 'enterprise'];

export function getNextPlan(currentPlan) {
  const index = planOrder.indexOf(currentPlan);
  return index >= 0 && index < planOrder.length - 1 ? planOrder[index + 1] : null;
}

export function getPlanTier(plan) {
  const index = ['basic', 'pro', 'premium', 'enterprise'].indexOf(plan);
  return index >= 0 ? index + 1 : null;
}