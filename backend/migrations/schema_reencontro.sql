-- =====================================================================
-- ReEncontro — Sistema de Achados e Perdidos do SESI Nova Odessa
-- Schema completo do banco de dados (MySQL 8+)
-- =====================================================================
-- Versão: 1.0
-- SGBD: MySQL 8.0 ou superior (requer suporte a JSON e CHECK constraints)
-- Charset: utf8mb4 (suporte completo a acentuação e emojis)
-- Convenção: snake_case, IDs BIGINT AUTO_INCREMENT, timestamps padrão
-- =====================================================================

-- ---------------------------------------------------------------------
-- Criação do banco
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS reencontro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE reencontro;


-- =====================================================================
-- BLOCO 1 — USUÁRIOS, RESPONSÁVEIS E ALUNOS
-- =====================================================================

-- ---------------------------------------------------------------------
-- users: tabela base de TODOS os usuários do sistema
-- Perfis: 'responsavel' (pais/mães), 'funcionaria' (inspetoras e diretora)
-- A diretora é uma funcionária com a flag is_diretora = TRUE
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  nome                VARCHAR(120)  NOT NULL,
  email               VARCHAR(160)  NOT NULL UNIQUE,
  senha_hash          VARCHAR(255)  NOT NULL,                  -- bcrypt
  telefone            VARCHAR(20)   NULL,                      -- opcional (RN-008)
  role                ENUM('responsavel','funcionaria') NOT NULL,
  is_diretora         BOOLEAN       NOT NULL DEFAULT FALSE,    -- só funcionária pode ser TRUE
  ativo               BOOLEAN       NOT NULL DEFAULT TRUE,
  email_verificado_em DATETIME      NULL,
  ultimo_login_em     DATETIME      NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_role  (role),
  INDEX idx_users_ativo (ativo),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- alunos: alunos vinculados a um responsável (N:1)
-- Um responsável pode ter vários alunos (irmãos)
-- ---------------------------------------------------------------------
CREATE TABLE alunos (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  responsavel_id  BIGINT        NOT NULL,                      -- FK para users (role=responsavel)
  nome            VARCHAR(120)  NOT NULL,
  sala            VARCHAR(20)   NOT NULL,                      -- "5B", "9A"
  periodo         ENUM('integral','manha','tarde') NOT NULL,
  ano_letivo      SMALLINT      NOT NULL,                      -- 2026
  ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_alunos_responsavel
    FOREIGN KEY (responsavel_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_alunos_responsavel (responsavel_id),
  INDEX idx_alunos_sala        (sala, periodo, ano_letivo)
) ENGINE=InnoDB;


-- =====================================================================
-- BLOCO 2 — TABELAS DE REFERÊNCIA (categorias e pontos de coleta)
-- =====================================================================

-- ---------------------------------------------------------------------
-- categorias: tipos de item (soft delete via 'ativo' - RN-017)
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  nome    VARCHAR(50)  NOT NULL UNIQUE,
  icone   VARCHAR(50)  NULL,                                   -- nome do ícone (frontend)
  ativo   BOOLEAN      NOT NULL DEFAULT TRUE,                  -- RN-017: nunca deletar, só inativar
  ordem   INT          NOT NULL DEFAULT 0,                     -- ordem de exibição

  INDEX idx_categorias_ativo (ativo)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- pontos_coleta: onde o item fica guardado (soft delete - RN-017)
-- ---------------------------------------------------------------------
CREATE TABLE pontos_coleta (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(80)   NOT NULL UNIQUE,
  descricao  VARCHAR(255)  NULL,
  ativo      BOOLEAN       NOT NULL DEFAULT TRUE,              -- RN-017

  INDEX idx_pontos_ativo (ativo)
) ENGINE=InnoDB;


-- =====================================================================
-- BLOCO 3 — ITENS E FOTOS
-- =====================================================================

-- ---------------------------------------------------------------------
-- itens: objetos encontrados
-- Fluxo de status: disponivel -> pendente -> em_processo -> entregue
--                  disponivel -> descartado (RN-012, após 90 dias)
-- ---------------------------------------------------------------------
CREATE TABLE itens (
  id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
  descricao               TEXT          NOT NULL,
  categoria_id            BIGINT        NOT NULL,
  local_encontrado        VARCHAR(120)  NOT NULL,              -- texto livre: "Pátio", "Sala 5B"
  ponto_coleta_id         BIGINT        NOT NULL,              -- onde está guardado
  data_encontrado         DATE          NOT NULL,
  data_disponibilizacao   DATE          NOT NULL,              -- p/ calcular 90 dias (RN-012)
  status                  ENUM('disponivel','pendente','em_processo','entregue','descartado')
                          NOT NULL DEFAULT 'disponivel',

  -- Rastreabilidade básica (sem tabela de logs)
  cadastrado_por_user_id  BIGINT        NOT NULL,              -- funcionária que cadastrou
  finalizado_por_user_id  BIGINT        NULL,                  -- funcionária que entregou/descartou
  finalizado_em           DATETIME      NULL,
  motivo_descarte         TEXT          NULL,                  -- justificativa do descarte (RN-012)

  -- Reversão de entrega (RN-015 - janela 24h)
  revertido_em            DATETIME      NULL,
  revertido_por_user_id   BIGINT        NULL,

  observacoes_internas    TEXT          NULL,                  -- notas privadas (não-públicas)
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_itens_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT fk_itens_ponto_coleta
    FOREIGN KEY (ponto_coleta_id) REFERENCES pontos_coleta(id),
  CONSTRAINT fk_itens_cadastrado_por
    FOREIGN KEY (cadastrado_por_user_id) REFERENCES users(id),
  CONSTRAINT fk_itens_finalizado_por
    FOREIGN KEY (finalizado_por_user_id) REFERENCES users(id),
  CONSTRAINT fk_itens_revertido_por
    FOREIGN KEY (revertido_por_user_id) REFERENCES users(id),

  INDEX idx_itens_status         (status),
  INDEX idx_itens_categoria      (categoria_id),
  INDEX idx_itens_ponto          (ponto_coleta_id),
  INDEX idx_itens_data           (data_encontrado),
  INDEX idx_itens_disponibiliz   (data_disponibilizacao),     -- p/ query dos 90 dias
  INDEX idx_itens_cadastrado_por (cadastrado_por_user_id)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- item_fotos: múltiplas fotos por item (1:N) — RN-006
-- ---------------------------------------------------------------------
CREATE TABLE item_fotos (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_id     BIGINT        NOT NULL,
  url         VARCHAR(500)  NOT NULL,                          -- URL do Cloudinary
  cloudinary_public_id VARCHAR(255) NULL,                      -- para deletar do Cloudinary
  ordem       INT           NOT NULL DEFAULT 0,
  is_capa     BOOLEAN       NOT NULL DEFAULT FALSE,            -- foto principal
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_fotos_item
    FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE CASCADE,

  INDEX idx_fotos_item (item_id, ordem)
) ENGINE=InnoDB;


-- =====================================================================
-- BLOCO 4 — REIVINDICAÇÕES ("É meu!")
-- =====================================================================

-- ---------------------------------------------------------------------
-- reivindicacoes: pedidos de "É meu!"
-- Os dados do requerente são um SNAPSHOT imutável (RN-018)
-- Fluxo: pendente -> aprovada -> entregue
--        pendente -> rejeitada
--        aprovada -> cancelada (após 7 dias sem retirada - RN-013)
-- ---------------------------------------------------------------------
CREATE TABLE reivindicacoes (
  id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
  item_id                BIGINT       NOT NULL,

  -- Quem reivindicou (logado OU anônimo)
  user_id                BIGINT       NULL,                    -- preenchido se logado
  aluno_id               BIGINT       NULL,                    -- aluno escolhido (se logado)

  -- SNAPSHOT dos dados no momento da reivindicação (RN-018 - imutável)
  -- Preenchidos SEMPRE, mesmo se logado, para histórico
  nome_requerente        VARCHAR(120) NOT NULL,
  email_requerente       VARCHAR(160) NOT NULL,
  telefone_requerente    VARCHAR(20)  NULL,                    -- opcional
  nome_aluno             VARCHAR(120) NOT NULL,
  sala_aluno             VARCHAR(20)  NOT NULL,
  periodo_aluno          ENUM('integral','manha','tarde') NOT NULL,

  -- Status (RN-002, RN-014, RN-016)
  status                 ENUM('pendente','aprovada','rejeitada','cancelada','entregue')
                         NOT NULL DEFAULT 'pendente',

  -- Auditoria do processamento (rastreabilidade básica)
  processado_por_user_id BIGINT       NULL,                    -- funcionária que aprovou/rejeitou
  processado_em          DATETIME     NULL,
  data_aprovacao         DATETIME     NULL,                    -- p/ calcular 7 dias (RN-013)
  motivo_rejeicao        TEXT         NULL,                    -- justificativa obrigatória (RN-014)
  observacoes            TEXT         NULL,

  created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_reiv_item
    FOREIGN KEY (item_id) REFERENCES itens(id),
  CONSTRAINT fk_reiv_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reiv_aluno
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE SET NULL,
  CONSTRAINT fk_reiv_processado_por
    FOREIGN KEY (processado_por_user_id) REFERENCES users(id),

  INDEX idx_reiv_status (status),
  INDEX idx_reiv_item   (item_id),
  INDEX idx_reiv_email  (email_requerente),
  INDEX idx_reiv_user   (user_id),
  INDEX idx_reiv_aprovacao (data_aprovacao)                   -- p/ query dos 7 dias
) ENGINE=InnoDB;


-- =====================================================================
-- BLOCO 5 — AUTENTICAÇÃO (reset de senha + refresh tokens)
-- =====================================================================

-- ---------------------------------------------------------------------
-- password_resets: tokens de redefinição de senha (RF-016, válido 1h)
-- ---------------------------------------------------------------------
CREATE TABLE password_resets (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT        NOT NULL,
  token_hash  VARCHAR(255)  NOT NULL,                          -- hash do token (nunca o token cru)
  expira_em   DATETIME      NOT NULL,                          -- created + 1h
  usado_em    DATETIME      NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_reset_token  (token_hash),
  INDEX idx_reset_expira (expira_em)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- refresh_tokens: tokens de renovação de sessão JWT
-- ---------------------------------------------------------------------
CREATE TABLE refresh_tokens (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT        NOT NULL,
  token_hash     VARCHAR(255)  NOT NULL,
  device_info    VARCHAR(255)  NULL,                           -- "Chrome / Windows"
  ip_emissao     VARCHAR(45)   NULL,                           -- IPv6 friendly
  expira_em      DATETIME      NOT NULL,
  revogado_em    DATETIME      NULL,
  ultimo_uso_em  DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refresh_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_refresh_user  (user_id),
  INDEX idx_refresh_token (token_hash)
) ENGINE=InnoDB;


-- =====================================================================
-- BLOCO 6 — NOTIFICAÇÕES (e-mail)
-- =====================================================================

-- ---------------------------------------------------------------------
-- notificacoes: fila de e-mails enviados pelo sistema (RN-010, RN-014)
-- ---------------------------------------------------------------------
CREATE TABLE notificacoes (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT        NULL,                        -- se destinatário tem conta
  email_destino     VARCHAR(160)  NOT NULL,
  tipo              VARCHAR(50)   NOT NULL,                    -- 'reivindicacao_recebida', etc
  assunto           VARCHAR(255)  NOT NULL,
  corpo             TEXT          NOT NULL,
  status            ENUM('pendente','enviada','falhou') NOT NULL DEFAULT 'pendente',
  tentativas        INT           NOT NULL DEFAULT 0,
  erro              TEXT          NULL,
  enviada_em        DATETIME      NULL,
  reivindicacao_id  BIGINT        NULL,                        -- se relacionada a reivindicação
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notif_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notif_reivindicacao
    FOREIGN KEY (reivindicacao_id) REFERENCES reivindicacoes(id) ON DELETE SET NULL,

  INDEX idx_notif_status (status),
  INDEX idx_notif_tipo   (tipo)
) ENGINE=InnoDB;


-- =====================================================================
-- SEED — Dados iniciais (categorias e pontos de coleta)
-- =====================================================================

INSERT INTO categorias (nome, icone, ordem) VALUES
  ('Eletrônico',       'smartphone', 1),
  ('Vestuário',        'shirt',      2),
  ('Acessório',        'watch',      3),
  ('Material Escolar', 'book-open',  4),
  ('Documento',        'file-text',  5),
  ('Outros',           'package',    6);

INSERT INTO pontos_coleta (nome, descricao) VALUES
  ('Mesa das Inspetoras', 'Recepção / inspetoria principal'),
  ('Almoxarifado',        'Para itens maiores ou volumosos'),
  ('Secretaria',          'Para documentos e itens de valor');

-- =====================================================================
-- FIM DO SCHEMA
-- =====================================================================
