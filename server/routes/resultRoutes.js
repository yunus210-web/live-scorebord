const express = require('express');

const {
  createResult,
  getResults,
} = require('../controllers/resultController');

const router = express.Router();

// =========================================
// PUBLISH NEW RESULT
// POST /api/results
// =========================================

router.post(
  '/',
  createResult
);

// =========================================
// GET ALL PUBLISHED RESULTS
// GET /api/results
// =========================================

router.get(
  '/',
  getResults
);

module.exports = router;