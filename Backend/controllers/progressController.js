const supabase = require('../config/supabaseClient');

exports.getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ progress: data });
};

exports.markLessonComplete = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('progress')
    .upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId, completed: true })
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ progress: data });
};
