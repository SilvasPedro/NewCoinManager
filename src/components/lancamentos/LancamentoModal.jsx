import { X, ArrowDownRight, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import CategorySelector from "../common/CategorySelector";

export default function LancamentoModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  editingId,
  onSubmit,
  categoriasPersonalizadas,
}) {
  if (!isOpen) return null;

  const handleQuickAddValue = (increment) => {
    const current = parseFloat(formData.valor) || 0;
    const nextVal = (current + increment).toFixed(2);
    setFormData((prev) => ({ ...prev, valor: nextVal }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-white/60 my-6">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {editingId ? "Editar Lançamento" : "Novo Lançamento"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Preencha os detalhes para registrar no seu fluxo financeiro
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

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4.5 max-h-[85vh] overflow-y-auto">
          {/* Seletor de Tipo (Despesa vs Receita) */}
          <div className="flex gap-2 p-1.5 bg-gray-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: "saida" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                formData.tipo === "saida"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Despesa (Saída)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: "entrada" })}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                formData.tipo === "entrada"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Receita (Entrada)
            </button>
          </div>

          {/* Campo Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Descrição do Lançamento
            </label>
            <input
              required
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder={
                formData.tipo === "saida"
                  ? "Ex: Supermercado, Combustível, Farmácia..."
                  : "Ex: Salário, Freelance, Pix recebido..."
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Campo Valor com Atalhos Rápidos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Valor (R$)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickAddValue(10)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-md cursor-pointer transition-colors"
                >
                  +10
                </button>
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

          {/* Seletor Visual Avançado de Categorias */}
          <CategorySelector
            value={formData.categoria}
            onChange={(cat) => setFormData({ ...formData, categoria: cat })}
            categoriasPersonalizadas={categoriasPersonalizadas}
          />

          {/* Competência e Status de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                Mês / Competência
              </label>
              <input
                required
                type="month"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.tipo === "saida" && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">Status de Pagamento</p>
                  <p className="text-[10px] text-gray-500">
                    {formData.pago ? "Lançamento liquidado" : "Pendente de quitação"}
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.pago}
                      onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                    />
                    <div
                      className={`block w-11 h-6 rounded-full transition-colors ${
                        formData.pago ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        formData.pago ? "transform translate-x-5" : ""
                      }`}
                    />
                  </div>
                </label>
              </div>
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
              {editingId ? "Salvar Alterações" : "Adicionar Lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
