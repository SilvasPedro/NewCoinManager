import { useState } from "react";
import { ChevronDown, ChevronUp, Tag, Edit3, Trash2 } from "lucide-react";

export default function LancamentosCategoryGroupView({
  transacoes,
  togglePago,
  handleOpenEdit,
  confirmDelete,
  formatCurrency,
}) {
  // Guardar quais categorias estão abertas (por padrão todas abertas)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  if (transacoes.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <Tag className="w-10 h-10 text-gray-300 mb-2" />
        <h3 className="text-base font-bold text-gray-800">
          Nenhum lançamento para agrupar
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Ajuste os filtros ou adicione lançamentos para visualizar por categoria.
        </p>
      </div>
    );
  }

  // Agrupar por categoria
  const groups = {};
  let totalGeral = 0;

  transacoes.forEach((t) => {
    const cat = t.categoria || "Geral";
    if (!groups[cat]) {
      groups[cat] = {
        nome: cat,
        items: [],
        total: 0,
        receitas: 0,
        despesas: 0,
      };
    }
    groups[cat].items.push(t);
    totalGeral += t.valor || 0;
    if (t.tipo === "entrada") {
      groups[cat].receitas += t.valor;
    } else {
      groups[cat].despesas += t.valor;
      groups[cat].total += t.valor;
    }
  });

  const sortedGroups = Object.values(groups).sort((a, b) => b.total - a.total);

  const toggleCategory = (catNome) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catNome]: !prev[catNome],
    }));
  };

  return (
    <div className="space-y-4">
      {sortedGroups.map((group) => {
        const isCollapsed = collapsedCategories[group.nome];
        const pct = totalGeral > 0 ? (group.total / totalGeral) * 100 : 0;

        return (
          <div
            key={group.nome}
            className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
          >
            {/* Header do Grupo com Subtotais e Toggle */}
            <button
              type="button"
              onClick={() => toggleCategory(group.nome)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 capitalize truncate">
                      {group.nome}
                    </h3>
                    <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                      {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>
                      {group.despesas > 0 && `Despesas: ${formatCurrency(group.despesas)}`}
                      {group.despesas > 0 && group.receitas > 0 && " • "}
                      {group.receitas > 0 && `Receitas: ${formatCurrency(group.receitas)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-2">
                <div className="text-right">
                  <p className="text-base sm:text-lg font-extrabold text-gray-900">
                    {formatCurrency(group.despesas > 0 ? group.despesas : group.receitas)}
                  </p>
                  {group.despesas > 0 && (
                    <p className="text-[11px] text-gray-400 font-medium">
                      {pct.toFixed(0)}% do orçamento
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </div>
              </div>
            </button>

            {/* Lista dos Lançamentos da Categoria */}
            {!isCollapsed && (
              <div className="border-t border-gray-100 divide-y divide-gray-100 bg-white/40">
                {group.items.map((t) => {
                  const isEntrada = t.tipo === "entrada";
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-blue-50/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="truncate">
                          <p className="text-sm font-bold text-gray-900 capitalize truncate">
                            {t.descricao}
                          </p>
                          {t.isRecorrente && (
                            <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Recorrente
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span
                          className={`text-sm sm:text-base font-extrabold ${
                            isEntrada ? "text-emerald-600" : "text-gray-900"
                          }`}
                        >
                          {isEntrada ? "+ " : "- "}
                          {formatCurrency(t.valor)}
                        </span>

                        {!t.isRecorrente && !isEntrada && (
                          <button
                            type="button"
                            onClick={() => togglePago(t.id, t.pago)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                              t.pago
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.pago ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {t.pago ? "Pago" : "Pendente"}
                          </button>
                        )}

                        {!t.isRecorrente && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-blue-700 hover:bg-blue-100/60 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDelete(t.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-100/60 rounded-lg transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
