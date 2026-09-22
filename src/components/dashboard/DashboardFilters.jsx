import { Filter, X, Search, Layers } from "lucide-react";

export default function DashboardFilters({
  typeFilter,
  setTypeFilter,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  availableCategories,
  onResetFilters,
  hasActiveFilters,
  totalResultsCount,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filtro por tipo (Pills) */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            id="filter-type-todos"
            type="button"
            onClick={() => setTypeFilter("todos")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              typeFilter === "todos"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Todos os Fluxos
          </button>
          <button
            id="filter-type-entradas"
            type="button"
            onClick={() => setTypeFilter("entrada")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              typeFilter === "entrada"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            Apenas Receitas
          </button>
          <button
            id="filter-type-saidas"
            type="button"
            onClick={() => setTypeFilter("saida")}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              typeFilter === "saida"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-gray-500 hover:text-rose-700"
            }`}
          >
            Apenas Despesas
          </button>
        </div>

        {/* Categoria + Busca + Reset */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Seletor de Categoria */}
          <div className="relative flex-1 sm:w-48 min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              id="select-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <option value="todas">Todas Categorias</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 sm:w-48 min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="input-search-transactions"
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={onResetFilters}
              title="Limpar todos os filtros"
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Filter className="w-3 h-3 text-blue-800" />
            Filtros ativos:{" "}
            {typeFilter !== "todos" && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                {typeFilter === "entrada" ? "Receitas" : "Despesas"}
              </span>
            )}
            {selectedCategory !== "todas" && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                {selectedCategory}
              </span>
            )}
            {searchTerm && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                "{searchTerm}"
              </span>
            )}
          </span>
          <span className="font-semibold text-gray-700">
            {totalResultsCount} registro(s) encontrado(s)
          </span>
        </div>
      )}
    </div>
  );
}
