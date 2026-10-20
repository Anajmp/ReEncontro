-- Índices compostos para as listagens paginadas (banco já existente).
-- GET /api/itens filtra por status = 'disponivel' e ordena por
-- data_encontrado; GET /api/itens/finalizados filtra por status e ordena
-- por finalizado_em. Com o índice composto o MySQL lê a página já na
-- ordem certa, sem ordenar a tabela inteira a cada requisição.
-- Os índices antigos de coluna única (idx_itens_status, idx_itens_data)
-- continuam: a FK e outras consultas ainda podem usá-los.

CREATE INDEX idx_itens_status_data       ON itens (status, data_encontrado);
CREATE INDEX idx_itens_status_finalizado ON itens (status, finalizado_em);
