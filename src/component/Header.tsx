"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Bell,
  BrainCircuit, // Ícone da IA
  ChevronDown,
  ClipboardList,
  Cpu,
  LayoutDashboard, 
  LogIn,
  LogOut,
  PlusCircle,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  // 1. Pegamos o objeto 'user' do contexto que você forneceu
  const { isAuthenticated, logout, loading, user } = useAuth();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (pathname === "/login" || pathname === "/register-user") return null;

  const linkStyle = (path: string) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all
    ${pathname === path 
      ? "bg-[#06B6D4]/10 text-[#06B6D4]" 
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
  `;

  // 👇 AJUSTE AQUI: O ID no seu AuthContext é 'sub', não 'id'
  const userId = user?.sub; 
  
  // Rota do Agente
  const agentRoute = userId ? `/patient/${userId}/agent` : '#';

  return (
    <header className="w-full bg-white border-b border-slate-200 h-16 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LADO ESQUERDO: LOGO E NAV PRINCIPAL */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <div className="bg-[#1E293B] p-1.5 rounded-lg text-[#06B6D4] shadow-lg group-hover:bg-slate-800 transition-colors">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-[#1E293B]">
              Vital<span className="text-[#06B6D4]">Monitor</span>
            </span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/dashboard" className={linkStyle("/dashboard")}>
                <LayoutDashboard size={18} /> Painel
              </Link>
              
              {/* --- BOTÃO DO AGENTE IA --- */}
              {/* Só exibe se tivermos um userId (sub) válido */}
              {userId && (
                <Link 
                  href={agentRoute} 
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border
                    ${pathname === agentRoute
                      ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                      : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 border-transparent"}
                  `}
                >
                  <BrainCircuit size={18} /> Guardian AI
                </Link>
              )}
              {/* ------------------------------- */}

              <Link href="/alerts" className={linkStyle("/alerts")}>
                <Bell size={18} /> Alertas
              </Link>
              <Link href="/reports/manager" className={linkStyle("/reports/manager")}>
                <ClipboardList size={18} /> Relatórios
              </Link>
            </nav>
          )}
        </div>

        {/* LADO DIREITO: AÇÕES E MENU DROP DOWN */}
        <div className="flex items-center gap-3">
          
          {loading ? (
            <div className="h-9 w-9 bg-slate-100 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <>
              {/* Botão Agente Mobile */}
              {userId && (
                <div className="lg:hidden flex items-center mr-2">
                   <Link href={agentRoute} className="text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                      <BrainCircuit size={20} />
                   </Link>
                </div>
              )}

              {/* Botão Novo Paciente (Se for Staff/Admin) */}
              <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
                 <Link href="/register" className={linkStyle("/register-paciente")}>
                    <PlusCircle size={18} /> <span className="hidden xl:inline">Novo Paciente</span>
                 </Link>
              </div>

              {/* Dropdown de Configurações */}
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${isSettingsOpen ? 'bg-slate-100 border-slate-300' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user?.role === 'ADMIN' ? 'bg-[#1E293B] text-[#06B6D4]' : 'bg-[#06B6D4] text-white'}`}>
                    {/* Exibe a inicial do nome */}
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-slate-900 leading-none">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{user?.role}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSettingsOpen && (
                  <>
                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 animate-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {user?.companyName || "Gestão de Equipe"}
                        </p>
                      </div>
                      
                      {userId && (
                        <Link href={agentRoute} onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-bold">
                          <BrainCircuit size={16} /> Guardian AI (Meu Status)
                        </Link>
                      )}

                      <Link href="/settings/users" onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#06B6D4] font-bold">
                        <Users size={16} /> Usuários
                      </Link>
                      <Link href="/settings/devices" onClick={() => setIsSettingsOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#06B6D4] font-bold">
                        <Cpu size={16} /> Dispositivos
                      </Link>
                      
                      <div className="h-px bg-slate-100 my-2"></div>
                      
                      <button 
                        onClick={() => { logout(); setIsSettingsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold"
                      >
                        <LogOut size={16} /> Sair do Sistema
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="bg-[#1E293B] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 flex items-center gap-2">
              <LogIn size={16} className="text-[#06B6D4]" /> Acessar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}