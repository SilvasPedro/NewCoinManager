import { Edit3, Trash2, Tag, CheckCircle2, Repeat, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function LancamentosGridView({
  transacoes,
  togglePago,
  handleOpenEdit,
  confirmDelete,
  formatCurrency,
  onResetFilters,
  onOpenAdd,
  selectedMonth,
  hasActiveFilters,
}) {
  if (transacoes.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
          <Tag className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-gray-800">
          {hasActiveFilters ? "Nenhum lançamento encontrado" : "Nenhum lançamento no período"}
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          {hasActiveFilters
            ? "Tente ajustar os filtros para visualizar outros itens."
            : `Você ainda não cadastrou lançamentos para ${selectedMonth}.`}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 transition-colors"
          >
            Limpar Filtros
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAdd}
            className="mt-4 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 transition-colors"
          >
            Adicionar Primeiro Lançamento
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {transacoes.map((t) => {
        const isEntrada = t.tipo === "entrada";
        return (
          <div
            key={t.id}
            className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/90 shadow-xs hover:shadow-md hover:border-blue-200/80 transition-all duration-300 flex flex-col justify-between group space-y-4"
          >
            {/* Topo do Card: Categoria & Ícone de Tipo */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg capitalize">
                  <Tag className="w-3 h-3 text-gray-400" />
                  {t.categoria || "Geral"}
                </span>

                {t.isRecorrente && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-extrabold uppercase rounded-md border border-blue-200">
                    <Repeat className="w-2.5 h-2.5" />
                    Fixa
                  </span>
                )}
              </div>

              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isEntrada ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                }`}
              >
                {isEntrada ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>

            {/* Conteúdo Central: Título e Valor */}
            <div>
              <p className="font-bold text-gray-900 text-base capitalize truncate">
                {t.descricao}
              </p>
              <p
                className={`text-2xl font-black tracking-tight mt-1 ${
                  isEntrada ? "text-emerald-600" : "text-gray-900"
                }`}
              >
                {isEntrada ? "+ " : "- "}
                {formatCurrency(t.valor)}
              </p>
            </div>

            {/* Rodapé do Card: Status Interativo e Ações Rápidas */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <div>
                {t.isRecorrente ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Automático
                  </span>
                ) : isEntrada ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Recebido
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => togglePago(t.id, t.pago)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer active:scale-95 ${
                      t.pago
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        t.pago ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {t.pago ? "Pago" : "Pendente"}
                  </button>
                )}
              </div>

              {!t.isRecorrente ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(t.id)}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium italic">
                  Recorrência
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
