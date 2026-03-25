import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store/AppContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Projetos from './pages/Projetos';
import Apontamentos from './pages/Apontamentos';
import Fechamento from './pages/Fechamento';
import Acessos from './pages/Acessos';
import Demandas from './pages/Demandas';
import Gantt from './pages/Gantt';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppContext();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="demandas" element={<Demandas />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="apontamentos" element={<Apontamentos />} />
            <Route path="fechamento" element={<Fechamento />} />
            <Route path="gantt" element={<Gantt />} />
            <Route path="acessos" element={<Acessos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
