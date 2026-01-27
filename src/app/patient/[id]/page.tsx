"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Activity, ArrowLeft, Heart, Droplets,
  BrainCircuit, AlertTriangle, Clock,
  AlertCircle, CheckCircle2, WifiOff, Timer
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const PREDICTION_VALIDITY_MS = 60 * 60 * 1000;
const MAX_INACTIVITY_MS = 30000;

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

interface PatientDetail {
  id: string;
  name: string;
  birthDate: string;
  active: boolean;
  company?: { name: string };
  vitals: VitalSign[];
  predictions: Prediction[];
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  const [currentBpm, setCurrentBpm] = useState<number>(0);
  const [currentSpo2, setCurrentSpo2] = useState<number>(0);
  const [chartData, setChartData] = useState<{ time: string; bpm: number }[]>([]);

  const [fallType, setFallType] = useState<FallType>("none");
  const [fallGForce, setFallGForce] = useState<number>(0);
  const [fallTime, setFallTime] = useState<string>("");

  const ignoreAlertsUntil = useRef<number>(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [resPatient, resPred, resVitals] = await Promise.all([
          fetch(`${API_URL}/patients/${id}`, { headers }),
          fetch(`${API_URL}/patients/${id}/predictions`, { headers }),
          fetch(`${API_URL}/patients/${id}/vitals/1`, { headers }),
        ]);

        if (!resPatient.ok) throw new Error("Falha ao carregar paciente");

        const dataPatient = await resPatient.json();
        const dataPred = await resPred.json();
        const dataVitals = await resVitals.json();

        setPatient({
          ...dataPatient,
          predictions: dataPred || [],
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
        console.error("Erro ao carregar paciente:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, isAuthenticated]);

  useEffect(() => {
    if (!token || !user?.companyId || !isAuthenticated) return;

    const socket: Socket = io(API_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: {
        token,
        companyId: user.companyId,
      },
    });

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("dados_vitais", (data: any) => {
      if (data.patientId !== id) return;

      const bpm = Number(data.bpm) || 0;
      const spo2 = Number(data.spo2) || 0;

      setCurrentBpm(bpm);
      setCurrentSpo2(spo2);

      const nowTime = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setChartData((prev) => [...prev, { time: nowTime, bpm }].slice(-30));
    });

    socket.on("dados_quedas", (data: any) => {
      if (data.patientId !== id) return;

      if (Date.now() < ignoreAlertsUntil.current) return;

      const nowStr = new Date().toLocaleTimeString("pt-BR");

      setFallGForce(data.g || 0);

      if (data.status === "queda_livre") {
        setFallType("free_fall");
        setFallTime(nowStr);
      } else if (data.status === "impacto") {
        setFallType("impact");
        setFallTime(nowStr);
      } else if (data.status === "QUEDA_CONFIRMADA") {
        setFallType("confirmed");
        setFallTime(nowStr);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token, user?.companyId, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentBpm(0);
      setCurrentSpo2(0);
    }, MAX_INACTIVITY_MS);

    return () => clearTimeout(timer);
  }, [currentBpm, currentSpo2]);

  const resetFallStatus = () => {
    setFallType("none");
    setFallGForce(0);
    setFallTime("");
    ignoreAlertsUntil.current = Date.now() + 3000;
  };

  const isSensorOnline = currentBpm > 0 || currentSpo2 > 0;

  if (authLoading || loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F1F5F9] text-[#06B6D4]">
        <Activity className="w-12 h-12 animate-spin mb-4" />
        <span className="text-[#1E293B] font-bold tracking-tight">Carregando Prontuário...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="h-screen flex items-center justify-center text-[#1E293B]">
        Paciente não encontrado.
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
  const latestPrediction = patient.predictions?.[0] ?? null;
  const isPredictionValid = latestPrediction
    ? Date.now() - new Date(latestPrediction.generatedAt).getTime() < PREDICTION_VALIDITY_MS
    : false;

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B] pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-[#F1F5F9] hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {patient.name}
                {isSensorOnline ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-extrabold border border-green-100 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-extrabold border border-slate-200 uppercase">
                    <WifiOff size={10} />
                    Offline
                  </span>
                )}
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">
                ID: {patient.id.slice(0, 8)} • {age} anos • {patient.company?.name || "Particular"}
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
              socketConnected
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {socketConnected ? "CONECTADO" : "DESCONECTADO"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {fallType !== "none" && (
          <div
            className={`rounded-2xl p-6 shadow-xl border-l-8 flex flex-col md:flex-row justify-between items-center gap-6 animate-bounce bg-white ${
              fallType === "confirmed" ? "border-red-500" : "border-orange-500"
            }`}
          >
            <div className="flex items-start gap-5">
              <div
                className={`p-4 rounded-xl ${
                  fallType === "confirmed" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                }`}
              >
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div>
                <h2
                  className={`text-2xl font-black ${
                    fallType === "confirmed" ? "text-red-600" : "text-orange-600"
                  }`}
                >
                  {fallType === "confirmed" ? "QUEDA CONFIRMADA" : "IMPACTO DETECTADO"}
                </h2>
                <p className="text-slate-600 mt-1">
                  Registrado às <span className="font-bold">{fallTime}</span>
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-xs font-mono">
                  <Activity size={12} /> G-Force: {fallGForce.toFixed(2)}G
                </div>
              </div>
            </div>
            <button
              onClick={resetFallStatus}
              className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg ${
                fallType === "confirmed" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <CheckCircle2 className="inline mr-2" size={18} />
              CONFIRMAR
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`bg-white rounded-2xl p-6 shadow border ${
              isSensorOnline && currentBpm > 100 ? "ring-2 ring-red-500" : ""
            } ${!isSensorOnline ? "opacity-70 bg-slate-50" : ""}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Frequência Cardíaca
                </span>
                <h3 className="text-sm font-semibold text-[#1E293B]">Monitoramento Contínuo</h3>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  isSensorOnline ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Heart
                  className={isSensorOnline ? "animate-pulse" : ""}
                  size={24}
                  fill={isSensorOnline ? "currentColor" : "none"}
                />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-5xl font-black text-[#1E293B] tracking-tighter">
                {isSensorOnline ? currentBpm : "—"}
              </span>
              <span className={`text-lg font-bold ${isSensorOnline ? "text-[#EF4444]" : "text-slate-400"}`}>
                bpm
              </span>
            </div>
            {!isSensorOnline && (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-200/50 p-2 rounded-lg">
                <Timer size={14} />
                Sem sinal recente
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-2xl p-6 shadow border ${
              isSensorOnline && currentSpo2 < 94 ? "ring-2 ring-[#F97316]" : ""
            } ${!isSensorOnline ? "opacity-70 bg-slate-50" : ""}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Saturação de Oxigênio
                </span>
                <h3 className="text-sm font-semibold text-[#1E293B]">Oximetria de Pulso</h3>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  isSensorOnline ? "bg-[#06B6D4]/10 text-[#06B6D4]" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Droplets size={24} />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-5xl font-black text-[#1E293B] tracking-tighter">
                {isSensorOnline ? currentSpo2 : "—"}
              </span>
              <span className={`text-lg font-bold ${isSensorOnline ? "text-[#06B6D4]" : "text-slate-400"}`}>
                %
              </span>
            </div>
            {!isSensorOnline && (
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-200/50 p-2 rounded-lg">
                <AlertCircle size={14} /> Aguardando sensor...
              </div>
            )}
          </div>

          <div className="bg-[#1E293B] rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between border border-slate-700">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BrainCircuit className="w-40 h-40 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#06B6D4]/20 rounded-lg text-[#06B6D4]">
                  <BrainCircuit size={20} />
                </div>
                <span className="text-xs font-bold uppercase text-[#06B6D4] tracking-widest">
                  IA Preditiva
                </span>
              </div>

              {latestPrediction && isPredictionValid ? (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                        latestPrediction.riskLevel === "HIGH"
                          ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30"
                          : latestPrediction.riskLevel === "MODERATE"
                          ? "bg-[#F97316]/20 text-[#F97316] border-[#F97316]/30"
                          : "bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30"
                      }`}
                    >
                      Risco{" "}
                      {latestPrediction.riskLevel === "HIGH"
                        ? "Alto"
                        : latestPrediction.riskLevel === "MODERATE"
                        ? "Moderado"
                        : "Baixo"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Score: {latestPrediction.score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    "{latestPrediction.reason}"
                  </p>
                  <p className="text-[10px] mt-4 text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> Atualizado: {new Date(latestPrediction.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="mt-2 opacity-50 text-sm flex flex-col gap-2">
                  <p>{isSensorOnline ? "Analisando novos dados..." : "Aguardando sinal para análise..."}</p>
                  {isSensorOnline && (
                    <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-[#06B6D4] w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border">
          <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2">
            <Activity size={18} className="text-[#06B6D4]" /> Tendência Cardíaca
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[40, 160]} stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" />
                <ReferenceLine y={60} stroke="#06B6D4" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-bold uppercase flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> Histórico Recente
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F1F5F9] text-slate-500 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Horário</th>
                  <th className="px-6 py-4">Parâmetro</th>
                  <th className="px-6 py-4">Leitura</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patient.vitals.slice(0, 5).map((vital) => (
                  <tr key={vital.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {new Date(vital.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1E293B]">
                      {vital.type === "HEART_RATE"
                        ? "Frequência Cardíaca"
                        : vital.type === "OXYGEN_SATURATION"
                        ? "Saturação O₂"
                        : "Temperatura"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1E293B] text-lg">{vital.value}</span>
                      <span className="text-xs text-slate-400 ml-1">{vital.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                      {vital.type === "HEART_RATE" && (vital.value > 100 || vital.value < 60) ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EF4444]/10 text-[#EF4444]">
                          FORA DO PADRÃO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#22C55E]/10 text-[#22C55E]">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce { animation: bounce 2s infinite; }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}