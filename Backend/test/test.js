import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';
import connectDB from '../config/db.js';

describe('URL Shortener Integration Tests', () => {

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /health - Health Check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('GET / - Root redirect or response', async () => {
    const res = await request(app).get('/');
    expect([200, 302]).toContain(res.statusCode);
  });

  it('GET /login - Serve login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
  });

  it('GET /signup - Serve signup page', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
  });

  it('POST /api/auth/login - Fail on empty credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/signup - Fail on password mismatch', async () => {
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

  it('GET /dashboard - Block unauthenticated user', async () => {
    const res = await request(app).get('/dashboard');
    expect([302, 401]).toContain(res.statusCode);
  });

  it('GET /api/url/history - Block unauthenticated API access', async () => {
    const res = await request(app).get('/api/url/history');
    expect(res.statusCode).toBe(401);
  });

  it('GET /invalidCode123 - Return 404 for invalid short code', async () => {
    const res = await request(app).get('/invalidCode123');
    expect(res.statusCode).toBe(404);
  });

});








// import request from 'supertest';
// import mongoose from 'mongoose';
// import app from '../index.js';
// import connectDB from '../config/db.js';

// describe('URL Shortener Application Integration Tests', () => {

//   beforeAll(async () => {
//     // Disable mongoose query buffering so tests don't hang if DB is offline
//     mongoose.set('bufferCommands', false);
//     await connectDB();
//   });

//   afterAll(async () => {
//     if (mongoose.connection.readyState !== 0) {
//       await mongoose.connection.close();
//     }
//   });

//   describe('GET /health', () => {
//     it('should return status 200 and OK status message', async () => {
//       const res = await request(app).get('/health');
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty('status', 'OK');
//     });
//   });

//   describe('Page Routes', () => {
//     it('GET / should respond', async () => {
//       const res = await request(app).get('/');
//       expect([200, 302]).toContain(res.statusCode);
//     });

//     it('GET /login should render page or redirect', async () => {
//       const res = await request(app).get('/login');
//       expect([200, 302]).toContain(res.statusCode);
//     });

//     it('GET /signup should render page or redirect', async () => {
//       const res = await request(app).get('/signup');
//       expect([200, 302]).toContain(res.statusCode);
//     });
//   });

//   describe('Auth API Validations', () => {
//     it('POST /api/auth/login - should fail on missing credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({ email: '' })
//         .set('Content-Type', 'application/json');

//       expect(res.statusCode).toBe(400);
//     });

//     it('POST /api/auth/signup - should fail when passwords do not match', async () => {
//       const res = await request(app)
//         .post('/api/auth/signup')
//         .send({
//           name: 'Test User',
//           email: 'test@example.com',
//           password: 'password123',
//           confirmPassword: 'differentpassword'
//         })
//         .set('Content-Type', 'application/json');

//       expect(res.statusCode).toBe(400);
//     });
//   });

//   describe('Protected Route Security', () => {
//     it('GET /dashboard without session should redirect or return 401', async () => {
//       const res = await request(app).get('/dashboard');
//       expect([302, 401]).toContain(res.statusCode);
//     });

//     it('GET /api/url/history without auth should return 401', async () => {
//       const res = await request(app)
//         .get('/api/url/history')
//         .set('Accept', 'application/json');

//       expect(res.statusCode).toBe(401);
//     });
//   });

//   describe('404 Handling', () => {
//     it('GET /nonexistent-shortcode should return 404', async () => {
//       const res = await request(app).get('/invalidCode123');
//       expect([404, 500]).toContain(res.statusCode);
//     }, 3000);
//   });

// });
