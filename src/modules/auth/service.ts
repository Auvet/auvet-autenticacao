import { AuthRepository } from './repository';
import { CryptoUtils } from '../../utils/crypto';
import { JwtUtils } from '../../utils/jwt';
import { AuthValidator } from '../../utils/validators';
import {
  RegisterTutorRequest,
  RegisterFuncionarioRequest,
  LoginRequest,
  LoginResponse,
  ValidateTokenResponse,
  TokenPayload,
  TutorDados,
  FuncionarioDados,
  Permissoes,
} from '../../types';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository?: AuthRepository) {
    this.authRepository = authRepository || new AuthRepository();
  }

  async registerTutor(data: RegisterTutorRequest): Promise<{ cpf: string; nome: string; email: string; tipoUsuario: string }> {
    console.log(`Registrando tutor: ${data.cpf}`);

    const validation = AuthValidator.validateRegisterTutor(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingUser = await this.authRepository.getUsuarioByCpf(data.cpf);
    if (existingUser) {
      throw new Error('Usuário já cadastrado com este CPF');
    }

    const existingEmail = await this.authRepository.getUsuarioByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await CryptoUtils.hashPassword(data.senha);

    const result = await this.authRepository.createUsuarioWithTutor(data, hashedPassword);

    console.log(`Tutor registrado com sucesso: ${result.usuario.cpf}`);

    return {
      cpf: result.usuario.cpf,
      nome: result.usuario.nome,
      email: result.usuario.email,
      tipoUsuario: 'tutor',
    };
  }

  async registerFuncionario(data: RegisterFuncionarioRequest): Promise<{ cpf: string; nome: string; email: string; tipoUsuario: string }> {
    console.log(`Registrando funcionário: ${data.cpf}`);

    const validation = AuthValidator.validateRegisterFuncionario(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingUser = await this.authRepository.getUsuarioByCpf(data.cpf);
    if (existingUser) {
      throw new Error('Usuário já cadastrado com este CPF');
    }

    const existingEmail = await this.authRepository.getUsuarioByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await CryptoUtils.hashPassword(data.senha);

    const result = await this.authRepository.createUsuarioWithFuncionario(data, hashedPassword);

    console.log(`Funcionário registrado com sucesso: ${result.usuario.cpf}`);

    return {
      cpf: result.usuario.cpf,
      nome: result.usuario.nome,
      email: result.usuario.email,
      tipoUsuario: 'funcionario',
    };
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    console.log(`Tentativa de login: ${loginData.cpf}`);

    if (!loginData.cpf || !loginData.senha) {
      throw new Error('CPF e senha são obrigatórios');
    }

    const usuario = await this.authRepository.getUsuarioByCpf(loginData.cpf);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const isValidPassword = await CryptoUtils.comparePassword(loginData.senha, usuario.senha);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }

    let tipoUsuario: 'tutor' | 'funcionario';
    let dadosAdicionais: TutorDados | FuncionarioDados;
    let permissoes: Permissoes;

    if (usuario.funcionario) {
      if (usuario.funcionario.status !== 'ativo') {
        throw new Error('Funcionário inativo');
      }

      tipoUsuario = 'funcionario';
      dadosAdicionais = {
        cargo: usuario.funcionario.cargo,
        registroProfissional: usuario.funcionario.registroProfissional,
        status: usuario.funcionario.status,
      };
      permissoes = {
        nivelAcesso: usuario.funcionario.nivelAcesso,
        podeVerTodosAnimais: true,
        podeGerenciarConsultas: true,
      };
    } else if (usuario.tutor) {
      tipoUsuario = 'tutor';
      dadosAdicionais = {
        telefone: usuario.tutor.telefone,
        endereco: usuario.tutor.endereco,
      };
      permissoes = {
        nivelAcesso: 0,
        podeVerTodosAnimais: false,
        podeGerenciarConsultas: false,
      };
    } else {
      throw new Error('Usuário não possui perfil de tutor ou funcionário');
    }

    const tokenPayload: TokenPayload = {
      cpf: usuario.cpf,
      email: usuario.email,
      tipoUsuario,
      nivelAcesso: permissoes.nivelAcesso,
    };

    const token = JwtUtils.generateToken(tokenPayload);

    console.log(`Login realizado com sucesso: ${usuario.cpf}`);

    return {
      token,
      usuario: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario,
        dadosAdicionais,
      },
      permissoes,
    };
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    console.log('Validando token');

    if (!token) {
      throw new Error('Token não fornecido');
    }

    const decoded = JwtUtils.verifyToken(token);

    const usuario = await this.authRepository.getUsuarioByCpf(decoded.cpf);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (usuario.funcionario && usuario.funcionario.status !== 'ativo') {
      throw new Error('Funcionário inativo');
    }

    console.log('Token válido');

    return {
      cpf: usuario.cpf,
      nome: usuario.nome,
      email: usuario.email,
      tipoUsuario: decoded.tipoUsuario,
      nivelAcesso: decoded.nivelAcesso,
    };
  }
}

export default new AuthService();

