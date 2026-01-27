"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Heart,
  Droplets,
  Search,
  Loader2,
  LogOut,
  Stethoscope,
  BrainCircuit,
  ChevronRight,
  WifiOff,
  Clock,
  ShieldAlert,
  AlertCircle,
  MapPin,
  CheckCircle,
  Phone,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const DATA_FRESH_TIMEOUT_MS = 25 * 1000;

// --- COMPONENTE DE ALERTA DE QUEDA (PREMIUM) ---
function FallAlertModal({
  patientName,
  onClose,
}: {
  patientName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-red-100 animate-in zoom-in-95">
        <div className="bg-red-600 p-4 flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="text-white" size={20} />
          <span className="text-white text-xs font-black uppercase tracking-widest">
            Emergência: Queda Detectada
          </span>
        </div>
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600 animate-bounce" size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Alerta Crítico
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            Impacto súbito detectado no dispositivo do paciente:
            <span className="text-xl font-black text-slate-800 block mt-2">
              {patientName}
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
              <MapPin size={18} className="text-cyan-400" /> Ver Localização
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Disparo Falso
              </button>
              <button className="bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all">
                Chamar Ajuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE DE ANÁLISE IA (PREMIUM) ---
function AIAnalysisModal({
  report,
  onClose,
}: {
  report: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <BrainCircuit size={28} />
            <div>
              <h3 className="font-black text-lg">Análise Clínica IA</h3>
              <p className="text-xs opacity-80 uppercase font-bold tracking-widest">
                Gemini 1.5 Flash Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="inline-block px-4 py-1 rounded-full bg-purple-50 text-purple-700 font-black text-xs mb-4">
            STATUS: {report.status_resumo}
          </div>
          <div className="space-y-6">
            <section>
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                Detalhamento Técnico
              </h4>
              <p className="text-slate-700 leading-relaxed font-medium">
                {report.analise_detalhada}
              </p>
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h4 className="text-blue-700 text-[10px] font-black uppercase mb-2 flex items-center gap-1">
                  <Stethoscope size={12} /> Enfermagem
                </h4>
                <p className="text-blue-900 text-sm font-bold">
                  {report.recomendacao_enfermagem}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <h4 className="text-amber-700 text-[10px] font-black uppercase mb-2 flex items-center gap-1">
                  <AlertCircle size={12} /> Alerta Geriátrico
                </h4>
                <p className="text-amber-900 text-sm font-bold">
                  {report.alerta_geriatrico}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const router = useRouter();
  const {
    isAuthenticated,
    loading: authLoading,
    token,
    user,
    logout,
  } = useAuth();

  const [patients, setPatients] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);

  // Estados para Modais
  const [fallAlert, setFallAlert] = useState<{
    active: boolean;
    patientName: string;
  }>({ active: false, patientName: "" });
  const [aiReport, setAiReport] = useState<any | null>(null);

  // Watchdog de 1s para limpeza
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Limpeza de vitais obsoletos
  useEffect(() => {
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        vitals: p.vitals.filter(
          (v: any) =>
            Date.now() - new Date(v.timestamp).getTime() <=
            DATA_FRESH_TIMEOUT_MS,
        ),
      })),
    );
  }, [tick]);

  const loadData = async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const res = await fetch(`${API_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) loadData();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.companyId) return;

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: { token, companyId: user.companyId },
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("dados_vitais", (data: any) => {
      setPatients((current) =>
        current.map((p) => {
          if (p.id !== data.patientId) return p;
          const now = new Date().toISOString();
          let newVitals = [...p.vitals];

          const update = (type: string, val: number, unit: string) => {
            const idx = newVitals.findIndex((v) => v.type === type);
            const obj = {
              id: `${type}-${Date.now()}`,
              type,
              value: val,
              unit,
              timestamp: now,
            };
            if (idx >= 0) newVitals[idx] = obj;
            else newVitals.push(obj);
          };

          if (data.bpm) update("HEART_RATE", Number(data.bpm), "bpm");
          if (data.spo2) update("OXYGEN_SATURATION", Number(data.spo2), "%");

          return {
            ...p,
            vitals: newVitals,
            currentActivity: data.activity
              ? { name: data.activity }
              : p.currentActivity,
          };
        }),
      );
    });

    socket.on("dados_quedas", (data: any) => {
      setFallAlert({
        active: true,
        patientName: data.patientName || "Paciente em Monitoramento",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, user?.companyId]);

  const handleAIAnalysis = async (e: React.MouseEvent, patientId: string) => {
    e.stopPropagation();
    setAiAnalyzingId(patientId);
    try {
      const res = await fetch(`${API_URL}/agent/analyze/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const report = await res.json();
      setAiReport(report);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzingId(null);
    }
  };

  const filteredPatients = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [patients, searchTerm],
  );

  if (authLoading || dataLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* MODAIS */}
      {fallAlert.active && (
        <FallAlertModal
          patientName={fallAlert.patientName}
          onClose={() => setFallAlert({ ...fallAlert, active: false })}
        />
      )}
      {aiReport && (
        <AIAnalysisModal report={aiReport} onClose={() => setAiReport(null)} />
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                VitalMonitor<span className="text-cyan-500">.ai</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {user?.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* BUSCA E STATUS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold">Monitoramento ao Vivo</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`h-2 w-2 rounded-full ${socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <span className="text-xs font-semibold text-slate-500">
                {socketConnected ? "WebSocket Ativo" : "Reconectando..."}
              </span>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Filtrar pacientes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* LISTA DE CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const bpm = patient.vitals.find(
              (v: any) => v.type === "HEART_RATE",
            );
            const spo2 = patient.vitals.find(
              (v: any) => v.type === "OXYGEN_SATURATION",
            );
            const isOnline = !!bpm || !!spo2;
            const isCritical =
              bpm?.value > 120 || bpm?.value < 45 || spo2?.value < 90;

            return (
              <div
                key={patient.id}
                className={`group rounded-[2rem] border-2 transition-all p-6 cursor-default
 relative overflow-hidden bg-white
          ${isOnline ? "border-transparent shadow-sm hover:shadow-2xl hover:border-cyan-500/20" : "border-slate-100 opacity-60 grayscale"}
          ${isCritical ? "border-red-500 animate-pulse shadow-red-100" : ""}
        `}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOnline ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight">
                        {patient.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400">
                        STATUS: {isOnline ? "MONITORADO" : "OFFLINE"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VITALS DISPLAY */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                      <Heart
                        size={14}
                        fill="currentColor"
                        className={isOnline ? "animate-pulse" : ""}
                      />
                      <span className="text-[10px] font-black uppercase">
                        BPM
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {isOnline ? bpm?.value || "--" : "--"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-cyan-500 mb-1">
                      <Droplets size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase">
                        SpO₂
                      </span>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                      {isOnline ? spo2?.value || "--" : "--"}%
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/patient/${patient.id}/agent`);
                    }}
                    className="relative z-50 pointer-events-auto flex items-center gap-2 text-xs font-black text-purple-600 hover:text-purple-800 transition-all"
                  >
                    <BrainCircuit size={16} />
                    ANÁLISE IA
                  </button>

                  <div
                    onClick={() => router.push(`/patient/${patient.id}`)}
                    className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-cyan-600 transition-colors"
                  >
                    VER PRONTUÁRIO <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
