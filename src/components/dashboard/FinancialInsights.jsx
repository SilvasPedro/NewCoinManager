import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export default function FinancialInsights({
  saldoLivrePercentual,
  receitasMes,
  despesasMes,
  saldoMes,
  recomendadoGuardar,
  reservaPercentual,
  maiorDespesa,
  maiorCategoria,
  formatCurrency,
}) {
  const percentualClamped = Math.max(0, Math.min(100, Number(saldoLivrePercentual) || 0));
  const taxaComprometimento = receitasMes > 0 ? Math.min(100, Math.round((despesasMes / receitasMes) * 100)) : 100;

  // Determinar status, cores e insights com base no percentual de saldo livre
  const getStatusConfig = () => {
    if (saldoLivrePercentual >= 50) {
      return {
        nivel: "Excelente (Investidor)",
        titulo: "Superávit Notável: Alta Capacidade de Poupança",
        badge: "Excelente",
        corTexto: "text-emerald-700",
        corBarra: "bg-emerald-500",
        corBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        corFundoIcone: "bg-emerald-100 text-emerald-700",
        icone: ShieldCheck,
        insights: [
          {
            icone: Sparkles,
            titulo: "Margem de economia ampla",
            texto: `Você tem ${percentualClamped.toFixed(0)}% (${formatCurrency(saldoMes)}) da sua receita totalmente livre para novos objetivos.`,
          },
          {
            icone: Target,
            titulo: "Aceleração de metas e investimentos",
            texto: `Ótimo momento para antecipar metas financeiras ou fortalecer sua reserva (${formatCurrency(recomendadoGuardar)} sugeridos).`,
          },
          {
            icone: CheckCircle2,
            titulo: "Custo de vida sob controle",
            texto: `Seus gastos totais consumiram apenas ${taxaComprometimento}% das receitas, garantindo resiliência a imprevistos.`,
          },
        ],
      };
    }

    if (saldoLivrePercentual >= 20) {
      return {
        nivel: "Saudável (Equilibrado)",
        titulo: "Orçamento Controlado e Margem Confortável",
        badge: "Saudável",
        corTexto: "text-blue-900",
        corBarra: "bg-blue-600",
        corBadge: "bg-blue-100 text-blue-800 border-blue-200",
        corFundoIcone: "bg-blue-100 text-blue-800",
        icone: CheckCircle2,
        insights: [
          {
            icone: Sparkles,
            titulo: "Regra dos 20%+ atingida",
            texto: `Com ${percentualClamped.toFixed(0)}% livre, você está na faixa recomendada de poupança saudável para proteger seu futuro.`,
          },
          {
            icone: Lightbulb,
            titulo: "Reserva recomendada ativa",
            texto: `Alocando os ${reservaPercentual}% calculados (${formatCurrency(recomendadoGuardar)}), você blinda sua tranquilidade financeira.`,
          },
          {
            icone: PieChart,
            titulo: "Acompanhe a maior categoria",
            texto: `A categoria "${maiorCategoria.nome}" liderou seus desembolsos (${formatCurrency(maiorCategoria.valor)}).`,
          },
        ],
      };
    }

    if (saldoLivrePercentual >= 5) {
      return {
        nivel: "Atenção (Margem Estreita)",
        titulo: "Pouca Folga Orçamentária no Mês",
        badge: "Atenção",
        corTexto: "text-amber-700",
        corBarra: "bg-amber-500",
        corBadge: "bg-amber-100 text-amber-800 border-amber-200",
        corFundoIcone: "bg-amber-100 text-amber-700",
        icone: AlertTriangle,
        insights: [
          {
            icone: AlertTriangle,
            titulo: "Margem livre curta",
            texto: `Restaram apenas ${percentualClamped.toFixed(0)}% da receita livre. Qualquer gasto extraordinário pode comprometer suas economias.`,
          },
          {
            icone: Lightbulb,
            titulo: "Revisão de maior gasto",
            texto: `Seu maior lançamento foi "${maiorDespesa.descricao}" (${formatCurrency(maiorDespesa.valor)}). Avalie se pode ser otimizado no próximo mês.`,
          },
          {
            icone: TrendingUp,
            titulo: "Otimização em foco",
            texto: `Tente conter despesas na categoria "${maiorCategoria.nome}" para restabelecer ao menos 20% de margem livre.`,
          },
        ],
      };
    }

    // < 5% ou negativo
    return {
      nivel: "Crítico (Risco de Déficit)",
      titulo: "Despesas Consumindo Quase Toda a Renda",
      badge: "Alerta Crítico",
      corTexto: "text-rose-700",
      corBarra: "bg-rose-500",
      corBadge: "bg-rose-100 text-rose-800 border-rose-200",
      corFundoIcone: "bg-rose-100 text-rose-700",
      icone: AlertOctagon,
      insights: [
        {
          icone: AlertOctagon,
          titulo: "Alerta de comprometimento alto",
          texto: `Suas despesas atingiram ${taxaComprometimento}% das receitas neste período${saldoMes < 0 ? ` (déficit de ${formatCurrency(Math.abs(saldoMes))})` : ""}.`,
        },
        {
          icone: Lightbulb,
          titulo: "Contenção de despesas variáveis",
          texto: `Priorize gastos essenciais de moradia/alimentação e congele compras discricionárias até o próximo ciclo salarial.`,
        },
        {
          icone: ShieldCheck,
          titulo: "Evite juros e cartão rotativo",
          texto: `Seu maior gasto foi "${maiorDespesa.descricao}" (${formatCurrency(maiorDespesa.valor)}). Renegocie prazos se necessário para não recorrer a dívidas caras.`,
        },
      ],
    };
  };

  const status = getStatusConfig();
  const IconeStatus = status.icone;

  return (
    <section
      id="section-status-financeiro"
      className="bg-gradient-to-br from-white/90 via-slate-50/80 to-blue-50/40 backdrop-blur-lg border border-white/80 shadow-sm rounded-2xl p-5 sm:p-6 transition-all"
    >
      {/* Header do Status Financeiro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${status.corFundoIcone} shadow-xs`}>
            <IconeStatus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Diagnóstico & Status Financeiro
              </h2>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${status.corBadge}`}>
                {status.badge}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${status.corTexto}`}>
              {status.titulo}
            </p>
          </div>
        </div>

        {/* Indicador grande do % livre */}
        <div className="flex items-baseline gap-1.5 bg-white/80 border border-gray-200/80 px-3.5 py-2 rounded-xl shadow-xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-gray-400">Saldo Livre:</span>
          <span className={`text-2xl sm:text-3xl font-black ${status.corTexto}`}>
            {percentualClamped.toFixed(0)}%
          </span>
          <span className="text-[11px] text-gray-400 font-medium">da receita</span>
        </div>
      </div>

      {/* Barra de Progresso com Marcadores */}
      <div className="py-4 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-gray-500">Distribuição da Renda</span>
          <span className="text-gray-700">
            {taxaComprometimento}% despesas vs {percentualClamped.toFixed(0)}% livre
          </span>
        </div>
        <div className="w-full bg-gray-200/80 rounded-full h-3.5 overflow-hidden p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${status.corBarra}`}
            style={{ width: `${Math.max(4, percentualClamped)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium px-1">
          <span className="text-rose-600 font-semibold">0% (Risco)</span>
          <span className="text-amber-600 font-semibold">20% (Mínimo Ideal)</span>
          <span className="text-blue-600 font-semibold">50%+ (Investidor)</span>
        </div>
      </div>

      {/* 3 Pequenos Insights Cards Baseados no % Livre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {status.insights.map((item, idx) => {
          const ItemIcon = item.icone;
          return (
            <div
              key={idx}
              id={`insight-card-${idx}`}
              className="bg-white/85 backdrop-blur-xs border border-gray-100/90 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                  <ItemIcon className="w-3.5 h-3.5 text-blue-900" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 leading-tight">
                  {item.titulo}
                </h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pl-9">
                {item.texto}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
