// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Metas from "./pages/Metas";
import Recorrencias from "./pages/Recorrencias";
import Configuracoes from "./pages/Configuracoes";
import Familia from "./pages/Familia"; // 1. IMPORTAÇÃO ADICIONADA

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/lancamentos" element={<PrivateRoute><Lancamentos /></PrivateRoute>} />
          <Route path="/metas" element={<PrivateRoute><Metas /></PrivateRoute>} />
          <Route path="/recorrencias" element={<PrivateRoute><Recorrencias /></PrivateRoute>} />
          <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
          
          {/* 2. ROTA DE FAMÍLIA ADICIONADA */}
          <Route path="/familia" element={<PrivateRoute><Familia /></PrivateRoute>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;