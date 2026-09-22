import {
  Search,
  X,
  List,
  LayoutGrid,
  FolderTree,
  Clock,
  Filter,
} from "lucide-react";

export default function LancamentosFilterBar({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  availableCategories,
  onResetFilters,
  hasActiveFilters,
  totalResultsCount,
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
      {/* Linha Superior: Visualizações (Tabs de Vidro) + Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Seletor de Modo de Visualização com Efeito de Vidro */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/90 rounded-xl overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            id="tab-view-tabela"
            type="button"
            onClick={() => setViewMode("tabela")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "tabela"
                ? "bg-white text-blue-950 font-bold shadow-xs border border-gray-200/60"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tabela
          </button>

          <button
            id="tab-view-cards"
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "cards"
                ? "bg-white text-blue-950 font-bold shadow-xs border border-gray-200/60"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Cards
          </button>

          <button
            id="tab-view-categorias"
            type="button"
            onClick={() => setViewMode("categorias")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "categorias"
                ? "bg-white text-blue-950 font-bold shadow-xs border border-gray-200/60"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Por Categoria
          </button>

          <button
            id="tab-view-pendentes"
            type="button"
            onClick={() => setViewMode("pendentes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "pendentes"
                ? "bg-amber-100 text-amber-900 font-bold shadow-xs border border-amber-200"
                : "text-gray-500 hover:text-amber-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendentes
          </button>
        </div>

        {/* Busca rápida */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-lancamentos"
            type="text"
            placeholder="Pesquisar lançamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Linha Inferior: Filtros de Tipo, Status, Categoria, Ordenação e Limpeza */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
        {/* Filtro por Tipo */}
        <div className="flex items-center gap-1 p-0.5 bg-gray-100/90 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterType === "all" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType("entrada")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterType === "entrada"
                ? "bg-emerald-600 text-white font-bold shadow-2xs"
                : "text-gray-500 hover:text-emerald-700"
            }`}
          >
            Receitas
          </button>
          <button
            type="button"
            onClick={() => setFilterType("saida")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterType === "saida"
                ? "bg-rose-600 text-white font-bold shadow-2xs"
                : "text-gray-500 hover:text-rose-700"
            }`}
          >
            Despesas
          </button>
          <button
            type="button"
            onClick={() => setFilterType("recorrente")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterType === "recorrente"
                ? "bg-blue-900 text-white font-bold shadow-2xs"
                : "text-gray-500 hover:text-blue-900"
            }`}
          >
            Recorrentes
          </button>
        </div>

        {/* Filtro de Status de Pagamento (exceto se a aba for pendentes) */}
        {viewMode !== "pendentes" && (
          <select
            id="select-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Status: Todos</option>
            <option value="pago">Status: Pagos</option>
            <option value="pendente">Status: Pendentes</option>
          </select>
        )}

        {/* Filtro de Categorias */}
        <div className="relative min-w-[130px]">
          <select
            id="select-category-filter-lancamentos"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer capitalize"
          >
            <option value="all">Todas Categorias</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenação */}
        <div className="relative min-w-[130px]">
          <select
            id="select-sort-order"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="data-desc">Mais Recentes</option>
            <option value="data-asc">Mais Antigos</option>
            <option value="valor-desc">Maior Valor</option>
            <option value="valor-asc">Menor Valor</option>
            <option value="nome-asc">Nome (A-Z)</option>
          </select>
        </div>

        {/* Limpar Filtros com Efeito de Vidro Suave */}
        {hasActiveFilters && (
          <button
            id="btn-reset-filters-lancamentos"
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold transition-all cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Contagem de Resultados Filtrados */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
        <span className="flex items-center gap-1 font-medium">
          <Filter className="w-3 h-3 text-blue-900" />
          Exibindo {totalResultsCount} lançamento{totalResultsCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
