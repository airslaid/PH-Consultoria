export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  contato: string;
  valor_hora_padrao: number;
}

export interface Projeto {
  id: string;
  cliente_id: string;
  nome: string;
  escopo: string;
  valor_hora: number;
  tipo_faturamento: 'Hora' | 'Fixo';
  valor_mensal?: number; // Se for Fixo
  duracao_meses?: number; // Se for Fixo
  data_inicio_faturamento?: string; // YYYY-MM
  status: 'Ativo' | 'Concluido' | 'Pausado';
}

export interface Apontamento {
  id: string;
  projeto_id: string;
  data: string; // YYYY-MM-DD
  horas: number;
  descricao: string;
  faturado: boolean;
  mes_fechamento?: string; // YYYY-MM (match snake_case)
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  role: 'ADMIN' | 'CLIENTE';
  cliente_id?: string; // ID do Cliente vinculado, se for perfil CLIENTE
}

export type DemandaStatus = 'Nova' | 'Aguardando Aprovação' | 'Aprovada' | 'Em Andamento' | 'Concluída';

export interface Demanda {
  id: string;
  titulo: string;
  descricao: string;
  cliente_id: string;
  projeto_id?: string; 
  status: DemandaStatus;
  horas_estimadas?: number;
  data_criacao: string;
}

export interface Faturamento {
  id: string;
  projeto_id: string;
  mes: string; // YYYY-MM
  valor: number;
  faturado: boolean;
  created_at?: string;
}
