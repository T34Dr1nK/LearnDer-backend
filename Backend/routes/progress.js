const router = require('express').Router();
const ctrl   = require('../controllers/progressController');
const authMw = require('../middleware/auth');

router.get('/course/:courseId',               authMw, ctrl.getCourseProgress);
router.post('/course/:courseId/lesson/:lessonId', authMw, ctrl.markLessonComplete);

module.exports = router;
