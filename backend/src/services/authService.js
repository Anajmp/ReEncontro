// =====================================================================
// authService — regras de negócio da autenticação.
// =====================================================================
import bcrypt from "bcrypt";
import { authRepository } from "../repositories/authRepository.js";
import { gerarToken } from "../utils/tokens.js";

export const authService = {
  async login(email, senha) {
    // 1. Busca o usuário pelo email
    const usuario = await authRepository.findByEmail(email);

    // 2. Se não existe, erro genérico (não revela se o email existe)
    if (!usuario) {
      throw { status: 401, mensagem: "E-mail ou senha inválidos" };
    }

    // 3. Verifica se a conta está ativa
    if (!usuario.ativo) {
      throw {
        status: 403,
        mensagem: "Conta desativada. Contate a administração.",
      };
    }

    // 4. Compara a senha enviada com o hash salvo no banco
    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaConfere) {
      throw { status: 401, mensagem: "E-mail ou senha inválidos" };
    }

    // 5. Gera o token JWT com os dados essenciais do usuário
    const token = gerarToken({
      id: usuario.id,
      role: usuario.role,
      is_diretora: usuario.is_diretora,
    });

    // 6. Registra o último login (não bloqueia a resposta se falhar)
    await authRepository.updateUltimoLogin(usuario.id);

    // 7. Devolve o token + dados públicos do usuário (nunca o senha_hash!)
    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        is_diretora: usuario.is_diretora,
      },
    };
  },

  async registrar({ nome, email, senha, telefone, alunos }) {
    // 1. Verifica se o email já está em uso
    const jaExiste = await authRepository.emailExiste(email);
    if (jaExiste) {
      throw { status: 409, mensagem: "Este e-mail já está cadastrado" };
    }

    // 2. Precisa ter pelo menos um aluno
    if (!alunos || alunos.length === 0) {
      throw { status: 400, mensagem: "Cadastre ao menos um aluno" };
    }

    // 3. Criptografa a senha (10 rounds de salt — padrão seguro)
    const senhaHash = await bcrypt.hash(senha, 10);

    // 4. Cria o responsável + alunos (transação)
    const responsavelId = await authRepository.criarResponsavelComAlunos({
      nome,
      email,
      senhaHash,
      telefone,
      alunos,
    });

    // 5. Já gera um token pra logar automaticamente após o cadastro
    const token = gerarToken({
      id: responsavelId,
      role: "responsavel",
      is_diretora: false,
    });

    return {
      token,
      usuario: { id: responsavelId, nome, email, role: "responsavel" },
    };
  },
};
