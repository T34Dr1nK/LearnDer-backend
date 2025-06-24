const supabase = require('../config/supabaseClient');

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ session: data.session });
};

exports.logout = async (req, res) => {
  await supabase.auth.signOut();
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Password reset email sent' });
};

exports.resetPassword = async (req, res) => {
  const { otp, password } = req.body;
  const { data, error } = await supabase.auth.resetPasswordForOtp({ otp, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
};
