import { NavLink } from "react-router-dom";
import { Settings, LogOut, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function MobileQuickActions({ onOpenProfile }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair da sua conta?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    }
  };

  return (
    <div
      id="mobile-quick-actions"
      className="lg:hidden flex items-center gap-1.5 self-end sm:self-auto"
    >
      {/* Botão de Perfil / Menu Rápido */}
      {onOpenProfile && (
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all text-xs font-semibold cursor-pointer border border-slate-200"
          title="Minha conta"
        >
          <div className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">
            {user?.displayName ? (
              user.displayName.charAt(0).toUpperCase()
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="max-w-[70px] truncate text-[11px] font-medium hidden sm:inline">
            {user?.displayName?.split(" ")[0] || "Perfil"}
          </span>
        </button>
      )}

      {/* Acesso Direto: Configurações */}
      <NavLink
        to="/configuracoes"
        id="quick-btn-configuracoes"
        className={({ isActive }) =>
          `p-2 rounded-xl transition-all cursor-pointer ${
            isActive
              ? "bg-blue-900 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
          }`
        }
        title="Configurações"
      >
        <Settings className="w-4 h-4" />
      </NavLink>

      {/* Acesso Direto: Sair */}
      <button
        type="button"
        id="quick-btn-logout"
        onClick={handleLogout}
        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer active:scale-95"
        title="Sair da Conta"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
