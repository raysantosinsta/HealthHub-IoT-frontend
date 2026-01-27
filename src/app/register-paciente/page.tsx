"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Calendar, 
  Cpu, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Stethoscope,
  Wifi,
  Mail
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function CadastroPaciente() {
  const router = useRouter();
  const { isAuthenticated, token, loading } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthDate: "",
    customId: "SENSOR-PATIENT-",
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Redireciona se não logado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3001/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          // Garante que o ID do sensor seja enviado em maiúsculas para o backend
          customId: formData.customId.trim().toUpperCase(),
        }),
      });

      if (response.ok) {
        setStatus("success");
        // Limpa o formulário após o sucesso
        setFormData({ name: "", email: "", birthDate: "", customId: "SENSOR-PATIENT-" });
        
        // Redireciona ou limpa o status após 3 segundos
        setTimeout(() => {
          setStatus("idle");
          router.push("/"); // Opcional: volta para a home
        }, 3000);
      } else {
        const errorData = await response.json();
        setStatus("error");
        setErrorMessage(errorData.message || "Erro ao cadastrar. Verifique se o ID do dispositivo já existe.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setStatus("error");
      setErrorMessage("Não foi possível conectar ao servidor.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F1F5F9] text-[#06B6D4]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <span className="font-bold text-sm tracking-widest uppercase text-[#1E293B]">Carregando Módulo...</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans relative overflow-hidden flex flex-col text-[#1E293B]">
      
      {/* Background Decorativo Tech */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#1E293B]/5 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#06B6D4] rounded-full blur-[120px] opacity-5 -z-10" />

      {/* HEADER NAV */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-10 pb-6">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#06B6D4] transition-colors font-semibold text-sm mb-6 p-1"
          >
            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-[#06B6D4] transition-colors">
                <ArrowLeft size={16} />
            </div>
            Voltar para Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <div className="p-3.5 bg-[#1E293B] rounded-2xl shadow-lg shadow-slate-300 text-[#06B6D4]">
                     <Stethoscope size={28} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">Novo Paciente</h1>
                    <p className="text-slate-500 font-medium">Cadastre um novo leito para monitoramento IoT.</p>
                 </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500">Sistema Online</span>
            </div>
          </div>
      </div>

      {/* CARD DO FORMULÁRIO */}
      <main className="max-w-3xl mx-auto w-full px-6 pb-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#06B6D4] opacity-50" />

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Prontuário Digital
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#1E293B] ml-1">Nome Completo</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#06B6D4]">
                                <User size={18} />
                            </div>
                            <input 
                                required
                                type="text"
                                placeholder="Ex: João Silva"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Email (Opcional, mas recomendado pelo seu Service) */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#1E293B] ml-1">E-mail de Contato</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#06B6D4]">
                                <Mail size={18} />
                            </div>
                            <input 
                                type="email"
                                placeholder="paciente@email.com"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Data Nascimento */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-bold text-[#1E293B] ml-1">Data de Nascimento</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#06B6D4]">
                                <Calendar size={18} />
                            </div>
                            <input 
                                required
                                type="date"
                                className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl text-[#1E293B] bg-[#F1F5F9] focus:bg-white focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition-all"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: DADOS DO SENSOR (DeviceId) */}
            <div className="bg-[#1E293B]/5 p-6 rounded-2xl border border-[#1E293B]/10 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-widest flex items-center gap-2">
                        <Cpu size={14} /> Vínculo de Hardware (DeviceId)
                    </h2>
                    <span className="flex items-center gap-1 text-[10px] bg-[#06B6D4]/10 text-[#06B6D4] px-2 py-1 rounded border border-[#06B6D4]/20 font-bold">
                        <Wifi size={10} /> MQTT ATIVO
                    </span>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1E293B] ml-1">
                        Serial do Dispositivo (Firmware ID)
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#06B6D4]">
                            <Cpu size={18} />
                        </div>
                        <input 
                            required
                            type="text"
                            placeholder="SENSOR-PATIENT-001"
                            className="block w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl text-[#1E293B] font-mono tracking-wide focus:ring-4 focus:ring-[#06B6D4]/10 focus:border-[#06B6D4] transition-all bg-white uppercase"
                            value={formData.customId}
                            onChange={(e) => setFormData({...formData, customId: e.target.value})}
                        />
                    </div>
                    <p className="text-xs text-slate-500 ml-1 leading-relaxed">
                        ⚠️ Este ID deve ser <strong>idêntico</strong> ao configurado no seu ESP32 para que os batimentos cardíacos apareçam no dashboard.
                    </p>
                </div>
            </div>

            {/* FEEDBACK DE ERRO */}
            {status === "error" && (
                <div role="alert" className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-bold text-sm">Falha no Cadastro</p>
                        <p className="text-xs opacity-90">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* BOTÃO DE AÇÃO */}
            <div className="pt-2">
                <button 
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className={`
                        w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                        ${status === "success" 
                            ? "bg-[#22C55E] text-white shadow-[#22C55E]/30" 
                            : status === "error"
                                ? "bg-[#EF4444] text-white"
                                : "bg-[#1E293B] hover:bg-slate-800 text-white shadow-[#1E293B]/30 hover:-translate-y-1"
                        }
                    `}
                >
                    {status === "loading" && <Loader2 className="animate-spin" />}
                    {status === "success" && <CheckCircle2 className="animate-bounce" />}
                    
                    {status === "loading" && "Vinculando..."}
                    {status === "success" && "Paciente e Sensor Vinculados!"}
                    {status === "error" && "Tentar Novamente"}
                    {status === "idle" && (
                        <>
                            <Save size={18} />
                            <span>Confirmar e Ativar Monitoramento</span>
                        </>
                    )}
                </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}