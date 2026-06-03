'use strict';

const { PLANS } = require('../config/plans');

const FIELD_MAP = {
  analyses: 'analysesLimit',
  kits: 'kitLimit',
  jdAnalyses: 'jdAnalysesLimit',
  evaluations: 'evaluationsLimit',
};

/**
 * Resolve a plan's usage limit from config/plans.js (single source of truth).
 * Returns null for unlimited (enterprise).
 */
function getPlanLimit(planId, type) {
  const field = FIELD_MAP[type];
  if (!field) return null;

  const plan = PLANS[planId] || PLANS.free;
  const value = plan[field];
  if (value === undefined) {
    return PLANS.free[field] ?? null;
  }
  return value;
}

module.exports = { getPlanLimit };
