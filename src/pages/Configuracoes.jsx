// src/pages/Configuracoes.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc 
} from "firebase/firestore";
import toast from "react-hot-toast"; // NOVO: Importação do Toast

export default function Configuracoes() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reservaPercentual, setReservaPercentual] = useState("");
  const [salvandoReserva, setSalvandoReserva] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: "" });

  // NOVO: Estado para o Modal de Exclusão
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchData = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      
      const configRef = doc(db, "configuracoes", user.uid);
      const configSnap = await getDoc(configRef);
      if (configSnap.exists() && configSnap.data().reservaPercentual) {
        setReservaPercentual(configSnap.data().reservaPercentual);
      }

      const q = query(collection(db, "categorias"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const dados = [];
      querySnapshot.forEach((d) => {
        dados.push({ id: d.id, ...d.data() });
      });
      dados.sort((a, b) => a.nome.localeCompare(b.nome));
      setCategorias(dados);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Falha ao carregar as configurações."); // NOVO
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSaveReserva = async (e) => {
    e.preventDefault();
    try {
      setSalvandoReserva(true);
      const configRef = doc(db, "configuracoes", user.uid);
      await setDoc(configRef, { 
        reservaPercentual: parseFloat(reservaPercentual) || 0 
      }, { merge: true });
      
      toast.success("Meta de reserva atualizada com sucesso!"); // NOVO (substituiu o alert)
    } catch (error) {
      console.error("Erro ao salvar reserva:", error);
      toast.error("Erro ao atualizar a meta de reserva."); // NOVO
    } finally {
      setSalvandoReserva(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ nome: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setFormData({ nome: cat.nome });
    setEditingId(cat.id);
    setIsModalOpen(true);
  };

  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        nome: formData.nome.toLowerCase(),
        uid: user.uid,
      };

      if (editingId) {
        await updateDoc(doc(db, "categorias", editingId), dataToSave);
        toast.success("Categoria atualizada!"); // NOVO
      } else {
        dataToSave.criadoEm = Date.now();
        await addDoc(collection(db, "categorias"), dataToSave);
        toast.success("Categoria criada com sucesso!"); // NOVO
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar a categoria."); // NOVO
    }
  };

  // NOVO: Função que abre o modal de exclusão
  const confirmDelete = (id) => {
    setItemToDelete(id);
  };

  // NOVO: Função que efetivamente deleta a categoria
  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "categorias", itemToDelete));
      toast.success("Categoria excluída!");
      fetchData();
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Erro ao excluir a categoria.");
    } finally {
      setItemToDelete(null); // Fecha o modal
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-gray-200">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Configurações</h2>
                <p className="text-gray-500 mt-1 text-sm">Gerencie seu perfil e suas preferências.</p>
              </div>
            </div>
          </header>

          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-3xl shadow-inner border-4 border-white flex-shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.displayName || "Usuário da Conta"}</h3>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Meta de Reserva Mensal</h3>
              <p className="text-sm text-gray-500">Qual porcentagem do seu saldo final você deseja tentar guardar/investir todo mês?</p>
            </div>
            
            <form onSubmit={handleSaveReserva} className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
              <div className="w-full">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Percentual (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1" min="0" max="100" 
                    value={reservaPercentual} 
                    onChange={(e) => setReservaPercentual(e.target.value)} 
                    placeholder="Ex: 20" 
                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900" 
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 font-bold pointer-events-none">%</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={salvandoReserva}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
              >
                {salvandoReserva ? "Salvando..." : "Salvar Meta"}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Minhas Categorias</h3>
                <p className="text-sm text-gray-500">Adicione categorias para organizar seus lançamentos.</p>
              </div>
              <button onClick={handleOpenAdd} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Nova Categoria
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-gray-500">Carregando categorias...</div>
              ) : categorias.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Nenhuma categoria criada.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {categorias.map((cat) => (
                    <li key={cat.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase border border-gray-200">
                          {cat.nome.substring(0, 2)}
                        </div>
                        <p className="font-bold text-gray-900 capitalize">{cat.nome}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenEdit(cat)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        {/* NOVO: Chamando a função confirmDelete */}
                        <button onClick={() => confirmDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* MODAL DE CATEGORIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{editingId ? "Editar Categoria" : "Nova Categoria"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSubmitCategoria} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome da Categoria</label>
                <input required type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Alimentação" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 capitalize" />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="w-full py-3.5 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all">
                  {editingId ? "Salvar Alterações" : "Criar Categoria"}
                </button>
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
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Excluir Categoria?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Os lançamentos antigos não serão alterados, mas essa categoria não aparecerá mais nas listas.
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