// src/pages/Familia.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { db } from "../config/firebase";
import { 
  collection, query, where, getDocs, 
  addDoc, updateDoc, deleteDoc, doc 
} from "firebase/firestore";

export default function Familia() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estados para organizar os dados
  const [membros, setMembros] = useState([]);
  const [convitesRecebidos, setConvitesRecebidos] = useState([]);
  const [convitesEnviados, setConvitesEnviados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle do Modal de Convite
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    relacionamento: "Cônjuge"
  });

  // 1. BUSCAR CONEXÕES (Convites e Membros)
  const fetchConexoes = async () => {
    if (!user?.uid || !user?.email) return;
    try {
      setLoading(true);
      
      const conexoesRef = collection(db, "conexoes_familia");

      // Query 1: Conexões onde EU sou o remetente (Convites que enviei ou pessoas que convidei e aceitaram)
      const qEnviados = query(conexoesRef, where("usuario1_uid", "==", user.uid));
      const snapEnviados = await getDocs(qEnviados);
      
      // Query 2: Conexões onde EU sou o destinatário (Convites que recebi ou pessoas que me convidaram e eu aceitei)
      const qRecebidos = query(conexoesRef, where("usuario2_email", "==", user.email));
      const snapRecebidos = await getDocs(qRecebidos);

      const todosEnviados = snapEnviados.docs.map(d => ({ id: d.id, ...d.data() }));
      const todosRecebidos = snapRecebidos.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filtrar e organizar os dados para a interface
      setConvitesEnviados(todosEnviados.filter(c => c.status === "pendente"));
      setConvitesRecebidos(todosRecebidos.filter(c => c.status === "pendente"));
      
      // Membros são todos os "aceitos", tanto enviados quanto recebidos
      const membrosAceitos = [
        ...todosEnviados.filter(c => c.status === "aceito"),
        ...todosRecebidos.filter(c => c.status === "aceito")
      ];
      setMembros(membrosAceitos);

    } catch (error) {
      console.error("Erro ao buscar dados da família:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConexoes();
  }, [user]);

  // 2. ENVIAR CONVITE
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (formData.email.toLowerCase() === user.email.toLowerCase()) {
      alert("Você não pode convidar a si mesmo!");
      return;
    }

    try {
      await addDoc(collection(db, "conexoes_familia"), {
        usuario1_uid: user.uid,
        usuario1_email: user.email,
        usuario1_nome: user.displayName || "Usuário",
        usuario2_email: formData.email.toLowerCase(),
        usuario2_uid: "", // Será preenchido quando o usuário 2 aceitar
        usuario2_nome: "", // Será preenchido quando o usuário 2 aceitar
        relacionamento: formData.relacionamento,
        status: "pendente",
        criadoEm: Date.now(),
      });
      
      setIsModalOpen(false);
      setFormData({ email: "", relacionamento: "Cônjuge" });
      fetchConexoes();
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
    }
  };

  // 3. ACEITAR CONVITE
  const handleAccept = async (convite) => {
    try {
      await updateDoc(doc(db, "conexoes_familia", convite.id), {
        status: "aceito",
        usuario2_uid: user.uid,
        usuario2_nome: user.displayName || "Usuário",
        atualizadoEm: Date.now()
      });
      fetchConexoes();
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
    }
  };

  // 4. RECUSAR / CANCELAR / REMOVER
  const handleRemove = async (id, mensagemConfirmacao) => {
    if (window.confirm(mensagemConfirmacao)) {
      try {
        await deleteDoc(doc(db, "conexoes_familia", id));
        fetchConexoes();
      } catch (error) {
        console.error("Erro ao remover conexão:", error);
      }
    }
  };

  // Função auxiliar para formatar a data
  const formatData = (timestamp) => {
    if (!timestamp) return "Data desconhecida";
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Cabeçalho */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-gray-200">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </button>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Família</h2>
                <p className="text-gray-500 mt-1 text-sm">Gerencie o compartilhamento de finanças da sua casa.</p>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-950 hover:bg-black text-white font-semibold rounded-xl transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              Convidar Familiar
            </button>
          </header>

          {loading ? (
            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div></div>
          ) : (
            <div className="space-y-8">

              {/* SEÇÃO 1: CONVITES RECEBIDOS (Ação Necessária) */}
              {convitesRecebidos.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    Solicitações Pendentes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {convitesRecebidos.map(convite => (
                      <div key={convite.id} className="bg-orange-50 p-5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                        <div>
                          <p className="text-sm text-orange-800 font-medium">Convite recebido de:</p>
                          <p className="text-lg font-bold text-gray-900">{convite.usuario1_nome} <span className="text-sm font-normal text-gray-500">({convite.usuario1_email})</span></p>
                          <p className="text-sm text-gray-600 mt-1">Para entrar como: <span className="font-bold">{convite.relacionamento}</span></p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRemove(convite.id, "Recusar este convite?")} className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold rounded-lg transition-colors text-sm">Recusar</button>
                          <button onClick={() => handleAccept(convite)} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-bold rounded-lg shadow-md transition-colors text-sm">Aceitar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* SEÇÃO 2: MEMBROS DA FAMÍLIA (Aceitos) */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Membros da Família</h3>
                
                {membros.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-900">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-gray-500 font-medium">Sua família ainda não tem membros.</p>
                    <p className="text-sm text-gray-400 mt-1">Convide alguém para compartilhar despesas e receitas.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {membros.map(membro => {
                      // Descobrir se quem está logado é o usuario1 ou usuario2
                      const souUsuario1 = membro.usuario1_uid === user.uid;
                      const nomeFamiliar = souUsuario1 ? membro.usuario2_nome : membro.usuario1_nome;
                      const emailFamiliar = souUsuario1 ? membro.usuario2_email : membro.usuario1_email;

                      return (
                        <div key={membro.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                          {/* Faixa decorativa */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                          
                          <div className="flex justify-between items-start mb-4 mt-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xl uppercase border border-gray-200">
                                {nomeFamiliar ? nomeFamiliar.charAt(0) : emailFamiliar.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 leading-tight">{nomeFamiliar || "Usuário"}</h4>
                                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-bold rounded mt-1 border border-blue-100">
                                  {membro.relacionamento}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-500 mb-4">
                            <p className="truncate" title={emailFamiliar}>{emailFamiliar}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Membro desde {formatData(membro.atualizadoEm)}
                            </p>
                          </div>

                          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleRemove(membro.id, "Tem certeza que deseja remover este membro da família? O compartilhamento será encerrado.")} className="text-xs text-red-500 hover:text-red-700 font-bold">
                              Remover Conexão
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* SEÇÃO 3: CONVITES ENVIADOS (Aguardando Resposta) */}
              {convitesEnviados.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-t border-gray-200 pt-8">Convites Enviados (Aguardando)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {convitesEnviados.map(convite => (
                      <div key={convite.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="truncate pr-4">
                          <p className="text-sm font-bold text-gray-700 truncate">{convite.usuario2_email}</p>
                          <p className="text-xs text-gray-500">Como: {convite.relacionamento}</p>
                        </div>
                        <button onClick={() => handleRemove(convite.id, "Cancelar este convite?")} className="text-gray-400 hover:text-red-500" title="Cancelar Convite">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CONVIDAR FAMILIAR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Novo Membro</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <form onSubmit={handleSendInvite} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">E-mail do Familiar</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@exemplo.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                <p className="text-xs text-gray-400 mt-2">O e-mail deve ser o mesmo que ele usa para acessar o NewCoinManager.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Relacionamento</label>
                <select required value={formData.relacionamento} onChange={(e) => setFormData({...formData, relacionamento: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium">
                  <option value="Cônjuge">Cônjuge</option>
                  <option value="Filho(a)">Filho(a)</option>
                  <option value="Pai/Mãe">Pai/Mãe</option>
                  <option value="Irmão/Irmã">Irmão/Irmã</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="w-full py-3.5 bg-blue-950 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}