import { Edit2, Trash2, CreditCard } from "lucide-react";

export default function RecorrenciasTableView({
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
          Ajuste os filtros ou crie uma nova recorrência.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* Visualização em Tabela para Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200/60">
            <tr>
              <th className="py-3.5 px-4">Descrição</th>
              <th className="py-3.5 px-3">Categoria</th>
              <th className="py-3.5 px-3">Modalidade</th>
              <th className="py-3.5 px-3">Início / Término</th>
              <th className="py-3.5 px-3 text-right">Valor Mensal</th>
              <th className="py-3.5 px-3 text-right">Saldo Restante</th>
              <th className="py-3.5 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isEntrada = item.tipoTransacao === "entrada";
              const isParcelada = item.tipo === "parcelada";
              const parcelasRestantes = isParcelada
                ? Math.max(0, item.parcelasTotais - item.parcelaAtual)
                : 0;
              const valorRestante = parcelasRestantes * item.valor;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {/* Descrição */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900 capitalize">
                      {item.descricao}
                    </p>
                  </td>

                  {/* Categoria */}
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                      {item.categoria}
                    </span>
                  </td>

                  {/* Modalidade */}
                  <td className="py-3.5 px-3">
                    {isEntrada ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Receita Fixa
                      </span>
                    ) : isParcelada ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                          {item.parcelaAtual}/{item.parcelasTotais} parcelas
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        Despesa Fixa
                      </span>
                    )}
                  </td>

                  {/* Início / Término */}
                  <td className="py-3.5 px-3 text-xs text-gray-600">
                    {isParcelada ? (
                      <div>
                        <span className="font-medium">
                          Fim:{" "}
                          <strong className="text-gray-900 capitalize">
                            {calcularPrevisaoFim(
                              item.dataInicio,
                              item.parcelaAtual,
                              item.parcelasTotais
                            )}
                          </strong>
                        </span>
                        <p className="text-[10px] text-gray-400">
                          Início: {item.dataInicio || "-"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        Desde: {item.dataInicio || "Contínua"}
                      </span>
                    )}
                  </td>

                  {/* Valor Mensal */}
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`font-black text-sm ${
                        isEntrada ? "text-emerald-600" : "text-gray-900"
                      }`}
                    >
                      {isEntrada ? "+ " : "- "}
                      {formatCurrency(item.valor)}
                    </span>
                  </td>

                  {/* Saldo Restante */}
                  <td className="py-3.5 px-3 text-right text-xs">
                    {isParcelada ? (
                      <div>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(valorRestante)}
                        </span>
                        <p className="text-[10px] text-gray-400">
                          {parcelasRestantes}x restantes
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile fallback layout */}
      <div className="md:hidden divide-y divide-gray-100 p-2">
        {items.map((item) => {
          const isEntrada = item.tipoTransacao === "entrada";
          const isParcelada = item.tipo === "parcelada";
          const parcelasRestantes = isParcelada
            ? Math.max(0, item.parcelasTotais - item.parcelaAtual)
            : 0;

          return (
            <div key={item.id} className="p-3.5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 capitalize text-sm">
                    {item.descricao}
                  </h4>
                  <p className="text-xs text-gray-500 capitalize">{item.categoria}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span
                  className={`text-base font-black ${
                    isEntrada ? "text-emerald-600" : "text-gray-900"
                  }`}
                >
                  {isEntrada ? "+ " : "- "}
                  {formatCurrency(item.valor)}
                  <span className="text-[11px] font-normal text-gray-400 ml-1">/mês</span>
                </span>

                {isParcelada ? (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    {item.parcelaAtual}/{item.parcelasTotais} ({parcelasRestantes}x faltam)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Fixa
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
