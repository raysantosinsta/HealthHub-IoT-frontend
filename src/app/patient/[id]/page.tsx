"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Activity,
  ArrowLeft,
  Heart,
  Droplets,
  BrainCircuit,
  AlertTriangle,
  Clock,
  Calendar,
  BedDouble,
  PersonStanding,
  Smile,
  HelpCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const MAX_INACTIVITY_MS = 30000;

// --- CONFIGURAÇÃO VISUAL ---
const getActivityStyle = (name: string) => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("dormindo") || normalizedName.includes("sono")) {
    return {
      icon: BedDouble,
      activeColor: "bg-indigo-600 text-white shadow-indigo-200",
      inactiveColor: "text-slate-500 hover:bg-slate-200",
    };
  }
  if (normalizedName.includes("física") || normalizedName.includes("exercício") || normalizedName.includes("correndo")) {
    return {
      icon: PersonStanding,
      activeColor: "bg-orange-500 text-white shadow-orange-200",
      inactiveColor: "text-slate-500 hover:bg-slate-200",
    };
  }
  if (normalizedName.includes("normal") || normalizedName.includes("acordado")) {
    return {
      icon: Smile,
      activeColor: "bg-emerald-500 text-white shadow-emerald-200",
      inactiveColor: "text-slate-500 hover:bg-slate-200",
    };
  }
  return {
    icon: HelpCircle,
    activeColor: "bg-slate-800 text-white shadow-slate-400",
    inactiveColor: "text-slate-500 hover:bg-slate-200",
  };
};

// --- TYPES ---
type FallType = "none" | "free_fall" | "impact" | "confirmed";

interface VitalSign {
  id: string;
  type: "HEART_RATE" | "OXYGEN_SATURATION" | "TEMPERATURE";
  value: number;
  unit: string;
  timestamp: string;
}

interface Prediction {
  id: string;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  score: number;
  reason: string;
  generatedAt: string;
}

interface UserWithActivities {
  activities?: Array<{ id: string; name: string }>;
  companyId: string;
}

interface PatientDetail {
  id: string;
  name: string;
  birthDate: string;
  active: boolean;
  company?: { name: string };
  currentActivity?: { id: string; name: string };
  vitals: VitalSign[];
  predictions: Prediction[];
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();
  
  // 1. CORREÇÃO DE LOOP: Memoizar availableActivities para evitar recriação de array a cada render
  const availableActivities = useMemo(() => {
    return (user as unknown as UserWithActivities)?.activities || [];
  }, [user]);

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Estados de Sinais Vitais
  const [currentBpm, setCurrentBpm] = useState<number>(0);
  const [currentSpo2, setCurrentSpo2] = useState<number>(0);
  const [chartData, setChartData] = useState<{ time: string; bpm: number }[]>([]);

  // Estados de Queda
  const [fallType, setFallType] = useState<FallType>("none");
  const [fallGForce, setFallGForce] = useState<number>(0);
  const [fallTime, setFallTime] = useState<string>("");

  // Estado da Atividade
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isUpdatingActivity, setIsUpdatingActivity] = useState(false);

  const ignoreAlertsUntil = useRef<number>(0);

  // Redirecionamento de Auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  // 2. CORREÇÃO DE LOOP: Carga Inicial de Dados (Dependências limpas)
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        const [resPatient, resPred, resVitals] = await Promise.all([
          fetch(`${API_URL}/patients/${id}`, { headers }),
          fetch(`${API_URL}/patients/${id}/predictions`, { headers }),
          fetch(`${API_URL}/patients/${id}/vitals/1`, { headers }),
        ]);

        const dataPatient = await resPatient.json();
        const dataPred = await resPred.json();
        const dataVitals = await resVitals.json();

        const sortedPreds = (dataPred || []).sort(
          (a: Prediction, b: Prediction) =>
            new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );

        setPatient({
          ...dataPatient,
          predictions: sortedPreds,
          vitals: dataVitals || [],
        });

        const processedChart = (dataVitals || [])
          .filter((v: VitalSign) => v.type === "HEART_RATE")
          .map((v: VitalSign) => ({
            time: new Date(v.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            bpm: v.value,
          }))
          .reverse();

        setChartData(processedChart);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, isAuthenticated]); // REMOVIDO availableActivities DAQUI

  // 3. Efeito separado para definir a atividade inicial (Evita o loop de fetch)
  useEffect(() => {
    if (patient?.currentActivity) {
      setSelectedActivityId(patient.currentActivity.id);
    } else if (availableActivities.length > 0 && !selectedActivityId) {
      // Opcional: Selecionar o primeiro se não tiver nenhum
      // setSelectedActivityId(availableActivities[0].id);
    }
  }, [patient, availableActivities]);

  // Socket.io para Tempo Real
  useEffect(() => {
    if (!token || !user?.companyId || !isAuthenticated) return;

    const socket: Socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token, companyId: user.companyId },
    });

    socket.on("connect", () => setSocketConnected(true));
    
    socket.on("dados_vitais", (data: any) => {
      if (data.patientId !== id) return;

      const bpm = Number(data.bpm) || 0;
      setCurrentBpm(bpm);
      setCurrentSpo2(Number(data.spo2) || 0);

      const nowTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setChartData((prev) => [...prev, { time: nowTime, bpm }].slice(-30));
    });

    socket.on("dados_quedas", (data: any) => {
      if (data.patientId !== id || Date.now() < ignoreAlertsUntil.current) return;
      
      const nowStr = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const gForce = Number(data.g || 0);
      let detectedType: FallType = "impact";
      
      if (data.status?.toUpperCase() === "QUEDA_CONFIRMADA" || gForce > 3.0) {
        detectedType = "confirmed";
      } else if (data.status?.toUpperCase() === "QUEDA_LIVRE") {
        detectedType = "free_fall";
      } else {
        detectedType = "impact";
      }

      setFallGForce(gForce);
      setFallType(detectedType);
      setFallTime(nowStr);
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token, user?.companyId, isAuthenticated]);

  // Reset inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentBpm(0);
      setCurrentSpo2(0);
    }, MAX_INACTIVITY_MS);
    return () => clearTimeout(timer);
  }, [currentBpm]);

  // ATUALIZAÇÃO DE STATUS
  const handleActivityChange = async (newActivityId: string) => {
    if (isUpdatingActivity || newActivityId === selectedActivityId) return;

    const previousId = selectedActivityId;
    setSelectedActivityId(newActivityId);
    setIsUpdatingActivity(true);

    try {
      const response = await fetch(`${API_URL}/patients/${id}/activity`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activityId: newActivityId }),
      });

      if (!response.ok) throw new Error("Falha na API");
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      setSelectedActivityId(previousId);
      alert("Não foi possível alterar o status. Verifique sua conexão.");
    } finally {
      setIsUpdatingActivity(false);
    }
  };

  const resetFallStatus = () => {
    setFallType("none");
    ignoreAlertsUntil.current = Date.now() + 3000;
  };

  if (authLoading || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Activity className="w-10 h-10 animate-spin text-cyan-600 mb-4" />
      <span className="text-slate-600 font-medium">Sincronizando prontuário...</span>
    </div>
  );

  if (!patient) return (
    <div className="h-screen flex items-center justify-center">Paciente não encontrado.</div>
  );

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
  const latestPrediction = patient.predictions?.[0];
  const isSensorOnline = currentBpm > 0;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isSensorOnline ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  {isSensorOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  {isSensorOnline ? "Monitorando" : "Offline"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">
                {age} anos • {patient.company?.name || "Empresa"}
              </p>
            </div>
          </div>

          {availableActivities.length > 0 ? (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full md:w-auto scrollbar-hide">
              {availableActivities.map((activity) => {
                const style = getActivityStyle(activity.name);
                const isActive = selectedActivityId === activity.id;
                const Icon = style.icon;

                return (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityChange(activity.id)}
                    disabled={isUpdatingActivity}
                    className={`
                      flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap
                      ${isActive ? style.activeColor : style.inactiveColor}
                    `}
                  >
                    <Icon size={16} />
                    <span>{activity.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-red-400 font-mono bg-red-50 px-2 py-1 rounded border border-red-100">
               ⚠️ Sem config de atividades no Token
            </div>
          )}

          <div className={`hidden md:block px-3 py-1 rounded-md text-[10px] font-black border ${socketConnected ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            LIVE
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {fallType !== "none" && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-l-[12px] border-red-500 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
                <AlertTriangle size={40} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-red-600">QUEDA DETECTADA</h2>
                <p className="text-slate-500">
                  Evento registrado às <span className="font-bold text-slate-700">{fallTime}</span> ({fallGForce.toFixed(2)}G).
                </p>
              </div>
            </div>
            <button onClick={resetFallStatus} className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95">
              CONFIRMAR ATENDIMENTO
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all ${isSensorOnline && currentBpm > 100 ? "border-red-200 ring-4 ring-red-50" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Frequência Cardíaca</span>
              <Heart className={`${isSensorOnline ? "text-red-500 animate-[pulse_0.8s_infinite]" : "text-slate-300"}`} fill={isSensorOnline ? "currentColor" : "none"} size={24} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">{isSensorOnline ? currentBpm : "--"}</span>
              <span className="text-slate-400 font-bold uppercase text-sm">BPM</span>
            </div>
          </div>

          <div className={`bg-white rounded-[2rem] p-8 shadow-sm border transition-all ${isSensorOnline && currentSpo2 < 94 ? "border-amber-200 ring-4 ring-amber-50" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saturação O₂</span>
              <Droplets className={isSensorOnline ? "text-cyan-500" : "text-slate-300"} size={24} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">{isSensorOnline ? currentSpo2 : "--"}</span>
              <span className="text-cyan-500 font-bold uppercase text-sm">%</span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden flex flex-col justify-between border border-slate-800">
             <div className="absolute -right-4 -top-4 opacity-10"><BrainCircuit size={160} /></div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                   <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg"><BrainCircuit size={20} /></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Análise Preditiva IA</span>
                </div>
                {latestPrediction ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${latestPrediction.riskLevel === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/50" : latestPrediction.riskLevel === "MODERATE" ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"}`}>
                        Risco {latestPrediction.riskLevel}
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${latestPrediction.score * 100}%` }} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic overflow-hidden line-clamp-3">"{latestPrediction.reason}"</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-2"><Calendar size={12} /> Processado: {new Date(latestPrediction.generatedAt).toLocaleDateString("pt-BR")}</div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm italic py-4">Aguardando dados...</div>
                )}
             </div>
          </div>
        </div>

        {/* 4. CORREÇÃO DE CHART: Adicionado min-w-0 para evitar erro de width(-1) */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity size={20} className="text-slate-400"/> Fluxo Cardíaco Real-time</h3>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
               <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"/> BPM</div>
            </div>
          </div>
          <div className="h-80 w-full min-w-0"> 
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[40, 160]} stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} itemStyle={{ fontWeight: "bold", fontSize: "12px" }} />
                <ReferenceLine y={100} stroke="#fecaca" strokeDasharray="5 5" />
                <ReferenceLine y={60} stroke="#e2e8f0" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="bpm" stroke="#06B6D4" strokeWidth={4} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="px-8 py-6 border-b border-slate-50"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-slate-400"/> Registros Recentes</h3></div>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 <tr>
                   <th className="px-8 py-4">Horário</th>
                   <th className="px-8 py-4">Tipo</th>
                   <th className="px-8 py-4">Valor</th>
                   <th className="px-8 py-4 text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {patient.vitals.slice(0, 5).map((vital) => (
                   <tr key={vital.id} className="group hover:bg-slate-50/80 transition-colors">
                     <td className="px-8 py-4 text-xs font-mono text-slate-400">{new Date(vital.timestamp).toLocaleTimeString("pt-BR", {hour: "2-digit", minute:"2-digit"})}</td>
                     <td className="px-8 py-4"><span className="text-sm font-bold text-slate-700">{vital.type === "HEART_RATE" ? "Cardíaco" : vital.type}</span></td>
                     <td className="px-8 py-4"><span className="text-lg font-black text-slate-900">{vital.value} <span className="text-[10px] text-slate-400">{vital.unit}</span></span></td>
                     <td className="px-8 py-4 text-right"><span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Recebido</span></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}