import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

export default function GlassStatCards({
  saldoMes,
  receitasMes,
  despesasMes,
  recomendadoGuardar,
  reservaPercentual,
  variacaoDespesas,
  viewMode,
  formatCurrency,
  saldoLivrePercentual,
}) {
  const isSaldoPositivo = saldoMes >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Saldo Principal com Efeito de Vidro Escuro Refinado (Dark Luxury Glass) */}
      <div
        id="card-saldo-principal"
        className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 shadow-xl border ${
          viewMode === "familia"
            ? "bg-gradient-to-br from-indigo-950/90 via-slate-900/85 to-blue-950/90 border-indigo-500/30 text-white"
            : "bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 border-blue-400/25 text-white"
        } backdrop-blur-xl group hover:border-white/40`}
      >
        {/* Luzes difusas de vidro (Ambient Glass Glows) */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-blue-500/20 blur-2xl pointer-events-none group-hover:bg-blue-400/25 transition-all"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-blue-200/90">
              <Wallet className="w-4 h-4 text-blue-400" />
              Saldo Líquido {viewMode === "familia" ? "(Família)" : ""}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                isSaldoPositivo
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {isSaldoPositivo ? "+ Superávit" : "- Déficit"}
            </span>
          </div>

          <div>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm break-words">
              {formatCurrency(saldoMes)}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-blue-200/80">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {saldoLivrePercentual >= 0 ? `${saldoLivrePercentual.toFixed(0)}% de margem livre` : "Gastos superando receitas"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Receitas Totais com Efeito de Vidro Claro (Frosted White Glass) */}
      <div
        id="card-receitas"
        className="relative overflow-hidden rounded-2xl p-6 bg-white/75 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Receitas
          </span>
          <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight break-words">
          {formatCurrency(receitasMes)}
        </p>
        <p className="text-xs text-gray-400 mt-2 font-medium">
          Entradas registradas no período
        </p>
      </div>

      {/* CARD 3: Despesas Totais com Efeito de Vidro Claro & Variação */}
      <div
        id="card-despesas"
        className="relative overflow-hidden rounded-2xl p-6 bg-white/75 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Despesas
          </span>
          <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight break-words">
            {formatCurrency(despesasMes)}
          </p>
          {variacaoDespesas !== 0 && (
            <div className="pt-1">
              <span
                className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  variacaoDespesas > 0
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {variacaoDespesas > 0 ? "▲ +" : "▼ -"}
                {Math.abs(variacaoDespesas).toFixed(1)}% vs mês anterior
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CARD 4: Reserva / Para Guardar com Efeito de Vidro Esmeralda Suave */}
      <div
        id="card-reserva"
        className="relative overflow-hidden rounded-2xl p-6 bg-emerald-50/70 backdrop-blur-md border border-emerald-200/80 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-800 flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-emerald-700" />
            Para Guardar
          </span>
          <span className="bg-emerald-200/90 text-emerald-900 text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-emerald-300">
            {reservaPercentual}%
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight break-words">
          {formatCurrency(recomendadoGuardar)}
        </p>
        <p className="text-xs text-emerald-700/80 mt-2 font-medium">
          Sugestão com base na sua meta configurada
        </p>
      </div>
    </div>
  );
}
