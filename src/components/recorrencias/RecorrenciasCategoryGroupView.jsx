import { useState } from "react";
import { Folder, ChevronDown, ChevronUp, Edit2, Trash2, CreditCard } from "lucide-react";

export default function RecorrenciasCategoryGroupView({
  items,
  onEdit,
  onDelete,
  formatCurrency,
  calcularPrevisaoFim,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 mx-auto flex items-center justify-center mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <p className="text-gray-900 font-bold text-base">Nenhuma recorrência encontrada</p>
        <p className="text-gray-500 text-xs mt-1">
          Ajuste os filtros ou crie uma nova recorrência.
        </p>
      </div>
    );
  }

  // Agrupar por categoria
  const grouped = items.reduce((acc, item) => {
    const cat = item.categoria?.toLowerCase() || "outros";
    if (!acc[cat]) {
      acc[cat] = {
        nome: cat,
        items: [],
        totalMensal: 0,
        totalRestanteDivida: 0,
      };
    }
    acc[cat].items.push(item);
    if (item.tipoTransacao === "entrada") {
      acc[cat].totalMensal += item.valor;
    } else {
      acc[cat].totalMensal -= item.valor;
      if (item.tipo === "parcelada") {
        const rest = Math.max(0, item.parcelasTotais - item.parcelaAtual);
        acc[cat].totalRestanteDivida += rest * item.valor;
      }
    }
    return acc;
  }, {});

  const categories = Object.values(grouped).sort(
    (a, b) => Math.abs(b.totalMensal) - Math.abs(a.totalMensal)
  );

  const toggleCategory = (catName) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  return (
    <div className="space-y-4">
      {categories.map((group) => {
        const isCollapsed = !!collapsedCategories[group.nome];

        return (
          <div
            key={group.nome}
            className="bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
          >
            {/* Cabeçalho da Categoria com Efeito de Vidro */}
            <div
              onClick={() => toggleCategory(group.nome)}
              className="p-4 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between cursor-pointer border-b border-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center shrink-0">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 capitalize text-sm sm:text-base">
                    {group.nome}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {group.items.length} recorrência{group.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Impacto Mensal
                  </span>
                  <span
                    className={`font-black text-sm sm:text-base ${
                      group.totalMensal >= 0 ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {group.totalMensal >= 0 ? "+ " : ""}
                    {formatCurrency(group.totalMensal)}
                  </span>
                </div>
                <div className="text-gray-400">
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Itens da Categoria */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-100">
                {group.items.map((item) => {
                  const isEntrada = item.tipoTransacao === "entrada";
                  const isParcelada = item.tipo === "parcelada";
                  const parcelasRestantes = isParcelada
                    ? Math.max(0, item.parcelasTotais - item.parcelaAtual)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isEntrada
                                ? "bg-emerald-100 text-emerald-800"
                                : isParcelada
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {isEntrada
                              ? "Receita Fixa"
                              : isParcelada
                              ? `Parcela ${item.parcelaAtual}/${item.parcelasTotais}`
                              : "Despesa Fixa"}
                          </span>
                          <span className="font-bold text-gray-900 capitalize text-sm">
                            {item.descricao}
                          </span>
                        </div>
                        {isParcelada && (
                          <p className="text-[11px] text-gray-400">
                            Fim previsto:{" "}
                            <strong className="text-gray-700 capitalize">
                              {calcularPrevisaoFim(
                                item.dataInicio,
                                item.parcelaAtual,
                                item.parcelasTotais
                              )}
                            </strong>{" "}
                            ({parcelasRestantes} parcelas restantes)
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <span
                          className={`font-black text-sm ${
                            isEntrada ? "text-emerald-600" : "text-gray-900"
                          }`}
                        >
                          {isEntrada ? "+ " : "- "}
                          {formatCurrency(item.valor)}
                          <span className="text-[10px] text-gray-400 font-normal ml-0.5">
                            /mês
                          </span>
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
