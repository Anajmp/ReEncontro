-- Cria a tabela de refresh tokens (bancos criados antes dela entrar no schema).
-- Mesma definição de schema_reencontro.sql; IF NOT EXISTS torna seguro rodar
-- de novo em um banco que já tenha a tabela.
-- Guardamos apenas o hash SHA-256 do token, nunca o valor puro.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT        NOT NULL,
  token_hash     VARCHAR(255)  NOT NULL,
  device_info    VARCHAR(255)  NULL,
  ip_emissao     VARCHAR(45)   NULL,
  expira_em      DATETIME      NOT NULL,
  revogado_em    DATETIME      NULL,
  ultimo_uso_em  DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_refresh_user  (user_id),
  INDEX idx_refresh_token (token_hash)
) ENGINE=InnoDB;
