import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import type { Etapa } from '../types';

const Gantt: React.FC = () => {
  const { projetos, etapas, addEtapa, updateEtapa, deleteEtapa } = useAppContext();
  const [projetoId, setProjetoId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState<Partial<Etapa> | null>(null);

  const selectedProjeto = projetos.find(p => p.id === projetoId);
  const etapasDoProjeto = etapas.filter(e => e.projeto_id === projetoId).sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluido': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Em Andamento': return <Clock size={16} className="text-amber-500" />;
      default: return <Circle size={16} className="text-muted" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Cronograma (Gantt)</h1>
        <div className="flex gap-3">
          <select 
            className="input-field" 
            style={{ width: '250px' }}
            value={projetoId}
            onChange={(e) => setProjetoId(e.target.value)}
          >
            <option value="">Selecionar Projeto...</option>
            {projetos.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {projetoId && (
            <button className="btn btn-primary" onClick={() => { setEditingEtapa({}); setShowModal(true); }}>
              <Plus size={18} /> Nova Etapa
            </button>
          )}
        </div>
      </div>

      {!projetoId ? (
        <div className="glass-panel p-10 text-center text-muted">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p>Selecione um projeto para visualizar e gerenciar o cronograma.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-4">
            <h2 className="text-lg mb-4">Linha do Tempo: {selectedProjeto?.nome}</h2>
            
            <div className="flex flex-col gap-2">
              {etapasDoProjeto.length === 0 ? (
                <p className="text-muted text-sm italic">Nenhuma etapa cadastrada para este projeto.</p>
              ) : (
                etapasDoProjeto.map(etapa => (
                  <div key={etapa.id} className="flex items-center gap-4 p-3 bg-black/5 rounded-lg hover:bg-black/10 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(etapa.status)}
                        <span className="font-bold text-sm">{etapa.descricao}</span>
                        <span className="badge text-xs" style={{ background: 'var(--bg-base)' }}>{etapa.progresso}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(etapa.data_inicio).toLocaleDateString('pt-BR')} até {new Date(etapa.data_fim).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      {/* Barra de Progresso Visual (Simulando Gantt) */}
                      <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all" 
                          style={{ width: `${etapa.progresso}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => { setEditingEtapa(etapa); setShowModal(true); }}>Editar</button>
                      <button className="btn btn-danger px-2 py-1 text-xs" onClick={() => deleteEtapa(etapa.id)}>Remover</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mini Dashboard de Progresso */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-4 text-center">
              <p className="text-muted text-xs uppercase font-bold mb-1">Total Etapas</p>
              <p className="text-2xl font-bold">{etapasDoProjeto.length}</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-muted text-xs uppercase font-bold mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-emerald-500">{etapasDoProjeto.filter(e => e.status === 'Concluido').length}</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-muted text-xs uppercase font-bold mb-1">Média Progresso</p>
              <p className="text-2xl font-bold text-blue-500">
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
