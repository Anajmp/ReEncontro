// =====================================================================
// lgpdController — anonimização de dados a pedido do titular (RN-008).
// =====================================================================
import { lgpdService } from "../services/lgpdService.js";

export const lgpdController = {
  // GET /api/lgpd/buscar?email=...
  async buscar(req, res, next) {
    try {
      const { email } = req.query;
      if (!email) {
        throw { status: 400, mensagem: "Informe o e-mail do responsável" };
      }
      const usuario = await lgpdService.buscar(String(email));
      res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/lgpd/anonimizar
  async anonimizar(req, res, next) {
    try {
      const { email, confirmacao } = req.body;
      if (!email) {
        throw { status: 400, mensagem: "Informe o e-mail do responsável" };
      }
      // Dupla confirmação: o e-mail digitado precisa bater exatamente
      if (confirmacao !== email) {
        throw {
          status: 400,
          mensagem: "A confirmação não confere com o e-mail informado",
        };
      }
      const resultado = await lgpdService.anonimizar(email);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
