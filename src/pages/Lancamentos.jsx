// src/pages/Lancamentos.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

import LancamentosHeader from "../components/lancamentos/LancamentosHeader";
import LancamentosSummaryCards from "../components/lancamentos/LancamentosSummaryCards";
import LancamentosFilterBar from "../components/lancamentos/LancamentosFilterBar";
import LancamentosTableView from "../components/lancamentos/LancamentosTableView";
import LancamentosGridView from "../components/lancamentos/LancamentosGridView";
import LancamentosCategoryGroupView from "../components/lancamentos/LancamentosCategoryGroupView";
import LancamentoModal from "../components/lancamentos/LancamentoModal";

const CATEGORIAS_PADRAO = [
  "Alimentação",
  "Educação",
  "Lazer",
  "Moradia",
  "Saúde",
  "Transporte",
  "Outros",
];

export default function Lancamentos() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [transacoes, setTransacoes] = useState([]);
  const [categoriasUser, setCategoriasUser] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const dataAtual = new Date();
    return `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
  });

  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'entrada' | 'saida' | 'recorrente'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'pago' | 'pendente'
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("data-desc"); // 'data-desc' | 'data-asc' | 'valor-desc' | 'valor-asc' | 'nome-asc'

  // Modos de visualização: 'tabela' | 'cards' | 'categorias' | 'pendentes'
  const [viewMode, setViewMode] = useState("tabela");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "saida",
    categoria: "",
    pago: false,
    referencia: selectedMonth,
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  };

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user?.uid) return;
      try {
        setLoading(true);

        // Buscar categorias personalizadas
        const qCat = query(collection(db, "categorias"), where("uid", "==", user.uid));
        const snapCat = await getDocs(qCat);
        const cats = [];
        snapCat.forEach((d) => cats.push(d.data().nome));
        if (isMounted) setCategoriasUser(cats.sort());

        // Buscar finanças e recorrências
        const qFinancas = query(
          collection(db, "financas"),
          where("uid", "==", user.uid),
          where("referencia", "==", selectedMonth)
        );

        const qRecorrencias = query(collection(db, "recorrencias"), where("uid", "==", user.uid));

        const [snapFinancas, snapRecorrencias] = await Promise.all([
          getDocs(qFinancas),
          getDocs(qRecorrencias),
        ]);

        const dados = [];

        snapFinancas.forEach((docSnap) => {
          dados.push({ id: docSnap.id, ...docSnap.data() });
        });

        const [selYear, selMonth] = selectedMonth.split("-").map(Number);

        snapRecorrencias.forEach((docSnap) => {
          const item = docSnap.data();
          if (!item.dataInicio) return;

          const [startYear, startMonth] = item.dataInicio.split("-").map(Number);
          const monthDiff = (selYear - startYear) * 12 + (selMonth - startMonth);

          if (monthDiff < 0) return;

          if (item.tipo === "fixa") {
            dados.push({
              id: `rec-${docSnap.id}`,
              descricao: item.descricao,
              valor: item.valor,
              tipo: item.tipoTransacao || "saida",
              categoria: item.categoria,
              isRecorrente: true,
              criadoEm: item.criadoEm || Date.now(),
            });
          } else if (item.tipo === "parcelada") {
            const parcelaDesteMes = item.parcelaAtual + monthDiff;
            if (parcelaDesteMes <= item.parcelasTotais) {
              dados.push({
                id: `rec-${docSnap.id}`,
                descricao: `${item.descricao} (${parcelaDesteMes}/${item.parcelasTotais})`,
                valor: item.valor,
                tipo: item.tipoTransacao || "saida",
                categoria: item.categoria,
                isRecorrente: true,
                criadoEm: item.criadoEm || Date.now(),
              });
            }
          }
        });

        if (isMounted) setTransacoes(dados);
      } catch (error) {
        console.error("Erro ao carregar dados de lançamentos:", error);
        toast.error("Falha ao carregar lançamentos.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, selectedMonth, refreshKey]);

  // Lista de todas as categorias únicas disponíveis no mês
  const availableCategories = useMemo(() => {
    const cats = new Set(CATEGORIAS_PADRAO);
    categoriasUser.forEach((c) => cats.add(c));
    transacoes.forEach((t) => {
      if (t.categoria) cats.add(t.categoria);
    });
    return Array.from(cats).sort();
  }, [categoriasUser, transacoes]);

  // Totais resumidos do período (Cards Pertinentes)
  const summaryMetrics = useMemo(() => {
    let receitasTotal = 0;
    let despesasTotal = 0;
    let despesasPendentes = 0;
    let qtdPendentes = 0;
    let qtdPagos = 0;

    transacoes.forEach((t) => {
      const isMeta =
        t.categoria === "Metas" ||
        t.descricao?.includes("Resgate:") ||
        t.descricao?.includes("Investimento:");

      if (t.tipo === "entrada") {
        receitasTotal += t.valor || 0;
      } else if (t.tipo === "saida") {
        despesasTotal += t.valor || 0;
        if (!t.isRecorrente && !isMeta) {
          if (t.pago) {
            qtdPagos++;
          } else {
            qtdPendentes++;
            despesasPendentes += t.valor || 0;
          }
        }
      }
    });

    const saldoTotal = receitasTotal - despesasTotal;

    return {
      receitasTotal,
      despesasTotal,
      saldoTotal,
      despesasPendentes,
      qtdPendentes,
      qtdPagos,
    };
  }, [transacoes]);

  // Filtragem e ordenação dos lançamentos
  const filteredAndSortedTransacoes = useMemo(() => {
    let result = transacoes.filter((t) => {
      // Se estiver no modo 'pendentes', força apenas despesas não pagas
      if (viewMode === "pendentes") {
        if (t.tipo !== "saida" || t.pago === true || t.isRecorrente) return false;
      }

      // Filtro de Busca
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchDesc = t.descricao?.toLowerCase().includes(term);
        const matchCat = t.categoria?.toLowerCase().includes(term);
        if (!matchDesc && !matchCat) return false;
      }

      // Filtro de Tipo
      if (filterType === "entrada" && t.tipo !== "entrada") return false;
      if (filterType === "saida" && t.tipo !== "saida") return false;
      if (filterType === "recorrente" && !t.isRecorrente) return false;

      // Filtro de Status
      if (viewMode !== "pendentes") {
        if (filterStatus === "pago" && (t.tipo !== "saida" || !t.pago)) return false;
        if (filterStatus === "pendente" && (t.tipo !== "saida" || t.pago)) return false;
      }

      // Filtro de Categoria
      if (
        filterCategory !== "all" &&
        t.categoria?.toLowerCase() !== filterCategory.toLowerCase()
      ) {
        return false;
      }

      return true;
    });

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "data-desc") return (b.criadoEm || 0) - (a.criadoEm || 0);
      if (sortBy === "data-asc") return (a.criadoEm || 0) - (b.criadoEm || 0);
      if (sortBy === "valor-desc") return (b.valor || 0) - (a.valor || 0);
      if (sortBy === "valor-asc") return (a.valor || 0) - (b.valor || 0);
      if (sortBy === "nome-asc") return (a.descricao || "").localeCompare(b.descricao || "");
      return 0;
    });

    return result;
  }, [transacoes, viewMode, searchTerm, filterType, filterStatus, filterCategory, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filterType !== "all" ||
    (viewMode !== "pendentes" && filterStatus !== "all") ||
    filterCategory !== "all";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterCategory("all");
    setSortBy("data-desc");
  };

  const handleOpenAdd = () => {
    setFormData({
      descricao: "",
      valor: "",
      tipo: "saida",
      categoria: "",
      pago: false,
      referencia: selectedMonth,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setFormData({
      descricao: t.descricao,
      valor: t.valor,
      tipo: t.tipo,
      categoria: t.categoria,
      pago: t.pago || false,
      referencia: t.referencia || selectedMonth,
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        valor: parseFloat(formData.valor),
        uid: user.uid,
      };

      if (editingId) {
        await updateDoc(doc(db, "financas", editingId), dataToSave);
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        dataToSave.criadoEm = Date.now();
        await addDoc(collection(db, "financas"), dataToSave);
        toast.success("Lançamento adicionado!");
      }

      setIsModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar o lançamento.");
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "financas", itemToDelete));
      toast.success("Lançamento excluído!");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir o lançamento.");
    } finally {
      setItemToDelete(null);
    }
  };

  const togglePago = async (id, currentStatus) => {
    try {
      setTransacoes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, pago: !currentStatus } : t))
      );
      await updateDoc(doc(db, "financas", id), { pago: !currentStatus });
      toast.success(currentStatus ? "Marcado como pendente." : "Marcado como pago!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      setRefreshKey((k) => k + 1);
      toast.error("Falha ao alterar status de pagamento.");
    }
  };

  const categoriasPersonalizadas = categoriasUser.filter(
    (catUser) => !CATEGORIAS_PADRAO.map((c) => c.toLowerCase()).includes(catUser.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-100/60 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-7 pb-8">
          {/* Header com Navegador de Mês touch-friendly e Botão de Vidro */}
          <LancamentosHeader
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onOpenAdd={handleOpenAdd}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />

          {/* Cards Pertinentes com Efeito de Vidro (Frosted & Dark Glass) */}
          <LancamentosSummaryCards
            receitasTotal={summaryMetrics.receitasTotal}
            despesasTotal={summaryMetrics.despesasTotal}
            saldoTotal={summaryMetrics.saldoTotal}
            despesasPendentes={summaryMetrics.despesasPendentes}
            qtdPendentes={summaryMetrics.qtdPendentes}
            qtdPagos={summaryMetrics.qtdPagos}
            formatCurrency={formatCurrency}
          />

          {/* Barra de Filtros e Alternância de Visualizações (Tabs de Vidro) */}
          <LancamentosFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            availableCategories={availableCategories}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalResultsCount={filteredAndSortedTransacoes.length}
          />

          {/* Área de Visualizações */}
          {loading ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mb-3"></div>
              <p className="text-xs font-semibold text-gray-500">
                Carregando lançamentos...
              </p>
            </div>
          ) : (
            <>
              {/* Visualização 1: Tabela / Lista detalhada ou Pendentes */}
              {(viewMode === "tabela" || viewMode === "pendentes") && (
                <LancamentosTableView
                  transacoes={filteredAndSortedTransacoes}
                  togglePago={togglePago}
                  handleOpenEdit={handleOpenEdit}
                  confirmDelete={confirmDelete}
                  formatCurrency={formatCurrency}
                  onResetFilters={handleResetFilters}
                  onOpenAdd={handleOpenAdd}
                  selectedMonth={selectedMonth}
                  hasActiveFilters={hasActiveFilters}
                />
              )}

              {/* Visualização 2: Grid de Cards Bento */}
              {viewMode === "cards" && (
                <LancamentosGridView
                  transacoes={filteredAndSortedTransacoes}
                  togglePago={togglePago}
                  handleOpenEdit={handleOpenEdit}
                  confirmDelete={confirmDelete}
                  formatCurrency={formatCurrency}
                  onResetFilters={handleResetFilters}
                  onOpenAdd={handleOpenAdd}
                  selectedMonth={selectedMonth}
                  hasActiveFilters={hasActiveFilters}
                />
              )}

              {/* Visualização 3: Agrupado por Categoria */}
              {viewMode === "categorias" && (
                <LancamentosCategoryGroupView
                  transacoes={filteredAndSortedTransacoes}
                  togglePago={togglePago}
                  handleOpenEdit={handleOpenEdit}
                  confirmDelete={confirmDelete}
                  formatCurrency={formatCurrency}
                  onResetFilters={handleResetFilters}
                  onOpenAdd={handleOpenAdd}
                  hasActiveFilters={hasActiveFilters}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL DE ADICIONAR / EDITAR COM SELETOR DE CATEGORIAS AVANÇADO */}
      <LancamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onSubmit={handleSubmit}
        categoriasPersonalizadas={categoriasPersonalizadas}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO COM BACKDROP BLUR */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center border border-white/60">
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600 border border-rose-100">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1.5">Excluir Lançamento?</h3>
            <p className="text-gray-500 text-xs mb-5">
              Essa ação não pode ser desfeita. Tem certeza que deseja remover este item?
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-xs cursor-pointer"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
