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
    const { type, category_id, date_from, date_to, search } = req.query;

    let query = `
      SELECT t.*, c.name as category_name, u.name as user_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.family_id = $1 AND t.is_deleted = false
    `;
    const params = [familyId];
    let paramIndex = 2;

    if (type && ['income', 'expense'].includes(type)) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }

    if (date_from) {
      query += ` AND t.date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      query += ` AND t.date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }

    if (search) {
      query += ` AND LOWER(t.comment) LIKE $${paramIndex}`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY t.date DESC, t.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const { type, category_id, date_from, date_to, search } = req.query;

    let query = `
      SELECT t.date, t.type, c.name as category, t.amount, t.comment
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.family_id = $1 AND t.is_deleted = false
    `;
    const params = [familyId];
    let paramIndex = 2;

    if (type && ['income', 'expense'].includes(type)) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (category_id) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category_id);
      paramIndex++;
    }
    if (date_from) {
      query += ` AND t.date >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    if (date_to) {
      query += ` AND t.date <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    }
    if (search) {
      query += ` AND LOWER(t.comment) LIKE $${paramIndex}`;
      params.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY t.date DESC';

    const result = await pool.query(query, params);

    const header = 'Дата;Тип;Категория;Сумма;Комментарий\n';
    const rows = result.rows.map(r => {
      const date = new Date(r.date).toLocaleDateString('ru-RU');
      const typeLabel = r.type === 'income' ? 'Доход' : 'Расход';
      const category = (r.category || '').replace(/;/g, ',');
      const comment = (r.comment || '').replace(/;/g, ',').replace(/\n/g, ' ');
      return `${date};${typeLabel};${category};${r.amount};${comment}`;
    }).join('\n');

    const csv = '\uFEFF' + header + rows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, u.name as user_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.family_id = $2 AND t.is_deleted = false`,
      [req.params.id, familyId]
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
    const familyId = req.user.familyId;
    const transactions = await pool.query(`
      SELECT type, SUM(amount) as total
      FROM transactions
      WHERE family_id = $1 AND is_deleted = false
      GROUP BY type
    `, [familyId]);
    
    const income = transactions.rows.find(r => r.type === 'income')?.total || 0;
    const expense = transactions.rows.find(r => r.type === 'expense')?.total || 0;
    
    const goals = await pool.query(
      'SELECT SUM(current_amount) as allocated FROM goals WHERE family_id = $1',
      [familyId]
    );
    const allocated = goals.rows[0]?.allocated || 0;
    
    const totalBalance = parseFloat(income) - parseFloat(expense);
    const freeBalance = totalBalance - parseFloat(allocated);
    
    res.json({ 
      success: true, 
      data: {
        totalIncome: parseFloat(income),
        totalExpense: parseFloat(expense),
        totalBalance: totalBalance,
        allocatedToGoals: parseFloat(allocated),
        freeBalance: freeBalance,
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
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
      [familyId, userId, category_id, parseFloat(amount), type, date, comment || null, receipt_url || null]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const familyId = req.user.familyId;
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
      [category_id, amount, date, comment, type, req.params.id, familyId]
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
    const familyId = req.user.familyId;
    const result = await pool.query(
      `UPDATE transactions 
       SET is_deleted = true, updated_at = NOW()
       WHERE id = $1 AND family_id = $2 AND is_deleted = false
       RETURNING *`,
      [req.params.id, familyId]
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

router.get('/analytics/spending-by-category', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT c.name as category, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.family_id = $1 AND t.type = 'expense' AND t.is_deleted = false
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [familyId]);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Analytics category error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics/spending-by-month', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount) as total
      FROM transactions
      WHERE family_id = $1 AND type = 'expense' AND is_deleted = false
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `, [familyId]);
    
    const data = result.rows.reverse().map(row => ({
      month: row.month,
      total: parseFloat(row.total)
    }));
    
    res.json({ success: true, data: data });
  } catch (err) {
    console.error('Analytics month error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics/top-expenses', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT c.name as category, SUM(t.amount) as total, COUNT(*) as count
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.family_id = $1 AND t.type = 'expense' AND t.is_deleted = false
      GROUP BY c.id, c.name
      ORDER BY total DESC
      LIMIT 5
    `, [familyId]);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Analytics top error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics/income-by-category', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT c.name as category, SUM(t.amount) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.family_id = $1 AND t.type = 'income' AND t.is_deleted = false
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [familyId]);
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Analytics income category error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics/income-by-month', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount) as total
      FROM transactions
      WHERE family_id = $1 AND type = 'income' AND is_deleted = false
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 6
    `, [familyId]);
    
    const data = result.rows.reverse().map(row => ({
      month: row.month,
      total: parseFloat(row.total)
    }));
    
    res.json({ success: true, data: data });
  } catch (err) {
    console.error('Analytics income month error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/analytics/monthly-comparison', async (req, res) => {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE family_id = $1 AND is_deleted = false
        AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      GROUP BY TO_CHAR(date, 'YYYY-MM'), type
    `, [familyId]);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const data = {};
    for (const row of result.rows) {
      if (!data[row.type]) data[row.type] = {};
      data[row.type][row.month] = parseFloat(row.total);
    }

    const comparison = {};
    for (const t of ['income', 'expense']) {
      const current = data[t]?.[currentMonth] || 0;
      const prev = data[t]?.[prevMonth] || 0;
      const change = prev > 0 ? ((current - prev) / prev * 100).toFixed(1) : (current > 0 ? 100 : 0);
      comparison[t] = { current, prev, change: parseFloat(change) };
    }

    res.json({ success: true, data: comparison });
  } catch (err) {
    console.error('Analytics comparison error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;