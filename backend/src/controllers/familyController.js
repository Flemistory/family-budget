const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '7d';

async function createFamily(req, res) {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Укажите название семьи' });
    }

    const existing = await pool.query(
      'SELECT family_id FROM family_members WHERE user_id = $1',
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Вы уже состоите в семье' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const familyResult = await client.query(
        'INSERT INTO families (name) VALUES ($1) RETURNING id',
        [name.trim()]
      );
      const familyId = familyResult.rows[0].id;

      await client.query(
        'INSERT INTO family_members (user_id, family_id, role) VALUES ($1, $2, $3)',
        [userId, familyId, 'admin']
      );

      await client.query('COMMIT');

      const token = jwt.sign(
        { userId, email: req.user.email, familyId, role: 'admin' },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.status(201).json({
        success: true,
        data: { familyId, role: 'admin', token }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create family error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getMembers(req, res) {
  try {
    const familyId = req.user.familyId;
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.avatar_url, fm.role, fm.joined_at
       FROM family_members fm
       JOIN users u ON fm.user_id = u.id
       WHERE fm.family_id = $1
       ORDER BY fm.role DESC, fm.joined_at ASC`,
      [familyId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function inviteMember(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Укажите email пользователя' });
    }

    const isAdmin = await pool.query(
      'SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2',
      [userId, familyId]
    );
    if (isAdmin.rows.length === 0 || isAdmin.rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Только админ может приглашать участников' });
    }

    const userResult = await pool.query(
      'SELECT id, name FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Пользователь с таким email не найден. Он должен сначала зарегистрироваться.' });
    }
    const targetUser = userResult.rows[0];

    const existing = await pool.query(
      'SELECT family_id FROM family_members WHERE user_id = $1',
      [targetUser.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Пользователь уже состоит в семье' });
    }

    const memberRole = ['admin', 'member', 'viewer'].includes(role) ? role : 'member';

    await pool.query(
      'INSERT INTO family_members (user_id, family_id, role) VALUES ($1, $2, $3)',
      [targetUser.id, familyId, memberRole]
    );

    res.status(201).json({
      success: true,
      data: {
        id: targetUser.id,
        name: targetUser.name,
        email: email.toLowerCase(),
        role: memberRole
      }
    });
  } catch (err) {
    console.error('Invite member error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateMemberRole(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const memberId = req.params.userId;
    const { role } = req.body;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Неверная роль' });
    }

    const isAdmin = await pool.query(
      'SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2',
      [userId, familyId]
    );
    if (isAdmin.rows.length === 0 || isAdmin.rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Только админ может менять роли' });
    }

    if (memberId === userId) {
      return res.status(400).json({ success: false, error: 'Нельзя изменить свою роль' });
    }

    const result = await pool.query(
      'UPDATE family_members SET role = $1 WHERE user_id = $2 AND family_id = $3 RETURNING *',
      [role, memberId, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Участник не найден' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function removeMember(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.id;
    const memberId = req.params.userId;

    const isAdmin = await pool.query(
      'SELECT role FROM family_members WHERE user_id = $1 AND family_id = $2',
      [userId, familyId]
    );
    if (isAdmin.rows.length === 0 || isAdmin.rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Только админ может удалять участников' });
    }

    if (memberId === userId) {
      return res.status(400).json({ success: false, error: 'Нельзя удалить себя. Используйте выход из семьи.' });
    }

    const result = await pool.query(
      'DELETE FROM family_members WHERE user_id = $1 AND family_id = $2 RETURNING *',
      [memberId, familyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Участник не найден' });
    }

    res.json({ success: true, message: 'Участник удалён из семьи' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createFamily, getMembers, inviteMember, updateMemberRole, removeMember };