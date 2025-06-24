const supabase = require('../config/supabaseClient');

exports.getProfile = (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  const { data, error } = await supabase.auth.updateUser({ data: req.body });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
};
