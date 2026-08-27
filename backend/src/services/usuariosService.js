import bcrypt from "bcrypt";
import { usuariosRepository } from "../repositories/usuariosRepository.js";

export const usuariosService = {
  async listarFuncionarias() {
    return usuariosRepository.listarFuncionarias();
  },

  async criarFuncionaria(dados) {
    if (await usuariosRepository.emailExiste(dados.email)) {
      throw { status: 409, mensagem: "Este e-mail já está cadastrado" };
    }
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const id = await usuariosRepository.criarFuncionaria({
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      telefone: dados.telefone,
      isDiretora: dados.is_diretora ?? false,
    });
    return { id };
  },

  async atualizarFuncionaria(id, dados) {
    const ok = await usuariosRepository.atualizarFuncionaria(id, {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      isDiretora: dados.is_diretora ?? false,
    });
    if (!ok) throw { status: 404, mensagem: "Funcionária não encontrada" };
    return { id };
  },

  async alterarStatus(id, ativo, quemFezId) {
    // Proteção: a diretora não pode desativar a própria conta
    if (Number(id) === Number(quemFezId) && !ativo) {
      throw {
        status: 400,
        mensagem: "Você não pode desativar a sua própria conta",
      };
    }
    const ok = await usuariosRepository.alterarStatus(id, ativo);
    if (!ok) throw { status: 404, mensagem: "Funcionária não encontrada" };
    return { id, ativo };
  },

  async alterarSenha(userId, senhaAtual, novaSenha) {
    const hashAtual = await usuariosRepository.buscarSenhaHash(userId);
    if (!hashAtual) {
      throw { status: 404, mensagem: "Usuário não encontrado" };
    }

    // Confere a senha atual antes de permitir a troca
    const confere = await bcrypt.compare(senhaAtual, hashAtual);
    if (!confere) {
      throw { status: 401, mensagem: "A senha atual está incorreta" };
    }

    if (novaSenha.length < 6) {
      throw {
        status: 400,
        mensagem: "A nova senha deve ter ao menos 6 caracteres",
      };
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);
    await usuariosRepository.atualizarSenha(userId, novoHash);

    return { mensagem: "Senha alterada com sucesso" };
  },

  async atualizarPerfil(userId, dados) {
    if (await usuariosRepository.emailEmUsoPorOutro(dados.email, userId)) {
      throw { status: 409, mensagem: "Este e-mail já está em uso" };
    }
    await usuariosRepository.atualizarPerfil(userId, dados);
    return { mensagem: "Dados atualizados" };
  },
};
