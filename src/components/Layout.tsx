import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Clock, FileCheck, LogOut, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export const Layout: React.FC = () => {
  const { logout, currentUser } = useAppContext();
  const isAdmin = currentUser?.role === 'ADMIN';

  const menu = isAdmin ? [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={14} /> },
    { name: 'Demandas', path: '/demandas', icon: <MessageSquare size={14} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={14} /> },
    { name: 'Projetos', path: '/projetos', icon: <FolderKanban size={14} /> },
    { name: 'Apontamentos', path: '/apontamentos', icon: <Clock size={14} /> },
    { name: 'Fechamento', path: '/fechamento', icon: <FileCheck size={14} /> },
    { name: 'Acessos', path: '/acessos', icon: <ShieldCheck size={14} /> },
  ] : [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={14} /> },
    { name: 'Demandas', path: '/demandas', icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="flex" style={{ height: '100vh', width: '100vw' }}>
      <div style={{ width: '210px', backgroundColor: '#f9fafb', borderRight: '1px solid var(--border-color)', padding: '1rem', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" style={{ width: '100%', maxHeight: '80px', objectFit: 'contain' }} />
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menu.map(item => (
            <NavLink 
              key={item.name} 
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                backgroundColor: isActive ? '#ecfdf5' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.7rem',
                transition: 'all var(--transition)'
              })}
            >
              {item.icon} {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex' }}>
          <button onClick={logout} className="btn btn-secondary w-full" style={{ padding: '0.4rem', color: 'var(--danger)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem' }} title="Sair do sistema">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
