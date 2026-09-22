import { Edit3, Trash2, Tag, CheckCircle2 } from "lucide-react";

export default function LancamentosTableView({
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
            ? "Tente ajustar ou remover os filtros para visualizar outros lançamentos."
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
    <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* --- DESKTOP TABLE --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4">Descrição</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Valor</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {transacoes.map((t) => {
              const isEntrada = t.tipo === "entrada";
              return (
                <tr
                  key={t.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 capitalize">
                        {t.descricao}
                      </p>
                      {t.isRecorrente && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] uppercase font-extrabold rounded-md border border-blue-200">
                          Recorrente
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg capitalize">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {t.categoria || "Geral"}
                    </span>
                  </td>

                  <td className="p-4 font-bold">
                    <span
                      className={`text-base font-extrabold ${
                        isEntrada ? "text-emerald-600" : "text-gray-900"
                      }`}
                    >
                      {isEntrada ? "+ " : "- "}
                      {formatCurrency(t.valor)}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {t.isRecorrente ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Automático
                      </span>
                    ) : isEntrada ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Recebido
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => togglePago(t.id, t.pago)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
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
                  </td>

                  <td className="p-4 text-right">
                    {t.isRecorrente ? (
                      <span className="text-xs text-gray-400 font-medium italic">
                        Gerenciado em Recorrências
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Lançamento"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmDelete(t.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden divide-y divide-gray-100">
        {transacoes.map((t) => {
          const isEntrada = t.tipo === "entrada";
          return (
            <div key={t.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-bold text-gray-900 text-sm capitalize truncate">
                      {t.descricao}
                    </p>
                    {t.isRecorrente && (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 text-[10px] uppercase font-extrabold rounded border border-blue-200">
                        Recorrente
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1 capitalize">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {t.categoria || "Geral"}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`text-base font-extrabold ${
                      isEntrada ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {isEntrada ? "+ " : "- "}
                    {formatCurrency(t.valor)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div>
                  {t.isRecorrente ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Automático
                    </span>
                  ) : isEntrada ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Recebido
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePago(t.id, t.pago)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                        t.pago
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
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

                {!t.isRecorrente && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(t)}
                      className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(t.id)}
                      className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
