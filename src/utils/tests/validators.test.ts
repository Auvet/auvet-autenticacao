import { AuthValidator } from '../validators';

describe('AuthValidator', () => {
  describe('validateCpf', () => {
    it('deve validar CPF correto', () => {
      expect(AuthValidator.validateCpf('12345678900')).toBe(true);
    });

    it('deve rejeitar CPF com menos de 11 dígitos', () => {
      expect(AuthValidator.validateCpf('123')).toBe(false);
    });

    it('deve rejeitar CPF com dígitos repetidos', () => {
      expect(AuthValidator.validateCpf('11111111111')).toBe(false);
    });

    it('deve aceitar CPF com formatação', () => {
      expect(AuthValidator.validateCpf('123.456.789-00')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('deve validar email correto', () => {
      expect(AuthValidator.validateEmail('usuario@email.com')).toBe(true);
    });

    it('deve rejeitar email sem @', () => {
      expect(AuthValidator.validateEmail('usuarioemail.com')).toBe(false);
    });

    it('deve rejeitar email sem domínio', () => {
      expect(AuthValidator.validateEmail('usuario@')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha com 6 caracteres', () => {
      const result = AuthValidator.validatePassword('senha1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const result = AuthValidator.validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('mínimo 6 caracteres');
    });

    it('deve rejeitar senha muito longa', () => {
      const longPassword = 'a'.repeat(256);
      const result = AuthValidator.validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('máximo 255 caracteres');
    });
  });

  describe('validateRegisterTutor', () => {
    it('deve validar dados corretos de tutor', () => {
      const data = {
        cpf: '12345678900',
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123',
        clinicas: ['12345678000190'],
      };

      const result = AuthValidator.validateRegisterTutor(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar tutor sem nome', () => {
      const data = {
        cpf: '12345678900',
        nome: '',
        clinicas: ['12345678000190'],
        email: 'joao@email.com',
        senha: 'senha123',
      };

      const result = AuthValidator.validateRegisterTutor(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
    });
  });

  describe('validateRegisterFuncionario', () => {
    it('deve validar dados corretos de funcionário', () => {
      const data = {
        cpf: '12345678900',
        nome: 'Maria Santos',
        email: 'maria@email.com',
        senha: 'senha456',
        cargo: 'Veterinária',
      };

      const result = AuthValidator.validateRegisterFuncionario(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar funcionário sem cargo', () => {
      const data = {
        cpf: '12345678900',
        nome: 'Maria Santos',
        email: 'maria@email.com',
        senha: 'senha456',
        cargo: '',
      };

      const result = AuthValidator.validateRegisterFuncionario(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cargo é obrigatório');
    });

    it('deve rejeitar nível de acesso inválido', () => {
      const data = {
        cpf: '12345678900',
        nome: 'Maria Santos',
        email: 'maria@email.com',
        senha: 'senha456',
        cargo: 'Veterinária',
        nivelAcesso: 15,
      };

      const result = AuthValidator.validateRegisterFuncionario(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nível de acesso deve estar entre 0 e 10');
    });
  });
});

