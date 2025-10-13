export interface Usuario {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  dataCadastro: Date;
}

export interface Funcionario {
  cpf: string;
  cargo: string;
  registroProfissional: string | null;
  status: string;
  nivelAcesso: number;
}

export interface Tutor {
  cpf: string;
  telefone: string | null;
  endereco: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RegisterTutorRequest {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
}

export interface RegisterFuncionarioRequest {
  cpf: string;
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  registroProfissional?: string;
  nivelAcesso?: number;
}

export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    cpf: string;
    nome: string;
    email: string;
    tipoUsuario: 'tutor' | 'funcionario';
    dadosAdicionais: TutorDados | FuncionarioDados;
  };
  permissoes: Permissoes;
}

export interface TutorDados {
  telefone: string | null;
  endereco: string | null;
}

export interface FuncionarioDados {
  cargo: string;
  registroProfissional: string | null;
  status: string;
}

export interface Permissoes {
  nivelAcesso: number;
  podeVerTodosAnimais: boolean;
  podeGerenciarConsultas: boolean;
}

export interface TokenPayload {
  cpf: string;
  email: string;
  tipoUsuario: 'tutor' | 'funcionario';
  nivelAcesso: number;
}

export interface ValidateTokenResponse {
  cpf: string;
  nome: string;
  email: string;
  tipoUsuario: 'tutor' | 'funcionario';
  nivelAcesso: number;
}

