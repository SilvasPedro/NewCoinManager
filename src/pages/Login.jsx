// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoIcon from "../assets/newcoin_icon.png";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      // Login bem-sucedido, redireciona para a Dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      // Tratamento de erro robusto
      if (err.code === 'auth/popup-closed-by-user') {
        setError("A janela de login foi fechada antes da conclusão.");
      } else {
        setError("Ocorreu um erro ao tentar entrar com o Google. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    // Fundo cinza claro padrão para contraste
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Card Principal Robustas e Moderno */}
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 transform transition-all duration-300 hover:shadow-blue-900/10">
        
        {/* Cabeçalho do Card */}
        <div className="flex flex-col items-center mb-12 text-center">
    
          <img 
            src={logoIcon} 
            alt="NewCoinManager" 
            className="w-auto h-20 flex-shrink-0 object-contain" 
          />
          <h1 className="text-4xl font-extrabold text-gray-950 tracking-tight">
            New<span className="text-blue-950">Coin</span><span className="text-green-600">Manager</span>
          </h1>
          
          <p className="mt-4 text-lg text-gray-600 max-w-sm">
            Sua plataforma robusta para gestão de ativos e finanças. Acesse sua conta de forma segura.
          </p>
        </div>
        
        {/* Área de Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Botão de Ação Única: Google */}
        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl shadow-lg bg-blue-950 text-white font-semibold text-lg hover:bg-black focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-70 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {loading ? (
              // Spinner de carregamento
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              // Ícone do Google em SVG (Cores oficiais mantidas para reconhecimento)
              <svg className="w-6 h-6 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Autenticando..." : "Continuar com Google"}
          </button>
        </div>

        {/* Rodapé do Card */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade do NewCoinManager.
          </p>
          <p className="text-xs text-gray-400 mt-2">© 2026 CoinManager_v2</p>
        </div>

      </div>
    </div>
  );
}