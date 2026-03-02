const { Router } = require('express');
const Label = require('../models/label');
const { pool } = require('../config');

const router = Router();

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await Label.stats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/users
router.get('/users', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
