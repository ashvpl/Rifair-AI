'use strict';

/**
 * Usage period rules (premium SaaS):
 *
 * - Free: one usage bucket from signup until upgrade — no automatic monthly reset.
 * - Monthly paid: usage bucket = subscription billing period; resets only on renewal/purchase.
 * - Annual paid: monthly usage windows anchored to subscription start day within the annual term.
 */

const PAID_PLANS = new Set(['lite', 'starter', 'growth', 'enterprise', 'internal_qa_plan']);

function parseDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function addMonths(date, months) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

function isPaidPlan(planId) {
  return PAID_PLANS.has(planId);
}

/**
 * @param {object|null} subscription
 * @param {Date} [now]
 * @returns {{
 *   periodKey: string,
 *   resetsAt: string | null,
 *   billingCycle: string,
 *   planId: string,
 *   isFreePlan: boolean,
 *   resetsOnUpgradeOnly: boolean,
 * }}
 */
function resolveUsagePeriod(subscription, now = new Date()) {
  const planId = subscription?.plan_id || 'free';
  const billingCycle = subscription?.billing_cycle || 'monthly';
  const isFreePlan = planId === 'free' || !isPaidPlan(planId);

  const periodStart = parseDate(subscription?.current_period_start);
  const periodEnd = parseDate(subscription?.current_period_end);

  if (!periodStart) {
    return {
      periodKey: formatDateKey(now).slice(0, 7),
      resetsAt: null,
      billingCycle,
      planId,
      isFreePlan: true,
      resetsOnUpgradeOnly: true,
    };
  }

  // Free (and non-paid): stable bucket until user upgrades — no calendar rollover
  if (isFreePlan) {
    return {
      periodKey: formatDateKey(periodStart),
      resetsAt: null,
      billingCycle,
      planId,
      isFreePlan: true,
      resetsOnUpgradeOnly: true,
    };
  }

  // Monthly paid: one bucket per subscription billing period (renewal on payment only)
  if (billingCycle !== 'annual') {
    return {
      periodKey: formatDateKey(periodStart),
      resetsAt: periodEnd ? periodEnd.toISOString() : null,
      billingCycle: 'monthly',
      planId,
      isFreePlan: false,
      resetsOnUpgradeOnly: false,
    };
  }

  // Annual paid: monthly usage windows inside the annual subscription term
  const subEnd = periodEnd || addMonths(periodStart, 12);

  if (now < periodStart) {
    const firstReset = addMonths(periodStart, 1);
    return {
      periodKey: formatDateKey(periodStart),
      resetsAt: firstReset.toISOString(),
      billingCycle: 'annual',
      planId,
      isFreePlan: false,
      resetsOnUpgradeOnly: false,
    };
  }

  let windowStart = new Date(periodStart.getTime());

  while (true) {
    const windowEnd = addMonths(windowStart, 1);

    if (now < windowEnd || windowEnd >= subEnd) {
      const resetsAt =
        now < windowEnd && windowEnd <= subEnd
          ? windowEnd.toISOString()
          : subEnd.toISOString();

      return {
        periodKey: formatDateKey(windowStart),
        resetsAt,
        billingCycle: 'annual',
        planId,
        isFreePlan: false,
        resetsOnUpgradeOnly: false,
      };
    }

    windowStart = windowEnd;
  }
}

module.exports = {
  resolveUsagePeriod,
  formatDateKey,
  isPaidPlan,
};
