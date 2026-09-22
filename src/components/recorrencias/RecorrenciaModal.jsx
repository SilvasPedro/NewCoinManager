import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Info } from "lucide-react";
import CategorySelector from "../common/CategorySelector";

export default function RecorrenciaModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  editingId,
  onSubmit,
  categoriasPersonalizadas = [],
  formatCurrency,
  calcularPrevisaoFim,
}) {
  if (!isOpen) return null;

  const isParcelada = formData.tipo === "parcelada";
  const numAtual = parseInt(formData.parcelaAtual) || 1;
  const numTotais = parseInt(formData.parcelasTotais) || 2;
  const numValor = parseFloat(formData.valor) || 0;
  const parcelasRestantes = Math.max(0, numTotais - numAtual);
  const dividaRestantePreview = parcelasRestantes * numValor;

  const handleQuickAddValue = (increment) => {
    const current = parseFloat(formData.valor) || 0;
    const nextVal = (current + increment).toFixed(2);
    setFormData((prev) => ({ ...prev, valor: nextVal }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-white/60 my-6">
        {/* Header do Modal */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {editingId ? "Editar Recorrência" : "Nova Recorrência"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Defina custos fixos, receitas ou parcelamentos automáticos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-xs transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Seletor Tipo de Transação (Despesa vs Receita) */}
          <div className="flex gap-2 p-1.5 bg-gray-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoTransacao: "saida" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                formData.tipoTransacao === "saida"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoTransacao: "entrada" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                formData.tipoTransacao === "entrada"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita
            </button>
          </div>

          {/* Seletor Modalidade: Valor Fixo vs Parcelado */}
          <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: "fixa" })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formData.tipo === "fixa"
                  ? "bg-blue-900 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Valor Fixo Contínuo
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: "parcelada" })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                formData.tipo === "parcelada"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-orange-600"
              }`}
            >
              Compra Parcelada
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <input
              required
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder={
                formData.tipoTransacao === "entrada"
                  ? "Ex: Salário mensal, Rendimento de aluguel..."
                  : formData.tipo === "parcelada"
                  ? "Ex: Smartphone, Notebook parcelado..."
                  : "Ex: Aluguel, Internet, Academia..."
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Valor Mensal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Valor Mensal (R$)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickAddValue(50)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-md cursor-pointer transition-colors"
                >
                  +50
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddValue(100)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-md cursor-pointer transition-colors"
                >
                  +100
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                <DollarSign className="w-4 h-4 text-gray-500" />
              </div>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-gray-900 text-base"
              />
            </div>
          </div>

          {/* Seletor de Categorias Avançado e Moderno */}
          <CategorySelector
            value={formData.categoria}
            onChange={(cat) => setFormData({ ...formData, categoria: cat })}
            categoriasPersonalizadas={categoriasPersonalizadas}
          />

          {/* Configuração de Parcelamento (Se for compra parcelada) */}
          {isParcelada && (
            <div className="space-y-3 p-4 bg-orange-50/80 border border-orange-200/90 rounded-2xl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-orange-950 uppercase tracking-wider mb-1">
                    Parcela Atual
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.parcelaAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, parcelaAtual: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-center font-black text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-950 uppercase tracking-wider mb-1">
                    Total de Parcelas
                  </label>
                  <input
                    required
                    type="number"
                    min="2"
                    value={formData.parcelasTotais}
                    onChange={(e) =>
                      setFormData({ ...formData, parcelasTotais: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-orange-200 rounded-xl text-center font-black text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Card de Preview Interativo em Tempo Real */}
              <div className="bg-white/90 p-3 rounded-xl border border-orange-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-orange-600" />
                    Parcelas a pagar:
                  </span>
                  <p className="font-extrabold text-gray-900">
                    {parcelasRestantes}x de {formatCurrency(numValor)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-gray-500 font-semibold block">Dívida Restante:</span>
                  <span className="font-black text-rose-600 text-sm">
                    {formatCurrency(dividaRestantePreview)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mês de Início */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-900" />
              {isParcelada ? "Mês da 1ª Parcela" : "Mês de Início"}
            </label>
            <input
              required
              type="month"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isParcelada && formData.dataInicio && (
              <p className="text-[11px] text-gray-500 mt-1">
                Previsão de quitação:{" "}
                <strong className="text-gray-900 capitalize">
                  {calcularPrevisaoFim(formData.dataInicio, numAtual, numTotais)}
                </strong>
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {editingId ? "Salvar Alterações" : "Adicionar Recorrência"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
