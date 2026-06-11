// =====================================================================
// itensService — regras de negócio dos itens.
// Não conhece req/res (isso é do controller) nem escreve SQL (isso é
// do repository). Aqui ficam as regras e a orquestração.
// =====================================================================
import { itensRepository } from '../repositories/itensRepository.js';

export const itensService = {
  // Lista itens disponíveis aplicando os filtros recebidos
  async listarDisponiveis(filtros) {
    return itensRepository.findDisponiveis(filtros);
  },

  // Busca um item; lança erro 404 se não existir
  async buscarPorId(id) {
    const item = await itensRepository.findById(id);
    if (!item) {
      throw { status: 404, mensagem: 'Item não encontrado' };
    }
    return item;
  },

  // Cria um item com suas fotos.
  // RN-006: pelo menos uma foto é obrigatória.
  async criar(dados, fotos, cadastradoPorUserId) {
    if (!fotos || fotos.length === 0) {
      throw { status: 400, mensagem: 'Pelo menos uma foto é obrigatória' };
    }

    const itemId = await itensRepository.create({
      ...dados,
      cadastradoPorUserId,
    });

    // Salva cada foto; a primeira vira a capa
    for (let i = 0; i < fotos.length; i++) {
      await itensRepository.addFoto({
        itemId,
        url: fotos[i].path,             // URL devolvida pelo Cloudinary
        cloudinaryPublicId: fotos[i].filename,
        isCapa: i === 0,
        ordem: i,
      });
    }

    return itensRepository.findById(itemId);
  },
};
