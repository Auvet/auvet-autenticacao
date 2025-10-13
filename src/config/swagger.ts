import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auvet Authentication API',
      version: '1.0.0',
      description: 'API de autenticação e gerenciamento de usuários do sistema Auvet',
      contact: {
        name: 'Izabella Alves Pereira',
        email: 'izabella@auvet.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'http://localhost:4000',
        description: 'Servidor de Produção',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticação e registro',
      },
      {
        name: 'Health',
        description: 'Health check do serviço',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Tutor: {
          type: 'object',
          required: ['cpf', 'nome', 'email', 'senha'],
          properties: {
            cpf: {
              type: 'string',
              description: 'CPF do tutor (11 dígitos)',
              example: '12345678900',
            },
            nome: {
              type: 'string',
              description: 'Nome completo do tutor',
              example: 'João Silva',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do tutor',
              example: 'joao@email.com',
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha (mínimo 6 caracteres)',
              example: 'senha123',
            },
            telefone: {
              type: 'string',
              description: 'Telefone do tutor (opcional)',
              example: '61999999999',
            },
            endereco: {
              type: 'string',
              description: 'Endereço do tutor (opcional)',
              example: 'Rua X, 123, Brasília',
            },
          },
        },
        Funcionario: {
          type: 'object',
          required: ['cpf', 'nome', 'email', 'senha', 'cargo'],
          properties: {
            cpf: {
              type: 'string',
              description: 'CPF do funcionário (11 dígitos)',
              example: '98765432100',
            },
            nome: {
              type: 'string',
              description: 'Nome completo do funcionário',
              example: 'Maria Santos',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do funcionário',
              example: 'maria@email.com',
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha (mínimo 6 caracteres)',
              example: 'senha456',
            },
            cargo: {
              type: 'string',
              description: 'Cargo do funcionário',
              example: 'Veterinária',
            },
            registroProfissional: {
              type: 'string',
              description: 'Registro profissional (opcional)',
              example: 'CRMV-12345',
            },
            nivelAcesso: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: 'Nível de acesso (1-10, padrão: 1)',
              example: 3,
            },
          },
        },
        Login: {
          type: 'object',
          required: ['cpf', 'senha'],
          properties: {
            cpf: {
              type: 'string',
              description: 'CPF do usuário',
              example: '12345678900',
            },
            senha: {
              type: 'string',
              format: 'password',
              description: 'Senha do usuário',
              example: 'senha123',
            },
          },
        },
        ValidateToken: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT a ser validado',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                usuario: {
                  type: 'object',
                  properties: {
                    cpf: { type: 'string', example: '12345678900' },
                    nome: { type: 'string', example: 'João Silva' },
                    email: { type: 'string', example: 'joao@email.com' },
                    tipoUsuario: { type: 'string', enum: ['tutor', 'funcionario'], example: 'tutor' },
                    dadosAdicionais: { type: 'object' },
                  },
                },
                permissoes: {
                  type: 'object',
                  properties: {
                    nivelAcesso: { type: 'integer', example: 0 },
                    podeVerTodosAnimais: { type: 'boolean', example: false },
                    podeGerenciarConsultas: { type: 'boolean', example: false },
                  },
                },
              },
            },
            message: {
              type: 'string',
              example: 'Login realizado com sucesso',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Mensagem de erro',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/docs/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Auvet Auth API Docs',
  }));

  console.log('Swagger documentation available at http://localhost:4000/api-docs');
}

