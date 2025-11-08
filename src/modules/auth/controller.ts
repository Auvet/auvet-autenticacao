import { Request, Response, Router } from 'express';
import { AuthService } from './service';
import { AuthRepository } from './repository';
import { ApiResponse, RegisterTutorRequest, RegisterFuncionarioRequest, LoginRequest } from '../../types';

export class AuthController {
  private authService: AuthService;
  public router: Router;

  constructor() {
    const authRepository = new AuthRepository();
    this.authService = new AuthService(authRepository);
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/register/tutor', this.registerTutor.bind(this));
    this.router.post('/register/funcionario', this.registerFuncionario.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/validatetoken', this.validateToken.bind(this));
    this.router.get('/usuarios/:cpf', this.getUsuarioByCpf.bind(this));
  }

  async registerTutor(req: Request, res: Response): Promise<void> {
    try {
      const tutorData: RegisterTutorRequest = req.body;

      const result = await this.authService.registerTutor(tutorData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Tutor cadastrado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      };

      const statusCode = error instanceof Error && error.message.includes('já cadastrado')
        ? 409
        : 400;

      res.status(statusCode).json(response);
    }
  }

  async registerFuncionario(req: Request, res: Response): Promise<void> {
    try {
      const funcionarioData: RegisterFuncionarioRequest = req.body;

      const result = await this.authService.registerFuncionario(funcionarioData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Funcionário cadastrado com sucesso',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      };

      const statusCode = error instanceof Error && error.message.includes('já cadastrado')
        ? 409
        : 400;

      res.status(statusCode).json(response);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      const result = await this.authService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Login realizado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      };

      const statusCode = error instanceof Error &&
        (error.message.includes('não encontrado') ||
         error.message.includes('incorreta') ||
         error.message.includes('inativo'))
        ? 401
        : 400;

      res.status(statusCode).json(response);
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        const response: ApiResponse = {
          success: false,
          error: 'Token não fornecido',
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.authService.validateToken(token);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Token válido',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Token inválido',
      };

      res.status(401).json(response);
    }
  }

  async getUsuarioByCpf(req: Request, res: Response): Promise<void> {
    const cpfParam = req.params?.['cpf'];

    if (typeof cpfParam !== 'string' || !cpfParam.trim()) {
      const response: ApiResponse = {
        success: false,
        error: 'CPF não fornecido',
      };

      res.status(400).json(response);
      return;
    }

    try {
      const result = await this.authService.getUsuarioByCpf(cpfParam);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Usuário encontrado com sucesso',
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
      };

      const statusCode = error instanceof Error && error.message.includes('não encontrado')
        ? 404
        : 400;

      res.status(statusCode).json(response);
    }
  }
}

export default new AuthController();

