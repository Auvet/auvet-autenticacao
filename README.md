# Auvet Autenticação

Serviço de autenticação e gerenciamento de usuários para o sistema Auvet.

## Descrição

Este serviço é responsável por:
- Cadastro de usuários (Tutores e Funcionários)
- Autenticação com JWT
- Validação de tokens
- Gerenciamento de permissões e níveis de acesso

## Tecnologias

- Node.js + TypeScript
- Express.js
- Prisma ORM
- MySQL
- JWT (jsonwebtoken)
- bcryptjs
- Docker

## Estrutura do Projeto

```
auvet-autenticacao/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── modules/
│   │   └── auth/
│   │       ├── controller.ts
│   │       ├── service.ts
│   │       └── repository.ts
│   ├── routes/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── crypto.ts
│   │   ├── jwt.ts
│   │   └── validators.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```
DATABASE_URL="mysql://auvet_user:auvet123@localhost:3307/auvet_db"
NODE_ENV=development
PORT=4000
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRATION=24h
```

### 3. Configurar Banco de Dados

```bash
npm run db:generate
npm run db:migrate
```

## Executar o Projeto

### Desenvolvimento Local

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up -d
```

## Endpoints da API

### Base URL
```
http://localhost:4000/api
```

### Health Check
```
GET /health
```

### Autenticação

#### Cadastrar Tutor
```http
POST /api/auth/register/tutor
Content-Type: application/json

{
  "cpf": "12345678900",
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "61999999999",
  "endereco": "Rua X, 123"
}
```

#### Cadastrar Funcionário
```http
POST /api/auth/register/funcionario
Content-Type: application/json

{
  "cpf": "98765432100",
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "senha": "senha456",
  "cargo": "Veterinária",
  "registroProfissional": "CRMV-12345",
  "nivelAcesso": 3
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "cpf": "12345678900",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "cpf": "12345678900",
      "nome": "João Silva",
      "email": "joao@email.com",
      "tipoUsuario": "tutor",
      "dadosAdicionais": {
        "telefone": "61999999999",
        "endereco": "Rua X, 123"
      }
    },
    "permissoes": {
      "nivelAcesso": 0,
      "podeVerTodosAnimais": false,
      "podeGerenciarConsultas": false
    }
  },
  "message": "Login realizado com sucesso"
}
```

#### Validar Token
```http
POST /api/auth/validatetoken
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "cpf": "12345678900",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipoUsuario": "tutor",
    "nivelAcesso": 0
  },
  "message": "Token válido"
}
```

## Tipos de Usuário

### Tutor
- **Nível de Acesso:** 0
- **Permissões:**
  - Pode ver apenas seus próprios animais
  - Pode agendar consultas para seus animais
  - Não pode gerenciar consultas de outros tutores

### Funcionário
- **Nível de Acesso:** 1-10 (configurável)
- **Permissões:**
  - Pode ver todos os animais do estabelecimento
  - Pode gerenciar consultas
  - Pode criar/editar/deletar registros (depende do nível de acesso)

## Níveis de Acesso

- **0:** Tutor (usuário comum)
- **1:** Funcionário básico (atendente)
- **2:** Veterinário
- **3:** Gerente
- **4+:** Administrador

## Scripts Disponíveis

```bash
npm run dev            # Inicia servidor em modo desenvolvimento
npm start              # Inicia servidor em modo produção
npm run build          # Compila TypeScript
npm run build:full     # Build completo com Prisma
npm run db:migrate     # Roda migrations do Prisma
npm run db:generate    # Gera Prisma Client
npm run db:studio      # Abre Prisma Studio
npm test               # Roda testes
npm run test:watch     # Roda testes em modo watch
npm run test:coverage  # Gera relatório de cobertura
npm run lint           # Verifica código com ESLint
npm run lint:fix       # Corrige problemas do ESLint
npm run lint:check     # Verifica lint sem warnings
```

## Integração com Backend

O backend do Auvet deve configurar a variável de ambiente `AUTH_API_URL` apontando para este serviço:

```
AUTH_API_URL=http://localhost:4000
```

O middleware de autenticação do backend fará requisições para o endpoint `/api/auth/validatetoken`.

## Segurança

- Senhas são hasheadas usando bcrypt com 10 salt rounds
- Tokens JWT são assinados e verificados
- Validação de CPF, email e senha
- Funcionários inativos não podem fazer login
- Tokens expiram em 24 horas (configurável)

## Docker

O projeto inclui configuração completa do Docker:

- **Porta do serviço:** 4000
- **Porta do MySQL:** 3308
- **Container MySQL:** auvet-auth-mysql
- **Container Auth:** auvet-auth

Para rodar com Docker:

```bash
docker-compose up -d
```

Para parar:

```bash
docker-compose down
```

Para ver logs:

```bash
docker-compose logs -f
```

## Desenvolvimento

### Estrutura de Camadas

1. **Controller:** Recebe requisições HTTP e retorna respostas
2. **Service:** Lógica de negócio e validações
3. **Repository:** Acesso ao banco de dados via Prisma

### Adicionar Novo Endpoint

1. Adicionar método no `AuthRepository`
2. Adicionar lógica no `AuthService`
3. Adicionar rota no `AuthController`
4. Adicionar tipos em `types/index.ts`

## Autor

Izabella Alves Pereira

## Licença

MIT
