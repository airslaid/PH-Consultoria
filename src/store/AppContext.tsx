import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Cliente, Projeto, Apontamento, Usuario, Demanda, Faturamento, Etapa } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextData {
  clientes: Cliente[];
  projetos: Projeto[];
  apontamentos: Apontamento[];
  usuarios: Usuario[];
  demandas: Demanda[];
  faturamentos: Faturamento[];
  etapas: Etapa[];
  currentUser: Usuario | null;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (cliente: Cliente) => void;
  deleteCliente: (id: string) => void;
  addProjeto: (projeto: Projeto) => void;
  updateProjeto: (projeto: Projeto) => void;
  deleteProjeto: (id: string) => void;
  addApontamento: (apontamento: Apontamento) => void;
  updateApontamento: (apontamento: Apontamento) => void;
  deleteApontamento: (id: string) => void;
  fecharMes: (mes: string, itens: { projeto_id: string, valor: number }[]) => Promise<void>;
  toggleFaturamento: (id: string, faturado: boolean) => Promise<void>;
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (usuario: Usuario) => void;
  deleteUsuario: (id: string) => void;
  addDemanda: (demanda: Demanda) => void;
  updateDemanda: (demanda: Demanda) => void;
  deleteDemanda: (id: string) => void;
  addEtapa: (etapa: Etapa) => Promise<void>;
  updateEtapa: (etapa: Etapa) => Promise<void>;
  deleteEtapa: (id: string) => Promise<void>;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => JSON.parse(localStorage.getItem('pbi-auth') || 'null'));

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      const { data: c } = await supabase.from('clientes').select('*');
      const { data: p } = await supabase.from('projetos').select('*');
      const { data: a } = await supabase.from('apontamentos').select('*');
      const { data: u } = await supabase.from('usuarios').select('*');
      const { data: d } = await supabase.from('demandas').select('*');
      const { data: f } = await supabase.from('faturamentos').select('*');
      const { data: et } = await supabase.from('etapas').select('*');
      
      if (c) setClientes(c);
      if (p) setProjetos(p);
      if (a) setApontamentos(a);
      if (u) setUsuarios(u);
      if (d) setDemandas(d);
      if (f) setFaturamentos(f);
      if (et) setEtapas(et);
    };
    fetchData();
  }, []);

  useEffect(() => { localStorage.setItem('pbi-auth', JSON.stringify(currentUser)); }, [currentUser]);

  const addCliente = async (cliente: Cliente) => {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single();
    if (error) { console.error('Erro ao adicionar cliente:', error); alert('Erro ao salvar no banco!'); return; }
    if (data) setClientes(prev => [...prev, data]);
  };
  const updateCliente = async (cliente: Cliente) => {
    const { data, error } = await supabase.from('clientes').update(cliente).eq('id', cliente.id).select().single();
    if (error) { console.error('Erro ao atualizar cliente:', error); alert('Erro ao salvar no banco!'); return; }
    if (data) setClientes(prev => prev.map(c => c.id === cliente.id ? data : c));
  };
  const deleteCliente = async (id: string) => {
    await supabase.from('clientes').delete().eq('id', id);
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  const addProjeto = async (projeto: Projeto) => {
    console.log('Tentando adicionar projeto:', projeto);
    const { data, error } = await supabase.from('projetos').insert(projeto).select().single();
    if (error) { console.error('Erro ao adicionar projeto:', error); alert(`Erro ao salvar projeto: ${error.message}`); return; }
    if (data) setProjetos(prev => [...prev, data]);
  };
  const updateProjeto = async (projeto: Projeto) => {
    const { data, error } = await supabase.from('projetos').update(projeto).eq('id', projeto.id).select().single();
    if (error) { console.error('Erro ao atualizar projeto:', error); alert(`Erro ao salvar projeto: ${error.message}`); return; }
    if (data) setProjetos(prev => prev.map(p => p.id === projeto.id ? data : p));
  };
  const deleteProjeto = async (id: string) => {
    await supabase.from('projetos').delete().eq('id', id);
    setProjetos(prev => prev.filter(p => p.id !== id));
  };

  const addApontamento = async (apontamento: Apontamento) => {
    const { data, error } = await supabase.from('apontamentos').insert(apontamento).select().single();
    if (error) { console.error('Erro ao adicionar apontamento:', error); alert('Erro ao salvar no banco!'); return; }
    if (data) setApontamentos(prev => [...prev, data]);
  };
  const updateApontamento = async (apontamento: Apontamento) => {
    const { data, error } = await supabase.from('apontamentos').update(apontamento).eq('id', apontamento.id).select().single();
    if (error) { console.error('Erro ao atualizar apontamento:', error); alert('Erro ao salvar no banco!'); return; }
    if (data) setApontamentos(prev => prev.map(a => a.id === apontamento.id ? data : a));
  };
  const deleteApontamento = async (id: string) => {
    await supabase.from('apontamentos').delete().eq('id', id);
    setApontamentos(prev => prev.filter(a => a.id !== id));
  };
  
  const addUsuario = async (usuario: Usuario) => {
    const { data } = await supabase.from('usuarios').insert(usuario).select().single();
    if (data) setUsuarios(prev => [...prev, data]);
  };
  const updateUsuario = async (usuario: Usuario) => {
    const { data } = await supabase.from('usuarios').update(usuario).eq('id', usuario.id).select().single();
    if (data) setUsuarios(prev => prev.map(u => u.id === usuario.id ? data : u));
  };
  const deleteUsuario = async (id: string) => {
    await supabase.from('usuarios').delete().eq('id', id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const addDemanda = async (demanda: Demanda) => {
    const { data } = await supabase.from('demandas').insert(demanda).select().single();
    if (data) setDemandas(prev => [...prev, data]);
  };
  const updateDemanda = async (demanda: Demanda) => {
    const { data } = await supabase.from('demandas').update(demanda).eq('id', demanda.id).select().single();
    if (data) setDemandas(prev => prev.map(d => d.id === demanda.id ? data : d));
  };
  const deleteDemanda = async (id: string) => {
    await supabase.from('demandas').delete().eq('id', id);
    setDemandas(prev => prev.filter(d => d.id !== id));
  };

  const fecharMes = async (mes: string, itens: { projeto_id: string, valor: number }[]) => {
    for (const item of itens) {
      await supabase.from('faturamentos').upsert({
        projeto_id: item.projeto_id,
        mes,
        valor: item.valor,
        faturado: false
      }, { onConflict: 'projeto_id,mes' });
    }
    
    // Marcar apontamentos como vinculados ao mês (opcional, mas bom para histórico)
    await supabase.from('apontamentos')
      .update({ mes_fechamento: mes })
      .filter('data', 'like', `${mes}%`)
      .filter('mes_fechamento', 'is', null);

    const { data } = await supabase.from('faturamentos').select('*');
    if (data) setFaturamentos(data);
  };

  const toggleFaturamento = async (id: string, faturado: boolean) => {
    const { data, error } = await supabase.from('faturamentos').update({ faturado }).eq('id', id).select().single();
    if (error) { console.error(error); return; }
    if (data) setFaturamentos(prev => prev.map(f => f.id === id ? data : f));
  };

  const addEtapa = async (etapa: Etapa) => {
    const { data, error } = await supabase.from('etapas').insert(etapa).select().single();
    if (error) { console.error('Erro ao adicionar etapa:', error); return; }
    if (data) setEtapas(prev => [...prev, data]);
  };
  const updateEtapa = async (etapa: Etapa) => {
    const { data, error } = await supabase.from('etapas').update(etapa).eq('id', etapa.id).select().single();
    if (error) { console.error('Erro ao atualizar etapa:', error); return; }
    if (data) setEtapas(prev => prev.map(e => e.id === etapa.id ? data : e));
  };
  const deleteEtapa = async (id: string) => {
    await supabase.from('etapas').delete().eq('id', id);
    setEtapas(prev => prev.filter(e => e.id !== id));
  };

  const login = (email: string, pass: string) => {
    const user = usuarios.find(u => u.email === email && u.senha === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      clientes, projetos, apontamentos, usuarios, demandas, faturamentos, etapas, currentUser,
      addCliente, updateCliente, deleteCliente,
      addProjeto, updateProjeto, deleteProjeto,
      addApontamento, updateApontamento, deleteApontamento, fecharMes, toggleFaturamento,
      addUsuario, updateUsuario, deleteUsuario,
      addDemanda, updateDemanda, deleteDemanda,
      addEtapa, updateEtapa, deleteEtapa,
      login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
