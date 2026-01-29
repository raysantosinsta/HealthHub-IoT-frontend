"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Lock, Shield, ArrowLeft, CheckCircle2, Loader2, 
  Briefcase, UserCog, Stethoscope, ShieldAlert, Calendar, Save,
  Activity, BedDouble, PersonStanding, Smile, Heart, Droplets, Baby
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://localhost:3001";

export default function CadastroUnificado() {
  const router = useRouter();
  const { isAuthenticated, user, token, loading: authLoading } = useAuth();

  // 1. ESTADO DE TIPO DE CADASTRO
  type RegType = "STAFF_ADMIN" | "PATIENT";
  const [regType, setRegType] = useState<RegType>("STAFF_ADMIN");

  // 2. ESTADOS DO FORMULÁRIO
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Senha para ambos agora
    role: "STAFF", // Para Staff/Admin
    birthDate: "", // Para Paciente
    customId: "SENSOR-PATIENT-", // Para Paciente
    companyId: "",
  });

  const [patterns, setPatterns] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // 3. BUSCA PADRÕES (Apenas se for Paciente)
  useEffect(() => {
    if (regType === "PATIENT" && token) {
      fetch(`${API_URL}/patients/activities-patterns`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPatterns(data);
          const initial: any = {};
          data.forEach(p => {
            initial[p.id] = { bpmMin: p.defaultBpmMin || 60, bpmMax: p.defaultBpmMax || 100, spo2Min: p.defaultSpo2Min || 94 };
          });
          setThresholds(initial);
        }
      });
    }
  }, [regType, token]);

  // 4. LÓGICA DE SUBMISSÃO DINÂMICA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    const endpoint = regType === "PATIENT" ? `${API_URL}/patients` : `${API_URL}/auth/register`;
    
    const payload = regType === "PATIENT" ? {
      name: formData.name,
      email: formData.email,
      password: formData.password, // Adicionado conforme sua necessidade de login do paciente
      birthDate: formData.birthDate,
      customId: formData.customId.trim().toUpperCase(),
      thresholds: patterns.map(p => ({ activityPatternId: p.id, ...thresholds[p.id] }))
    } : {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      companyId: user?.companyId
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          if(regType === "PATIENT") router.push("/");
        }, 2000);
      } else {
        const error = await res.json();
        throw new Error(error.message || "Erro no cadastro");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (authLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 text-[#1E293B]">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER COM SELETOR */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              {regType === "PATIENT" ? <Baby className="text-[#06B6D4]" /> : <UserCog className="text-[#06B6D4]" />}
              {regType === "PATIENT" ? "Cadastrar Paciente" : "Cadastrar Equipe"}
            </h1>
            <p className="text-slate-500">Organização: {user?.companyName}</p>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setRegType("STAFF_ADMIN")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${regType === "STAFF_ADMIN" ? "bg-white shadow-sm text-[#06B6D4]" : "text-slate-500"}`}
            >
              Staff / Admin
            </button>
            <button 
              onClick={() => setRegType("PATIENT")}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${regType === "PATIENT" ? "bg-white shadow-sm text-[#06B6D4]" : "text-slate-500"}`}
            >
              Paciente
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* COLUNA 1: DADOS COMUNS */}
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Dados de Acesso</h2>
              
              <div className="space-y-1">
                <label className="text-sm font-bold">Nome Completo</label>
                <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold">E-mail (Login)</label>
                <input required type="email" className="input-base" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold">Senha de Acesso</label>
                <input required type="password" placeholder="••••••••" className="input-base" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              {regType === "PATIENT" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">Data de Nascimento</label>
                    <input required type="date" className="input-base" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">ID do Sensor</label>
                    <input required className="input-base font-mono uppercase" value={formData.customId} onChange={e => setFormData({...formData, customId: e.target.value})} />
                  </div>
                </>
              )}
            </div>

            {/* COLUNA 2: ESPECÍFICOS */}
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                {regType === "PATIENT" ? "Limites Médicos" : "Nível de Permissão"}
              </h2>

              {regType === "STAFF_ADMIN" ? (
                <div className="space-y-3">
                  <div onClick={() => setFormData({...formData, role: 'STAFF'})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'STAFF' ? 'border-[#06B6D4] bg-cyan-50' : 'border-slate-100'}`}>
                    <p className="font-bold flex items-center gap-2"><Stethoscope size={18}/> Corpo Clínico</p>
                    <p className="text-xs text-slate-500">Acesso a pacientes e alertas em tempo real.</p>
                  </div>
                  <div onClick={() => setFormData({...formData, role: 'ADMIN'})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.role === 'ADMIN' ? 'border-[#1E293B] bg-slate-50' : 'border-slate-100'}`}>
                    <p className="font-bold flex items-center gap-2"><Briefcase size={18}/> Administrador</p>
                    <p className="text-xs text-slate-500">Gestão total da conta e equipe.</p>
                  </div>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {patterns.map(p => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg border text-sm">
                      <p className="font-bold mb-2 text-cyan-700">{p.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder="BPM Min" className="p-2 rounded border text-xs" value={thresholds[p.id]?.bpmMin} onChange={e => setThresholds({...thresholds, [p.id]: {...thresholds[p.id], bpmMin: Number(e.target.value)}})} />
                        <input type="number" placeholder="BPM Max" className="p-2 rounded border text-xs" value={thresholds[p.id]?.bpmMax} onChange={e => setThresholds({...thresholds, [p.id]: {...thresholds[p.id], bpmMax: Number(e.target.value)}})} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {status === "error" && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                  <ShieldAlert size={16}/> {errorMessage}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "loading"}
                className={`w-full py-4 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 ${status === "success" ? "bg-green-500" : "bg-[#1E293B] hover:bg-slate-800"}`}
              >
                {status === "loading" ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {status === "loading" ? "Salvando..." : status === "success" ? "Cadastrado!" : "Finalizar Registro"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-base {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-base:focus {
          border-color: #06B6D4;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>
    </div>
  );
}