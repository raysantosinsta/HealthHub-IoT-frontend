// "use client";

// import { useState, useEffect } from "react";
// import { 
//   User, 
//   Calendar, 
//   Cpu, 
//   Save, 
//   ArrowLeft, 
//   CheckCircle2, 
//   Loader2, 
//   AlertCircle,
//   Stethoscope,
//   Wifi,
//   Mail,
//   Activity,    // Ícone Genérico
//   BedDouble,   // Ícone Dormindo
//   PersonStanding, // Ícone Atividade
//   Smile,       // Ícone Normal
//   Heart,
//   Droplets
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../../contexts/AuthContext";

// const API_URL = "http://localhost:3001";

// // Helper para escolher ícone baseado no nome da atividade que vem do banco
// const getIconForPattern = (name: string) => {
//   const n = name.toLowerCase();
//   if (n.includes('dormindo') || n.includes('sono')) return <BedDouble size={20} />;
//   if (n.includes('física') || n.includes('exercício')) return <PersonStanding size={20} />;
//   if (n.includes('normal') || n.includes('acordado')) return <Smile size={20} />;
//   return <Activity size={20} />;
// };

// interface ActivityPattern {
//   id: string;
//   name: string;
//   defaultBpmMin: number;
//   defaultBpmMax: number;
//   defaultSpo2Min: number;
// }

// export default function CadastroPaciente() {
//   const router = useRouter();
//   const { isAuthenticated, token, loading } = useAuth();
  
//   // Dados básicos do paciente
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     birthDate: "",
//     customId: "SENSOR-PATIENT-",
//   });

//   // Novos Estados para lidar com os Limites
//   const [patterns, setPatterns] = useState<ActivityPattern[]>([]);
//   const [thresholds, setThresholds] = useState<Record<string, { bpmMin: number; bpmMax: number; spo2Min: number }>>({});

//   const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isLoadingPatterns, setIsLoadingPatterns] = useState(true);

//   // 1. Redireciona se não logado
//   useEffect(() => {
//     if (!loading && !isAuthenticated) {
//       router.replace("/login");
//     }
//   }, [loading, isAuthenticated, router]);

//   // 2. Busca os padrões de atividade ao carregar
//   useEffect(() => {
//     if (!token) return;

//     const fetchPatterns = async () => {
//       try {
//         const res = await fetch(`${API_URL}/patients/activities-patterns`, {
//           headers: { "Authorization": `Bearer ${token}` }
//         });
//         const data = await res.json();
        
//         if (Array.isArray(data)) {
//           setPatterns(data);
//           // Inicializa os inputs com os valores default do banco (ou valores seguros)
//           const initialThresholds: any = {};
//           data.forEach(p => {
//             initialThresholds[p.id] = {
//               bpmMin: p.defaultBpmMin || 60,
//               bpmMax: p.defaultBpmMax || 100,
//               spo2Min: p.defaultSpo2Min || 94
//             };
//           });
//           setThresholds(initialThresholds);
//         }
//       } catch (error) {
//         console.error("Erro ao buscar padrões", error);
//       } finally {
//         setIsLoadingPatterns(false);
//       }
//     };

//     fetchPatterns();
//   }, [token]);

//   // Handler para mudança nos inputs de limites
//   const handleThresholdChange = (patternId: string, field: string, value: string) => {
//     setThresholds(prev => ({
//       ...prev,
//       [patternId]: {
//         ...prev[patternId],
//         [field]: Number(value)
//       }
//     }));
//   };

//   // 3. Envio do Formulário
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus("loading");
//     setErrorMessage("");

//     // Monta o array de thresholds conforme o DTO do backend
//     const thresholdsArray = patterns.map(p => ({
//       activityPatternId: p.id,
//       bpmMin: thresholds[p.id]?.bpmMin,
//       bpmMax: thresholds[p.id]?.bpmMax,
//       spo2Min: thresholds[p.id]?.spo2Min,
//     }));

//     try {
//       const response = await fetch(`${API_URL}/patients`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           ...formData,
//           customId: formData.customId.trim().toUpperCase(),
//           thresholds: thresholdsArray // <--- O NOVO CAMPO
//         }),
//       });

//       if (response.ok) {
//         setStatus("success");
//         setFormData({ name: "", email: "", birthDate: "", customId: "SENSOR-PATIENT-" });
//         setTimeout(() => {
//           setStatus("idle");
//           router.push("/");
//         }, 2000);
//       } else {
//         const errorData = await response.json();
//         setStatus("error");
//         setErrorMessage(errorData.message || "Erro ao cadastrar.");
//       }
//     } catch (error) {
//       console.error("Erro na requisição:", error);
//       setStatus("error");
//       setErrorMessage("Não foi possível conectar ao servidor.");
//     }
//   };

//   if (loading) return <div>Carregando...</div>; // Simplificado para exemplo
//   if (!isAuthenticated) return null;

//   return (
//     <div className="min-h-screen bg-[#F1F5F9] font-sans relative overflow-hidden flex flex-col text-[#1E293B]">
      
//       {/* Background Decorativo */}
//       <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#1E293B]/5 to-transparent -z-10" />
//       <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#06B6D4] rounded-full blur-[120px] opacity-5 -z-10" />

//       {/* HEADER NAV */}
//       <div className="max-w-4xl mx-auto w-full px-6 pt-10 pb-6">
//           <Link href="/" className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#06B6D4] transition-colors font-semibold text-sm mb-6 p-1">
//             <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-[#06B6D4] transition-colors">
//                 <ArrowLeft size={16} />
//             </div>
//             Voltar para Dashboard
//           </Link>
          
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//                  <div className="p-3.5 bg-[#1E293B] rounded-2xl shadow-lg shadow-slate-300 text-[#06B6D4]">
//                      <Stethoscope size={28} />
//                  </div>
//                  <div>
//                     <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">Novo Paciente</h1>
//                     <p className="text-slate-500 font-medium">Cadastre e configure os limites vitais.</p>
//                  </div>
//             </div>
//           </div>
//       </div>

//       {/* CARD DO FORMULÁRIO */}
//       <main className="max-w-4xl mx-auto w-full px-6 pb-12">
//         <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
//           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#06B6D4] opacity-50" />

//           <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            
//             {/* SEÇÃO 1: DADOS PESSOAIS */}
//             <div className="space-y-6">
//                 <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
//                     <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//                         <User size={14} /> Prontuário Digital
//                     </h2>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-1.5">
//                         <label className="text-sm font-bold text-[#1E293B] ml-1">Nome Completo</label>
//                         <input required type="text" placeholder="Ex: João Silva" className="input-base"
//                             value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
//                     </div>
//                     <div className="space-y-1.5">
//                         <label className="text-sm font-bold text-[#1E293B] ml-1">E-mail</label>
//                         <input type="email" placeholder="paciente@email.com" className="input-base"
//                             value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
//                     </div>
//                     <div className="space-y-1.5">
//                         <label className="text-sm font-bold text-[#1E293B] ml-1">Data de Nascimento</label>
//                         <input required type="date" className="input-base"
//                             value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
//                     </div>
//                     <div className="space-y-1.5">
//                          <label className="text-sm font-bold text-[#1E293B] ml-1">ID do Sensor (Device ID)</label>
//                          <input required type="text" className="input-base font-mono uppercase bg-slate-50"
//                             value={formData.customId} onChange={(e) => setFormData({...formData, customId: e.target.value})} />
//                     </div>
//                 </div>
//             </div>

//             {/* SEÇÃO 2: CONFIGURAÇÃO DE LIMITES (NOVO) */}
//             <div className="space-y-6">
//                 <div className="flex items-center justify-between border-b border-slate-100 pb-2">
//                     <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//                         <Activity size={14} /> Limites de Monitoramento (Thresholds)
//                     </h2>
//                     {isLoadingPatterns && <Loader2 size={14} className="animate-spin text-cyan-500"/>}
//                 </div>

//                 <div className="grid grid-cols-1 gap-4">
//                   {patterns.map((pattern) => (
//                     <div key={pattern.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors">
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="p-2 bg-white rounded-lg text-cyan-600 shadow-sm">
//                            {getIconForPattern(pattern.name)}
//                         </div>
//                         <span className="font-bold text-slate-700">{pattern.name}</span>
//                       </div>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {/* BPM MIN */}
//                         <div className="relative">
//                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">BPM Mínimo</label>
//                           <div className="relative">
//                              <Heart size={14} className="absolute left-3 top-3 text-slate-400" />
//                              <input 
//                                type="number" 
//                                value={thresholds[pattern.id]?.bpmMin}
//                                onChange={(e) => handleThresholdChange(pattern.id, 'bpmMin', e.target.value)}
//                                className="w-full pl-9 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none"
//                              />
//                           </div>
//                         </div>

//                         {/* BPM MAX */}
//                         <div className="relative">
//                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">BPM Máximo</label>
//                           <div className="relative">
//                              <Heart size={14} className="absolute left-3 top-3 text-red-400" />
//                              <input 
//                                type="number" 
//                                value={thresholds[pattern.id]?.bpmMax}
//                                onChange={(e) => handleThresholdChange(pattern.id, 'bpmMax', e.target.value)}
//                                className="w-full pl-9 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
//                              />
//                           </div>
//                         </div>

//                         {/* SPO2 MIN */}
//                         <div className="relative">
//                           <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">SpO2 Mínimo (%)</label>
//                           <div className="relative">
//                              <Droplets size={14} className="absolute left-3 top-3 text-cyan-400" />
//                              <input 
//                                type="number" 
//                                value={thresholds[pattern.id]?.spo2Min}
//                                onChange={(e) => handleThresholdChange(pattern.id, 'spo2Min', e.target.value)}
//                                className="w-full pl-9 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none"
//                              />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {!isLoadingPatterns && patterns.length === 0 && (
//                      <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
//                         Nenhum padrão de atividade encontrado. O sistema usará padrões globais.
//                      </div>
//                   )}
//                 </div>
//             </div>

//             {/* FEEDBACK DE ERRO */}
//             {status === "error" && (
//                 <div role="alert" className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center gap-3 animate-shake">
//                     <AlertCircle size={20} />
//                     <div>
//                         <p className="font-bold text-sm">Falha no Cadastro</p>
//                         <p className="text-xs opacity-90">{errorMessage}</p>
//                     </div>
//                 </div>
//             )}

//             {/* BOTÃO */}
//             <div className="pt-2">
//                 <button 
//                     type="submit"
//                     disabled={status === "loading" || status === "success"}
//                     className={`
//                         w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
//                         ${status === "success" 
//                             ? "bg-[#22C55E] text-white shadow-[#22C55E]/30" 
//                             : status === "error"
//                                 ? "bg-[#EF4444] text-white"
//                                 : "bg-[#1E293B] hover:bg-slate-800 text-white shadow-[#1E293B]/30 hover:-translate-y-1"
//                         }
//                     `}
//                 >
//                     {status === "loading" ? <Loader2 className="animate-spin" /> : <Save size={18} />}
//                     {status === "loading" ? "Processando..." : status === "success" ? "Sucesso!" : "Salvar Configurações"}
//                 </button>
//             </div>

//           </form>
//         </div>
//       </main>

//       <style jsx global>{`
//         .input-base {
//            display: block;
//            width: 100%;
//            padding: 0.875rem 1rem;
//            border: 1px solid #E2E8F0;
//            border-radius: 0.75rem;
//            color: #1E293B;
//            background-color: #F8FAFC;
//            transition: all 0.2s;
//         }
//         .input-base:focus {
//            background-color: white;
//            border-color: #06B6D4;
//            outline: none;
//            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
//         }
//       `}</style>
//     </div>
//   );
// }