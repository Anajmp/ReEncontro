-- Adiciona coluna nome em itens (banco já existente).
-- Preenche com o início da descrição nos registros antigos.

ALTER TABLE itens
  ADD COLUMN nome VARCHAR(120) NULL AFTER id;

UPDATE itens
SET nome = LEFT(descricao, 120)
WHERE nome IS NULL OR nome = '';

ALTER TABLE itens
  MODIFY COLUMN nome VARCHAR(120) NOT NULL;
