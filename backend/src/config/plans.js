const PLANS = {
  free: {
    inr: { monthly: 0, annual: 0 },
    usd: { monthly: 0, annual: 0 },
    analysesLimit: 5,
    kitLimit: 1,
    jdAnalysesLimit: 0,
    evaluationsLimit: 1,
  },
  lite: {
    inr: { monthly: 499, annual: 399 },
    usd: { monthly: 6, annual: 5 },
    analysesLimit: 20,
    kitLimit: 10,
    jdAnalysesLimit: 0,
    evaluationsLimit: 3,
  },
  starter: {
    inr: { monthly: 999, annual: 799 },
    usd: { monthly: 12, annual: 10 },
    analysesLimit: 40,
    kitLimit: 20,
    jdAnalysesLimit: 0,
    evaluationsLimit: 5,
  },
  growth: {
    inr: { monthly: 2999, annual: 2399 },
    usd: { monthly: 36, annual: 29 },
    analysesLimit: 200,
    kitLimit: 80,
    jdAnalysesLimit: 20,
    evaluationsLimit: 20,
  },
  enterprise: {
    inr: { monthly: 0, annual: 0 },
    usd: { monthly: 0, annual: 0 },
    analysesLimit: null,
    kitLimit: null,
    jdAnalysesLimit: null,
    evaluationsLimit: null,
  },
  analyses_20: {
    inr: { monthly: 599, annual: 599 },
    usd: { monthly: 8, annual: 8 },
    isAddon: true,
    type: 'analyses',
    amount: 20
  },
  kits_5: {
    inr: { monthly: 249, annual: 249 },
    usd: { monthly: 3, annual: 3 },
    isAddon: true,
    type: 'kits',
    amount: 5
  },
  kits_15: {
    inr: { monthly: 599, annual: 599 },
    usd: { monthly: 8, annual: 8 },
    isAddon: true,
    type: 'kits',
    amount: 15
  }
};

module.exports = { PLANS };
