"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Briefcase,
  UserCog,
  Stethoscope,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function CadastroUser() {
  const router = useRouter();
  const { isAuthenticated, user, token, loading } = useAuth(); 

  // Estados do Formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF", 
    companyId: "",
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Lógica de Proteção e Auto-preenchimento
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
        router.push("/login");
        return;
    }

    // Garante que o colaborador seja criado na mesma empresa que o Admin logado
    if (user?.companyId && !formData.companyId) {
        setFormData(prev => ({ ...prev, companyId: user.companyId }));
    }
  }, [isAuthenticated, loading, router, user, formData.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
        const res = await fetch("http://localhost:3001/auth/register", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Usando token do Contexto
            },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            setStatus("success");
            // Reseta apenas campos sensíveis, mantém a empresa
            setFormData(prev => ({ ...prev, name: "", email: "", password: "" }));
            setTimeout(() => setStatus("idle"), 3000);
        } else {
            const errorData = await res.json();
            setStatus("error");
            setErrorMessage(errorData.message || "Erro ao cadastrar colaborador.");
            setTimeout(() => setStatus("idle"), 4000);
        }
    } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMessage("Falha na conexão com o servidor.");
        setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] text-[#06B6D4]">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <span className="font-bold text-sm tracking-widest uppercase text-[#1E293B]">Validando Permissões...</span>
        </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col relative text-[#1E293B]">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#06B6D4] rounded-full blur-[120px] opacity-5 -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      {/* HEADER NAV */}
      <div className="max-w-5xl mx-auto w-full px-6 pt-10 pb-6">
         <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#06B6D4] transition-colors font-semibold text-sm mb-6 p-1"
         >
            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-[#06B6D4] transition-colors">
                <ArrowLeft size={16} />
            </div>
            Voltar para Dashboard
         </Link>
         
         <div className="flex items-center gap-4">
             <div className="p-3.5 bg-[#1E293B] rounded-2xl shadow-lg shadow-slate-300 text-[#06B6D4]">
                 <UserCog size={28} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">Novo Colaborador</h1>
               Cadastre a equipe para: <span className="text-[#06B6D4] font-bold">{user?.companyName || 'Sua Empresa'}</span>
             </div>
         </div>
      </div>

      <main className="max-w-5xl mx-auto w-full px-6 pb-12 flex-1">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#06B6D4] opacity-30" />

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* DADOS DE ACESSO */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                        <div className="p-1.5 bg-[#F1F5F9] rounded text-[#06B6D4]">
                            <Lock size={16} /> 
                        </div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Credenciais</h2>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#1E293B]">Nome Completo</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#06B6D4]">
                                <User size={20} />
                            </div>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: Dr. Carlos Silva"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#1E293B]">Email Corporativo</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#06B6D4]">
                                <Mail size={20} />
                            </div>
                            <input 
                                required
                                type="email"
                                placeholder="nome@hospital.com"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#1E293B]">Senha Provisória</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#06B6D4]">
                                <Lock size={20} />
                            </div>
                            <input 
                                required
                                type="password"
                                placeholder="••••••••"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* PERMISSÕES */}
                <div className="space-y-6 flex flex-col h-full">
                     <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <div className="p-1.5 bg-[#F1F5F9] rounded text-[#06B6D4]">
                            <Shield size={16} /> 
                        </div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Acesso</h2>
                    </div>

                    {/* STAFF */}
                    <div 
                        onClick={() => setFormData({...formData, role: 'STAFF'})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                            formData.role === 'STAFF' ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 'border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`p-2.5 rounded-full ${formData.role === 'STAFF' ? 'bg-[#06B6D4] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            <p className="font-bold">Corpo Clínico</p>
                            <p className="text-xs text-slate-500">Acesso a pacientes e alertas.</p>
                        </div>
                    </div>

                    {/* ADMIN */}
                    <div 
                        onClick={() => setFormData({...formData, role: 'ADMIN'})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                            formData.role === 'ADMIN' ? 'border-[#1E293B] bg-[#1E293B]/5' : 'border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`p-2.5 rounded-full ${formData.role === 'ADMIN' ? 'bg-[#1E293B] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <p className="font-bold">Administrador</p>
                            <p className="text-xs text-slate-500">Gestão de equipe e configurações.</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[20px]"></div>

                    {status === "error" && (
                        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center gap-3">
                            <ShieldAlert size={20} />
                            <span className="text-sm font-semibold">{errorMessage}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={status === "loading" || status === "success"}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                            status === "success" ? "bg-[#22C55E] text-white" : "bg-[#1E293B] hover:bg-slate-800 text-white"
                        }`}
                    >
                        {status === "loading" ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                        {status === "loading" ? "Processando..." : status === "success" ? "Sucesso!" : "Finalizar Cadastro"}
                    </button>
                </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}