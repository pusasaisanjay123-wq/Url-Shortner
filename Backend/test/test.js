import request from 'supertest';
import app from '../index.js';

describe('URL Shortener CI Unit Tests', () => {

  it('GET /health - Should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET /login - Login route availability', async () => {
    const res = await request(app).get('/login');
    expect([200, 302]).toContain(res.statusCode);
  });

  it('GET /signup - Signup route availability', async () => {
    const res = await request(app).get('/signup');
    expect([200, 302]).toContain(res.statusCode);
  });

  it('POST /api/auth/login - Validate empty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/signup - Validate password mismatch', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
    expect(res.statusCode).toBe(400);
  });

  it('GET /dashboard - Block unauthenticated access', async () => {
    const res = await request(app).get('/dashboard');
    expect([302, 401]).toContain(res.statusCode);
  });

  it('GET /api/url/history - Block unauthenticated API requests', async () => {
    const res = await request(app).get('/api/url/history');
    expect(res.statusCode).toBe(401);
  });

});












// import request from 'supertest';
// import mongoose from 'mongoose';
// import app from '../index.js';
// import connectDB from '../config/db.js';

// describe('URL Shortener Integration Tests', () => {

//   beforeAll(async () => {
//     await connectDB();
//   });

//   afterAll(async () => {
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.connection.close();
//     }
//   });

//   it('GET /health - Health Check', async () => {
//     const res = await request(app).get('/health');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('OK');
//   });

//   it('GET / - Root redirect or response', async () => {
//     const res = await request(app).get('/');
//     expect([200, 302]).toContain(res.statusCode);
//   });

//   it('GET /login - Serve login page', async () => {
//     const res = await request(app).get('/login');
//     expect(res.statusCode).toBe(200);
//   });

//   it('GET /signup - Serve signup page', async () => {
//     const res = await request(app).get('/signup');
//     expect(res.statusCode).toBe(200);
//   });

//   it('POST /api/auth/login - Fail on empty credentials', async () => {
//     const res = await request(app)
//       .post('/api/auth/login')
//       .send({ email: '' });
//     expect(res.statusCode).toBe(400);
//   });

//   it('POST /api/auth/signup - Fail on password mismatch', async () => {
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

//   it('GET /dashboard - Block unauthenticated user', async () => {
//     const res = await request(app).get('/dashboard');
//     expect([302, 401]).toContain(res.statusCode);
//   });

//   it('GET /api/url/history - Block unauthenticated API access', async () => {
//     const res = await request(app).get('/api/url/history');
//     expect(res.statusCode).toBe(401);
//   });

//   it('GET /invalidCode123 - Return 404 for invalid short code', async () => {
//     const res = await request(app).get('/invalidCode123');
//     expect(res.statusCode).toBe(404);
//   });

// });

