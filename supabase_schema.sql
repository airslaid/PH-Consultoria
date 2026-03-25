-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  contato TEXT,
  valor_hora_padrao NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Projetos
CREATE TABLE IF NOT EXISTS projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  escopo TEXT,
  valor_hora NUMERIC DEFAULT 0,
  tipo_faturamento TEXT DEFAULT 'Hora' CHECK (tipo_faturamento IN ('Hora', 'Fixo')),
  valor_mensal NUMERIC DEFAULT 0,
  duracao_meses INTEGER DEFAULT 0,
  data_inicio_faturamento TEXT, -- YYYY-MM
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Concluido', 'Pausado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Usuários (Acessos)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  role TEXT DEFAULT 'CLIENTE' CHECK (role IN ('ADMIN', 'CLIENTE')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Demandas
CREATE TABLE IF NOT EXISTS demandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Nova' CHECK (status IN ('Nova', 'Aguardando Aprovação', 'Aprovada', 'Em Andamento', 'Concluída')),
  horas_estimadas NUMERIC,
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Apontamentos (Horas)
CREATE TABLE IF NOT EXISTS apontamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horas NUMERIC NOT NULL,
  descricao TEXT,
  faturado BOOLEAN DEFAULT FALSE,
  mes_fechamento TEXT, -- YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Faturamentos (Controle mensal por projeto)
CREATE TABLE IF NOT EXISTS faturamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  mes TEXT NOT NULL, -- YYYY-MM
  valor NUMERIC NOT NULL,
  faturado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(projeto_id, mes)
);

-- 7. Tabela de Etapas (Cronograma/Gantt)
CREATE TABLE IF NOT EXISTS etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID REFERENCES projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Andamento', 'Concluido')),
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir Usuário Administrador Padrão
INSERT INTO usuarios (nome, email, senha, role)
VALUES ('Patrick Admin', 'patrick@phconsultoria.com.br', '1234', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
