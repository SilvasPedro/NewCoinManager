// src/pages/Metas.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, doc 
} from "firebase/firestore";
import toast from "react-hot-toast"; // NOVO: Importação do Toast

export default function Metas() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // NOVO: Estado para o Modal de Exclusão
  const [itemToDelete, setItemToDelete] = useState(null);

  const [goalFormData, setGoalFormData] = useState({
    nome: "",
    valorObjetivo: "",
    dataPrevisao: "",
  });

  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [fundsData, setFundsData] = useState({
    valor: "",
    tipo: "adicionar",
    referencia: (() => {
      const dataAtual = new Date();
      return `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`;
    })()
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const fetchMetas = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const q = query(collection(db, "metas"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const dados = [];
      querySnapshot.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() });
      });
      dados.sort((a, b) => new Date(a.dataPrevisao) - new Date(b.dataPrevisao));
      setMetas(dados);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
      toast.error("Falha ao carregar suas metas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [user]);

  const handleOpenAddGoal = () => {
    setGoalFormData({ nome: "", valorObjetivo: "", dataPrevisao: "" });
    setEditingId(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (meta) => {
    setGoalFormData({
      nome: meta.nome,
      valorObjetivo: meta.valorObjetivo,
      dataPrevisao: meta.dataPrevisao,
    });
    setEditingId(meta.id);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        nome: goalFormData.nome,
        valorObjetivo: parseFloat(goalFormData.valorObjetivo),
        dataPrevisao: goalFormData.dataPrevisao,
        uid: user.uid,
      };

      if (editingId) {
        await updateDoc(doc(db, "metas", editingId), dataToSave);
        toast.success("Meta atualizada com sucesso!"); // NOVO
      } else {
        dataToSave.valorAtual = 0;
        dataToSave.criadoEm = Date.now();
        await addDoc(collection(db, "metas"), dataToSave);
        toast.success("Nova meta criada!"); // NOVO
      }
      
      setIsGoalModalOpen(false);
      fetchMetas();
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
      toast.error("Erro ao salvar a meta."); // NOVO
    }
  };

  // NOVO: Função que abre o modal de exclusão
  const confirmDelete = (id) => {
    setItemToDelete(id);
  };

  // NOVO: Função que efetivamente deleta (chamada pelo modal de exclusão)
  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "metas", itemToDelete));
      toast.success("Meta excluída!"); // NOVO
      fetchMetas();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast.error("Erro ao excluir a meta."); // NOVO
    } finally {
      setItemToDelete(null); // Fecha o modal
    }
  };

  const handleOpenFunds = (meta) => {
    setSelectedMeta(meta);
    const dataAtual = new Date();
    setFundsData({ 
      valor: "", 
      tipo: "adicionar",
      referencia: `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, "0")}`
    });
    setIsFundsModalOpen(true);
  };

  const handleSaveFunds = async (e) => {
    e.preventDefault();
    if (!selectedMeta) return;

    const valorMovimentado = parseFloat(fundsData.valor);
    let novoValorAtual = selectedMeta.valorAtual;

    if (fundsData.tipo === "adicionar") {
      novoValorAtual += valorMovimentado;
    } else {
      novoValorAtual -= valorMovimentado;
      if (novoValorAtual < 0) novoValorAtual = 0; 
    }

    try {
      await updateDoc(doc(db, "metas", selectedMeta.id), {
        valorAtual: novoValorAtual
      });

      const transacaoData = {
        descricao: fundsData.tipo === "adicionar" ? `Investimento: ${selectedMeta.nome}` : `Resgate: ${selectedMeta.nome}`,
        valor: valorMovimentado,
        tipo: fundsData.tipo === "adicionar" ? "saida" : "entrada", 
        categoria: "Metas",
        pago: true,
        referencia: fundsData.referencia,
        uid: user.uid,
        criadoEm: Date.now()
      };

      await addDoc(collection(db, "financas"), transacaoData);

      setIsFundsModalOpen(false);
      fetchMetas();
      
      // NOVO: Toast de sucesso substituindo o alert()
      toast.success(
        `Lançamento registrado em ${fundsData.referencia}!`, 
        { icon: '💰' } // Um charme extra adicionando um ícone na notificação
      );
    } catch (error) {
      console.error("Erro ao movimentar saldo:", error);
      toast.error("Erro ao atualizar o saldo e criar o lançamento."); // NOVO
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-gray-200">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Minhas Metas</h2>
                <p className="text-gray-500 mt-1 text-sm">Acompanhe seus objetivos financeiros e conquistas.</p>
              </div>
            </div>

            <button 
              onClick={handleOpenAddGoal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Nova Meta
            </button>
          </header>

          {loading ? (
            <div className="text-center p-10 text-gray-500">Carregando metas...</div>
          ) : metas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-900">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <p className="text-gray-500 font-medium">Você ainda não definiu nenhuma meta.</p>
               <button onClick={handleOpenAddGoal} className="mt-4 text-blue-600 font-semibold hover:underline">Criar primeiro objetivo</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {metas.map((meta) => {
                const progresso = meta.valorObjetivo > 0 
                  ? Math.min((meta.valorAtual / meta.valorObjetivo) * 100, 100) 
                  : 0;
                const concluida = meta.valorAtual >= meta.valorObjetivo;

                const dataFormatada = new Date(meta.dataPrevisao + "T00:00:00").toLocaleDateString('pt-BR');

                return (
                  <div key={meta.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-all duration-300 hover:shadow-md ${concluida ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{meta.nome}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Para {dataFormatada}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEditGoal(meta)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {/* NOVO: Usando a função confirmDelete para acionar o modal */}
                        <button onClick={() => confirmDelete(meta.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-2xl font-extrabold ${concluida ? 'text-green-600' : 'text-blue-950'}`}>
                          {formatCurrency(meta.valorAtual)}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          de {formatCurrency(meta.valorObjetivo)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-1000 ${concluida ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${progresso}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs font-bold text-gray-400">
                        {progresso.toFixed(1)}% {concluida && "🎉"}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleOpenFunds(meta)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-colors border ${concluida ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-gray-50 text-blue-900 border-gray-200 hover:bg-gray-100'}`}
                      >
                        Movimentar Saldo
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL DE CRIAR/EDITAR META --- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? "Editar Meta" : "Nova Meta"}</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome do Objetivo</label>
                <input required type="text" value={goalFormData.nome} onChange={(e) => setGoalFormData({...goalFormData, nome: e.target.value})} placeholder="Ex: Reserva de Emergência..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Valor Alvo (R$)</label>
                  <input required type="number" step="0.01" min="1" value={goalFormData.valorObjetivo} onChange={(e) => setGoalFormData({...goalFormData, valorObjetivo: e.target.value})} placeholder="0,00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Previsão</label>
                  <input required type="date" value={goalFormData.dataPrevisao} onChange={(e) => setGoalFormData({...goalFormData, dataPrevisao: e.target.value})} className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <button type="submit" className="w-full py-3.5 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  {editingId ? "Salvar Alterações" : "Criar Meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE MOVIMENTAR SALDO --- */}
      {isFundsModalOpen && selectedMeta && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 text-center w-full">Atualizar Progresso</h3>
            </div>
            <form onSubmit={handleSaveFunds} className="p-6 space-y-4">
              <p className="text-center text-sm text-gray-500 font-medium mb-2">Meta: <span className="font-bold text-gray-900">{selectedMeta.nome}</span></p>
              
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${fundsData.tipo === 'adicionar' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" name="tipoFundos" className="hidden" checked={fundsData.tipo === 'adicionar'} onChange={() => setFundsData({...fundsData, tipo: 'adicionar'})} />
                  Guardar (+)
                </label>
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${fundsData.tipo === 'remover' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" name="tipoFundos" className="hidden" checked={fundsData.tipo === 'remover'} onChange={() => setFundsData({...fundsData, tipo: 'remover'})} />
                  Retirar (-)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center mt-2">Qual valor?</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">R$</span>
                  <input required type="number" step="0.01" min="0.01" value={fundsData.valor} onChange={(e) => setFundsData({...fundsData, valor: e.target.value})} placeholder="0,00" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-2xl text-center text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 text-center">Referência do Lançamento</label>
                <input required type="month" value={fundsData.referencia} onChange={(e) => setFundsData({...fundsData, referencia: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center font-medium" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsFundsModalOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOVO: MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center">
            
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 border border-red-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Meta?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Essa ação não pode ser desfeita e todo o histórico da meta será perdido. Tem certeza que deseja continuar?
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete} 
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all"
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