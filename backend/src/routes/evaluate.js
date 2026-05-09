// backend/src/routes/evaluate.js
'use strict';

const express = require('express');
const router  = express.Router();

const { evaluateCandidate }               = require('../controllers/evaluationController');
const { requireAuth, authErrorHandler }   = require('../middleware/auth');

router.post('/', requireAuth, evaluateCandidate, authErrorHandler);

module.exports = router;
