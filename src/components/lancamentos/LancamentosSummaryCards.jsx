import { TrendingUp, TrendingDown, Clock, Wallet, CheckCircle2 } from "lucide-react";

export default function LancamentosSummaryCards({
  receitasTotal,
  despesasTotal,
  saldoTotal,
  despesasPendentes,
  qtdPendentes,
  qtdPagos,
  formatCurrency,
}) {
  const isSaldoPositivo = saldoTotal >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Saldo do Mês com Efeito de Vidro Escuro & Glow */}
      <div
        id="card-lancamentos-saldo"
        className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-xl border border-blue-400/25 shadow-lg text-white group hover:border-white/40 transition-all"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-500/20 blur-xl pointer-events-none group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-200/90 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-400" />
              Saldo Previsto
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
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">
              {formatCurrency(saldoTotal)}
            </p>
            <p className="text-xs text-blue-200/70 mt-1">
              Balanço líquido de receitas e saídas
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2: Total de Receitas com Frosted Glass */}
      <div
        id="card-lancamentos-receitas"
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Entradas
          </span>
          <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
            +
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight break-words">
          {formatCurrency(receitasTotal)}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          Receitas creditadas neste mês
        </p>
      </div>

      {/* CARD 3: Total de Despesas com Frosted Glass */}
      <div
        id="card-lancamentos-despesas"
        className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Saídas Totais
          </span>
          <span className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 text-xs font-bold">
            -
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight break-words">
          {formatCurrency(despesasTotal)}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {qtdPagos} pagas
          </span>
        </div>
      </div>

      {/* CARD 4: Contas a Pagar / Pendentes */}
      <div
        id="card-lancamentos-pendentes"
        className="relative overflow-hidden rounded-2xl p-5 bg-amber-50/70 backdrop-blur-md border border-amber-200/80 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            A Pagar / Pendentes
          </span>
          <span className="text-xs font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300">
            {qtdPendentes} pendência{qtdPendentes !== 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight break-words">
          {formatCurrency(despesasPendentes)}
        </p>
        <p className="text-xs text-amber-800/80 mt-1 font-medium">
          Ainda não baixado do seu saldo
        </p>
      </div>
    </div>
  );
}
