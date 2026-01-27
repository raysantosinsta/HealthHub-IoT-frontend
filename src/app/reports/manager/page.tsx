'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Users, 
  Search, 
  RefreshCcw, 
  Mail,
  Building2,
  FileBarChart
} from 'lucide-react';
import Link from 'next/link';

// Interface do Paciente
interface Patient {
  id: string;
  name: string;
  email: string;
  companyName?: string;
}

export default function ReportManagerPage() {
  // --- ESTADOS ---
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  // Estado da seleção
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Estados do envio
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const API_URL = 'http://localhost:3001';

  // 1. Buscar Pacientes
  const fetchPatients = async () => {
    setLoadingList(true);
    setFetchError(false);
    try {
      const response = await axios.get(`${API_URL}/patients`);
      
      const formattedData: Patient[] = response.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email || 'Email não cadastrado',
        companyName: p.company?.name || 'Empresa não informada'
      }));

      setPatientsList(formattedData);
    } catch (error) {
      console.error("Erro ao buscar lista de pacientes:", error);
      setFetchError(true);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const selectedPatient = patientsList.find(p => p.id === selectedPatientId);

  // 2. Função de Enviar Relatório
  const handleGenerateReport = async () => {
    if (!selectedPatient) return;

    setSending(true);
    setStatus('idle');

    try {
      await axios.post(`${API_URL}/reports/generate-manual`, {
        patientId: selectedPatient.id,
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000); 
      
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] py-10 px-4 flex flex-col items-center font-sans text-[#1E293B] relative overflow-hidden">
      
      {/* Background Decorativo Tech */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-[#1E293B]/5 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-[#06B6D4] rounded-full blur-[120px] opacity-5 -z-10" />

      {/* Botão Voltar */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between z-10">
        <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 text-slate-500 hover:text-[#06B6D4] transition-colors font-medium text-sm"
        >
          <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-[#06B6D4] transition-colors">
            <ArrowLeft className="w-4 h-4" /> 
          </div>
          Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
          <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-wide">
             Módulo de Relatórios
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Barra de Progresso Decorativa */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#06B6D4] opacity-50" />

        {/* Cabeçalho do Card */}
        <div className="bg-[#1E293B] p-8 text-white relative overflow-hidden">
          {/* Textura de fundo sutil */}
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <FileBarChart size={120} />
          </div>

          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-[#06B6D4]/20 rounded-xl text-[#06B6D4] backdrop-blur-sm">
                    <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Gerador de Relatórios</h1>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                Selecione um paciente para compilar os dados vitais da última semana em PDF e enviar via e-mail corporativo.
              </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* --- SELEÇÃO DE PACIENTE --- */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Selecione o Paciente
              </label>
              {fetchError && (
                <button 
                  onClick={fetchPatients} 
                  className="text-xs text-[#06B6D4] hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCcw className="w-3 h-3" /> Recarregar Lista
                </button>
              )}
            </div>
            
            <div className="relative group">
              {loadingList ? (
                <div className="w-full h-14 bg-[#F1F5F9] rounded-xl flex items-center px-4 text-slate-400 text-sm border border-slate-200">
                  <Loader2 className="w-4 h-4 animate-spin mr-3 text-[#06B6D4]" /> Sincronizando banco de dados...
                </div>
              ) : fetchError ? (
                <div className="w-full h-14 bg-[#EF4444]/5 text-[#EF4444] rounded-xl flex items-center px-4 text-sm border border-[#EF4444]/20">
                  <AlertCircle className="w-4 h-4 mr-2" /> Erro de conexão com API (Porta 3001).
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      setStatus('idle');
                    }}
                    className="w-full appearance-none bg-[#F1F5F9] hover:bg-slate-100 border border-slate-200 text-[#1E293B] font-medium py-4 px-5 pr-10 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-[#06B6D4] focus:ring-4 focus:ring-[#06B6D4]/10 transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- Buscar na lista --</option>
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-focus-within:text-[#06B6D4] transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- CARD DE REVISÃO E ENVIO --- */}
          {selectedPatient && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              
              {/* Ticket de Revisão */}
              <div className="bg-[#06B6D4]/5 border border-[#06B6D4]/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#06B6D4] rounded-full blur-2xl opacity-10 -mr-8 -mt-8" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-3">
                    <div>
                        <p className="text-[10px] text-[#06B6D4] font-black uppercase mb-1 tracking-wider">Destinatário</p>
                        <p className="font-bold text-[#1E293B] text-lg">{selectedPatient.name}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedPatient.email}</span>
                        </div>
                        {selectedPatient.companyName && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{selectedPatient.companyName}</span>
                            </div>
                        )}
                    </div>
                  </div>
                  
                  {/* Status Dot */}
                  <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                      <div className={`w-3 h-3 rounded-full shadow-sm transition-colors duration-500 ${sending ? 'bg-[#F97316] animate-pulse' : 'bg-[#22C55E]'}`}></div>
                  </div>
                </div>
              </div>

              {/* Botão Principal de Ação */}
              <button
                onClick={handleGenerateReport}
                disabled={sending || status === 'success'}
                className={`
                  w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-sm transition-all shadow-lg transform active:scale-[0.98]
                  disabled:cursor-not-allowed
                  ${sending 
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none' 
                    : status === 'success' 
                      ? 'bg-[#22C55E] text-white shadow-[#22C55E]/30 ring-4 ring-[#22C55E]/10'
                      : status === 'error'
                        ? 'bg-[#EF4444] text-white shadow-[#EF4444]/30'
                        : 'bg-[#1E293B] hover:bg-slate-800 text-white shadow-[#1E293B]/30 hover:-translate-y-1'
                  }
                `}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processando Solicitação...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    <span>Enviado com Sucesso!</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>Falha no Envio. Tentar Novamente.</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Confirmar e Enviar Relatório</span>
                  </>
                )}
              </button>

              {status === 'success' && (
                <div className="mt-4 p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20 text-center animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-[#1E293B] font-medium">
                        📨 Um e-mail com o PDF anexo foi disparado para a caixa de entrada do paciente.
                    </p>
                </div>
              )}
            </div>
          )}

          {/* Estado Vazio (Placeholder) */}
          {!selectedPatient && !loadingList && !fetchError && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
              <Search className="w-10 h-10 mb-2 opacity-50" />
              <span className="text-sm font-medium">Selecione um paciente acima para iniciar.</span>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer Legal */}
      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Sistema Clínico. Geração de relatórios auditada.
      </div>
    </div>
  );
}