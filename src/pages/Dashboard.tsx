import React from 'react';
import { useAppContext } from '../store/AppContext';
import { Users, Briefcase, Timer, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const decimalToHHMM = (decimal: number) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const Dashboard: React.FC = () => {
  const { clientes, projetos, apontamentos, faturamentos } = useAppContext();
  
  const currentMonth = new Date().toISOString().substring(0, 7);
  const apontamentosMes = apontamentos.filter(a => a.data.startsWith(currentMonth));
  
  const horasMes = apontamentosMes.reduce((sum, a) => sum + a.horas, 0);
  
  const faturadosIds = faturamentos.filter(f => f.faturado).map(f => f.projeto_id);
  const horasNaoFaturadasTotal = apontamentos.filter(a => !faturadosIds.includes(a.projeto_id)).reduce((sum, a) => sum + a.horas, 0);

  const totalFaturadoAteHoje = faturamentos.filter(f => f.faturado).reduce((sum, f) => sum + f.valor, 0);

  return (
    <div>
      <h1 className="mb-4 text-2xl">Dashboard Resumo</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Link to="/clientes" className="glass-panel p-4 flex flex-col hover:-translate-y-1" style={{ textDecoration: 'none', transition: 'all 0.2s' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg icon-box"><Users size={20} /></div>
            <span className="text-xl font-bold">{clientes.length}</span>
          </div>
          <p className="text-muted text-sm font-medium">Clientes Ativos</p>
        </Link>
        
        <Link to="/projetos" className="glass-panel p-4 flex flex-col hover:-translate-y-1" style={{ textDecoration: 'none', transition: 'all 0.2s' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg icon-box"><Briefcase size={20} /></div>
            <span className="text-xl font-bold">{projetos.filter(p => p.status === 'Ativo').length}</span>
          </div>
          <p className="text-muted text-sm font-medium">Projetos Ativos</p>
        </Link>
...

        <Link to="/apontamentos" className="glass-panel p-4 flex flex-col hover:-translate-y-1" style={{ textDecoration: 'none', transition: 'all 0.2s' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg icon-box"><Timer size={20} /></div>
            <span className="text-xl font-bold">{decimalToHHMM(horasMes)}</span>
          </div>
          <p className="text-muted text-sm font-medium">Horas do Mês</p>
        </Link>

        <Link to="/fechamento" className="glass-panel p-4 flex flex-col hover:-translate-y-1" style={{ textDecoration: 'none', transition: 'all 0.2s', border: horasNaoFaturadasTotal > 0 ? '1px solid var(--danger)' : '' }}>
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg icon-box"><Wallet size={20} /></div>
            <span className="text-xl font-bold">{decimalToHHMM(horasNaoFaturadasTotal)}</span>
          </div>
          <p className="text-muted text-sm font-medium">Pendente Faturar</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <h2 className="mb-3 text-lg font-bold">Atalhos Rápidos</h2>
          <div className="flex flex-col gap-2">
            <Link to="/apontamentos" className="btn btn-primary w-full text-sm" style={{ justifyContent: 'flex-start' }}><Timer size={16} /> Lançar Horas</Link>
            <Link to="/clientes" className="btn btn-secondary w-full text-sm" style={{ justifyContent: 'flex-start' }}><Users size={16} /> Novo Cliente</Link>
            <Link to="/projetos" className="btn btn-secondary w-full text-sm" style={{ justifyContent: 'flex-start' }}><Briefcase size={16} /> Novo Projeto</Link>
          </div>
        </div>

        <div className="glass-panel p-4 flex flex-col items-center justify-center bg-black/20">
          <div className="p-3 bg-emerald-500/10 rounded-full mb-2 text-emerald-500">
            <Wallet size={32} />
          </div>
          <p className="text-muted mb-1 text-md">Histórico Total Faturado</p>
          <h2 className="text-3xl font-bold text-emerald-500">R$ {totalFaturadoAteHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
          <p className="text-xs text-muted mt-1">Valor acumulado de projetos faturados.</p>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
