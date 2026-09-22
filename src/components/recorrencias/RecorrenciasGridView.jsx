import { Edit2, Trash2, Calendar, Clock, CreditCard } from "lucide-react";

export default function RecorrenciasGridView({
  items,
  onEdit,
  onDelete,
  formatCurrency,
  calcularPrevisaoFim,
}) {
  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-900 mx-auto flex items-center justify-center mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <p className="text-gray-900 font-bold text-base">Nenhuma recorrência encontrada</p>
        <p className="text-gray-500 text-xs mt-1">
          Ajuste os filtros ou crie uma nova recorrência para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const isEntrada = item.tipoTransacao === "entrada";
        const isParcelada = item.tipo === "parcelada";
        const progresso = isParcelada
          ? Math.min(100, Math.round((item.parcelaAtual / item.parcelasTotais) * 100))
          : 100;

        const parcelasRestantes = isParcelada
          ? Math.max(0, item.parcelasTotais - item.parcelaAtual)
          : 0;
        const valorTotalRestante = parcelasRestantes * item.valor;

        return (
          <div
            key={item.id}
            id={`recorrencia-card-${item.id}`}
            className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
          >
            {/* Topo do Card */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                        isEntrada
                          ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                          : isParcelada
                          ? "bg-orange-100/90 text-orange-800 border border-orange-200"
                          : "bg-blue-100/90 text-blue-900 border border-blue-200"
                      }`}
                    >
                      {isEntrada
                        ? "Receita Fixa"
                        : isParcelada
                        ? "Despesa Parcelada"
                        : "Despesa Fixa"}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                      {item.categoria}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight capitalize truncate">
                    {item.descricao}
                  </h3>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar recorrência"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Excluir recorrência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bloco de Valor Mensal e Dívida Restante */}
              <div className="flex items-baseline justify-between mb-4 pt-1">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    Valor Mensal
                  </span>
                  <p
                    className={`text-2xl font-black tracking-tight ${
                      isEntrada ? "text-emerald-600" : "text-gray-900"
                    }`}
                  >
                    {isEntrada ? "+ " : "- "}
                    {formatCurrency(item.valor)}
                  </p>
                </div>

                {isParcelada && (
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Falta Pagar
                    </span>
                    <p className="text-sm font-bold text-rose-600">
                      {formatCurrency(valorTotalRestante)}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {parcelasRestantes}x de {formatCurrency(item.valor)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé: Progresso para Parceladas OU Indicador para Fixas */}
            {isParcelada ? (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    Parcela {item.parcelaAtual} de {item.parcelasTotais}
                    <span className="text-[11px] text-orange-600 font-semibold ml-1">
                      ({progresso}%)
                    </span>
                  </span>
                  <span className="text-gray-400 font-medium text-[11px]">
                    Previsão Término:{" "}
                    <strong className="text-gray-800 capitalize">
                      {calcularPrevisaoFim(
                        item.dataInicio,
                        item.parcelaAtual,
                        item.parcelasTotais
                      )}
                    </strong>
                  </span>
                </div>

                {/* Barra de Progresso com Transição Suave */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-900" />
                  Cobrança Mensal Contínua
                </span>
                {item.dataInicio && (
                  <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600">
                    Desde: {item.dataInicio}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
