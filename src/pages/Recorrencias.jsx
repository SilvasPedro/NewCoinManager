// src/pages/Recorrencias.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, doc, writeBatch 
} from "firebase/firestore";

export default function Recorrencias() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [recorrencias, setRecorrencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    categoria: "",
    tipo: "fixa",
    parcelaAtual: 1,
    parcelasTotais: 2,
    dataInicio: ""
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const fetchRecorrencias = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const q = query(collection(db, "recorrencias"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const dados = [];
      querySnapshot.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() });
      });
      dados.sort((a, b) => b.criadoEm - a.criadoEm);
      setRecorrencias(dados);
    } catch (error) {
      console.error("Erro ao buscar recorrências:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecorrencias();
  }, [user]);

  // CORREÇÃO: Cálculos matemáticos precisos
  const metrics = useMemo(() => {
    let custoFixoMensal = 0;
    let custoParceladoMensal = 0;
    let dividaTotalRestante = 0;

    recorrencias.forEach(item => {
      if (item.tipo === "fixa") {
        custoFixoMensal += item.valor;
      } else if (item.tipo === "parcelada") {
        custoParceladoMensal += item.valor;
        
        // CORREÇÃO: Calcula apenas as que faltam baseado no que o usuário digitou (Total - Atual)
        const parcelasRestantes = item.parcelasTotais - item.parcelaAtual;
        if (parcelasRestantes > 0) {
          dividaTotalRestante += (parcelasRestantes * item.valor);
        }
      }
    });

    return { custoFixoMensal, custoParceladoMensal, dividaTotalRestante };
  }, [recorrencias]);

  // CORREÇÃO: A previsão do fim agora usa as parcelas que faltam a partir do mês atual indicado
  const calcularPrevisaoFim = (dataInicio, parcelaAtual, parcelasTotais) => {
    if (!dataInicio) return "Desconhecido";
    const [ano, mes] = dataInicio.split("-").map(Number);
    const mesesRestantes = parcelasTotais - parcelaAtual;
    
    // Soma apenas os meses restantes ao mês indicado
    const dataFim = new Date(ano, (mes - 1) + mesesRestantes, 1);
    
    // Devolve formatado (Ex: mai. de 2028)
    return dataFim.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const handleOpenAdd = () => {
    setFormData({ descricao: "", valor: "", categoria: "", tipo: "fixa", parcelaAtual: 1, parcelasTotais: 2, dataInicio: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      descricao: item.descricao,
      valor: item.valor,
      categoria: item.categoria,
      tipo: item.tipo,
      parcelaAtual: item.parcelaAtual || 1,
      parcelasTotais: item.parcelasTotais || 2,
      dataInicio: item.dataInicio || ""
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        valor: parseFloat(formData.valor),
        parcelaAtual: parseInt(formData.parcelaAtual),
        parcelasTotais: parseInt(formData.parcelasTotais),
        uid: user.uid,
      };

      if (!editingId) dataToSave.criadoEm = Date.now();

      if (editingId) {
        await updateDoc(doc(db, "recorrencias", editingId), dataToSave);
      } else {
        await addDoc(collection(db, "recorrencias"), dataToSave);
      }
      
      setIsModalOpen(false);
      fetchRecorrencias();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir esta recorrência?")) {
      await deleteDoc(doc(db, "recorrencias", id));
      fetchRecorrencias();
    }
  };

  const handleDeleteAll = async () => {
    if (recorrencias.length === 0) return;
    if (window.confirm("ATENÇÃO: Tem certeza que deseja apagar TODAS as recorrências de uma vez? Essa ação não pode ser desfeita.")) {
      try {
        setLoading(true);
        const batch = writeBatch(db);
        recorrencias.forEach((item) => {
          const docRef = doc(db, "recorrencias", item.id);
          batch.delete(docRef);
        });
        await batch.commit();
        fetchRecorrencias();
      } catch (error) {
        console.error("Erro ao apagar tudo:", error);
        setLoading(false);
      }
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
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Recorrências</h2>
                <p className="text-gray-500 mt-1 text-sm">Gerencie contas fixas e pagamentos parcelados.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleDeleteAll} disabled={recorrencias.length === 0} className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50">
                Apagar Tudo
              </button>
              <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Nova Conta
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Custos Fixos Mensais</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.custoFixoMensal)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Parcelas (Mês)</h3>
              <p className="text-3xl font-bold text-orange-500">{formatCurrency(metrics.custoParceladoMensal)}</p>
            </div>
            <div className="bg-blue-950 p-6 rounded-2xl shadow-lg border border-blue-900 text-white">
              <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-2">Dívida Total Restante</h3>
              <p className="text-3xl font-bold">{formatCurrency(metrics.dividaTotalRestante)}</p>
              <p className="text-xs text-blue-300 mt-1">Soma de todas as parcelas pendentes.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-10 text-gray-500">Carregando dados...</div>
          ) : recorrencias.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <p className="text-gray-500 font-medium">Nenhuma recorrência cadastrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recorrencias.map((item) => {
                const isParcelada = item.tipo === "parcelada";
                const progresso = isParcelada ? (item.parcelaAtual / item.parcelasTotais) * 100 : 100;
                
                // Variáveis Corrigidas
                const parcelasRestantes = isParcelada ? item.parcelasTotais - item.parcelaAtual : 0;
                const valorTotalRestanteDoItem = parcelasRestantes * item.valor;
                
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isParcelada ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isParcelada ? 'Parcelado' : 'Conta Fixa'}
                          </span>
                          <span className="text-sm text-gray-400 font-medium capitalize">{item.categoria}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize">{item.descricao}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Valor Mensal</p>
                        <p className="text-2xl font-extrabold text-red-600">{formatCurrency(item.valor)}</p>
                      </div>
                      
                      {isParcelada && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Faltam</p>
                          <p className="text-lg font-bold text-gray-900">{parcelasRestantes}x <span className="text-sm font-medium text-gray-500">de {formatCurrency(item.valor)}</span></p>
                          {/* NOVO: Valor total restante exclusivo daquele item */}
                          <p className="text-xs font-bold text-red-500 mt-0.5">Restante: {formatCurrency(valorTotalRestanteDoItem)}</p>
                        </div>
                      )}
                    </div>

                    {isParcelada ? (
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                          <span>Parcela {item.parcelaAtual} de {item.parcelasTotais}</span>
                          <span className="text-gray-400 font-medium">Fim: <span className="text-gray-700 capitalize">{calcularPrevisaoFim(item.dataInicio, item.parcelaAtual, item.parcelasTotais)}</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                        <span className="text-gray-500">Recorrência Mensal Ininterrupta</span>
                        {item.dataInicio && <span className="font-bold text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded">Desde: {item.dataInicio}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? "Editar Recorrência" : "Nova Recorrência"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${formData.tipo === 'fixa' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" className="hidden" checked={formData.tipo === 'fixa'} onChange={() => setFormData({...formData, tipo: 'fixa'})} />
                  Conta Fixa
                </label>
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${formData.tipo === 'parcelada' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" className="hidden" checked={formData.tipo === 'parcelada'} onChange={() => setFormData({...formData, tipo: 'parcelada'})} />
                  Parcelada
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descrição</label>
                <input required type="text" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Aluguel, Celular novo..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Valor Mensal (R$)</label>
                  <input required type="number" step="0.01" min="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} placeholder="0,00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Categoria</label>
                  <input required type="text" value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Moradia" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {formData.tipo === "parcelada" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div>
                    <label className="block text-xs font-semibold text-orange-800 uppercase mb-1">Parcela Atual</label>
                    <input required type="number" min="1" value={formData.parcelaAtual} onChange={(e) => setFormData({...formData, parcelaAtual: e.target.value})} className="w-full px-3 py-2 border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-center font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-orange-800 uppercase mb-1">Total de Parcelas</label>
                    <input required type="number" min="2" value={formData.parcelasTotais} onChange={(e) => setFormData({...formData, parcelasTotais: e.target.value})} className="w-full px-3 py-2 border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-center font-bold" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  {formData.tipo === 'parcelada' ? "Mês da 1ª Parcela" : "Mês de Início"}
                </label>
                <input required type="month" value={formData.dataInicio} onChange={(e) => setFormData({...formData, dataInicio: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button type="submit" className="w-full py-3.5 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all">
                  {editingId ? "Salvar Alterações" : "Adicionar Recorrência"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}