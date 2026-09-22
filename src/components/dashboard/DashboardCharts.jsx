import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, Repeat, Layers } from "lucide-react";

// Paleta sofisticada de cores para categorias
const CATEGORY_COLORS = [
  "#2563eb", // blue-600
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#64748b", // slate-500
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
];

export default function DashboardCharts({
  dadosGrafico,
  dadosCategorias,
  dadosFixoVariavel,
  formatCurrency,
}) {
  const [activeTab, setActiveTab] = useState("fluxo"); // 'fluxo' | 'categorias' | 'fixoVariavel'

  const totalDespesasCategorias = dadosCategorias.reduce((acc, curr) => acc + curr.valor, 0);

  return (
    <div
      id="card-graficos-dashboard"
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 space-y-5"
    >
      {/* Barra de Seleção de Visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Análise Visual & Gráficos
          </h2>
          <p className="text-xs text-gray-500">
            Alterne entre as perspectivas financeiras
          </p>
        </div>

        {/* Tabs de navegação dos gráficos */}
        <div className="flex items-center gap-1 p-1 bg-gray-100/90 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            id="tab-chart-fluxo"
            type="button"
            onClick={() => setActiveTab("fluxo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "fluxo"
                ? "bg-white text-blue-900 shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Fluxo & Saldo
          </button>
          <button
            id="tab-chart-categorias"
            type="button"
            onClick={() => setActiveTab("categorias")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "categorias"
                ? "bg-white text-blue-900 shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            Categorias (Donut)
          </button>
          <button
            id="tab-chart-fixo-variavel"
            type="button"
            onClick={() => setActiveTab("fixoVariavel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === "fixoVariavel"
                ? "bg-white text-blue-900 shadow-xs font-bold"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Fixo vs Variável
          </button>
        </div>
      </div>

      {/* Conteúdo da Tab 1: Fluxo de Caixa e Linha de Saldo */}
      {activeTab === "fluxo" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
            <span>Evolução mensal de receitas, despesas e saldo disponível acumulado</span>
          </div>
          {dadosGrafico.length > 0 ? (
            <div className="h-64 sm:h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dadosGrafico}
                  margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                  <Bar
                    dataKey="receitas"
                    name="Receitas"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="despesas"
                    name="Despesas"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    name="Saldo Disponível"
                    stroke="#1e3a8a"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 flex-col">
              <Layers className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhum histórico suficiente para exibir o gráfico.</p>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Tab 2: Gráfico Donut de Categorias + Ranking */}
      {activeTab === "categorias" && (
        <div className="space-y-4">
          {dadosCategorias.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Gráfico Donut */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      dataKey="valor"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${formatCurrency(value)} (${(
                          (Number(value) / (totalDespesasCategorias || 1)) *
                          100
                        ).toFixed(1)}%)`,
                        "Valor",
                      ]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "0.75rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Ranking lateral de Categorias com barra de progresso */}
              <div className="lg:col-span-6 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Distribuição das Maiores Despesas
                </h3>
                {dadosCategorias.map((cat, idx) => {
                  const pct = totalDespesasCategorias > 0 ? (cat.valor / totalDespesasCategorias) * 100 : 0;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div
                      key={cat.nome}
                      className="p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                        <span className="flex items-center gap-2 text-gray-800 capitalize truncate max-w-[60%]">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          {cat.nome}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-bold">
                            {formatCurrency(cat.valor)}
                          </span>
                          <span className="text-gray-400 text-[11px] w-10 text-right">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 flex-col">
              <PieChartIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma despesa categorizada neste período.</p>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Tab 3: Despesas Fixas vs Variáveis */}
      {activeTab === "fixoVariavel" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Despesas Fixas / Recorrências
                </span>
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  {dadosFixoVariavel.pctFixa.toFixed(0)}% do total
                </span>
              </div>
              <p className="text-2xl font-extrabold text-indigo-950">
                {formatCurrency(dadosFixoVariavel.valorFixa)}
              </p>
              <p className="text-xs text-indigo-700/80 mt-1">
                Compromissos essenciais já contratados ou recorrentes
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Despesas Variáveis / Pontuais
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  {dadosFixoVariavel.pctVariavel.toFixed(0)}% do total
                </span>
              </div>
              <p className="text-2xl font-extrabold text-amber-950">
                {formatCurrency(dadosFixoVariavel.valorVariavel)}
              </p>
              <p className="text-xs text-amber-700/80 mt-1">
                Gastos do dia a dia mais fáceis de ajustar ou enxugar
              </p>
            </div>
          </div>

          <div className="h-44 sm:h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    tipo: "Composição de Despesas",
                    Recorrentes: dadosFixoVariavel.valorFixa,
                    Variaveis: dadosFixoVariavel.valorVariavel,
                  },
                ]}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${val}`}
                />
                <YAxis type="category" dataKey="tipo" hide />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="Recorrentes"
                  name="Fixas / Recorrentes"
                  fill="#4f46e5"
                  stackId="a"
                  radius={[4, 0, 0, 4]}
                />
                <Bar
                  dataKey="Variaveis"
                  name="Variáveis / Avulsas"
                  fill="#f59e0b"
                  stackId="a"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
