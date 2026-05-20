// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [allTransacoes, setAllTransacoes] = useState([]);
  const [allRecorrencias, setAllRecorrencias] = useState([]);
  
  const [hasFamily, setHasFamily] = useState(false);
  const [viewMode, setViewMode] = useState("individual");
  const [reservaPercentual, setReservaPercentual] = useState(0);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const dataAtual = new Date();
    return `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  useEffect(() => {
    async function fetchDados() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        
        const configSnap = await getDoc(doc(db, "configuracoes", user.uid));
        if (configSnap.exists()) {
          setReservaPercentual(configSnap.data().reservaPercentual || 0);
        }

        const conexoesRef = collection(db, "conexoes_familia");
        const q1 = query(conexoesRef, where("usuario1_uid", "==", user.uid), where("status", "==", "aceito"));
        const q2 = query(conexoesRef, where("usuario2_uid", "==", user.uid), where("status", "==", "aceito"));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        let uidsFamilia = [user.uid];
        snap1.forEach(d => uidsFamilia.push(d.data().usuario2_uid));
        snap2.forEach(d => uidsFamilia.push(d.data().usuario1_uid));
        
        uidsFamilia = [...new Set(uidsFamilia.filter(id => id))];
        setHasFamily(uidsFamilia.length > 1);

        const chunks = [];
        for (let i = 0; i < uidsFamilia.length; i += 10) {
           chunks.push(uidsFamilia.slice(i, i + 10));
        }
        
        let todasTr = [];
        let todasRec = [];

        for (const chunk of chunks) {
            const qTr = query(collection(db, "financas"), where("uid", "in", chunk));
            const snapTr = await getDocs(qTr);
            snapTr.forEach(d => todasTr.push({ id: d.id, ...d.data() }));

            const qRec = query(collection(db, "recorrencias"), where("uid", "in", chunk));
            const snapRec = await getDocs(qRec);
            snapRec.forEach(d => todasRec.push({ id: d.id, ...d.data() }));
        }
        
        setAllTransacoes(todasTr);
        setAllRecorrencias(todasRec);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, [user]);

  const transacoesCompletas = useMemo(() => {
    const trFiltradas = viewMode === "familia" ? allTransacoes : allTransacoes.filter(t => t.uid === user?.uid);
    const recFiltradas = viewMode === "familia" ? allRecorrencias : allRecorrencias.filter(r => r.uid === user?.uid);

    const [year, month] = selectedMonth.split("-").map(Number);
    const dataAnterior = new Date(year, month - 2, 1); 
    const prevRef = `${dataAnterior.getFullYear()}-${String(dataAnterior.getMonth() + 1).padStart(2, "0")}`;
    
    const mesesParaGerar = new Set([...trFiltradas.map(t => t.referencia), selectedMonth, prevRef]);
    const transacoesFinais = [...trFiltradas];

    recFiltradas.forEach(rec => {
      if (!rec.dataInicio) return;
      const [startYear, startMonth] = rec.dataInicio.split("-").map(Number);

      mesesParaGerar.forEach(refMes => {
        if (!refMes) return;
        const [refY, refM] = refMes.split("-").map(Number);
        const monthDiff = (refY - startYear) * 12 + (refM - startMonth);

        if (monthDiff >= 0) {
          if (rec.tipo === "fixa" || (rec.tipo === "parcelada" && rec.parcelaAtual + monthDiff <= rec.parcelasTotais)) {
            transacoesFinais.push({
              id: `rec-${rec.id}-${refMes}`,
              valor: rec.valor,
              tipo: "saida", 
              categoria: rec.categoria,
              referencia: refMes,
              descricao: rec.descricao
            });
          }
        }
      });
    });

    return transacoesFinais;
  }, [allTransacoes, allRecorrencias, viewMode, user, selectedMonth]);

  const metrics = useMemo(() => {
    const currentRef = selectedMonth;
    const [year, month] = selectedMonth.split("-").map(Number);
    const dataAnterior = new Date(year, month - 2, 1); 
    const prevRef = `${dataAnterior.getFullYear()}-${String(dataAnterior.getMonth() + 1).padStart(2, "0")}`;

    let receitasMes = 0; let despesasMes = 0; let despesasMesAnterior = 0;
    let maiorDespesa = { descricao: "Nenhuma", valor: 0 };
    const categoriasMes = {};
    const historicoPorMes = {};

    transacoesCompletas.forEach((t) => {
      if (!historicoPorMes[t.referencia]) {
        historicoPorMes[t.referencia] = { name: t.referencia, receitas: 0, despesas: 0, saldo: 0 };
      }
      if (t.tipo === "entrada") historicoPorMes[t.referencia].receitas += t.valor;
      if (t.tipo === "saida") historicoPorMes[t.referencia].despesas += t.valor;
      historicoPorMes[t.referencia].saldo = historicoPorMes[t.referencia].receitas - historicoPorMes[t.referencia].despesas;

      if (t.referencia === currentRef) {
        if (t.tipo === "entrada") receitasMes += t.valor;
        if (t.tipo === "saida") {
          despesasMes += t.valor;
          if (t.valor > maiorDespesa.valor) maiorDespesa = { descricao: t.descricao, valor: t.valor };
          categoriasMes[t.categoria] = (categoriasMes[t.categoria] || 0) + t.valor;
        }
      }

      if (t.referencia === prevRef) {
        if (t.tipo === "saida") despesasMesAnterior += t.valor;
      }
    });

    let maiorCategoria = { nome: "Nenhuma", valor: 0 };
    for (const [cat, val] of Object.entries(categoriasMes)) {
      if (val > maiorCategoria.valor) maiorCategoria = { nome: cat, valor: val };
    }

    const saldoMes = receitasMes - despesasMes;
    const recomendadoGuardar = saldoMes > 0 ? saldoMes * (reservaPercentual / 100) : 0;

    // NOVO: Cálculo da variação de despesas
    let variacaoDespesas = 0;
    if (despesasMesAnterior > 0) {
      variacaoDespesas = ((despesasMes - despesasMesAnterior) / despesasMesAnterior) * 100;
    }

    let saudeScore = 0;
    if (receitasMes > 0) {
      const gastoPercentual = (despesasMes / receitasMes) * 100;
      saudeScore = Math.max(0, 100 - gastoPercentual);
    }

    const dadosGrafico = Object.values(historicoPorMes).sort((a, b) => a.name.localeCompare(b.name));

    return { 
      receitasMes, despesasMes, saldoMes, recomendadoGuardar, maiorDespesa, 
      maiorCategoria, variacaoDespesas, saudeScore, dadosGrafico 
    };
  }, [transacoesCompletas, selectedMonth, reservaPercentual]);

  const obterStatusSaude = (score) => {
    if (score >= 70) return { texto: "Investidor! Saldo excelente.", cor: "text-green-600", bgCor: "bg-green-500" };
    if (score >= 30) return { texto: "Equilibrado. Mantenha o controle.", cor: "text-yellow-600", bgCor: "bg-yellow-500" };
    return { texto: "Atenção aos gastos!", cor: "text-red-600", bgCor: "bg-red-500" };
  };

  const statusSaude = obterStatusSaude(metrics.saudeScore);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-gray-200">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Visão Geral</h2>
                <p className="text-gray-500 mt-1 text-sm">Resumo financeiro do período.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {hasFamily && (
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 w-full sm:w-auto">
                  <button onClick={() => setViewMode("individual")} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${viewMode === 'individual' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    Meu Saldo
                  </button>
                  <button onClick={() => setViewMode("familia")} className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${viewMode === 'familia' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Família
                  </button>
                </div>
              )}

              <div className="flex items-center bg-gray-50 md:bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-full sm:w-auto">
                <span className="px-3 text-sm font-semibold text-gray-500 hidden md:block">Período:</span>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full sm:w-auto px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold tracking-wide" />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-2xl shadow-lg text-white relative overflow-hidden transition-colors duration-500 ${viewMode === 'familia' ? 'bg-indigo-950 border-indigo-900' : 'bg-blue-950 border-blue-900'}`}>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>
              <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">
                Saldo do Mês {viewMode === 'familia' && "(Família)"}
              </h3>
              <p className="text-3xl font-bold break-words">{formatCurrency(metrics.saldoMes)}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Receitas</h3>
              <p className="text-3xl font-bold text-green-600 break-words">{formatCurrency(metrics.receitasMes)}</p>
            </div>

            {/* CARD ATUALIZADO: Despesas agora inclui a % de Variação Novamente */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Despesas</h3>
              <div className="flex flex-col xl:flex-row xl:items-baseline gap-2">
                <p className="text-3xl font-bold text-red-500 break-words">{formatCurrency(metrics.despesasMes)}</p>
                {metrics.variacaoDespesas !== 0 && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-md w-fit ${metrics.variacaoDespesas > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {metrics.variacaoDespesas > 0 ? '▲' : '▼'} {Math.abs(metrics.variacaoDespesas).toFixed(1)}% vs anterior
                  </span>
                )}
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Para Guardar</h3>
                <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-md">{reservaPercentual}%</span>
              </div>
              <p className="text-3xl font-bold text-green-700 break-words">{formatCurrency(metrics.recomendadoGuardar)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Maior Despesa</h3>
                <p className="text-lg font-bold text-gray-900 capitalize">{metrics.maiorDespesa.descricao}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-2xl font-bold text-red-500 break-words">{formatCurrency(metrics.maiorDespesa.valor)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Maior Categoria</h3>
                <p className="text-lg font-bold text-gray-900 capitalize">{metrics.maiorCategoria.nome}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-2xl font-bold text-red-500 break-words">{formatCurrency(metrics.maiorCategoria.valor)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status Financeiro</h3>
                <p className={`text-xl font-bold mt-1 ${statusSaude.cor}`}>{statusSaude.texto}</p>
              </div>
              <span className={`text-3xl font-black ${statusSaude.cor}`}>
                {metrics.saudeScore.toFixed(0)}% <span className="text-sm font-medium text-gray-400">livre</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
              <div className={`h-4 rounded-full transition-all duration-1000 ${statusSaude.bgCor}`} style={{ width: `${metrics.saudeScore}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-semibold px-1">
              <span>0% (Risco)</span>
              <span>30% (Atenção)</span>
              <span>70%+ (Investidor)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-6">Fluxo de Caixa e Tendência de Saldo</h3>
            {metrics.dadosGrafico.length > 0 ? (
              <div className="h-64 md:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={metrics.dadosGrafico} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Line type="monotone" dataKey="saldo" name="Saldo Final (Tendência)" stroke="#1e3a8a" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400 flex-col">
                <p>Nenhum histórico suficiente.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}