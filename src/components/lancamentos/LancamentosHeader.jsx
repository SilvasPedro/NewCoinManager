import { Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import MobileQuickActions from "../navigation/MobileQuickActions";

export default function LancamentosHeader({
  selectedMonth,
  setSelectedMonth,
  onOpenAdd,
  onOpenMobileMenu,
}) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(prev);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(next);
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  };

  const formattedMonthLabel = (() => {
    try {
      const [y, m] = selectedMonth.split("-").map(Number);
      const date = new Date(y, m - 1, 1);
      return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    } catch {
      return selectedMonth;
    }
  })();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/60 shadow-xs">
      <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Lançamentos
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">
            {formattedMonthLabel} • Controle de entradas e saídas
          </p>
        </div>
        <MobileQuickActions onOpenProfile={onOpenMobileMenu} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        {/* Seletor de Mês touch-friendly */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-xs flex-1 sm:flex-none justify-between">
          <button
            id="btn-lancamentos-prev-month"
            type="button"
            onClick={handlePrevMonth}
            title="Mês anterior"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <Calendar className="w-4 h-4 text-blue-900 hidden sm:block" />
            <input
              id="input-lancamentos-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs sm:text-sm font-bold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer py-1"
            />
          </div>

          <button
            id="btn-lancamentos-next-month"
            type="button"
            onClick={handleNextMonth}
            title="Próximo mês"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Botão rápido para ir ao mês atual */}
        <button
          id="btn-lancamentos-current-month"
          type="button"
          onClick={handleSetCurrentMonth}
          className="hidden lg:flex items-center px-3 py-2.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-xs transition-colors"
        >
          Hoje
        </button>

        {/* Botão com Efeito de Vidro (Glassmorphic Luxury Button) */}
        <button
          id="btn-novo-lancamento"
          type="button"
          onClick={onOpenAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-900/85 to-blue-900/90 backdrop-blur-xl border border-white/20 shadow-md text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:border-white/40 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-lg bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Novo Lançamento</span>
        </button>
      </div>
    </header>
  );
}
