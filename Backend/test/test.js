import request from 'supertest';
import app from '../index.js';

describe('URL Shortener Automated CI Test Suite', () => {

  it('GET /health - Healthcheck returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET / - Root endpoint redirects or responds', async () => {
    const res = await request(app).get('/');
    expect([200, 302]).toContain(res.statusCode);
  });

  it('POST /api/auth/login - Validates input requirements', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/url/history - Enforces authentication guard', async () => {
    const res = await request(app).get('/api/url/history');
    expect(res.statusCode).toBe(401);
  });

});








// import request from 'supertest';
// import app from '../index.js';

// describe('URL Shortener CI Unit Tests', () => {

//   it('GET /health - Should return 200 OK', async () => {
//     const res = await request(app).get('/health');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('OK');
//   });

//   it('GET /login - Login route availability', async () => {
//     const res = await request(app).get('/login');
//     expect([200, 302]).toContain(res.statusCode);
//   });

//   it('GET /signup - Signup route availability', async () => {
//     const res = await request(app).get('/signup');
//     expect([200, 302]).toContain(res.statusCode);
//   });

//   it('POST /api/auth/login - Validate empty credentials', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({});
//     expect(res.statusCode).toBe(400);
//   });

//   it('POST /api/auth/signup - Validate password mismatch', async () => {
//     const res = await request(app)
//       .post('/api/auth/signup')
//       .send({
//         name: 'Test User',
//         email: 'test@example.com',
//         password: 'password123',
//         confirmPassword: 'differentpassword'
//       });
//     expect(res.statusCode).toBe(400);
//   });

//   it('GET /dashboard - Block unauthenticated access', async () => {
//     const res = await request(app).get('/dashboard');
//     expect([302, 401]).toContain(res.statusCode);
//   });

//   it('GET /api/url/history - Block unauthenticated API requests', async () => {
//     const res = await request(app).get('/api/url/history');
//     expect(res.statusCode).toBe(401);
//   });

// });












