import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, CheckCircle, Clock, Play, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Demanda, DemandaStatus } from '../types';

export default function Demandas() {
  const { demandas, addDemanda, updateDemanda, currentUser, clientes } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'NOVA' | 'ESTIMAR'>('NOVA');
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);

  const [formData, setFormData] = useState({ titulo: '', descricao: '', horas: '' });

  const isAdmin = currentUser?.role === 'ADMIN';

  const visibleDemandas = isAdmin 
    ? demandas 
    : demandas.filter(d => d.cliente_id === currentUser?.cliente_id);

  const openNewDemanda = () => {
    setModalType('NOVA');
    setFormData({ titulo: '', descricao: '', horas: '' });
    setSelectedDemanda(null);
    setIsModalOpen(true);
  };

  const openEstimate = (demanda: Demanda) => {
    setModalType('ESTIMAR');
    setFormData({ ...formData, horas: demanda.horas_estimadas?.toString() || '' });
    setSelectedDemanda(demanda);
    setIsModalOpen(true);
  };

  const handleCreateDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.cliente_id) return;

    addDemanda({
      id: crypto.randomUUID(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      cliente_id: currentUser.cliente_id,
      status: 'Nova',
      data_criacao: new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  const handleEstimateDemanda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemanda) return;

    updateDemanda({
      ...selectedDemanda,
      horas_estimadas: Number(formData.horas),
      status: 'Aguardando Aprovação'
    });
    setIsModalOpen(false);
  };

  const changeStatus = (demanda: Demanda, newStatus: DemandaStatus) => {
    updateDemanda({ ...demanda, status: newStatus });
  };

  const getStatusBadge = (status: DemandaStatus) => {
    switch(status) {
      case 'Nova': return <span className="badge badge-active">Nova solicitação</span>;
      case 'Aguardando Aprovação': return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>Aguardando Aprovação</span>;
      case 'Aprovada': return <span className="badge badge-primary">Aprovada</span>;
      case 'Em Andamento': return <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>Em Andamento</span>;
      case 'Concluída': return <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' }}>Concluída</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1>Gestão de Demandas</h1>
          <p className="text-muted mt-1">{isAdmin ? 'Caixa de entrada de pedidos dos seus clientes.' : 'Solicite analises e dashboards sob demanda.'}</p>
        </div>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={openNewDemanda}>
            <Plus size={18} /> Nova Demanda
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Solicitação</th>
              {isAdmin && <th>Empresa (Cliente)</th>}
              <th>Status</th>
              <th>Horas Orçadas</th>
              <th style={{ width: '180px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {visibleDemandas.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="text-center text-muted p-8">Ainda não existem demandas registradas.</td></tr>
            ) : (
              visibleDemandas.sort((a,b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()).map(d => {
                const emp = clientes.find(c => c.id === d.cliente_id)?.empresa || '-';
                return (
                  <tr key={d.id}>
                    <td className="text-sm font-medium">{new Date(d.data_criacao).toLocaleDateString('pt-BR')}</td>
                    <td>
                       <div className="font-bold mb-1" style={{ color: 'var(--text-main)' }}>{d.titulo}</div>
                       <div className="text-sm text-muted line-clamp-2">{d.descricao}</div>
                    </td>
                    {isAdmin && <td>{emp}</td>}
                    <td>{getStatusBadge(d.status)}</td>
                    <td className="font-bold text-lg">{d.horas_estimadas ? `${d.horas_estimadas}h` : '-'}</td>
                    <td>
                      <div className="flex gap-2">
			                  {/* MODO ADMIN */}
                        {isAdmin && d.status === 'Nova' && (
                          <button className="btn btn-primary text-sm" onClick={() => openEstimate(d)} style={{ padding: '0.4rem 0.75rem' }}>
                            <Clock size={16} /> Estimar Horas
                          </button>
                        )}
                        {isAdmin && d.status === 'Aprovada' && (
                          <button className="btn btn-secondary text-sm" style={{ padding: '0.4rem 0.75rem', color: '#4338ca' }} onClick={() => changeStatus(d, 'Em Andamento')}>
                            <Play size={16} fill="currentColor" /> Iniciar
                          </button>
                        )}
                        {isAdmin && d.status === 'Em Andamento' && (
                          <button className="btn text-sm" style={{ padding: '0.4rem 0.75rem', backgroundColor: '#059669', color: 'white' }} onClick={() => changeStatus(d, 'Concluída')}>
                            <CheckCircle2 size={16} /> Concluir
                          </button>
                        )}

                        {/* MODO CLIENTE */}
                        {!isAdmin && d.status === 'Aguardando Aprovação' && (
                          <button className="btn btn-primary text-sm" style={{ padding: '0.4rem 0.75rem' }} title="Aprovar Orçamento e Iniciar Demanda" onClick={() => changeStatus(d, 'Aprovada')}>
                            <CheckCircle size={16} /> Aprovar Projeto (Orçamento de {d.horas_estimadas}h)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'NOVA' ? 'Abrir Solicitação (Demanda)' : 'Orçamento de Horas'}>
        <form onSubmit={modalType === 'NOVA' ? handleCreateDemanda : handleEstimateDemanda}>
          {modalType === 'NOVA' ? (
            <>
              <div className="form-group">
                <label>O que você precisa?</label>
                <input className="input-field" required value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Novo Painel de Vendas Regionais" />
              </div>
              <div className="form-group mb-6">
                <label>Descreva os detalhes (Fontes, campos, informações)</label>
                <textarea className="input-field" required rows={4} value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Precisamos cruzar a tabela X com ERP Y e extrair gráficos diários de performance..." />
              </div>
            </>
          ) : (
            <div className="form-group mb-6">
              <label>Quantas horas serão cobradas para desenvolver: "{selectedDemanda?.titulo}"?</label>
              <input className="input-field" type="number" required value={formData.horas} onChange={e => setFormData({...formData, horas: e.target.value})} placeholder="Ex: 12" />
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary">
               {modalType === 'NOVA' ? 'Enviar para Análise' : 'Confirmar Orçamento'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
