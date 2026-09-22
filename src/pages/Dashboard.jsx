// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import GlassStatCards from "../components/dashboard/GlassStatCards";
import FinancialInsights from "../components/dashboard/FinancialInsights";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import TopExpensesList from "../components/dashboard/TopExpensesList";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [allTransacoes, setAllTransacoes] = useState([]);
  const [allRecorrencias, setAllRecorrencias] = useState([]);

  const [hasFamily, setHasFamily] = useState(false);
  const [viewMode, setViewMode] = useState("individual");
  const [reservaPercentual, setReservaPercentual] = useState(0);

  // Filtros de tempo
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const dataAtual = new Date();
    return `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
  });
  const [periodPreset, setPeriodPreset] = useState("month"); // 'month' | 'last3' | 'last6' | 'year'

  // Novos Filtros Adicionais
  const [typeFilter, setTypeFilter] = useState("todos"); // 'todos' | 'entrada' | 'saida'
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
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
        snap1.forEach((d) => uidsFamilia.push(d.data().usuario2_uid));
        snap2.forEach((d) => uidsFamilia.push(d.data().usuario1_uid));

        uidsFamilia = [...new Set(uidsFamilia.filter((id) => id))];
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
          snapTr.forEach((d) => todasTr.push({ id: d.id, ...d.data() }));

          const qRec = query(collection(db, "recorrencias"), where("uid", "in", chunk));
          const snapRec = await getDocs(qRec);
          snapRec.forEach((d) => todasRec.push({ id: d.id, ...d.data() }));
        }

        setAllTransacoes(todasTr);
        setAllRecorrencias(todasRec);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDados();
  }, [user]);

  // Expandir recorrências para os meses necessários
  const transacoesCompletas = useMemo(() => {
    const trFiltradas = viewMode === "familia" ? allTransacoes : allTransacoes.filter((t) => t.uid === user?.uid);
    const recFiltradas = viewMode === "familia" ? allRecorrencias : allRecorrencias.filter((r) => r.uid === user?.uid);

    const [year, month] = selectedMonth.split("-").map(Number);
    const dataAnterior = new Date(year, month - 2, 1);
    const prevRef = `${dataAnterior.getFullYear()}-${String(dataAnterior.getMonth() + 1).padStart(2, "0")}`;

    const mesesParaGerar = new Set([...trFiltradas.map((t) => t.referencia), selectedMonth, prevRef]);
    const transacoesFinais = [...trFiltradas];

    recFiltradas.forEach((rec) => {
      if (!rec.dataInicio) return;
      const [startYear, startMonth] = rec.dataInicio.split("-").map(Number);

      mesesParaGerar.forEach((refMes) => {
        if (!refMes) return;
        const [refY, refM] = refMes.split("-").map(Number);
        const monthDiff = (refY - startYear) * 12 + (refM - startMonth);

        if (monthDiff >= 0) {
          if (rec.tipo === "fixa" || (rec.tipo === "parcelada" && rec.parcelaAtual + monthDiff <= rec.parcelasTotais)) {
            transacoesFinais.push({
              id: `rec-${rec.id}-${refMes}`,
              valor: rec.valor,
              tipo: rec.tipoTransacao || "saida",
              categoria: rec.categoria,
              referencia: refMes,
              descricao: rec.descricao,
              isRecorrente: true,
            });
          }
        }
      });
    });

    return transacoesFinais;
  }, [allTransacoes, allRecorrencias, viewMode, user, selectedMonth]);

  // Lista de meses que compõem o filtro ativo (mês único, últimos 3, últimos 6 ou ano)
  const activeMonthList = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    if (periodPreset === "month") {
      return [selectedMonth];
    }
    if (periodPreset === "last3") {
      const list = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      return list;
    }
    if (periodPreset === "last6") {
      const list = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
      return list;
    }
    if (periodPreset === "year") {
      const list = [];
      for (let m = 1; m <= 12; m++) {
        list.push(`${year}-${String(m).padStart(2, "0")}`);
      }
      return list;
    }
    return [selectedMonth];
  }, [selectedMonth, periodPreset]);

  // Todas as categorias disponíveis no período filtrado
  const availableCategories = useMemo(() => {
    const cats = new Set();
    transacoesCompletas.forEach((t) => {
      if (t.categoria && t.categoria !== "Metas") {
        cats.add(t.categoria);
      }
    });
    return Array.from(cats).sort();
  }, [transacoesCompletas]);

  // Transações pós filtros de tipo, categoria e busca
  const transacoesFiltradas = useMemo(() => {
    return transacoesCompletas.filter((t) => {
      // Filtro de mês (conforme preset)
      if (!activeMonthList.includes(t.referencia)) return false;

      // Filtro de Tipo
      if (typeFilter !== "todos" && t.tipo !== typeFilter) return false;

      // Filtro de Categoria
      if (selectedCategory !== "todas" && t.categoria !== selectedCategory) return false;

      // Filtro de Busca
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchDesc = t.descricao?.toLowerCase().includes(term);
        const matchCat = t.categoria?.toLowerCase().includes(term);
        if (!matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [transacoesCompletas, activeMonthList, typeFilter, selectedCategory, searchTerm]);

  // Métricas calculadas para os cards, insights e gráficos
  const metrics = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const dataAnterior = new Date(year, month - 2, 1);
    const prevRef = `${dataAnterior.getFullYear()}-${String(dataAnterior.getMonth() + 1).padStart(2, "0")}`;

    let receitasMes = 0;
    let despesasMes = 0;
    let despesasMesAnterior = 0;
    let fluxoMetasMes = 0;
    let maiorDespesa = { descricao: "Nenhuma", valor: 0 };
    const categoriasMes = {};
    const historicoPorMes = {};

    let valorFixa = 0;
    let valorVariavel = 0;

    // Histórico para o gráfico de fluxo
    transacoesCompletas.forEach((t) => {
      if (!historicoPorMes[t.referencia]) {
        historicoPorMes[t.referencia] = { name: t.referencia, receitas: 0, despesas: 0, saldo: 0 };
      }

      const isMeta =
        t.categoria === "Metas" ||
        t.descricao?.includes("Resgate:") ||
        t.descricao?.includes("Investimento:");

      if (t.tipo === "entrada") {
        if (!isMeta) historicoPorMes[t.referencia].receitas += t.valor;
        historicoPorMes[t.referencia].saldo += t.valor;
      }
      if (t.tipo === "saida") {
        if (!isMeta) historicoPorMes[t.referencia].despesas += t.valor;
        historicoPorMes[t.referencia].saldo -= t.valor;
      }

      // Cálculo específico do mês anterior para variação
      if (t.referencia === prevRef && t.tipo === "saida" && !isMeta) {
        despesasMesAnterior += t.valor;
      }
    });

    // Cálculos específicos para as transações filtradas do período ativo
    transacoesFiltradas.forEach((t) => {
      const isMeta =
        t.categoria === "Metas" ||
        t.descricao?.includes("Resgate:") ||
        t.descricao?.includes("Investimento:");

      if (t.tipo === "entrada") {
        if (!isMeta) receitasMes += t.valor;
        else fluxoMetasMes += t.valor;
      }
      if (t.tipo === "saida") {
        if (!isMeta) {
          despesasMes += t.valor;
          if (t.valor > maiorDespesa.valor) {
            maiorDespesa = { descricao: t.descricao || "Sem nome", valor: t.valor };
          }
          const catNome = t.categoria || "Geral";
          categoriasMes[catNome] = (categoriasMes[catNome] || 0) + t.valor;

          if (t.isRecorrente) {
            valorFixa += t.valor;
          } else {
            valorVariavel += t.valor;
          }
        } else {
          fluxoMetasMes -= t.valor;
        }
      }
    });

    let maiorCategoria = { nome: "Nenhuma", valor: 0 };
    for (const [cat, val] of Object.entries(categoriasMes)) {
      if (val > maiorCategoria.valor) maiorCategoria = { nome: cat, valor: val };
    }

    const saldoMes = receitasMes - despesasMes + fluxoMetasMes;
    const recomendadoGuardar = saldoMes > 0 ? saldoMes * (reservaPercentual / 100) : 0;

    let variacaoDespesas = 0;
    if (despesasMesAnterior > 0 && periodPreset === "month") {
      variacaoDespesas = ((despesasMes - despesasMesAnterior) / despesasMesAnterior) * 100;
    }

    // % de Saldo Livre = (Saldo / Receitas) * 100
    let saldoLivrePercentual = 0;
    if (receitasMes > 0) {
      saldoLivrePercentual = (saldoMes / receitasMes) * 100;
    } else if (despesasMes > 0) {
      saldoLivrePercentual = -100;
    }

    // Dados estruturados para o gráfico de categorias
    const dadosCategorias = Object.entries(categoriasMes)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor);

    // Dados para o gráfico histórico
    const dadosGrafico = Object.values(historicoPorMes)
      .filter((m) => {
        if (periodPreset === "month") return true;
        return activeMonthList.includes(m.name);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Dados Fixo vs Variável
    const totalDespesasClassificadas = valorFixa + valorVariavel;
    const dadosFixoVariavel = {
      valorFixa,
      valorVariavel,
      pctFixa: totalDespesasClassificadas > 0 ? (valorFixa / totalDespesasClassificadas) * 100 : 0,
      pctVariavel: totalDespesasClassificadas > 0 ? (valorVariavel / totalDespesasClassificadas) * 100 : 0,
    };

    return {
      receitasMes,
      despesasMes,
      saldoMes,
      recomendadoGuardar,
      maiorDespesa,
      maiorCategoria,
      variacaoDespesas,
      saldoLivrePercentual,
      dadosGrafico,
      dadosCategorias,
      dadosFixoVariavel,
    };
  }, [transacoesCompletas, transacoesFiltradas, selectedMonth, periodPreset, activeMonthList, reservaPercentual]);

  const hasActiveFilters =
    typeFilter !== "todos" || selectedCategory !== "todas" || searchTerm.trim() !== "";

  const handleResetFilters = () => {
    setTypeFilter("todos");
    setSelectedCategory("todas");
    setSearchTerm("");
    setPeriodPreset("month");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-blue-900"></div>
          <p className="text-sm font-semibold text-gray-500">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100/60 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7 pb-8">
          {/* Header com Navegador de Mês, Atalhos e Modo Família */}
          <DashboardHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            hasFamily={hasFamily}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            periodPreset={periodPreset}
            setPeriodPreset={setPeriodPreset}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />

          {/* Novos Filtros: Tipo (Entradas/Saídas), Categorias e Busca */}
          <DashboardFilters
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            availableCategories={availableCategories}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalResultsCount={transacoesFiltradas.length}
          />

          {/* Cards Principais com Efeito de Vidro (Glassmorphism) */}
          <GlassStatCards
            saldoMes={metrics.saldoMes}
            receitasMes={metrics.receitasMes}
            despesasMes={metrics.despesasMes}
            recomendadoGuardar={metrics.recomendadoGuardar}
            reservaPercentual={reservaPercentual}
            variacaoDespesas={metrics.variacaoDespesas}
            viewMode={viewMode}
            formatCurrency={formatCurrency}
            saldoLivrePercentual={metrics.saldoLivrePercentual}
          />

          {/* Status Financeiro com Pequenos Insights Baseados no % de Saldo Livre */}
          <FinancialInsights
            saldoLivrePercentual={metrics.saldoLivrePercentual}
            receitasMes={metrics.receitasMes}
            despesasMes={metrics.despesasMes}
            saldoMes={metrics.saldoMes}
            recomendadoGuardar={metrics.recomendadoGuardar}
            reservaPercentual={reservaPercentual}
            maiorDespesa={metrics.maiorDespesa}
            maiorCategoria={metrics.maiorCategoria}
            formatCurrency={formatCurrency}
          />

          {/* Novas Visualizações (Tabs: Fluxo & Saldo, Categorias Donut, Fixo vs Variável) */}
          <DashboardCharts
            dadosGrafico={metrics.dadosGrafico}
            dadosCategorias={metrics.dadosCategorias}
            dadosFixoVariavel={metrics.dadosFixoVariavel}
            formatCurrency={formatCurrency}
          />

          {/* Maiores Despesas do Período */}
          <TopExpensesList
            transacoes={transacoesFiltradas}
            formatCurrency={formatCurrency}
          />
        </div>
      </main>
    </div>
  );
}
