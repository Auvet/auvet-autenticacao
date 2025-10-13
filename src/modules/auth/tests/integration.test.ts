import request from 'supertest';
import express from 'express';
import { AuthController } from '../controller';

const app = express();
app.use(express.json());

const authController = new AuthController();
app.use('/api/auth', authController.router);

describe('AuthController - Integration Tests', () => {
  describe('POST /api/auth/register/tutor', () => {
    it('deve retornar erro de validação para CPF inválido', async() => {
      const response = await request(app)
        .post('/api/auth/register/tutor')
        .send({
          cpf: '123',
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: 'senha123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('CPF inválido');
    });

    it('deve retornar erro de validação para email inválido', async() => {
      const response = await request(app)
        .post('/api/auth/register/tutor')
        .send({
          cpf: '12345678900',
          nome: 'João Silva',
          email: 'emailinvalido',
          senha: 'senha123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email inválido');
    });

    it('deve retornar erro para senha curta', async() => {
      const response = await request(app)
        .post('/api/auth/register/tutor')
        .send({
          cpf: '12345678900',
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('mínimo 6 caracteres');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve retornar erro quando CPF e senha não fornecidos', async() => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/validatetoken', () => {
    it('deve retornar erro quando token não fornecido', async() => {
      const response = await request(app)
        .post('/api/auth/validatetoken')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token não fornecido');
    });

    it('deve retornar erro para token inválido', async() => {
      const response = await request(app)
        .post('/api/auth/validatetoken')
        .send({ token: 'token-invalido' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

