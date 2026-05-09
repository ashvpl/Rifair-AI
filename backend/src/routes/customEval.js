'use strict';

const express = require('express');
const router  = express.Router();

const { createSession, submitScores, getSession }      = require('../controllers/customEvalController');
const { requireAuth, authErrorHandler }    = require('../middleware/auth');

// GET /api/custom-eval/:id         → get session details
router.get('/:id', requireAuth, getSession, authErrorHandler);

// POST /api/custom-eval           → create session (bias check + meta classify)
router.post('/', requireAuth, createSession, authErrorHandler);

// POST /api/custom-eval/:id/score → submit scores + run AI evaluation
router.post('/:id/score', requireAuth, submitScores, authErrorHandler);

module.exports = router;
