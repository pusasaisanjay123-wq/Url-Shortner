export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.originalUrl.startsWith('/api/')) {
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



















// export const isAuthenticated = (req, res, next) => {
//   if (req.session && req.session.userId) {
//     return next();
//   }
//   if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.startsWith('/api/')) {
//     return res.status(401).json({ error: 'Please log in to continue' });
//   }
//   return res.redirect('/login');
// };

// export const isNotAuthenticated = (req, res, next) => {
//   if (req.session && req.session.userId) {
//     // If it's an API request (starts with /api/), return proper JSON
//     if (req.originalUrl.startsWith('/api/') || req.method !== 'GET') {
//       return res.status(400).json({ error: 'You are already logged in. Please refresh or logout first.' });
//     }
//     // If it's a browser page request (GET /login), redirect to dashboard
//     return res.redirect('/dashboard');
//   }
//   return next();
// };