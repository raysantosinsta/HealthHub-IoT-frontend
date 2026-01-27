"use client";

import {
    Activity, ArrowLeft,
    BrainCircuit,
    HeartHandshake,
    Loader2,
    ShieldCheck,
    Sparkles,
    Stethoscope
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// INTERFACE ALINHADA COM O SEU AGENTSERVICE (NESTJS)
interface AIAnalysis {
  status_resumo: "Estável" | "Atenção" | "Crítico" | "Erro";
  analise_detalhada: string;
  recomendacao_enfermagem: string;
  alerta_geriatrico: string;
}

export default function AgentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);

    try {
      // Chamada real para o seu endpoint NestJS
      const res = await fetch(`http://localhost:3001/agent/analysis/${id}`);
      if (!res.ok) throw new Error("Falha na comunicação com o servidor");
      
      const data: AIAnalysis = await res.json();
      setAnalysis(data);
      setLastRun(new Date().toLocaleTimeString('pt-BR'));
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar análise. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  // Helper para cores de status baseado no retorno do NestJS
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'bg-red-500';
      case 'Atenção': return 'bg-orange-500';
      case 'Estável': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B] pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
           <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-slate-500 hover:text-[#06B6D4] transition font-bold text-sm"
            >
                <ArrowLeft size={18} /> Voltar
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1E293B]/5 rounded-full border border-[#1E293B]/10">
                <BrainCircuit size={14} className="text-[#06B6D4]" />
                <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Guardian AI Engine</span>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
                <h1 className="text-4xl font-black text-[#1E293B] tracking-tight mb-2 flex items-center gap-3">
                    VitalMonitor <span className="text-[#06B6D4]">Guardian AI</span>
                    <Sparkles className="text-[#06B6D4] animate-pulse" size={28} />
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                    Auditoria clínica autônoma. Cruzamento de dados vitais, atividade atual e riscos geriátricos.
                </p>
            </div>

            <button
                onClick={runAnalysis}
                disabled={loading}
                className={`
                    group relative px-8 py-5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center gap-3 overflow-hidden
                    ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1E293B] hover:bg-slate-800'}
                `}
            >
                {loading ? (
                    <> <Loader2 className="animate-spin" /> Analisando Contexto... </>
                ) : (
                    <> <BrainCircuit size={24} className="text-[#06B6D4]" /> Gerar Auditoria IA </>
                )}
            </button>
        </div>

        {!analysis && !loading && (
            <div className="border-3 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-slate-50/50">
                <BrainCircuit size={48} className="text-slate-300 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-[#1E293B] mb-2">Aguardando solicitação</h3>
                <p className="text-slate-500 max-w-md mx-auto">Clique no botão acima para processar os sinais vitais recentes e gerar o parecer clínico.</p>
            </div>
        )}

        {analysis && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white border border-slate-100">
                    <div className={`h-2 w-full ${getStatusColor(analysis.status_resumo)}`} />
                    
                    <div className="p-8 md:p-10">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border 
                                ${analysis.status_resumo === 'Crítico' ? 'bg-red-50 text-red-600 border-red-200' : 
                                  analysis.status_resumo === 'Atenção' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                                  'bg-emerald-50 text-emerald-600 border-emerald-200'}
                            `}>
                                STATUS: {analysis.status_resumo}
                            </span>
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                                <Activity size={14} /> Ref: {lastRun}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-[#1E293B] leading-tight mb-4">Parecer da Inteligência Artificial</h2>
                        
                        <div className="bg-[#F1F5F9] p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-lg">
                            {analysis.analise_detalhada}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1E293B] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[#06B6D4] font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <Stethoscope size={16} /> Recomendação de Enfermagem
                            </h3>
                            <p className="text-xl font-medium leading-relaxed">{analysis.recomendacao_enfermagem}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-[#06B6D4]/20 shadow-xl shadow-[#06B6D4]/5 relative overflow-hidden">
                        <div className="relative z-10">
                             <h3 className="text-[#06B6D4] font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                <HeartHandshake size={16} /> Olhar Gerontológico
                            </h3>
                            <p className="text-xl font-medium text-slate-600 leading-relaxed italic">
                                "{analysis.alerta_geriatrico}"
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center py-6 opacity-50">
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                        <ShieldCheck size={12} />
                        Análise via Gemini Pro. Uso exclusivo para apoio à decisão clínica.
                    </p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}