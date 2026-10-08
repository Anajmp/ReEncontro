// =====================================================================
// googleAuthService — autenticação via Google (apenas responsáveis).
// =====================================================================
import { OAuth2Client } from 'google-auth-library';
import { authRepository } from '../repositories/authRepository.js';
import { gerarToken } from '../utils/tokens.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = {
  async entrar(credential) {
    // 1. Valida o token junto ao Google (nunca confiar cegamente no que vem do front)
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw { status: 401, mensagem: 'Não foi possível validar sua conta Google' };
    }

    const googleId = payload.sub;
    const email = payload.email;
    const nome = payload.name || email.split('@')[0];

    // 2. Já existe alguém com esse google_id? Então é login normal.
    let usuario = await authRepository.findByGoogleId(googleId);

    if (!usuario) {
      // 3. Não tem google_id, mas o e-mail já existe? Vincula as contas.
      const porEmail = await authRepository.findByEmail(email);

      if (porEmail) {
        // Funcionárias não usam login Google
        if (porEmail.role === 'funcionaria') {
          throw {
            status: 403,
            mensagem: 'Contas de funcionária devem entrar com e-mail e senha.',
          };
        }
        await authRepository.vincularGoogle(porEmail.id, googleId);
        usuario = await authRepository.findByGoogleId(googleId);
      } else {
        // 4. Ninguém encontrado: cria uma conta nova de responsável
        const avatarSeed = Math.random().toString(36).slice(2, 10);
        const novoId = await authRepository.criarResponsavelGoogle({
          nome, email, googleId, avatarSeed,
        });
        usuario = await authRepository.findByGoogleId(googleId);
      }
    }

    if (!usuario.ativo) {
      throw { status: 403, mensagem: 'Esta conta está desativada.' };
    }

    // 5. Gera o token da nossa aplicação
    const token = gerarToken({
      id: usuario.id,
      role: usuario.role,
      is_diretora: usuario.is_diretora,
    });

    await authRepository.updateUltimoLogin(usuario.id);

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        role: usuario.role,
        is_diretora: usuario.is_diretora,
        avatar_seed: usuario.avatar_seed,
        cadastro_completo: Boolean(usuario.cadastro_completo),
      },
    };
  },
};