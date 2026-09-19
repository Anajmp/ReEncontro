// =====================================================================
// authService — regras de negócio da autenticação.
//
// O login utiliza a entidade de domínio Usuario, que encapsula a
// verificação de senha e as regras de perfil. Assim o hash da senha
// não circula fora da classe.
// =====================================================================
import bcrypt from "bcrypt";
import { authRepository } from "../repositories/authRepository.js";
import { gerarToken } from "../utils/tokens.js";
import { Usuario } from "../models/Usuario.js";

export const authService = {
  async login(email, senha) {
    // 1. Busca a linha do usuário no banco
    const linha = await authRepository.findByEmail(email);

    // 2. Se não existe, erro genérico (não revela se o e-mail está cadastrado)
    if (!linha) {
      throw { status: 401, mensagem: "E-mail ou senha inválidos" };
    }

    // 3. Monta a entidade de domínio a partir dos dados brutos
    const usuario = new Usuario(linha);

    // 4. A própria entidade responde se a conta pode autenticar
    if (!usuario.podeAutenticar()) {
      throw {
        status: 403,
        mensagem: "Conta desativada. Contate a administração.",
      };
    }

    // 5. A comparação com o hash acontece dentro da classe
    const senhaConfere = await usuario.verificarSenha(senha);
    if (!senhaConfere) {
      throw { status: 401, mensagem: "E-mail ou senha inválidos" };
    }

    // 6. Gera o token JWT com os dados essenciais
    const token = gerarToken({
      id: usuario.id,
      role: usuario.role,
      is_diretora: usuario.isDiretora,
    });

    // 7. Registra o último acesso
    await authRepository.updateUltimoLogin(usuario.id);

    // 8. paraResposta() garante que o hash da senha nunca seja exposto
    return { token, usuario: usuario.paraResposta() };
  },

  async registrar({ nome, email, senha, telefone, alunos }) {
    // Gera um seed aleatório para o avatar
    const avatarSeed = Math.random().toString(36).slice(2, 10);

    // 1. Verifica se o e-mail já está em uso
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

    // 4. Cria o responsável + alunos (transação atômica)
    const responsavelId = await authRepository.criarResponsavelComAlunos({
      nome,
      email,
      senhaHash,
      telefone,
      alunos,
      avatarSeed,
    });

    // 5. Já gera um token para logar automaticamente após o cadastro
    const token = gerarToken({
      id: responsavelId,
      role: "responsavel",
      is_diretora: false,
    });

    return {
      token,
      usuario: {
        id: responsavelId,
        nome,
        email,
        telefone: telefone ?? null,
        role: "responsavel",
        is_diretora: false,
        avatar_seed: avatarSeed,
        cadastro_completo: true,
      },
    };
  },
};