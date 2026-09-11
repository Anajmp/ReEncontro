// =====================================================================
// completarCadastroService — finaliza o cadastro de quem entrou pelo Google.
// =====================================================================
import bcrypt from "bcrypt";
import { alunosRepository } from "../repositories/alunosRepository.js";
import { authRepository } from "../repositories/authRepository.js";
import { usuariosRepository } from "../repositories/usuariosRepository.js";

export const completarCadastroService = {
  async completar(userId, dados) {
    // 1. Cadastra o primeiro aluno
    await alunosRepository.criar(userId, {
      nome: dados.aluno_nome,
      sala: dados.aluno_sala,
      periodo: dados.aluno_periodo,
      anoLetivo: dados.aluno_ano_letivo ?? new Date().getFullYear(),
    });

    // 2. Atualiza o telefone, se informado
    if (dados.telefone) {
      await usuariosRepository.atualizarTelefone(userId, dados.telefone);
    }

    // 3. Define uma senha, se a pessoa quiser poder entrar sem o Google
    if (dados.senha) {
      if (dados.senha.length < 6) {
        throw {
          status: 400,
          mensagem: "A senha deve ter ao menos 6 caracteres",
        };
      }
      const hash = await bcrypt.hash(dados.senha, 10);
      await usuariosRepository.atualizarSenha(userId, hash);
    }

    // 4. Marca o cadastro como completo
    await authRepository.marcarCadastroCompleto(userId);

    return { mensagem: "Cadastro concluído com sucesso!" };
  },
};
