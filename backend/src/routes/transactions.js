const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

const FAMILY_ID = '00000000-0000-0000-0000-000000000000';
const USER_ID = '00000000-0000-0000-0000-000000000000';

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as category_name, u.name as user_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.family_id = $1 AND t.is_deleted = false
      ORDER BY t.date DESC, t.created_at DESC
    `, [FAMILY_ID]);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, u.name as user_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.family_id = $2 AND t.is_deleted = false`,
      [req.params.id, FAMILY_ID]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Транзакция не найдена' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE family_id = $1 AND is_deleted = false
      GROUP BY type
    `, [FAMILY_ID]);
    
    const income = result.rows.find(r => r.type === 'income')?.total || 0;
    const expense = result.rows.find(r => r.type === 'expense')?.total || 0;
    
    res.json({ 
      success: true, 
      data: {
        totalIncome: parseFloat(income),
        totalExpense: parseFloat(expense),
        balance: parseFloat(income) - parseFloat(expense)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category_id, amount, type, date, comment, receipt_url } = req.body;
    
    if (!category_id || !amount || !type || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Required fields: category_id, amount, type, date' 
      });
    }

    const result = await pool.query(
      `INSERT INTO transactions 
       (family_id, user_id, category_id, amount, type, date, comment, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [FAMILY_ID, USER_ID, category_id, parseFloat(amount), type, date, comment || null, receipt_url || null]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category_id, amount, date, comment, type } = req.body;
    
    if (!category_id && !amount && !date && !comment && !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Укажите хотя бы одно поле для обновления' 
      });
    }

    const result = await pool.query(
      `UPDATE transactions 
       SET category_id = COALESCE($1, category_id),
           amount = COALESCE($2, amount),
           date = COALESCE($3, date),
           comment = COALESCE($4, comment),
           type = COALESCE($5, type),
           updated_at = NOW()
       WHERE id = $6 AND family_id = $7 AND is_deleted = false
       RETURNING *`,
      [category_id, amount, date, comment, type, req.params.id, FAMILY_ID]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Транзакция не найдена' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE transactions 
       SET is_deleted = true, updated_at = NOW()
       WHERE id = $1 AND family_id = $2 AND is_deleted = false
       RETURNING *`,
      [req.params.id, FAMILY_ID]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Транзакция не найдена' });
    }
    
    res.json({ success: true, message: 'Транзакция удалена' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;