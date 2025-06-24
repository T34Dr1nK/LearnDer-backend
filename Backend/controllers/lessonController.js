const supabase = require('../config/supabaseClient');

exports.getLessons = async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ lessons: data });
};

exports.getLessonById = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('id', lessonId)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ lesson: data });
};
