import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Projeto } from '../types';

const Projetos: React.FC = () => {
  const { projetos, clientes, addProjeto, updateProjeto, deleteProjeto } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '', cliente_id: '', escopo: '', valor_hora: '', status: 'Ativo' as 'Ativo' | 'Concluido' | 'Pausado',
    tipo_faturamento: 'Hora' as 'Hora' | 'Fixo', valor_mensal: '', duracao_meses: '', data_inicio_faturamento: new Date().toISOString().substring(0, 7)
  });

  const openModal = (projeto?: Projeto) => {
    if (projeto) {
      setEditingId(projeto.id);
      setFormData({
        nome: projeto.nome, cliente_id: projeto.cliente_id, escopo: projeto.escopo,
        valor_hora: projeto.valor_hora.toString(), status: projeto.status,
        tipo_faturamento: projeto.tipo_faturamento || 'Hora',
        valor_mensal: projeto.valor_mensal?.toString() || '',
        duracao_meses: projeto.duracao_meses?.toString() || '',
        data_inicio_faturamento: projeto.data_inicio_faturamento || new Date().toISOString().substring(0, 7)
      });
    } else {
      setEditingId(null);
      setFormData({ 
        nome: '', cliente_id: '', escopo: '', valor_hora: '', status: 'Ativo',
        tipo_faturamento: 'Hora', valor_mensal: '', duracao_meses: '', data_inicio_faturamento: new Date().toISOString().substring(0, 7)
      });
    }
    setIsModalOpen(true);
  };

  const handleClienteChange = (cliente_id: string) => {
    const cl = clientes.find(c => c.id === cliente_id);
    setFormData({ ...formData, cliente_id, valor_hora: cl ? cl.valor_hora_padrao.toString() : formData.valor_hora });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_id) return alert('Selecione um cliente!');
/*  - [ ] Need to ensure Projeto type is also snake_case in payload */
    const payload: Projeto = {
      id: editingId || crypto.randomUUID(),
      nome: formData.nome,
      cliente_id: formData.cliente_id,
      escopo: formData.escopo,
      valor_hora: formData.tipo_faturamento === 'Hora' ? Number(formData.valor_hora) : 0,
      tipo_faturamento: formData.tipo_faturamento,
      valor_mensal: formData.tipo_faturamento === 'Fixo' ? Number(formData.valor_mensal) : undefined,
      duracao_meses: formData.tipo_faturamento === 'Fixo' ? Number(formData.duracao_meses) : undefined,
      data_inicio_faturamento: formData.tipo_faturamento === 'Fixo' ? formData.data_inicio_faturamento : undefined,
      status: formData.status
    };

    if (editingId) updateProjeto(payload);
    else addProjeto(payload);

    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Projetos</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Novo Projeto</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
               <th>Projeto</th>
               <th>Cliente</th>
               <th>Modelo</th>
               <th>Valor (R$)</th>
               <th>Status</th>
               <th style={{ width: '100px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">Nenhum projeto cadastrado.</td></tr>
            ) : (
              projetos.map(p => (
                <tr key={p.id}>
                   <td className="font-bold">{p.nome}</td>
                   <td>{clientes.find(c => c.id === p.cliente_id)?.nome || 'Desconhecido'}</td>
                   <td>
                     <span className="badge" style={{ backgroundColor: p.tipo_faturamento === 'Fixo' ? '#e0f2fe' : '#f3f4f6', color: p.tipo_faturamento === 'Fixo' ? '#0369a1' : '#374151' }}>
                       {p.tipo_faturamento === 'Fixo' ? 'Fechado' : 'Por Hora'}
                     </span>
                   </td>
                   <td>
                     {p.tipo_faturamento === 'Fixo' ? (
                       <div className="flex flex-col">
                         <span className="font-bold">R$ {p.valor_mensal?.toFixed(2)}/mês</span>
                         <span className="text-xs text-muted">{p.duracao_meses} meses</span>
                       </div>
                     ) : (
                       <span className="font-bold">R$ {p.valor_hora.toFixed(2)}/h</span>
                     )}
                   </td>
                   <td><span className={`badge ${p.status === 'Ativo' ? 'badge-active' : 'badge-pending'}`}>{p.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                       <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(p)}><Edit2 size={16} /></button>
                       <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => { if(window.confirm('Excluir projeto e seus apontamentos?')) deleteProjeto(p.id); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Projeto' : 'Novo Projeto'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome do Projeto</label>
            <input className="input-field" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Dashboard de Vendas" />
          </div>
          <div className="form-group">
            <label>Cliente Associado</label>
            <select className="input-field" required value={formData.cliente_id} onChange={e => handleClienteChange(e.target.value)}>
              <option value="" disabled>Selecione um Cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.empresa}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Escopo Resumido</label>
            <input className="input-field" value={formData.escopo} onChange={e => setFormData({...formData, escopo: e.target.value})} placeholder="Desenvolvimento de 3 painéis..." />
          </div>

          <div className="form-group">
            <label>Modelo de Cobrança</label>
            <div className="flex gap-4 p-2 bg-black/5 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={formData.tipo_faturamento === 'Hora'} onChange={() => setFormData({...formData, tipo_faturamento: 'Hora'})} />
                <span>Valor por Hora</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={formData.tipo_faturamento === 'Fixo'} onChange={() => setFormData({...formData, tipo_faturamento: 'Fixo'})} />
                <span>Projeto Fechado (Fixo)</span>
              </label>
            </div>
          </div>

          {formData.tipo_faturamento === 'Hora' ? (
            <div className="form-group">
              <label>Valor/Hora (R$)</label>
              <input className="input-field" type="number" step="0.01" required value={formData.valor_hora} onChange={e => setFormData({...formData, valor_hora: e.target.value})} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className="form-group">
                <label>Valor por Mês</label>
                <input className="input-field" type="number" step="0.01" required value={formData.valor_mensal} onChange={e => setFormData({...formData, valor_mensal: e.target.value})} placeholder="Ex: 2000" />
              </div>
              <div className="form-group">
                <label>Qtd. Meses</label>
                <input className="input-field" type="number" step="1" required value={formData.duracao_meses} onChange={e => setFormData({...formData, duracao_meses: e.target.value})} placeholder="Ex: 6" />
              </div>
              <div className="form-group">
                <label>Início Cobrança</label>
                <input className="input-field" type="month" required value={formData.data_inicio_faturamento} onChange={e => setFormData({...formData, data_inicio_faturamento: e.target.value})} />
              </div>
            </div>
          )}

          <div className="form-group mb-6">
            <label>Status do Projeto</label>
            <select className="input-field" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
              <option value="Ativo">Ativo</option>
              <option value="Concluido">Concluído</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary"><Save size={18} /> Salvar Projeto</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Projetos;
