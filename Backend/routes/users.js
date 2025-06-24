const router = require('express').Router();
const ctrl   = require('../controllers/userController');
const authMw = require('../middleware/auth');

router.get('/me', authMw, ctrl.getProfile);
router.put('/me', authMw, ctrl.updateProfile);

module.exports = router;
