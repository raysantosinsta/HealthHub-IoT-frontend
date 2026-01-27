"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Tipagem baseada no seu Schema HealthPrediction
interface Alert {
  id: string;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  reason: string;
  score: number;
  generatedAt: string;
  patient: {
    name: string;
    id: string;
    currentActivity?: {
      name: string;
    }
  };
}

export default function AlertsTimeline() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MODERATE'>('ALL');

  // Simulação de fetch - Substituir pelo seu endpoint NestJS
  useEffect(() => {
    // fetch('/api/alerts').then(res => res.json()).then(setAlerts)
    const mockAlerts: Alert[] = [
      {
        id: "1",
        riskLevel: "HIGH",
        reason: "BPM (115) acima do limite para estado 'Dormindo'",
        score: 0.92,
        generatedAt: new Date().toISOString(),
        patient: { name: "Sr. João Silva", id: "c1", currentActivity: { name: "Dormindo" } }
      },
      {
        id: "2",
        riskLevel: "MODERATE",
        reason: "Queda gradual de SpO2 detectada nas últimas 4 horas",
        score: 0.65,
        generatedAt: new Date(Date.now() - 3600000).toISOString(),
        patient: { name: "Dona Maria Oliveira", id: "c2", currentActivity: { name: "Repouso" } }
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-red-50 border-red-200 text-red-700 icon-red-500';
      case 'MODERATE': return 'bg-orange-50 border-orange-200 text-orange-700 icon-orange-500';
      default: return 'bg-blue-50 border-blue-200 text-blue-700 icon-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Central de Alertas <Bell className="text-[#06B6D4]" />
            </h1>
            <p className="text-slate-500">Monitoramento preditivo em tempo real</p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Todos</button>
            <button onClick={() => setFilter('HIGH')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filter === 'HIGH' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>Críticos</button>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="relative space-y-4">
          {/* Linha vertical da timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 ml-[-1px] hidden md:block" />

          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`relative group transition-all hover:scale-[1.01] border rounded-2xl p-5 shadow-sm bg-white ${getSeverityStyles(alert.riskLevel).split(' ').slice(0,2).join(' ')}`}
            >
              <div className="flex items-start gap-4">
                {/* Ícone de Status */}
                <div className={`p-3 rounded-xl hidden md:block ${alert.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  {alert.riskLevel === 'HIGH' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                        {alert.patient.name}
                        <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                          ID: {alert.patient.id}
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(alert.generatedAt).toLocaleTimeString()}</span>
                        <span className="flex items-center gap-1"><Activity size={14} /> Atividade: {alert.patient.currentActivity?.name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${alert.riskLevel === 'HIGH' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                        {alert.riskLevel === 'HIGH' ? 'Risco Crítico' : 'Atenção'}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 bg-white/50 p-3 rounded-lg border border-slate-100 font-medium">
                    {alert.reason}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {/* Badge de Probabilidade */}
                       <div className="text-xs font-bold text-slate-400">
                         Score de Confiança IA: {(alert.score * 100).toFixed(0)}%
                       </div>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-bold text-[#06B6D4] hover:underline">
                      Abrir Prontuário <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Tudo sob controle</h3>
            <p className="text-slate-500">Nenhum alerta crítico detectado nas últimas 24h.</p>
          </div>
        )}
      </div>
    </div>
  );
}