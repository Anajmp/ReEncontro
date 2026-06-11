// =====================================================================
// Middlewares de autorização por perfil
// Use DEPOIS do authMiddleware (precisam de req.usuario).
// =====================================================================

// Permite apenas funcionárias (inspetoras e diretora)
export function apenasFuncionaria(req, res, next) {
  if (req.usuario?.role !== 'funcionaria') {
    return res.status(403).json({ erro: 'Acesso restrito a funcionárias' });
  }
  next();
}

// Permite apenas a diretora (funcionária com is_diretora = true)
export function apenasDiretora(req, res, next) {
  if (req.usuario?.role !== 'funcionaria' || !req.usuario?.is_diretora) {
    return res.status(403).json({ erro: 'Acesso restrito à diretora' });
  }
  next();
}
