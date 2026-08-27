import { lgpdRepository } from "../repositories/lgpdRepository.js";

export const lgpdService = {
  async buscar(email) {
    const usuario = await lgpdRepository.buscarResponsavel(email);
    if (!usuario) {
      throw {
        status: 404,
        mensagem: "Nenhum responsável encontrado com este e-mail",
      };
    }
    if (!usuario.ativo) {
      throw {
        status: 409,
        mensagem: "Esta conta já foi anonimizada ou está inativa",
      };
    }
    return usuario;
  },

  async anonimizar(email) {
    // Valida antes de executar (reaproveita as checagens acima)
    const usuario = await this.buscar(email);
    await lgpdRepository.anonimizar(usuario.id);
    return {
      mensagem: `Dados de ${usuario.nome} foram anonimizados com sucesso.`,
    };
  },
};
