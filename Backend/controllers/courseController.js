const supabase = require('../config/supabaseClient');

exports.getCourses = async (_, res) => {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ courses: data });
};

exports.searchCourses = async (req, res) => {
  const q = req.query.q || '';
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .ilike('title', `%${q}%`);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ courses: data });
};

exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ course: data });
};

exports.createCourse = async (req, res) => {
  const { data, error } = await supabase.from('courses').insert(req.body).single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ course: data });
};

exports.updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase
    .from('courses')
    .update(req.body)
    .eq('id', courseId)
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ course: data });
};

exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
};
