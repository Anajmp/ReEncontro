// =====================================================================
// alunosService — regras de negócio dos alunos.
// =====================================================================
import { alunosRepository } from "../repositories/alunosRepository.js";
import { authRepository } from "../repositories/authRepository.js";

export const alunosService = {
  async listarMeus(responsavelId) {
    return alunosRepository.listarPorResponsavel(responsavelId);
  },

  async criar(responsavelId, dados) {
    const alunoId = await alunosRepository.criar(responsavelId, {
      nome: dados.nome,
      sala: dados.sala,
      periodo: dados.periodo,
      anoLetivo: dados.ano_letivo,
    });

    // Ao cadastrar o primeiro aluno, o cadastro passa a ser completo
    await authRepository.marcarCadastroCompleto(responsavelId);

    return { id: alunoId };
  },

  async atualizar(alunoId, responsavelId, dados) {
    const ok = await alunosRepository.atualizar(alunoId, responsavelId, {
      nome: dados.nome,
      sala: dados.sala,
      periodo: dados.periodo,
      anoLetivo: dados.ano_letivo,
    });
    if (!ok) {
      throw {
        status: 404,
        mensagem: "Aluno não encontrado ou não pertence a você",
      };
    }
    return { id: alunoId };
  },
};
