// =====================================================================
// Tratamento central de erros
// Captura erros lançados em qualquer controller (via next(err))
// e devolve uma resposta JSON padronizada.
// =====================================================================
import { ZodError } from 'zod';

export function errorMiddleware(err, req, res, _next) {
  // Erro de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.errors.map((e) => ({
        campo: e.path.join('.'),
        mensagem: e.message,
      })),
    });
  }

  // Erro de negócio com status definido (ex: throw { status: 404, mensagem: '...' })
  // "extra" leva campos que o front precisa para reagir (ex.: { codigo: 'codigo_expirado' })
  if (err.status) {
    return res.status(err.status).json({ erro: err.mensagem, ...err.extra });
  }

  // Erro não tratado — loga e devolve 500 genérico
  console.error('Erro não tratado:', err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}
