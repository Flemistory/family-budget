const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.use((req, res, next) => {
  if (!req.user.familyId) {
    return res.status(403).json({ success: false, error: 'Вы не состоите в семье' });
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const { type } = req.query;

    let query = `
      SELECT id, name, type, color, parent_id, is_default
      FROM categories
      WHERE (family_id = $1 OR is_default = true)
    `;
    const params = [familyId];

    if (type && ['income', 'expense'].includes(type)) {
      query += ' AND type = $2';
      params.push(type);
    }

    query += ' ORDER BY type, name';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;