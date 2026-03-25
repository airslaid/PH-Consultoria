import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Cliente } from '../types';

const Clientes: React.FC = () => {
  const { clientes, addCliente, updateCliente, deleteCliente } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '', empresa: '', contato: '', valor_hora_padrao: ''
  });

  const openModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingId(cliente.id);
      setFormData({
        nome: cliente.nome, empresa: cliente.empresa,
        contato: cliente.contato, valor_hora_padrao: cliente.valor_hora_padrao.toString()
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', empresa: '', contato: '', valor_hora_padrao: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Cliente = {
      id: editingId || crypto.randomUUID(),
      nome: formData.nome,
      empresa: formData.empresa,
      contato: formData.contato,
      valor_hora_padrao: Number(formData.valor_hora_padrao)
    };

    if (editingId) updateCliente(payload);
    else addCliente(payload);

    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Clientes</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Novo Cliente</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Contato</th>
              <th>Valor/Hora (R$)</th>
              <th style={{ width: '100px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted">Nenhum cliente cadastrado.</td></tr>
            ) : (
              clientes.map(c => (
                <tr key={c.id}>
                  <td className="font-bold">{c.nome}</td>
                  <td>{c.empresa}</td>
                  <td>{c.contato}</td>
                  <td>{c.valor_hora_padrao.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                       <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(c)}><Edit2 size={16} /></button>
                       <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => { if(window.confirm('Excluir cliente e seus projetos vinculados?')) deleteCliente(c.id); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome do Cliente</label>
            <input className="input-field" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: João Silva" />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input className="input-field" required value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} placeholder="Ex: Tech Corp" />
          </div>
          <div className="form-group">
            <label>Contato (Email/Telefone)</label>
            <input className="input-field" required value={formData.contato} onChange={e => setFormData({...formData, contato: e.target.value})} placeholder="joao@techcorp.com" />
          </div>
          <div className="form-group mb-6">
            <label>Valor/Hora Padrão (R$)</label>
            <input className="input-field" type="number" step="0.01" required value={formData.valor_hora_padrao} onChange={e => setFormData({...formData, valor_hora_padrao: e.target.value})} placeholder="150.00" />
          </div>
          <div className="flex justify-between items-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary"><Save size={18} /> Salvar Cliente</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Clientes;
