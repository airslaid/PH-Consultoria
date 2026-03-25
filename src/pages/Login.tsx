import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

const Login: React.FC = () => {
  const { currentUser, login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className="flex items-center justify-center p-6" style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(91, 227, 188, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(61, 184, 157, 0.25) 0px, transparent 50%)' 
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '70px', width: 'auto', marginBottom: '1.5rem', objectFit: 'contain' }} />
        
        <h1 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--text-main)' }}>Acesso ao Sistema</h1>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="form-group mb-0">
            <label>E-mail</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="digite seu email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(false); }}
              required
            />
          </div>
          
          <div className="form-group mb-2">
            <label>Senha</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              required
            />
          </div>

          {error && (
            <div className="mb-2 text-center text-sm" style={{ color: 'var(--danger)', fontWeight: 600 }}>
              Credenciais inválidas. Verifique seu e-mail e senha.
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full mt-2" style={{ padding: '0.75rem' }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
