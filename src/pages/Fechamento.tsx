import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CheckCircle2 } from 'lucide-react';

const decimalToHHMM = (decimal: number) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const Fechamento: React.FC = () => {
  const { apontamentos, projetos, clientes, faturamentos, fecharMes, toggleFaturamento } = useAppContext();
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [mes, setMes] = useState(currentMonth);

  // Filtrar apontamentos do mês
  const apontamentosMes = apontamentos.filter(a => a.data.startsWith(mes));

  const isMonthInRange = (startMonth: string, duration: number, targetMonth: string) => {
    if (!startMonth || !duration) return false;
    const [startYear, startMonthVal] = startMonth.split('-').map(Number);
    const [targetYear, targetMonthVal] = targetMonth.split('-').map(Number);
    
    const startTotalMonths = startYear * 12 + (startMonthVal - 1);
    const targetTotalMonths = targetYear * 12 + (targetMonthVal - 1);
    const diff = targetTotalMonths - startTotalMonths;
    
    return diff >= 0 && diff < duration;
  };  
  // Agrupar por Cliente -> Projeto
  const resumo = clientes.map(cli => {
    const projsDoCliente = projetos.filter(p => p.cliente_id === cli.id);
    const projetosComApontamentos = projsDoCliente.map(proj => {
      const aps = apontamentosMes.filter(a => a.projeto_id === proj.id);
      const horasTotais = aps.reduce((sum, a) => sum + a.horas, 0);
      
      let valorTotal = 0;
      let faturamentoAtivo = false;

      if (proj.tipo_faturamento === 'Fixo') {
        faturamentoAtivo = isMonthInRange(proj.data_inicio_faturamento || '', proj.duracao_meses || 0, mes);
        valorTotal = faturamentoAtivo ? (proj.valor_mensal || 0) : 0;
      } else {
        faturamentoAtivo = aps.length > 0;
        valorTotal = horasTotais * proj.valor_hora;
      }

      const fat = faturamentos.find(f => f.projeto_id === proj.id && f.mes === mes);
      const isFaturado = fat?.faturado || false;
      const faturamentoId = fat?.id;
      
      return { ...proj, horasTotais, valorTotal, aps, isFaturado, faturamentoId, faturamentoAtivo };
    }).filter(p => p.faturamentoAtivo || p.aps.length > 0);

    const valorTotalCliente = projetosComApontamentos.reduce((sum, p) => sum + p.valorTotal, 0);
    const horasTotaisCliente = projetosComApontamentos.reduce((sum, p) => sum + p.horasTotais, 0);
    const todosProjetosFaturados = projetosComApontamentos.length > 0 && projetosComApontamentos.every(p => p.isFaturado);

    return { ...cli, projetosComApontamentos, valorTotalCliente, horasTotaisCliente, todosProjetosFaturados };
  }).filter(c => c.projetosComApontamentos.length > 0);

  const totalGeralMensal = resumo.reduce((sum, c) => sum + c.valorTotalCliente, 0);
  const totalHorasMensal = resumo.reduce((sum, c) => sum + c.horasTotaisCliente, 0);
  const temPendenciasGerais = resumo.some(c => !c.todosProjetosFaturados);
  const precisaProcessar = resumo.some(c => c.projetosComApontamentos.some(p => !p.faturamentoId));

  const handleProcessarMes = () => {
    const itens = resumo.flatMap(c => c.projetosComApontamentos.map(p => ({
      projeto_id: p.id,
      valor: p.valorTotal
    })));
    fecharMes(mes, itens);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Fechamento Mensal</h1>
        <div className="flex gap-4 items-center">
          <input className="input-field" type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ width: 'auto' }} />
          {precisaProcessar ? (
            <button className="btn btn-primary" onClick={handleProcessarMes}>
               Processar Mês ({mes})
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500 font-bold">
              <CheckCircle2 size={18} /> Mês Processado
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-muted mb-1 text-sm">Total de Horas</p>
          <h2 className="text-xl font-bold">{decimalToHHMM(totalHorasMensal)}</h2>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-muted mb-1 text-sm">Total a Faturar</p>
          <h2 className="text-xl font-bold" style={{ color: 'var(--secondary)' }}>
            R$ {totalGeralMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center">
          <p className="text-muted mb-1 text-sm">Status do Mês</p>
          {temPendenciasGerais ? (
            <span className="badge badge-pending text-md" style={{ padding: '0.3rem 0.8rem' }}>Aberto (Pendente)</span>
          ) : resumo.length > 0 ? (
            <span className="badge badge-active text-md" style={{ padding: '0.3rem 0.8rem' }}>Tudo Faturado</span>
          ) : (
            <span className="badge text-muted text-md" style={{ padding: '0.3rem 0.8rem' }}>Sem dados</span>
          )}
        </div>
      </div>

      {resumo.length === 0 ? (
        <div className="glass-panel p-6 text-center text-muted">
          Nenhum apontamento encontrado para o mês selecionado.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {resumo.map(cli => (
            <div key={cli.id} className="glass-panel overflow-hidden" style={{ padding: 0 }}>
              <div className="flex justify-between items-center p-3 bg-black/20" style={{ borderBottom: '1px solid var(--border-color)', width: '100%' }}>
                <h3 className="font-bold flex items-center gap-2 text-md" style={{ margin: 0 }}>
                  {cli.nome} <span className="text-muted text-xs font-normal">({cli.empresa})</span>
                </h3>
                <div className="flex gap-6 font-bold text-sm">
                  <span className="text-muted">{decimalToHHMM(cli.horasTotaisCliente)}</span>
                  <span style={{ color: 'var(--primary)', minWidth: '100px', textAlign: 'right' }}>R$ {cli.valorTotalCliente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="p-2">
                <table style={{ background: 'transparent', border: 'none', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent', padding: '0.5rem' }}>Projeto</th>
                      <th style={{ background: 'transparent', padding: '0.5rem' }}>Valor/Hora</th>
                      <th style={{ background: 'transparent', padding: '0.5rem' }}>Horas</th>
                      <th style={{ background: 'transparent', padding: '0.5rem' }}>Total</th>
                      <th style={{ background: 'transparent', padding: '0.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cli.projetosComApontamentos.map(p => (
                      <tr key={p.id}>
                        <td style={{ padding: '0.5rem', border: 'none' }}>
                          <div className="flex flex-col">
                            <span>{p.nome}</span>
                            <span className="text-xs text-muted">{p.tipo_faturamento === 'Fixo' ? '🚚 Projeto Fechado' : '⏱️ Por Hora'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem', border: 'none' }}>
                          {p.tipo_faturamento === 'Fixo' ? `R$ ${p.valor_mensal?.toFixed(2)}/mês` : `R$ ${p.valor_hora.toFixed(2)}/h`}
                        </td>
                        <td style={{ padding: '0.5rem', border: 'none' }}>{decimalToHHMM(p.horasTotais)}</td>
                        <td style={{ padding: '0.5rem', border: 'none', fontWeight: 'bold' }}>R$ {p.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td style={{ padding: '0.5rem', border: 'none' }}>
                          {!p.faturamentoId ? (
                            <span className="text-muted text-xs italic">Não Processado</span>
                          ) : p.isFaturado ? (
                            <div className="flex items-center gap-2">
                              <span className="badge badge-active">Faturado</span>
                              <button className="text-xs text-muted hover:text-danger underline" onClick={() => toggleFaturamento(p.faturamentoId!, false)}>Estornar</button>
                            </div>
                          ) : (
                            <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => toggleFaturamento(p.faturamentoId!, true)}>
                              Marcar como Faturado
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Fechamento;
