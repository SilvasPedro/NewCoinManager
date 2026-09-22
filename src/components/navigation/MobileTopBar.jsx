import { NavLink } from "react-router-dom";
import { Settings, LogOut, User } from "lucide-react";
import logoIcon from "../../assets/newcoin_icon.png";

export default function MobileTopBar({
  user,
  onOpenProfile,
  onLogout,
}) {
  return (
    <div
      id="mobile-top-bar"
      className="lg:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between text-white shadow-sm"
    >
      {/* Lado Esquerdo: Marca / Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 active:scale-95 transition-transform">
        <img
          src={logoIcon}
          alt="NewCoinManager"
          className="w-7 h-7 object-contain"
        />
        <span className="font-extrabold text-sm tracking-wider text-white">
          NCM
        </span>
      </NavLink>

      {/* Lado Direito: Acesso Rápido a Configurações, Perfil e Sair */}
      <div className="flex items-center gap-1.5">
        {/* Botão de Perfil / Ações */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
          title="Minha conta"
        >
          <div className="w-5 h-5 rounded-md bg-blue-900/60 border border-blue-400/30 flex items-center justify-center text-[11px] font-black text-blue-200">
            {user?.displayName ? (
              user.displayName.charAt(0).toUpperCase()
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px]">
            {user?.displayName?.split(" ")[0] || "Perfil"}
          </span>
        </button>

        {/* Botão Acessível 1-Toque: Configurações */}
        <NavLink
          to="/configuracoes"
          id="topbar-btn-configuracoes"
          className={({ isActive }) =>
            `p-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
            }`
          }
          title="Configurações"
        >
          <Settings className="w-4 h-4" />
        </NavLink>

        {/* Botão Acessível 1-Toque: Sair */}
        <button
          type="button"
          id="topbar-btn-logout"
          onClick={onLogout}
          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/50 transition-all cursor-pointer active:scale-95"
          title="Sair da Conta"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
