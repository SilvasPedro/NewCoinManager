import { Users, User, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import MobileQuickActions from "../navigation/MobileQuickActions";

export default function DashboardHeader({
  viewMode,
  setViewMode,
  hasFamily,
  selectedMonth,
  setSelectedMonth,
  periodPreset,
  setPeriodPreset,
  onOpenMobileMenu,
}) {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 2, 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(prev);
    setPeriodPreset("month");
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(next);
    setPeriodPreset("month");
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    setPeriodPreset("month");
  };

  // Formatar nome do mês bonito (ex: Março de 2026)
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
    <header className="flex flex-col gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/60 shadow-sm transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Título & Mobile Quick Actions */}
        <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Visão Geral
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 capitalize">
              {formattedMonthLabel} • Painel financeiro
            </p>
          </div>
          <MobileQuickActions onOpenProfile={onOpenMobileMenu} />
        </div>

        {/* Controles da direita: Família/Individual e Navegador de Mês */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {hasFamily && (
            <div className="flex bg-gray-100/90 p-1 rounded-xl border border-gray-200 shadow-inner w-full sm:w-auto">
              <button
                id="btn-filter-individual"
                type="button"
                onClick={() => setViewMode("individual")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  viewMode === "individual"
                    ? "bg-white text-blue-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Meu Saldo
              </button>
              <button
                id="btn-filter-familia"
                type="button"
                onClick={() => setViewMode("familia")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  viewMode === "familia"
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Família
              </button>
            </div>
          )}

          {/* Seletor de período com botões Anterior/Próximo touch-friendly */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <button
              id="btn-prev-month"
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
                id="input-selected-month"
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setPeriodPreset("month");
                }}
                className="text-xs sm:text-sm font-bold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer py-1"
              />
            </div>

            <button
              id="btn-next-month"
              type="button"
              onClick={handleNextMonth}
              title="Próximo mês"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Atalhos rápidos de visualização de tempo */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
        <span className="text-gray-400 text-[11px] uppercase tracking-wider hidden sm:inline mr-1">
          Atalhos:
        </span>
        <button
          id="btn-preset-current-month"
          type="button"
          onClick={handleSetCurrentMonth}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors"
        >
          Mês Atual
        </button>
        <button
          id="btn-preset-last-3"
          type="button"
          onClick={() => setPeriodPreset(periodPreset === "last3" ? "month" : "last3")}
          className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
            periodPreset === "last3"
              ? "bg-blue-900 text-white border-blue-900 shadow-xs"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Últimos 3 Meses
        </button>
        <button
          id="btn-preset-last-6"
          type="button"
          onClick={() => setPeriodPreset(periodPreset === "last6" ? "month" : "last6")}
          className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
            periodPreset === "last6"
              ? "bg-blue-900 text-white border-blue-900 shadow-xs"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Últimos 6 Meses
        </button>
        <button
          id="btn-preset-year"
          type="button"
          onClick={() => setPeriodPreset(periodPreset === "year" ? "month" : "year")}
          className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
            periodPreset === "year"
              ? "bg-blue-900 text-white border-blue-900 shadow-xs"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Ano {selectedMonth.split("-")[0]}
        </button>
      </div>
    </header>
  );
}
