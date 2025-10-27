export class AuthValidator {
  static validateCpf(cpf: string): boolean {
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    if (cleanCpf.length !== 11) {
      return false;
    }
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      return false;
    }
    return true;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Senha deve ter no mínimo 6 caracteres');
    }

    if (password.length > 255) {
      errors.push('Senha deve ter no máximo 255 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateRegisterTutor(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.cpf) {
      errors.push('CPF é obrigatório');
    } else if (!this.validateCpf(data.cpf)) {
      errors.push('CPF inválido');
    }

    if (!data.nome || data.nome.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (!this.validateEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.senha) {
      errors.push('Senha é obrigatória');
    } else {
      const passwordValidation = this.validatePassword(data.senha);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (!data.clinicas || !Array.isArray(data.clinicas) || data.clinicas.length === 0) {
      errors.push('Tutor deve estar vinculado a pelo menos uma clínica');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateRegisterFuncionario(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.cpf) {
      errors.push('CPF é obrigatório');
    } else if (!this.validateCpf(data.cpf)) {
      errors.push('CPF inválido');
    }

    if (!data.nome || data.nome.trim() === '') {
      errors.push('Nome é obrigatório');
    }

    if (!data.email) {
      errors.push('Email é obrigatório');
    } else if (!this.validateEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.senha) {
      errors.push('Senha é obrigatória');
    } else {
      const passwordValidation = this.validatePassword(data.senha);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (!data.cargo || data.cargo.trim() === '') {
      errors.push('Cargo é obrigatório');
    }

    if (data.nivelAcesso !== undefined && (data.nivelAcesso < 0 || data.nivelAcesso > 10)) {
      errors.push('Nível de acesso deve estar entre 0 e 10');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

