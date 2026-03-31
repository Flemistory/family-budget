const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createFamily, getMembers, inviteMember, updateMemberRole, removeMember } = require('../controllers/familyController');

router.use(verifyToken);

// Создание семьи — не требует familyId
router.post('/', createFamily);

// Остальные маршруты требуют familyId
router.use((req, res, next) => {
  if (!req.user.familyId) {
    return res.status(403).json({ success: false, error: 'Вы не состоите в семье' });
  }
  next();
});

router.get('/members', getMembers);
router.post('/members', inviteMember);
router.patch('/members/:userId/role', updateMemberRole);
router.delete('/members/:userId', removeMember);

module.exports = router;