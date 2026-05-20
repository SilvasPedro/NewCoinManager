// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast"; // 1. IMPORTAÇÃO DO TOAST

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Metas from "./pages/Metas";
import Recorrencias from "./pages/Recorrencias";
import Configuracoes from "./pages/Configuracoes";
import Familia from "./pages/Familia";

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
          <Route path="/familia" element={<PrivateRoute><Familia /></PrivateRoute>} />
        </Routes>
      </Router>

      {/* 2. COMPONENTE TOASTER ADICIONADO AQUI */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          // Configurações visuais globais dos toasts
          duration: 4000,
          style: {
            background: '#1e293b', // Fundo azul marinho (sua paleta)
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e', // Verde Tailwind
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Vermelho Tailwind
              secondary: '#fff',
            },
          }
        }} 
      />
    </AuthProvider>
  );
}

export default App;