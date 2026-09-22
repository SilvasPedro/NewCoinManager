import { Plus, Trash2, Repeat } from "lucide-react";
import MobileQuickActions from "../navigation/MobileQuickActions";

export default function RecorrenciasHeader({
  totalItems,
  onOpenAdd,
  onConfirmDeleteAll,
  onOpenMobileMenu,
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/60 shadow-xs">
      <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Recorrências
            </h1>
            <span className="text-xs font-bold bg-blue-50 text-blue-900 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              {totalItems} ativas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Gerencie ganhos recorrentes, custos fixos e compras parceladas
          </p>
        </div>
        <MobileQuickActions onOpenProfile={onOpenMobileMenu} />
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {totalItems > 0 && (
          <button
            id="btn-recorrencias-delete-all"
            type="button"
            onClick={onConfirmDeleteAll}
            className="px-3.5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Apagar todas as recorrências"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Tudo</span>
          </button>
        )}

        {/* Botão com Efeito de Vidro (Glassmorphic Luxury Button) */}
        <button
          id="btn-nova-recorrencia"
          type="button"
          onClick={onOpenAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-900/85 to-blue-900/90 backdrop-blur-xl border border-white/20 shadow-md text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:border-white/40 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-lg bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Nova Recorrência</span>
        </button>
      </div>
    </header>
  );
}
