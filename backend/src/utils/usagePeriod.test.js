'use strict';

const { resolveUsagePeriod } = require('./usagePeriod');

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Free: stable key, no auto reset date
{
  const sub = {
    plan_id: 'free',
    billing_cycle: 'monthly',
    current_period_start: '2026-01-10T00:00:00.000Z',
    current_period_end: '2126-01-10T00:00:00.000Z',
  };
  const r = resolveUsagePeriod(sub, new Date('2026-06-03T12:00:00.000Z'));
  assert(r.periodKey === '2026-01-10', 'free period key anchored to signup');
  assert(r.resetsAt === null, 'free has no scheduled reset');
  assert(r.resetsOnUpgradeOnly === true, 'free resets only on upgrade');
}

// Monthly paid: key = period start, resets at period end
{
  const sub = {
    plan_id: 'starter',
    billing_cycle: 'monthly',
    current_period_start: '2026-05-15T00:00:00.000Z',
    current_period_end: '2026-06-15T00:00:00.000Z',
  };
  const r = resolveUsagePeriod(sub, new Date('2026-06-03T12:00:00.000Z'));
  assert(r.periodKey === '2026-05-15', 'monthly paid uses billing period start');
  assert(r.resetsAt === '2026-06-15T00:00:00.000Z', 'monthly paid resets at period end');
}

// Annual paid: monthly window inside term
{
  const sub = {
    plan_id: 'growth',
    billing_cycle: 'annual',
    current_period_start: '2026-01-15T00:00:00.000Z',
    current_period_end: '2027-01-15T00:00:00.000Z',
  };
  const r = resolveUsagePeriod(sub, new Date('2026-03-20T12:00:00.000Z'));
  assert(r.periodKey === '2026-03-15', 'annual window for March usage');
  assert(r.billingCycle === 'annual', 'annual billing cycle');
}

console.log('usagePeriod.test.js: all assertions passed');
