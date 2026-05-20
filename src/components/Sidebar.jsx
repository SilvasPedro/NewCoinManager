// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";
import logoIcon from "../assets/newcoin_icon.png";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();

  // LER DO LOCALSTORAGE: Verifica se o usuário já havia deixado a barra recolhida antes
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState === "true"; // Retorna true se estava salva como recolhida
  });

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  // FUNÇÃO PARA RECOLHER/EXPANDIR E SALVAR A ESCOLHA
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const menuItems = [
    { name: "Visão Geral", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Lançamentos", path: "/lancamentos", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
    { name: "Metas", path: "/metas", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { name: "Recorrências", path: "/recorrencias", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
    { name: "Família", path: "/familia", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Configurações", path: "/configuracoes", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative z-50 h-screen bg-gray-950 flex flex-col border-r border-blue-950/50 shadow-2xl transition-all duration-300 flex-shrink-0
          ${collapsed ? "md:w-20" : "md:w-64"} 
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <button
          onClick={toggleCollapse} // AQUI: Chama a nova função em vez do setCollapsed direto
          className="hidden md:flex absolute -right-3 top-10 bg-blue-900 border border-gray-800 text-white w-6 h-6 rounded-full items-center justify-center z-50 shadow-md hover:bg-blue-700 transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        {/* LOGO SECTION */}
        <div className={`h-20 flex items-center border-b border-gray-800 relative ${collapsed ? 'justify-center' : 'px-6'}`}>
          {/* 2. SUBSTITUÍMOS O DIV PELA TAG IMG */}
          <img
            src={logoIcon}
            alt="NewCoinManager"
            className="w-8 h-8 flex-shrink-0 object-contain"
          />
          {/* 3. ATUALIZAMOS O NOME */}
          {!collapsed && (
            <h1 className="text-xl font-bold text-white tracking-wide ml-3 whitespace-nowrap">
              NCM
            </h1>
          )}
          {/* Botão de fechar mobile */}
          <button className="md:hidden absolute right-4 text-gray-400 hover:text-white p-2" onClick={() => setMobileOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-all duration-200 font-medium
                ${collapsed ? "justify-center py-3" : "px-4 py-3 gap-3"}
                ${isActive ? "bg-blue-950/40 text-green-400 shadow-sm border border-blue-900/30" : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"}`
              }
              title={collapsed ? item.name : ""}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t border-gray-800 bg-black/20 flex flex-col ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className="flex flex-col mb-4 px-2">
              <span className="text-sm font-bold text-gray-200 truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Sair" : ""}
            className={`flex items-center bg-gray-900 hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-900/50 rounded-lg transition-colors text-sm font-semibold
              ${collapsed ? "justify-center p-2.5 w-10 h-10" : "w-full justify-center gap-2 px-4 py-2"}`
            }
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!collapsed && <span>Sair da Conta</span>}
          </button>
        </div>

      </aside>
    </>
  );
}