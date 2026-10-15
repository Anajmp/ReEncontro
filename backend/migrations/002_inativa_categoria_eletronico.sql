-- Remove a categoria "Eletrônico" das listagens.
-- RN-017: categorias nunca são deletadas, apenas inativadas.
UPDATE categorias SET ativo = 0 WHERE nome LIKE 'Eletr%nico%';
