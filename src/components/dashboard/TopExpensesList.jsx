import { Calendar, Tag } from "lucide-react";

export default function TopExpensesList({ transacoes, formatCurrency }) {
  // Pegar as 5 maiores despesas do período selecionado
  const topDespesas = transacoes
    .filter((t) => t.tipo === "saida" && t.categoria !== "Metas" && !t.descricao?.includes("Investimento:"))
    .sort((a, b) => (b.valor || 0) - (a.valor || 0))
    .slice(0, 5);

  if (topDespesas.length === 0) {
    return null;
  }

  return (
    <div
      id="card-top-despesas"
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            Maiores Despesas do Período
          </h2>
          <p className="text-xs text-gray-500">
            Lançamentos de maior impacto no seu fluxo de caixa
          </p>
        </div>
        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
          Top {topDespesas.length}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {topDespesas.map((item, index) => (
          <div
            key={item.id || index}
            className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/70 -mx-2 px-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-xs border border-rose-100">
                #{index + 1}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-gray-900 truncate capitalize">
                  {item.descricao || "Sem descrição"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                    <Tag className="w-2.5 h-2.5" />
                    {item.categoria || "Geral"}
                  </span>
                  {item.referencia && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.referencia}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm sm:text-base font-extrabold text-rose-600">
                - {formatCurrency(item.valor)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
