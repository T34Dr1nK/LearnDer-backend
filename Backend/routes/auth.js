const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const authMw = require('../middleware/auth');

router.post('/signup',        ctrl.signup);
router.post('/login',         ctrl.login);
router.post('/logout',        authMw, ctrl.logout);
router.get ('/me',            authMw, ctrl.getMe);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);

module.exports = router;
