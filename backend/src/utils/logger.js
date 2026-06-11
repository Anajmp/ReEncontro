// =====================================================================
// Logger (pino)
// Use no lugar de console.log para logs estruturados.
// =====================================================================
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});
