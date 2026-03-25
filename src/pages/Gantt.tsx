import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Calendar } from 'lucide-react';
import type { Etapa } from '../types';

const Gantt: React.FC = () => {
  const { projetos, etapas, addEtapa, updateEtapa, deleteEtapa } = useAppContext();
  const [projetoId, setProjetoId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<Partial<Etapa> | null>(null);

  const selectedProjeto = projetos.find(p => p.id === projetoId);
  const etapasDoProjeto = etapas.filter(e => e.projeto_id === projetoId).sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));

  // Cálculo de datas para o gráfico
  const todasDatas = etapasDoProjeto.flatMap(e => [new Date(e.data_inicio), new Date(e.data_fim)]);
  const minDate = todasDatas.length > 0 ? new Date(Math.min(...todasDatas.map(d => d.getTime()))) : new Date();
  const maxDate = todasDatas.length > 0 ? new Date(Math.max(...todasDatas.map(d => d.getTime()))) : new Date();
  
  // Adicionar margem de dias
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 5);

  const totalDias = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const diasArray = Array.from({ length: totalDias }, (_, i) => {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getPosicaoELargura = (inicio: string, fim: string) => {
    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    const diffInicio = Math.max(0, Math.floor((dInicio.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    const diffDuracao = Math.ceil((dFim.getTime() - dInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { left: diffInicio * 30, width: diffDuracao * 30 };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId) return;

    if (editingEtapa?.id) {
      await updateEtapa(editingEtapa as Etapa);
    } else {
      await addEtapa({
        ...editingEtapa,
        projeto_id: projetoId,
        status: 'Pendente',
        progresso: 0
      } as Etapa);
    }
    setShowModal(false);
    setEditingEtapa(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluido': return 'var(--primary)';
      case 'Em Andamento': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Cronograma (Gantt)</h1>
        <div className="flex gap-3">
          <select 
            className="input-field" 
            style={{ width: '220px', fontSize: '13px' }}
            value={projetoId}
            onChange={(e) => setProjetoId(e.target.value)}
          >
            <option value="">Selecionar Projeto...</option>
            {projetos.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {projetoId && (
            <button className="btn btn-primary text-sm" onClick={() => { setEditingEtapa({}); setShowModal(true); }}>
              <Plus size={16} /> Nova Etapa
            </button>
          )}
        </div>
      </div>

      {!projetoId ? (
        <div className="glass-panel p-10 text-center text-muted">
          <Calendar size={48} className="mx-auto mb-4 opacity-10" />
          <p>Selecione um projeto para visualizar o gráfico de Gantt.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="glass-panel overflow-hidden" style={{ padding: 0 }}>
            <div className="p-4 border-b border-gray-100 bg-white/50">
              <h2 className="text-md font-bold text-primary">Linha do Tempo: {selectedProjeto?.nome}</h2>
            </div>
            
            <div className="overflow-x-auto" style={{ maxHeight: '500px' }}>
              <div style={{ minWidth: (totalDias * 30) + 200 }}>
                {/* Header do Calendário */}
                <div className="flex border-b border-gray-100" style={{ backgroundColor: 'var(--bg-base)' }}>
                  <div style={{ width: '200px', flexShrink: 0, padding: '0.5rem 1rem', fontSize: '11px', fontWeight: 'bold' }}>ETAPA</div>
                  <div className="flex">
                    {diasArray.map((dia, idx) => (
                      <div key={idx} style={{ width: '30px', flexShrink: 0, textAlign: 'center', padding: '0.5rem 0', fontSize: '10px', borderLeft: '1px solid #eee', color: dia.getDay() === 0 || dia.getDay() === 6 ? 'var(--danger)' : 'inherit' }}>
                        <div style={{ opacity: 0.6 }}>{dia.toLocaleDateString('pt-BR', { weekday: 'short' }).charAt(0)}</div>
                        <div>{dia.getDate()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linhas das Etapas */}
                <div className="relative">
                  {etapasDoProjeto.length === 0 ? (
                    <div className="p-10 text-center text-muted text-sm italic">Nenhuma etapa cadastrada.</div>
                  ) : (
                    etapasDoProjeto.map((etapa) => {
                      const { left, width } = getPosicaoELargura(etapa.data_inicio, etapa.data_fim);
                      return (
                        <div key={etapa.id} className="flex border-b border-gray-50 hover:bg-black/5 transition-colors group" style={{ height: '40px' }}>
                          <div style={{ width: '200px', flexShrink: 0, padding: '0 1rem', display: 'flex', alignItems: 'center', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={etapa.descricao}>
                            {etapa.descricao}
                          </div>
                          <div className="flex relative" style={{ flex: 1 }}>
                            {/* Linhas de grade verticais */}
                            {diasArray.map((_, i) => (
                              <div key={i} style={{ width: '30px', borderLeft: '1px solid #f9f9f9', height: '100%' }} />
                            ))}
                            
                            {/* Barra de Gantt */}
                            <div 
                              className="absolute rounded flex items-center justify-between px-2 cursor-pointer hover:brightness-95 transition-all shadow-sm"
                              style={{ 
                                left: left, 
                                width: width, 
                                top: '8px', 
                                height: '24px', 
                                backgroundColor: getStatusColor(etapa.status),
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                zIndex: 1
                              }}
                              onClick={() => { setEditingEtapa(etapa); setShowModal(true); }}
                            >
                              <span className="truncate">{etapa.progresso}%</span>
                              <div className="flex gap-1">
                                <button className="p-0.5 hover:bg-white/20 rounded" onClick={(e) => { e.stopPropagation(); deleteEtapa(etapa.id); }}><Plus size={10} style={{ transform: 'rotate(45deg)' }} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="glass-panel p-3 text-center">
              <p className="text-muted text-[10px] uppercase font-bold mb-1">Status</p>
              <div className="flex justify-center gap-3">
                <span className="flex items-center gap-1 text-[10px] font-medium"><div style={{width:8,height:8,background:'var(--primary)',borderRadius:2}}/> Concluído</span>
                <span className="flex items-center gap-1 text-[10px] font-medium"><div style={{width:8,height:8,background:'#f59e0b',borderRadius:2}}/> Em Andamento</span>
                <span className="flex items-center gap-1 text-[10px] font-medium"><div style={{width:8,height:8,background:'#94a3b8',borderRadius:2}}/> Pendente</span>
              </div>
            </div>
            <div className="glass-panel p-3 text-center">
              <p className="text-muted text-[10px] uppercase font-bold mb-1">Total Etapas</p>
              <p className="text-xl font-bold">{etapasDoProjeto.length}</p>
            </div>
            <div className="glass-panel p-3 text-center">
              <p className="text-muted text-[10px] uppercase font-bold mb-1">Concluídas</p>
              <p className="text-xl font-bold text-primary">{etapasDoProjeto.filter(e => e.status === 'Concluido').length}</p>
            </div>
            <div className="glass-panel p-3 text-center">
              <p className="text-muted text-[10px] uppercase font-bold mb-1">Progresso Médio</p>
              <p className="text-xl font-bold text-amber-500">
                {etapasDoProjeto.length > 0 
                  ? Math.round(etapasDoProjeto.reduce((s, e) => s + (e.progresso || 0), 0) / etapasDoProjeto.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel p-6" style={{ width: '450px' }}>
            <h2 className="mb-4">{editingEtapa?.id ? 'Editar Etapa' : 'Nova Etapa'}</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="form-group">
                <label>Descrição da Etapa</label>
                <input 
                  className="input-field" 
                  value={editingEtapa?.descricao || ''} 
                  onChange={e => setEditingEtapa({...editingEtapa, descricao: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Início</label>
                  <input 
                    type="date"
                    className="input-field" 
                    value={editingEtapa?.data_inicio || ''} 
                    onChange={e => setEditingEtapa({...editingEtapa, data_inicio: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Termo</label>
                  <input 
                    type="date"
                    className="input-field" 
                    value={editingEtapa?.data_fim || ''} 
                    onChange={e => setEditingEtapa({...editingEtapa, data_fim: e.target.value})}
                    required
                  />
                </div>
              </div>

              {editingEtapa?.id && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      className="input-field"
                      value={editingEtapa?.status || 'Pendente'}
                      onChange={e => setEditingEtapa({...editingEtapa, status: e.target.value as any})}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluido">Concluído</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Progresso (%)</label>
                    <input 
                      type="number"
                      min="0" max="100"
                      className="input-field" 
                      value={editingEtapa?.progresso || 0} 
                      onChange={e => setEditingEtapa({...editingEtapa, progresso: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Etapa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gantt;
