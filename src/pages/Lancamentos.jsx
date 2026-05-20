// src/pages/Lancamentos.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, doc 
} from "firebase/firestore";

// Lista de categorias padrão para todos os usuários
const CATEGORIAS_PADRAO = [
  "Alimentação",
  "Educação",
  "Lazer",
  "Moradia",
  "Saúde",
  "Transporte",
  "Outros"
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    tipo: "saida",
    categoria: "", 
    pago: false,
    referencia: selectedMonth
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // BUSCAR CATEGORIAS EXCLUSIVAS DO USUÁRIO
  const fetchCategorias = async () => {
    if (!user?.uid) return;
    try {
      // O filtro "where" garante que ele veja APENAS as categorias que ele mesmo criou
      const q = query(collection(db, "categorias"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const cats = [];
      snap.forEach(doc => cats.push(doc.data().nome));
      setCategoriasUser(cats.sort());
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // BUSCAR LANÇAMENTOS + INJETAR RECORRÊNCIAS
  const fetchTransacoes = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      
      const qFinancas = query(
        collection(db, "financas"), 
        where("uid", "==", user.uid),
        where("referencia", "==", selectedMonth)
      );
      
      const qRecorrencias = query(
        collection(db, "recorrencias"), 
        where("uid", "==", user.uid)
      );

      const [snapFinancas, snapRecorrencias] = await Promise.all([
        getDocs(qFinancas),
        getDocs(qRecorrencias)
      ]);

      const dados = [];
      
      snapFinancas.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() });
      });

      const [selYear, selMonth] = selectedMonth.split("-").map(Number);

      snapRecorrencias.forEach((doc) => {
        const item = doc.data();
        if (!item.dataInicio) return;
        
        const [startYear, startMonth] = item.dataInicio.split("-").map(Number);
        const monthDiff = (selYear - startYear) * 12 + (selMonth - startMonth);

        if (monthDiff < 0) return; 

        if (item.tipo === "fixa") {
          dados.push({
            id: `rec-${doc.id}`, 
            descricao: item.descricao,
            valor: item.valor,
            tipo: "saida", 
            categoria: item.categoria,
            isRecorrente: true, 
            criadoEm: item.criadoEm || Date.now()
          });
        } else if (item.tipo === "parcelada") {
          const parcelaDesteMes = item.parcelaAtual + monthDiff;
          if (parcelaDesteMes <= item.parcelasTotais) {
            dados.push({
              id: `rec-${doc.id}`,
              descricao: `${item.descricao} (${parcelaDesteMes}/${item.parcelasTotais})`,
              valor: item.valor,
              tipo: "saida",
              categoria: item.categoria,
              isRecorrente: true,
              criadoEm: item.criadoEm || Date.now()
            });
          }
        }
      });

      dados.sort((a, b) => b.criadoEm - a.criadoEm);
      setTransacoes(dados);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchTransacoes();
    setFormData(prev => ({ ...prev, referencia: selectedMonth }));
  }, [user, selectedMonth]);

  const handleOpenAdd = () => {
    setFormData({ descricao: "", valor: "", tipo: "saida", categoria: "", pago: false, referencia: selectedMonth });
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
      referencia: t.referencia
    });
    setEditingId(t.id);
    setIsModalOpen(true);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepara os dados básicos que servem tanto para criar quanto para editar
      const dataToSave = {
        ...formData,
        valor: parseFloat(formData.valor),
        uid: user.uid,
      };

      if (editingId) {
        // Se estiver EDITANDO, atualiza apenas os dados alterados (sem tocar no criadoEm)
        await updateDoc(doc(db, "financas", editingId), dataToSave);
      } else {
        // Se for NOVO, adicionamos a data de criação exata de agora antes de salvar
        dataToSave.criadoEm = Date.now();
        await addDoc(collection(db, "financas"), dataToSave);
      }
      
      setIsModalOpen(false);
      fetchTransacoes();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o lançamento.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      try {
        await deleteDoc(doc(db, "financas", id));
        fetchTransacoes();
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  const togglePago = async (id, currentStatus) => {
    try {
      setTransacoes(transacoes.map(t => t.id === id ? { ...t, pago: !currentStatus } : t));
      await updateDoc(doc(db, "financas", id), { pago: !currentStatus });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      fetchTransacoes();
    }
  };

  // Prepara as categorias do usuário, removendo duplicatas caso ele crie uma com o mesmo nome das padrões
  const categoriasPersonalizadas = categoriasUser.filter(
    catUser => !CATEGORIAS_PADRAO.map(c => c.toLowerCase()).includes(catUser.toLowerCase())
  );

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
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Lançamentos</h2>
                <p className="text-gray-500 mt-1 text-sm">Gerencie suas receitas e despesas.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <button 
                onClick={handleOpenAdd}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Novo Lançamento
              </button>
            </div>
          </header>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Carregando dados...</div>
            ) : transacoes.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                 </div>
                 <p className="text-gray-500 font-medium">Nenhum lançamento encontrado em {selectedMonth}.</p>
                 <button onClick={handleOpenAdd} className="mt-4 text-blue-600 font-semibold hover:underline">Adicionar o primeiro</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="p-4">Descrição</th>
                      <th className="p-4 hidden sm:table-cell">Categoria</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {transacoes.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 capitalize flex items-center gap-2">
                            {t.descricao}
                            {t.isRecorrente && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-md border border-blue-200">
                                Recorrente
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden capitalize mt-0.5">{t.categoria}</p>
                        </td>
                        <td className="p-4 hidden sm:table-cell capitalize text-gray-600 font-medium">
                          {t.categoria}
                        </td>
                        <td className="p-4 font-bold">
                          <span className={t.tipo === "entrada" ? "text-green-600" : "text-gray-900"}>
                            {t.tipo === "entrada" ? "+ " : "- "}
                            {formatCurrency(t.valor)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {t.isRecorrente ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Automático
                            </span>
                          ) : t.tipo === "saida" ? (
                            <button 
                              onClick={() => togglePago(t.id, t.pago)}
                              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-colors border ${
                                t.pago 
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${t.pago ? "bg-green-500" : "bg-red-500"}`}></div>
                              {t.pago ? "Pago" : "Pendente"}
                            </button>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                              Receita
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {t.isRecorrente ? (
                            <span className="text-xs text-gray-400 font-medium">Editar em Recorrências</span>
                          ) : (
                            <div className="space-x-2">
                              <button onClick={() => handleOpenEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* MODAL DE ADICIONAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? "Editar Lançamento" : "Novo Lançamento"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="flex gap-4 p-1 bg-gray-100 rounded-xl">
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${formData.tipo === 'saida' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" name="tipo" className="hidden" checked={formData.tipo === 'saida'} onChange={() => setFormData({...formData, tipo: 'saida'})} />
                  Despesa
                </label>
                <label className={`flex-1 text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${formData.tipo === 'entrada' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  <input type="radio" name="tipo" className="hidden" checked={formData.tipo === 'entrada'} onChange={() => setFormData({...formData, tipo: 'entrada'})} />
                  Receita
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Descrição</label>
                  <input required type="text" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Ex: Supermercado" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Valor (R$)</label>
                  <input required type="number" step="0.01" min="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} placeholder="0,00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900" />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Categoria</label>
                  
                  {/* NOVO: SELECT AGRUPADO DE CATEGORIAS */}
                  <select 
                    required 
                    value={formData.categoria} 
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium capitalize"
                  >
                    <option value="" disabled>Selecione...</option>
                    
                    {/* Grupo 1: Categorias Básicas */}
                    <optgroup label="Básicas">
                      {CATEGORIAS_PADRAO.map(cat => (
                        <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                      ))}
                    </optgroup>

                    {/* Grupo 2: Categorias do Usuário */}
                    {categoriasPersonalizadas.length > 0 && (
                      <optgroup label="Minhas Categorias">
                        {categoriasPersonalizadas.map((cat, idx) => (
                          <option key={`user-${idx}`} value={cat.toLowerCase()}>{cat}</option>
                        ))}
                      </optgroup>
                    )}

                    {/* Grupo Extra: Caso esteja editando um lançamento com categoria que não existe mais */}
                    {formData.categoria && 
                     !CATEGORIAS_PADRAO.map(c => c.toLowerCase()).includes(formData.categoria.toLowerCase()) && 
                     !categoriasUser.map(c => c.toLowerCase()).includes(formData.categoria.toLowerCase()) && (
                       <optgroup label="Categoria Antiga (Inativa)">
                         <option value={formData.categoria.toLowerCase()}>{formData.categoria}</option>
                       </optgroup>
                    )}
                  </select>

                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Competência</label>
                  <input required type="month" value={formData.referencia} onChange={(e) => setFormData({...formData, referencia: e.target.value})} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {formData.tipo === 'saida' && (
                  <label className="flex items-center gap-3 cursor-pointer mt-5">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={formData.pago} onChange={(e) => setFormData({...formData, pago: e.target.checked})} />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${formData.pago ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.pago ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{formData.pago ? 'Já foi pago' : 'Não pago'}</span>
                  </label>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button type="submit" className="w-full py-3.5 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  {editingId ? "Salvar Alterações" : "Adicionar Lançamento"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}