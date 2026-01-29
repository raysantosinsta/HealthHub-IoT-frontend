"use client";

import {
  ArrowLeft,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Activity,
  Loader2,
  Phone,
  BrainCircuit,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface PatientGuidance {
  status: "NORMAL" | "ATENCAO" | "ALERTA" | "ERRO";
  message: string;
  action: string;
  context?: {
    lastVital: number;
    avgBpm7Days: number | null; // Adicione esta linha
    activity: string;
    limits: string;
  };
}

export default function PatientAgentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [guidance, setGuidance] = useState<PatientGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false); // Novo estado para o botão da IA

  // 1. Efeito para carregar DADOS DO SENSOR (Tempo Real - Sem IA)
  useEffect(() => {
    if (!id) return;

    const fetchSensorData = async () => {
      try {
        // Chamamos a rota com um query param ?onlyContext=true
        const res = await fetch(
          `http://localhost:3001/agent/guidance/${id}?onlyContext=true`,
        );
        const data = await res.json();

        // Atualiza apenas o contexto, mantendo a mensagem da IA anterior se existir
        setGuidance((prev) => ({
          status: prev?.status || "NORMAL",
          message:
            prev?.message || "Clique no botão abaixo para uma nova análise.",
          action: prev?.action || "Aguardando comando.",
          ...data, // Sobrescreve com o contexto novo vindo do banco
        }));
      } catch (error) {
        console.error("Erro ao buscar sensores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000); // Sensores atualizam a cada 5s
    return () => clearInterval(interval);
  }, [id]);

  // 2. Função disparada pelo BOTÃO para chamar a IA
  const askAI = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/agent/guidance/${id}`); // Chama completo (com IA)
      const data = await res.json();
      setGuidance(data);
    } catch (error) {
      console.error("Erro na IA:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ALERTA":
        return {
          bg: "bg-red-500",
          text: "text-red-600",
          icon: (
            <AlertTriangle size={64} className="text-white animate-pulse" />
          ),
          title: "Atenção Crítica",
        };
      case "ATENCAO":
        return {
          bg: "bg-amber-500",
          text: "text-amber-700",
          icon: <Stethoscope size={64} className="text-white" />,
          title: "Requer Cuidado",
        };
      case "NORMAL":
        return {
          bg: "bg-emerald-500",
          text: "text-emerald-700",
          icon: <CheckCircle2 size={64} className="text-white" />,
          title: "Tudo Normal",
        };
      default:
        return {
          bg: "bg-slate-400",
          text: "text-slate-600",
          icon: <Bot size={64} className="text-white" />,
          title: "Aguardando",
        };
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#06B6D4]" size={48} />
      </div>
    );

  const config = getStatusConfig(guidance?.status || "ERRO");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 font-bold"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            AI Health Assistant
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LADO ESQUERDO: SENSORES (Tempo Real) */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-400 uppercase flex items-center gap-2">
            <Activity size={20} /> Sensores em Tempo Real
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-slate-500 font-medium">
                Frequência Atual
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#06B6D4]">
                  {guidance?.context?.lastVital || "--"}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1">
                  BPM
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-slate-500 font-medium">Média (7 dias)</span>
              <div className="text-right">
                <span className="text-xl font-bold text-slate-600">
                  {guidance?.context?.avgBpm7Days || "---"}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-1">
                  BPM
                </span>
              </div>
            </div>

            {/* Indicador de Tendência */}
            {guidance?.context?.avgBpm7Days && guidance?.context?.lastVital && (
              <div
                className={`text-xs font-bold p-2 rounded-lg text-center ${
                  guidance.context.lastVital > guidance.context.avgBpm7Days
                    ? "bg-orange-50 text-orange-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {guidance.context.lastVital > guidance.context.avgBpm7Days
                  ? "↑ Acima da sua média semanal"
                  : "↓ Abaixo/Igual à sua média semanal"}
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: IA (Sob Demanda) */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-400 uppercase flex items-center gap-2">
            <Bot size={20} /> Análise da IA
          </h2>
          <div
            className={`${config.bg} rounded-[2.5rem] p-8 shadow-xl text-center min-h-[250px] flex flex-col items-center justify-center transition-all duration-500`}
          >
            {isAiLoading ? (
              <Loader2 size={40} className="text-white animate-spin" />
            ) : (
              config.icon
            )}
            <h1 className="text-2xl font-black text-white mt-4">
              {isAiLoading ? "Processando..." : config.title}
            </h1>
            <p className="text-white/90 italic mt-2">"{guidance?.message}"</p>
          </div>

          <button
            onClick={askAI}
            disabled={isAiLoading}
            className="w-full bg-[#06B6D4] hover:bg-[#0891B2] disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all"
          >
            {isAiLoading ? (
              "IA PENSANDO..."
            ) : (
              <>
                <BrainCircuit size={24} /> ANALISAR COM INTELIGÊNCIA ARTIFICIAL
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
