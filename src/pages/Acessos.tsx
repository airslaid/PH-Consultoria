import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Edit2, Trash2, Save, Key } from 'lucide-react';
import { Modal } from '../components/Modal';
import type { Usuario } from '../types';

export default function Acessos() {
  const { usuarios, clientes, addUsuario, updateUsuario, deleteUsuario, currentUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', role: 'CLIENTE', cliente_id: ''
  });

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingId(usuario.id);
      setFormData({
        nome: usuario.nome, email: usuario.email,
        senha: usuario.senha || '', role: usuario.role, cliente_id: usuario.cliente_id || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nome: '', email: '', senha: '', role: 'CLIENTE', cliente_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Usuario = {
      id: editingId || crypto.randomUUID(),
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      role: formData.role as 'ADMIN' | 'CLIENTE',
      cliente_id: formData.role === 'CLIENTE' ? formData.cliente_id : undefined
    };

    if (editingId) updateUsuario(payload);
    else addUsuario(payload);

    setIsModalOpen(false);
  };

  if (currentUser?.role !== 'ADMIN') {
    return <div className="p-6 text-center" style={{ color: 'var(--danger)' }}>Acesso Negado. Apenas administradores.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Gestão de Acessos (Portal B2B)</h1>
        <button className="btn btn-primary" onClick={() => openModal()}><Key size={18} /> Novo Acesso</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Empresa Vinculada</th>
              <th style={{ width: '100px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted">Nenhum acesso cadastrado.</td></tr>
            ) : (
              usuarios.map(u => {
                const emp = clientes.find(c => c.id === u.cliente_id)?.empresa || '-';
                return (
                  <tr key={u.id}>
                    <td className="font-bold">{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-active'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.role === 'CLIENTE' ? emp : 'Consultoria PBI'}</td>
                    <td>
                      <div className="flex gap-2">
                         <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openModal(u)}><Edit2 size={16} /></button>
                         {u.id !== currentUser?.id && (
                           <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => { if(window.confirm('Excluir este acesso do sistema?')) deleteUsuario(u.id); }}><Trash2 size={16} /></button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Acesso' : 'Novo Acesso'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nome do Usuário</label>
            <input className="input-field" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: João Silva" />
          </div>
          <div className="form-group">
            <label>E-mail (Login)</label>
            <input className="input-field" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="joao@empresa.com" />
          </div>
          <div className="form-group">
            <label>Senha de Acesso</label>
            <input className="input-field" type="text" required value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} placeholder="Defina uma senha provisória" />
          </div>
          
          <div className="form-group">
            <label>Perfil</label>
            <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="CLIENTE">Usuário Cliente (Portal Externo)</option>
              <option value="ADMIN">Administrador (Equipe PBI)</option>
            </select>
          </div>

          {formData.role === 'CLIENTE' && (
            <div className="form-group mb-6">
              <label>Empresa Vinculada</label>
              <select className="input-field" required value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})}>
                <option value="">Selecione a empresa...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.empresa} ({c.nome})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
             <button type="submit" className="btn btn-primary"><Save size={18} /> Salvar Acesso</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
