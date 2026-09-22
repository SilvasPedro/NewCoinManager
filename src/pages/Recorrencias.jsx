// src/pages/Recorrencias.jsx
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
  writeBatch,
} from "firebase/firestore";
import toast from "react-hot-toast";

import RecorrenciasHeader from "../components/recorrencias/RecorrenciasHeader";
import RecorrenciasSummaryCards from "../components/recorrencias/RecorrenciasSummaryCards";
import RecorrenciasFilterBar from "../components/recorrencias/RecorrenciasFilterBar";
import RecorrenciasGridView from "../components/recorrencias/RecorrenciasGridView";
import RecorrenciasTableView from "../components/recorrencias/RecorrenciasTableView";
import RecorrenciasCategoryGroupView from "../components/recorrencias/RecorrenciasCategoryGroupView";
import RecorrenciaModal from "../components/recorrencias/RecorrenciaModal";

export default function Recorrencias() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [recorrencias, setRecorrencias] = useState([]);
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

  // Filtros e Visualização
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("all"); // 'all' | 'fixa' | 'parcelada'
  const [filterTransacao, setFilterTransacao] = useState("all"); // 'all' | 'entrada' | 'saida'
  const [sortBy, setSortBy] = useState("data-desc");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'tabela' | 'categorias'

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    tipo: "fixa",
    tipoTransacao: "saida",
    parcelaAtual: 1,
    parcelasTotais: 2,
    dataInicio: "",
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const calcularPrevisaoFim = (dataInicio, parcelaAtual, parcelasTotais) => {
    if (!dataInicio) return "Desconhecido";
    const [ano, mes] = dataInicio.split("-").map(Number);
    const mesesRestantes = Math.max(0, (parcelasTotais || 0) - (parcelaAtual || 0));
    const dataFim = new Date(ano, mes - 1 + mesesRestantes, 1);
    return dataFim.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  };

  // Carregar dados
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user?.uid) return;
      try {
        setLoading(true);

        // 1. Recorrências
        const qRec = query(collection(db, "recorrencias"), where("uid", "==", user.uid));
        const snapRec = await getDocs(qRec);
        const dados = [];
        snapRec.forEach((d) => {
          dados.push({ id: d.id, ...d.data() });
        });
        dados.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));

        // 2. Categorias Personalizadas
        const qCat = query(collection(db, "categorias"), where("uid", "==", user.uid));
        const snapCat = await getDocs(qCat);
        const cats = [];
        snapCat.forEach((d) => {
          if (d.data().nome) cats.push(d.data().nome);
        });

        if (isMounted) {
          setRecorrencias(dados);
          setCategoriasPersonalizadas(cats);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Falha ao carregar recorrências.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, refreshKey]);

  // Métricas Globais dos Cards
  const metrics = useMemo(() => {
    let receitasMensais = 0;
    let custoFixoMensal = 0;
    let custoParceladoMensal = 0;
    let dividaTotalRestante = 0;
    let qtdFixas = 0;
    let qtdParceladas = 0;

    recorrencias.forEach((item) => {
      const val = parseFloat(item.valor) || 0;
      if (item.tipoTransacao === "entrada") {
        receitasMensais += val;
      } else {
        if (item.tipo === "fixa") {
          custoFixoMensal += val;
          qtdFixas += 1;
        } else if (item.tipo === "parcelada") {
          custoParceladoMensal += val;
          qtdParceladas += 1;
          const parcelasRestantes = Math.max(0, (item.parcelasTotais || 0) - (item.parcelaAtual || 0));
          dividaTotalRestante += parcelasRestantes * val;
        }
      }
    });

    return {
      receitasMensais,
      custoFixoMensal,
      custoParceladoMensal,
      dividaTotalRestante,
      qtdFixas,
      qtdParceladas,
    };
  }, [recorrencias]);

  // Lista Filtrada e Ordenada
  const filteredRecorrencias = useMemo(() => {
    let result = [...recorrencias];

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.descricao?.toLowerCase().includes(term) ||
          item.categoria?.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo (fixa vs parcelada)
    if (filterTipo !== "all") {
      result = result.filter((item) => item.tipo === filterTipo);
    }

    // Filtro por transação (entrada vs saída)
    if (filterTransacao !== "all") {
      result = result.filter((item) => item.tipoTransacao === filterTransacao);
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "valor-desc") {
        return (b.valor || 0) - (a.valor || 0);
      }
      if (sortBy === "valor-asc") {
        return (a.valor || 0) - (b.valor || 0);
      }
      if (sortBy === "nome-asc") {
        return (a.descricao || "").localeCompare(b.descricao || "");
      }
      if (sortBy === "progresso-desc") {
        const progA = a.tipo === "parcelada" ? (a.parcelaAtual || 0) / (a.parcelasTotais || 1) : 0;
        const progB = b.tipo === "parcelada" ? (b.parcelaAtual || 0) / (b.parcelasTotais || 1) : 0;
        return progB - progA;
      }
      // data-desc (default)
      return (b.criadoEm || 0) - (a.criadoEm || 0);
    });

    return result;
  }, [recorrencias, searchTerm, filterTipo, filterTransacao, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filterTipo !== "all" ||
    filterTransacao !== "all" ||
    sortBy !== "data-desc";

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterTipo("all");
    setFilterTransacao("all");
    setSortBy("data-desc");
  };

  // Abrir Modal
  const handleOpenAdd = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setFormData({
      descricao: "",
      valor: "",
      categoria: "outros",
      tipo: "fixa",
      tipoTransacao: "saida",
      parcelaAtual: 1,
      parcelasTotais: 2,
      dataInicio: currentMonth,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      descricao: item.descricao || "",
      valor: item.valor || "",
      categoria: item.categoria || "outros",
      tipo: item.tipo || "fixa",
      tipoTransacao: item.tipoTransacao || "saida",
      parcelaAtual: item.parcelaAtual || 1,
      parcelasTotais: item.parcelasTotais || 2,
      dataInicio: item.dataInicio || "",
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Submissão do Formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descricao.trim()) {
      toast.error("Informe uma descrição");
      return;
    }

    try {
      const dataToSave = {
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor) || 0,
        categoria: (formData.categoria || "outros").toLowerCase(),
        tipo: formData.tipo,
        tipoTransacao: formData.tipoTransacao,
        parcelaAtual: parseInt(formData.parcelaAtual) || 1,
        parcelasTotais: parseInt(formData.parcelasTotais) || 2,
        dataInicio: formData.dataInicio || "",
        uid: user.uid,
      };

      if (!editingId) {
        dataToSave.criadoEm = Date.now();
      }

      if (editingId) {
        await updateDoc(doc(db, "recorrencias", editingId), dataToSave);
        toast.success("Recorrência atualizada com sucesso!");
      } else {
        await addDoc(collection(db, "recorrencias"), dataToSave);
        toast.success("Nova recorrência cadastrada!");
      }

      setIsModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar os dados.");
    }
  };

  // Exclusão Individual
  const confirmDelete = (id) => {
    setItemToDelete(id);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "recorrencias", itemToDelete));
      toast.success("Recorrência excluída!");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir o item.");
    } finally {
      setItemToDelete(null);
    }
  };

  // Exclusão Total em Lote
  const confirmDeleteAll = () => {
    if (recorrencias.length === 0) return;
    setIsDeleteAllModalOpen(true);
  };

  const executeDeleteAll = async () => {
    try {
      setLoading(true);
      const batch = writeBatch(db);
      recorrencias.forEach((item) => {
        const docRef = doc(db, "recorrencias", item.id);
        batch.delete(docRef);
      });
      await batch.commit();
      toast.success("Todas as recorrências foram apagadas!");
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Erro ao apagar tudo:", error);
      toast.error("Erro ao tentar limpar a lista.");
      setLoading(false);
    } finally {
      setIsDeleteAllModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/60 overflow-hidden font-sans text-gray-900">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8 pb-28 lg:pb-8 relative">
        <div className="max-w-7xl mx-auto space-y-5 pb-8">
          {/* HEADER PRINCIPAL */}
          <RecorrenciasHeader
            totalItems={recorrencias.length}
            onOpenAdd={handleOpenAdd}
            onConfirmDeleteAll={confirmDeleteAll}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />

          {/* CARDS DE RESUMO COM EFEITO DE VIDRO */}
          <RecorrenciasSummaryCards
            receitasMensais={metrics.receitasMensais}
            custoFixoMensal={metrics.custoFixoMensal}
            custoParceladoMensal={metrics.custoParceladoMensal}
            dividaTotalRestante={metrics.dividaTotalRestante}
            qtdFixas={metrics.qtdFixas}
            qtdParceladas={metrics.qtdParceladas}
            formatCurrency={formatCurrency}
          />

          {/* BARRA DE FILTROS E SELEÇÃO DE VISUALIZAÇÃO */}
          <RecorrenciasFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterTipo={filterTipo}
            setFilterTipo={setFilterTipo}
            filterTransacao={filterTransacao}
            setFilterTransacao={setFilterTransacao}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
            totalResultsCount={filteredRecorrencias.length}
          />

          {/* CONTEÚDO PRINCIPAL COM MÚLTIPLAS VISUALIZAÇÕES */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-semibold text-xs">
                Carregando suas recorrências...
              </p>
            </div>
          ) : viewMode === "tabela" ? (
            <RecorrenciasTableView
              items={filteredRecorrencias}
              onEdit={handleOpenEdit}
              onDelete={confirmDelete}
              formatCurrency={formatCurrency}
              calcularPrevisaoFim={calcularPrevisaoFim}
            />
          ) : viewMode === "categorias" ? (
            <RecorrenciasCategoryGroupView
              items={filteredRecorrencias}
              onEdit={handleOpenEdit}
              onDelete={confirmDelete}
              formatCurrency={formatCurrency}
              calcularPrevisaoFim={calcularPrevisaoFim}
            />
          ) : (
            <RecorrenciasGridView
              items={filteredRecorrencias}
              onEdit={handleOpenEdit}
              onDelete={confirmDelete}
              formatCurrency={formatCurrency}
              calcularPrevisaoFim={calcularPrevisaoFim}
            />
          )}
        </div>
      </main>

      {/* MODAL DE ADICIONAR / EDITAR RECORRÊNCIA */}
      <RecorrenciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        editingId={editingId}
        onSubmit={handleSubmit}
        categoriasPersonalizadas={categoriasPersonalizadas}
        formatCurrency={formatCurrency}
        calcularPrevisaoFim={calcularPrevisaoFim}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO INDIVIDUAL COM BACKDROP BLUR */}
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

            <h3 className="text-lg font-bold text-gray-900 mb-1.5">Excluir Recorrência?</h3>
            <p className="text-gray-500 text-xs mb-5">
              Ela deixará de ser projetada no seu fluxo financeiro mensal a partir de agora.
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

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUIR TUDO (LOTE) */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all p-7 text-center border-2 border-rose-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide">
              Atenção Crítica!
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm font-medium mb-6">
              Você está prestes a <span className="text-rose-600 font-bold">APAGAR TODAS</span> as
              suas recorrências de uma só vez. Essa ação{" "}
              <strong className="text-gray-900">não pode ser desfeita</strong>.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={executeDeleteAll}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
              >
                Sim, apagar tudo
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteAllModalOpen(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm cursor-pointer"
              >
                Cancelar e voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
