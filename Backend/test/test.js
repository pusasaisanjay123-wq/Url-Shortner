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
