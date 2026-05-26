import { describe, expect, it, beforeAll } from '@jest/globals';
import request from 'supertest';
import { APP_URL, TESTER_EMAIL, TESTER_PASSWORD } from '../utils/constants';

describe('Auth Module', () => {
  const app = APP_URL;
  const newUserEmail = `user.${Date.now()}@example.com`;
  const newUserPassword = `secret`;

  describe('Registration', () => {
    it('should fail with existing email: /api/v1/auth/email/register (POST)', () => {
      return request(app)
        .post('/api/v1/auth/email/register')
        .send({ email: TESTER_EMAIL, password: TESTER_PASSWORD })
        .expect(422)
        .expect(({ body }) => {
          expect(body.errors.email).toBeDefined();
        });
    });

    it('should successfully register and return token: /api/v1/auth/email/register (POST)', () => {
      return request(app)
        .post('/api/v1/auth/email/register')
        .send({ email: newUserEmail, password: newUserPassword })
        .expect(201)
        .expect(({ body }) => {
          expect(body.token).toBeDefined();
          expect(body.user.email).toBe(newUserEmail);
        });
    });
  });

  describe('Login', () => {
    it('should login successfully: /api/v1/auth/email/login (POST)', () => {
      return request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .expect(200)
        .expect(({ body }) => {
          expect(body.token).toBeDefined();
          expect(body.refreshToken).toBeDefined();
          expect(body.tokenExpires).toBeDefined();
          expect(body.user.email).toBeDefined();
          expect(body.user.password).not.toBeDefined();
        });
    });
  });

  describe('Logged in user', () => {
    let newUserApiToken: string;

    beforeAll(async () => {
      await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .then(({ body }) => {
          newUserApiToken = body.token;
        });
    });

    it('should retrieve own profile: /api/v1/auth/me (GET)', () => {
      return request(app)
        .get('/api/v1/auth/me')
        .auth(newUserApiToken, { type: 'bearer' })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body.email).toBeDefined();
          expect(body.password).not.toBeDefined();
        });
    });

    it('should get new refresh token: /api/v1/auth/refresh (POST)', async () => {
      let refreshToken = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .then(({ body }) => body.refreshToken);

      refreshToken = await request(app)
        .post('/api/v1/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send()
        .then(({ body }) => body.refreshToken);

      return request(app)
        .post('/api/v1/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send()
        .expect(({ body }) => {
          expect(body.token).toBeDefined();
          expect(body.refreshToken).toBeDefined();
          expect(body.tokenExpires).toBeDefined();
        });
    });

    it('should fail on second use of same refresh token: /api/v1/auth/refresh (POST)', async () => {
      const refreshToken = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .then(({ body }) => body.refreshToken);

      await request(app)
        .post('/api/v1/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send();

      return request(app)
        .post('/api/v1/auth/refresh')
        .auth(refreshToken, { type: 'bearer' })
        .send()
        .expect(401);
    });

    it('should update password successfully: /api/v1/auth/me (PATCH)', async () => {
      const newUserNewPassword = 'new-secret';
      const token = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .then(({ body }) => body.token);

      await request(app)
        .patch('/api/v1/auth/me')
        .auth(token, { type: 'bearer' })
        .send({ password: newUserNewPassword })
        .expect(422);

      await request(app)
        .patch('/api/v1/auth/me')
        .auth(token, { type: 'bearer' })
        .send({ password: newUserNewPassword, oldPassword: newUserPassword })
        .expect(200);

      return request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserNewPassword })
        .expect(200)
        .expect(({ body }) => {
          expect(body.token).toBeDefined();
        });
    });

    it('should delete profile successfully: /api/v1/auth/me (DELETE)', async () => {
      const token = await request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .then(({ body }) => body.token);

      await request(app)
        .delete('/api/v1/auth/me')
        .auth(token, { type: 'bearer' });

      return request(app)
        .post('/api/v1/auth/email/login')
        .send({ email: newUserEmail, password: newUserPassword })
        .expect(422);
    });
  });
});
