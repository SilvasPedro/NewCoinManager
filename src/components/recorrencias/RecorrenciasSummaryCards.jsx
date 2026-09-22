import { TrendingUp, Calendar, CreditCard, ShieldAlert } from "lucide-react";

export default function RecorrenciasSummaryCards({
  receitasMensais,
  custoFixoMensal,
  custoParceladoMensal,
  dividaTotalRestante,
  qtdFixas,
  qtdParceladas,
  formatCurrency,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Dívida Restante / Compromisso Futuro (Dark Glass Luxury) */}
      <div
        id="card-recorrencias-divida"
        className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-xl border border-blue-400/25 shadow-lg text-white group hover:border-white/40 transition-all"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-500/20 blur-xl pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-200/90 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              Compromisso Futuro
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-md">
              {qtdParceladas} parcelamento{qtdParceladas !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">
              {formatCurrency(dividaTotalRestante)}
            </p>
            <p className="text-xs text-blue-200/70 mt-1">
              Soma de todas as parcelas restantes a pagar
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2: Receitas Recorrentes com Frosted Glass */}
      <div
        id="card-recorrencias-receitas"
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Receitas Fixas / Mês
          </span>
          <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
            +
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight break-words">
          {formatCurrency(receitasMensais)}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          Ganhos fixos creditados todo mês
        </p>
      </div>

      {/* CARD 3: Despesas Fixas */}
      <div
        id="card-recorrencias-fixas"
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-900" />
            Despesas Fixas
          </span>
          <span className="text-xs font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded-lg border border-blue-100">
            {qtdFixas} conta{qtdFixas !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight break-words">
          {formatCurrency(custoFixoMensal)}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          Custo mensal recorrente e contínuo
        </p>
      </div>

      {/* CARD 4: Parcelas do Mês */}
      <div
        id="card-recorrencias-parcelas"
        className="relative overflow-hidden rounded-2xl p-5 bg-orange-50/70 backdrop-blur-md border border-orange-200/80 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-orange-800 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-orange-600" />
            Parcelas no Mês
          </span>
          <span className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold">
            -
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-tight break-words">
          {formatCurrency(custoParceladoMensal)}
        </p>
        <p className="text-xs text-orange-800/80 mt-1 font-medium">
          Impacto mensal das compras parceladas
        </p>
      </div>
    </div>
  );
}
