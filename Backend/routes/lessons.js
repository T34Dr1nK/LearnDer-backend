const router = require('express').Router();
const ctrl   = require('../controllers/lessonController');

router.get('/:courseId/lessons',             ctrl.getLessons);
router.get('/:courseId/lessons/:lessonId',   ctrl.getLessonById);

module.exports = router;
