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
    const result = await pool.query(
      'SELECT * FROM goals WHERE family_id = $1 ORDER BY created_at DESC',
      [familyId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Goals GET error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND family_id = $2',
      [req.params.id, familyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Цель не найдена' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Goal GET error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const { name, target_amount, current_amount, deadline, color } = req.body;
    if (!name || !target_amount) {
      return res.status(400).json({ success: false, error: 'Required: name, target_amount' });
    }
    const result = await pool.query(
      `INSERT INTO goals (family_id, name, target_amount, current_amount, deadline, color)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [familyId, name, Number(target_amount), Number(current_amount) || 0, deadline || null, color || '#4CAF50']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Goal POST error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const { name, target_amount, current_amount, deadline, color } = req.body;
    const check = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND family_id = $2',
      [req.params.id, familyId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Цель не найдена' });
    }
    const current = check.rows[0];
    const newName = name !== undefined && name !== null ? name : current.name;
    const newTarget = target_amount !== undefined && target_amount !== null ? Number(target_amount) : current.target_amount;
    const newCurrent = current_amount !== undefined && current_amount !== null ? Number(current_amount) : current.current_amount;
    const newDeadline = deadline !== undefined && deadline !== null ? deadline : current.deadline;
    const newColor = color !== undefined && color !== null ? color : current.color;
    const result = await pool.query(
      `UPDATE goals SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, color = $5
       WHERE id = $6 AND family_id = $7 RETURNING *`,
      [newName, newTarget, newCurrent, newDeadline, newColor, req.params.id, familyId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('GOAL PUT ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/contribute', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const amount = req.body.amount;
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount required' });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    const current = await pool.query(
      'SELECT current_amount FROM goals WHERE id = $1 AND family_id = $2',
      [req.params.id, familyId]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    const oldAmount = Number(current.rows[0].current_amount) || 0;
    const newAmount = oldAmount + numAmount;
    const result = await pool.query(
      'UPDATE goals SET current_amount = $1 WHERE id = $2 AND family_id = $3 RETURNING *',
      [newAmount, req.params.id, familyId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('CONTRIBUTE ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND family_id = $2 RETURNING *',
      [req.params.id, familyId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Цель не найдена' });
    }
    res.json({ success: true, message: 'Цель удалена' });
  } catch (err) {
    console.error('Goal DELETE error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;