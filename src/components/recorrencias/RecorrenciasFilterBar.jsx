import {
  Search,
  X,
  List,
  LayoutGrid,
  FolderTree,
  Filter,
} from "lucide-react";

export default function RecorrenciasFilterBar({
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterTransacao,
  setFilterTransacao,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
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
            id="tab-recorrencias-cards"
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
            id="tab-recorrencias-tabela"
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
            id="tab-recorrencias-categorias"
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
        </div>

        {/* Busca rápida */}
        <div className="relative w-full lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-recorrencias"
            type="text"
            placeholder="Pesquisar recorrência..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Linha Inferior: Filtros de Tipo Recorrência, Tipo Transação, Ordenação */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
        {/* Tipo: Todas, Fixas, Parceladas */}
        <div className="flex items-center gap-1 p-0.5 bg-gray-100/90 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterTipo("all")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterTipo === "all" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterTipo("fixa")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterTipo === "fixa"
                ? "bg-blue-900 text-white font-bold shadow-2xs"
                : "text-gray-500 hover:text-blue-900"
            }`}
          >
            Apenas Fixas
          </button>
          <button
            type="button"
            onClick={() => setFilterTipo("parcelada")}
            className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
              filterTipo === "parcelada"
                ? "bg-orange-600 text-white font-bold shadow-2xs"
                : "text-gray-500 hover:text-orange-700"
            }`}
          >
            Apenas Parceladas
          </button>
        </div>

        {/* Transação: Todas, Receitas, Despesas */}
        <select
          id="select-transacao-recorrencia"
          value={filterTransacao}
          onChange={(e) => setFilterTransacao(e.target.value)}
          className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Transação: Todas</option>
          <option value="entrada">Apenas Receitas</option>
          <option value="saida">Apenas Despesas</option>
        </select>

        {/* Ordenação */}
        <div className="relative min-w-[130px]">
          <select
            id="select-sort-recorrencias"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="data-desc">Mais Recentes</option>
            <option value="valor-desc">Maior Valor Mensal</option>
            <option value="valor-asc">Menor Valor Mensal</option>
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="progresso-desc">Próximas do Fim (Parceladas)</option>
          </select>
        </div>

        {/* Limpar Filtros */}
        {hasActiveFilters && (
          <button
            id="btn-reset-filters-recorrencias"
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold transition-all cursor-pointer ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Contagem de Resultados */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
        <span className="flex items-center gap-1 font-medium">
          <Filter className="w-3 h-3 text-blue-900" />
          Exibindo {totalResultsCount} recorrência{totalResultsCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
