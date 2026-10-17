-- Verificação de e-mail por código de 6 dígitos (banco já existente).
-- Mesmo desenho da password_resets: guardamos apenas o HASH do código.
-- A coluna users.email_verificado_em já existe e não é alterada aqui.

CREATE TABLE IF NOT EXISTS email_verificacoes (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT        NOT NULL,
  codigo_hash  VARCHAR(255)  NOT NULL,                         -- hash do código (nunca o código cru)
  expira_em    DATETIME      NOT NULL,                         -- created + 15 min
  usado_em     DATETIME      NULL,                             -- usado, substituído ou queimado
  tentativas   INT           NOT NULL DEFAULT 0,               -- tentativas erradas (máx. 5)
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_verif_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_verif_user   (user_id),
  INDEX idx_verif_expira (expira_em)
) ENGINE=InnoDB;
