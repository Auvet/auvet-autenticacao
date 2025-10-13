import { AuthService } from '../service';
import { AuthRepository } from '../repository';
import { CryptoUtils } from '../../../utils/crypto';

jest.mock('../repository');
jest.mock('../../../utils/crypto');

describe('AuthService - Unit Tests', () => {
  let authService: AuthService;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockAuthRepository = new AuthRepository() as jest.Mocked<AuthRepository>;
    authService = new AuthService(mockAuthRepository);
    jest.clearAllMocks();
  });

  describe('registerTutor', () => {
    it('deve registrar um tutor com sucesso', async() => {
      const tutorData = {
        cpf: '12345678900',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
        telefone: '61999999999',
        endereco: 'Rua X, 123',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue(null);
      mockAuthRepository.getUsuarioByEmail = jest.fn().mockResolvedValue(null);
      (CryptoUtils.hashPassword as jest.Mock) = jest.fn().mockResolvedValue('hashedPassword');
      mockAuthRepository.createUsuarioWithTutor = jest.fn().mockResolvedValue({
        usuario: {
          cpf: '12345678900',
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: 'hashedPassword',
          dataCadastro: new Date(),
        },
        tutor: {
          cpf: '12345678900',
          telefone: '61999999999',
          endereco: 'Rua X, 123',
        },
      });

      const result = await authService.registerTutor(tutorData);

      expect(result.cpf).toBe('12345678900');
      expect(result.tipoUsuario).toBe('tutor');
      expect(mockAuthRepository.createUsuarioWithTutor).toHaveBeenCalled();
    });

    it('deve lançar erro se CPF já existe', async() => {
      const tutorData = {
        cpf: '12345678900',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue({
        cpf: '12345678900',
      });

      await expect(authService.registerTutor(tutorData)).rejects.toThrow('Usuário já cadastrado com este CPF');
    });

    it('deve lançar erro se email já existe', async() => {
      const tutorData = {
        cpf: '12345678900',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue(null);
      mockAuthRepository.getUsuarioByEmail = jest.fn().mockResolvedValue({
        cpf: '98765432100',
        email: 'joao@email.com',
      });

      await expect(authService.registerTutor(tutorData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso para tutor', async() => {
      const loginData = {
        cpf: '12345678900',
        senha: 'senha123',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue({
        cpf: '12345678900',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'hashedPassword',
        tutor: {
          cpf: '12345678900',
          telefone: '61999999999',
          endereco: 'Rua X, 123',
        },
        funcionario: null,
      });
      (CryptoUtils.comparePassword as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(result.usuario.tipoUsuario).toBe('tutor');
      expect(result.permissoes.nivelAcesso).toBe(0);
      expect(result.token).toBeDefined();
    });

    it('deve lançar erro se usuário não existe', async() => {
      const loginData = {
        cpf: '12345678900',
        senha: 'senha123',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro se senha incorreta', async() => {
      const loginData = {
        cpf: '12345678900',
        senha: 'senhaErrada',
      };

      mockAuthRepository.getUsuarioByCpf = jest.fn().mockResolvedValue({
        cpf: '12345678900',
        senha: 'hashedPassword',
      });
      (CryptoUtils.comparePassword as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Senha incorreta');
    });
  });
});

