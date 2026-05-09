'use strict';

const express = require('express');
const router  = express.Router();

const { createAudit, getAudit, rewriteQuestion, updateAudit } = require('../controllers/kitAuditController');
const { requireAuth, authErrorHandler }          = require('../middleware/auth');

// POST /api/kit-audit          → run full audit on uploaded questions
router.post('/',              requireAuth, createAudit,      authErrorHandler);

// GET  /api/kit-audit/:id      → fetch a saved audit report
router.get('/:id',            requireAuth, getAudit,         authErrorHandler);

// PATCH /api/kit-audit/:id     → update audit questions/metadata
router.patch('/:id',          requireAuth, updateAudit,       authErrorHandler);

// POST /api/kit-audit/:id/rewrite → generate AI rewrite for one question (paid)
router.post('/:id/rewrite',   requireAuth, rewriteQuestion,  authErrorHandler);

module.exports = router;
