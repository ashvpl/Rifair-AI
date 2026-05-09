"use strict";

const { PLANS } = require("../config/plans");

const getPlans = (req, res) => {
  res.json({
    success: true,
    plans: PLANS
  });
};

module.exports = { getPlans };
