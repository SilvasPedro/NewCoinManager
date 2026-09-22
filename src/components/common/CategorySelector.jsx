import { useState, useMemo } from "react";
import {
  Utensils,
  Home,
  Car,
  HeartPulse,
  GraduationCap,
  Sparkles,
  Tag,
  Search,
  Check,
  Plus,
} from "lucide-react";

const CATEGORIAS_PADRAO_COM_ICONES = [
  { nome: "Alimentação", icon: Utensils, cor: "bg-amber-100 text-amber-800 border-amber-200" },
  { nome: "Moradia", icon: Home, cor: "bg-blue-100 text-blue-800 border-blue-200" },
  { nome: "Transporte", icon: Car, cor: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { nome: "Saúde", icon: HeartPulse, cor: "bg-rose-100 text-rose-800 border-rose-200" },
  { nome: "Educação", icon: GraduationCap, cor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { nome: "Lazer", icon: Sparkles, cor: "bg-purple-100 text-purple-800 border-purple-200" },
  { nome: "Outros", icon: Tag, cor: "bg-gray-100 text-gray-800 border-gray-200" },
];

export default function CategorySelector({
  value,
  onChange,
  categoriasPersonalizadas = [],
}) {
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Normalizar categorias
  const todasCategorias = useMemo(() => {
    const list = [...CATEGORIAS_PADRAO_COM_ICONES];

    categoriasPersonalizadas.forEach((cat) => {
      const jaExiste = list.some((c) => c.nome.toLowerCase() === cat.toLowerCase());
      if (!jaExiste) {
        list.push({
          nome: cat,
          icon: Sparkles,
          cor: "bg-cyan-100 text-cyan-800 border-cyan-200",
          isPersonalizada: true,
        });
      }
    });

    // Se o valor selecionado não estiver na lista (ex: categoria antiga)
    if (value && !list.some((c) => c.nome.toLowerCase() === value.toLowerCase())) {
      list.push({
        nome: value,
        icon: Tag,
        cor: "bg-violet-100 text-violet-800 border-violet-200",
        isOutra: true,
      });
    }

    return list;
  }, [categoriasPersonalizadas, value]);

  const filteredCategorias = useMemo(() => {
    if (!search.trim()) return todasCategorias;
    return todasCategorias.filter((c) =>
      c.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [todasCategorias, search]);

  const handleSelect = (catNome) => {
    onChange(catNome.toLowerCase());
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChange(customInput.trim().toLowerCase());
      setCustomInput("");
      setShowAddCustom(false);
    }
  };

  const selectedItem = todasCategorias.find(
    (c) => c.nome.toLowerCase() === (value || "").toLowerCase()
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Categoria
        </label>
        {selectedItem && (
          <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 capitalize">
            <Check className="w-3 h-3 text-emerald-600" />
            {selectedItem.nome}
          </span>
        )}
      </div>

      {/* Caixa de Seleção com Busca e Visualização em Grid */}
      <div className="bg-gray-50/90 border border-gray-200 rounded-2xl p-2.5 space-y-2.5">
        {/* Barra de Busca rápida dentro do seletor */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar ou buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Grade de Categorias Interativas com Efeito Visual Refinado */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {filteredCategorias.map((cat) => {
            const isSelected = (value || "").toLowerCase() === cat.nome.toLowerCase();
            const Icon = cat.icon || Tag;

            return (
              <button
                key={cat.nome}
                type="button"
                onClick={() => handleSelect(cat.nome)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border cursor-pointer active:scale-95 ${
                  isSelected
                    ? "bg-white text-blue-950 font-bold border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-white/80 hover:bg-white text-gray-700 border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${cat.cor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs capitalize truncate font-medium flex-1">
                  {cat.nome}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Adicionar categoria personalizada rápida caso queira */}
        {showAddCustom ? (
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-200/60">
            <input
              type="text"
              placeholder="Nome da nova categoria..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 cursor-pointer"
            >
              Usar
            </button>
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="px-2 py-1.5 text-gray-500 hover:text-gray-800 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-700 pt-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            Inserir outra categoria
          </button>
        )}
      </div>
    </div>
  );
}
