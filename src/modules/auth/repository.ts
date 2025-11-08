import prisma from '../../config/database';
import { Usuario, Funcionario, Tutor, RegisterTutorRequest, RegisterFuncionarioRequest } from '../../types';

export class AuthRepository {
  async createUsuarioWithTutor(data: RegisterTutorRequest, hashedPassword: string): Promise<{ usuario: Usuario; tutor: Tutor }> {
    const cleanCpf = data.cpf.replace(/[^\d]/g, '');

    if (!data.clinicas || data.clinicas.length === 0) {
      throw new Error('Tutor deve estar vinculado a pelo menos uma clínica');
    }

    const result = await prisma.$transaction(async(tx: any) => {
      const usuario = await tx.usuario.create({
        data: {
          cpf: cleanCpf,
          nome: data.nome,
          email: data.email,
          senha: hashedPassword,
        },
      });

      const tutor = await tx.tutor.create({
        data: {
          cpf: cleanCpf,
          telefone: data.telefone || null,
          endereco: data.endereco || null,
        },
      });

      // Vincular tutor às clínicas fornecidas
      for (const clinicaCnpj of data.clinicas) {
        await tx.tutorClinica.create({
          data: {
            tutorCpf: cleanCpf,
            clinicaCnpj,
          },
        });
      }

      return { usuario, tutor };
    });

    return result;
  }

  async createUsuarioWithFuncionario(data: RegisterFuncionarioRequest, hashedPassword: string): Promise<{ usuario: Usuario; funcionario: Funcionario }> {
    const cleanCpf = data.cpf.replace(/[^\d]/g, '');

    const result = await prisma.$transaction(async(tx: any) => {
      const usuario = await tx.usuario.create({
        data: {
          cpf: cleanCpf,
          nome: data.nome,
          email: data.email,
          senha: hashedPassword,
        },
      });

      const funcionario = await tx.funcionario.create({
        data: {
          cpf: cleanCpf,
          cargo: data.cargo,
          registroProfissional: data.registroProfissional || null,
          nivelAcesso: data.nivelAcesso || 1,
          status: 'ativo',
        },
      });

      return { usuario, funcionario };
    });

    return result;
  }

  async getUsuarioByCpf(cpf: string): Promise<any> {
    const cleanCpf = cpf.replace(/[^\d]/g, '');

    const usuario = await prisma.usuario.findUnique({
      where: { cpf: cleanCpf },
      include: {
        tutor: true,
        funcionario: true,
      },
    });

    return usuario;
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    return usuario;
  }

  async getTutorByCpf(cpf: string): Promise<Tutor | null> {
    const cleanCpf = cpf.replace(/[^\d]/g, '');

    const tutor = await prisma.tutor.findUnique({
      where: { cpf: cleanCpf },
    });

    return tutor;
  }

  async getFuncionarioByCpf(cpf: string): Promise<Funcionario | null> {
    const cleanCpf = cpf.replace(/[^\d]/g, '');

    const funcionario = await prisma.funcionario.findUnique({
      where: { cpf: cleanCpf },
    });

    return funcionario;
  }
}

export default new AuthRepository();

