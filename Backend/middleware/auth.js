export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Please log in to continue' });
  }
  return res.redirect('/login');
};

export const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return next();
};