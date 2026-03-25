import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Edit2, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Apontamento } from '../types';

const formatBRDate = (dateString: string) => dateString.split('-').reverse().join('/');

const decimalToHHMM = (decimal: number) => {
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const hhmmToDecimal = (hhmm: string) => {
  if (!hhmm.includes(':')) return Number(hhmm) || 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

const Apontamentos: React.FC = () => {
  const { apontamentos, projetos, clientes, addApontamento, updateApontamento, deleteApontamento } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projeto_id: '', data: new Date().toISOString().substring(0, 10), horas: '', descricao: ''
  });

  const openModal = (apontamento?: Apontamento) => {
    if (apontamento) {
      if (apontamento.faturado) {
        alert('Apontamentos faturados não podem ser editados.');
        return;
      }
      setEditingId(apontamento.id);
      setFormData({
        projeto_id: apontamento.projeto_id, data: apontamento.data,
        horas: decimalToHHMM(apontamento.horas), descricao: apontamento.descricao
      });
    } else {
      setEditingId(null);
      setFormData({
        projeto_id: '', data: new Date().toISOString().substring(0, 10),
        horas: '', descricao: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projeto_id) return alert('Selecione um projeto!');

    const payload: Apontamento = {
      id: editingId || crypto.randomUUID(),
      projeto_id: formData.projeto_id,
      data: formData.data,
      horas: hhmmToDecimal(formData.horas),
      descricao: formData.descricao,
      faturado: false
    };

    // If editing, preserve the faturado status and mesFechamento
    if (editingId) {
      const existing = apontamentos.find(a => a.id === editingId);
      if (existing) {
        payload.faturado = existing.faturado;
        payload.mes_fechamento = existing.mes_fechamento;
        updateApontamento(payload);
      }
    } else {
      addApontamento(payload);
    }

    setIsModalOpen(false);
  };

  // Sort descending by date
  const sortedApontamentos = [...apontamentos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Apontamentos de Horas</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Lançar Horas</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Projeto</th>
              <th>Cliente</th>
              <th>Horas</th>
              <th>Status</th>
              <th>Descrição</th>
              <th style={{ width: '100px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedApontamentos.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted">Nenhum apontamento registrado.</td></tr>
            ) : (
              sortedApontamentos.map(a => {
                const proj = projetos.find(p => p.id === a.projeto_id);
                const cli = clientes.find(c => c.id === proj?.cliente_id);
                
                return (
                  <tr key={a.id}>
                    <td className="font-bold">{formatBRDate(a.data)}</td>
                    <td>{proj?.nome || 'Desconhecido'}</td>
                    <td>{cli?.nome || 'Desconhecido'}</td>
                    <td className="font-bold">{decimalToHHMM(a.horas)}</td>
                    <td>
                      {a.faturado ? 
                        <span className="badge badge-active flex items-center gap-1" style={{width: 'fit-content'}}><CheckCircle2 size={12}/> Faturado ({a.mes_fechamento})</span> : 
                        <span className="badge badge-pending">Pendente</span>
                      }
                    </td>
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.descricao}>
                      {a.descricao}
                    </td>
                    <td>
                      <div className="flex gap-2">
                         <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(a)} disabled={a.faturado}><Edit2 size={16} /></button>
                         <button className="btn btn-danger" style={{ padding: '0.4rem' }} disabled={a.faturado} onClick={() => { if(window.confirm('Excluir apontamento?')) deleteApontamento(a.id); }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Apontamento' : 'Novo Apontamento'}>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-group mb-0">
              <label>Data</label>
              <input className="input-field" type="date" required value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
            </div>
            <div className="form-group mb-0">
              <label>Horas (ex: 01:30)</label>
              <input className="input-field" type="text" placeholder="HH:MM" required value={formData.horas} onChange={e => {
                let val = e.target.value.replace(/[^0-9:]/g, '');
                if (val.length === 2 && !val.includes(':') && !formData.horas.includes(':')) val += ':';
                setFormData({...formData, horas: val});
              }} />
            </div>
          </div>
          <div className="form-group">
            <label>Projeto</label>
            <select className="input-field" required value={formData.projeto_id} onChange={e => setFormData({...formData, projeto_id: e.target.value})}>
              <option value="" disabled>Selecione um Projeto</option>
              {projetos.filter(p => p.status !== 'Pausado').map(p => {
                const c = clientes.find(client => client.id === p.cliente_id);
                return <option key={p.id} value={p.id}>{p.nome} ({c?.nome})</option>
              })}
            </select>
          </div>
          <div className="form-group mb-6">
            <label>Descrição das Atividades</label>
            <textarea className="input-field" rows={3} required value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Modelagem de dados no Power BI..." />
          </div>
          <div className="flex justify-between items-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary"><Save size={18} /> Salvar Apontamento</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Apontamentos;
