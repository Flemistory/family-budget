const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

const FAMILY_ID = '00000000-0000-0000-0000-000000000000';

// GET все цели
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE family_id = $1 ORDER BY created_at DESC',
      [FAMILY_ID]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Goals GET error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET одна цель
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE id = $1 AND family_id = $2',
      [req.params.id, FAMILY_ID]
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

// POST создать цель
router.post('/', async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;
    if (!name || !target_amount) {
      return res.status(400).json({ success: false, error: 'Required: name, target_amount' });
    }
    const result = await pool.query(
      `INSERT INTO goals (family_id, name, target_amount, current_amount, deadline, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [FAMILY_ID, name, Number(target_amount), Number(current_amount) || 0, deadline || null, color || '#4CAF50', icon || '🎯']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Goal POST error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT обновить цель (БЕЗ updated_at)
router.put('/:id', async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;
    const result = await pool.query(
      `UPDATE goals SET 
       name = COALESCE($1, name),
       target_amount = COALESCE($2::numeric, target_amount),
       current_amount = COALESCE($3::numeric, current_amount),
       deadline = COALESCE($4, deadline),
       color = COALESCE($5, color),
       icon = COALESCE($6, icon)
       WHERE id = $7 AND family_id = $8 RETURNING *`,
      [name, target_amount, current_amount, deadline, color, icon, req.params.id, FAMILY_ID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Цель не найдена' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Goal PUT error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔥 PATCH пополнить цель (БЕЗ updated_at) 🔥
router.patch('/:id/contribute', async (req, res) => {
  try {
    const amount = req.body.amount;
    
    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount required' });
    }
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Получаем текущую сумму
    const current = await pool.query(
      'SELECT current_amount FROM goals WHERE id = $1 AND family_id = $2',
      [req.params.id, FAMILY_ID]
    );
    
    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }
    
    // Считаем новую сумму
    const oldAmount = Number(current.rows[0].current_amount) || 0;
    const newAmount = oldAmount + numAmount;
    
    // Обновляем (БЕЗ updated_at)
    const result = await pool.query(
      'UPDATE goals SET current_amount = $1 WHERE id = $2 AND family_id = $3 RETURNING *',
      [newAmount, req.params.id, FAMILY_ID]
    );
    
    res.json({ success: true, data: result.rows[0] });
    
  } catch (err) {
    console.error('🔥 CONTRIBUTE ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE удалить цель
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND family_id = $2 RETURNING *',
      [req.params.id, FAMILY_ID]
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
