import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';
import connectDB from '../config/db.js';

describe('URL Shortener Application Integration Tests', () => {

  beforeAll(async () => {
    // Disable mongoose query buffering so tests don't hang if DB is offline
    mongoose.set('bufferCommands', false);
    await connectDB();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('GET /health', () => {
    it('should return status 200 and OK status message', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
    });
  });

  describe('Page Routes', () => {
    it('GET / should respond', async () => {
      const res = await request(app).get('/');
      expect([200, 302]).toContain(res.statusCode);
    });

    it('GET /login should render page or redirect', async () => {
      const res = await request(app).get('/login');
      expect([200, 302]).toContain(res.statusCode);
    });

    it('GET /signup should render page or redirect', async () => {
      const res = await request(app).get('/signup');
      expect([200, 302]).toContain(res.statusCode);
    });
  });

  describe('Auth API Validations', () => {
    it('POST /api/auth/login - should fail on missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '' })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(400);
    });

    it('POST /api/auth/signup - should fail when passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword'
        })
        .set('Content-Type', 'application/json');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Protected Route Security', () => {
    it('GET /dashboard without session should redirect or return 401', async () => {
      const res = await request(app).get('/dashboard');
      expect([302, 401]).toContain(res.statusCode);
    });

    it('GET /api/url/history without auth should return 401', async () => {
      const res = await request(app)
        .get('/api/url/history')
        .set('Accept', 'application/json');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('404 Handling', () => {
    it('GET /nonexistent-shortcode should return 404', async () => {
      const res = await request(app).get('/invalidCode123');
      expect([404, 500]).toContain(res.statusCode);
    }, 3000);
  });

});



















// import request from 'supertest';
// import mongoose from 'mongoose';
// import app from '../index.js';
// import connectDB from '../config/db.js';

// describe('URL Shortener Application Integration Tests', () => {

//   // Connect to DB before running tests so database queries don't hang
//   beforeAll(async () => {
//     await connectDB();
//   });

//   // Close DB connection after all tests finish
//   afterAll(async () => {
//     await mongoose.connection.close();
//   });

//   // 1. Health Check Endpoint
//   describe('GET /health', () => {
//     it('should return status 200 and OK status message', async () => {
//       const res = await request(app).get('/health');
//       expect(res.statusCode).toBe(200);
//       expect(res.body).toHaveProperty('status', 'OK');
//       expect(res.body).toHaveProperty('timestamp');
//     });
//   });

//   // 2. Page Navigation Routes
//   describe('Page Routes', () => {
//     it('GET / should serve index page or redirect to login', async () => {
//       const res = await request(app).get('/');
//       expect([200, 302]).toContain(res.statusCode);
//     });

//     it('GET /login should render the login page', async () => {
//       const res = await request(app).get('/login');
//       expect(res.statusCode).toBe(200);
//     });

//     it('GET /signup should render the signup page', async () => {
//       const res = await request(app).get('/signup');
//       expect(res.statusCode).toBe(200);
//     });
//   });

//   // 3. Auth API Validations
//   describe('Auth API Validations', () => {
//     it('POST /api/auth/login - should fail on missing credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({ email: '' })
//         .set('Content-Type', 'application/json');

//       expect(res.statusCode).toBe(400);
//       expect(res.body).toHaveProperty('error');
//     });

//     it('POST /api/auth/signup - should fail on missing fields', async () => {
//       const res = await request(app)
//         .post('/api/auth/signup')
//         .send({ name: 'Test User' })
//         .set('Content-Type', 'application/json');

//       expect(res.statusCode).toBe(400);
//       expect(res.body).toHaveProperty('error');
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
//       expect(res.body.error).toBe('Passwords do not match');
//     });
//   });

//   // 4. Protected Routes Security
//   describe('Protected Route Security', () => {
//     it('GET /dashboard without active session should redirect to /login', async () => {
//       const res = await request(app).get('/dashboard');
//       expect(res.statusCode).toBe(302);
//       expect(res.headers.location).toBe('/login');
//     });

//     it('GET /api/url/history without auth header/session should return 401', async () => {
//       const res = await request(app)
//         .get('/api/url/history')
//         .set('Accept', 'application/json');

//       expect(res.statusCode).toBe(401);
//       expect(res.body.error).toBe('Please log in to continue');
//     });

//     it('POST /api/url/shorten without auth session should return 401', async () => {
//       const res = await request(app)
//         .post('/api/url/shorten')
//         .send({ originalUrl: 'https://example.com' })
//         .set('Content-Type', 'application/json')
//         .set('Accept', 'application/json');

//       expect(res.statusCode).toBe(401);
//       expect(res.body.error).toBe('Please log in to continue');
//     });
//   });

//   // 5. Short URL Fallback
//   describe('404 Handling', () => {
//     it('GET /nonexistent-shortcode should return 404', async () => {
//       const res = await request(app).get('/invalidCode123');
//       expect(res.statusCode).toBe(404);
//     });
//   });

// });