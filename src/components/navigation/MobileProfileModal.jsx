import { NavLink } from "react-router-dom";
import { Settings, LogOut, X, ChevronRight, User } from "lucide-react";

export default function MobileProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        id="mobile-profile-sheet"
        className="relative z-10 bg-slate-950/95 backdrop-blur-2xl border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-white p-6 space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Top bar with drag handle and close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-400">
              Minha Conta & Preferências
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-900/40 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-400/30 flex items-center justify-center text-blue-200 font-black text-lg shrink-0">
            {user?.displayName ? (
              user.displayName.charAt(0).toUpperCase()
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-base text-white truncate">
              {user?.displayName || "Usuário"}
            </h4>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Action Buttons: Configurações & Sair */}
        <div className="space-y-2.5 pt-1">
          {/* Botão de Configurações */}
          <NavLink
            to="/configuracoes"
            id="mobile-btn-configuracoes"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-950/80 border-blue-500 text-white ring-2 ring-blue-500/20"
                  : "bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-200 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-white">Configurações</p>
                <p className="text-[11px] text-slate-400">
                  Gerenciar categorias e reserva financeira
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </NavLink>

          {/* Botão de Sair */}
          <button
            type="button"
            id="mobile-btn-logout"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 text-rose-300 hover:text-rose-200 transition-all cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-rose-200">Sair da Conta</p>
                <p className="text-[11px] text-rose-400/70">
                  Desconectar com segurança deste aparelho
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-500/60" />
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">NewCoinManager • Gestão Financeira Inteligente</p>
        </div>
      </div>
    </div>
  );
}
