"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Activity, 
  Check, 
  ArrowRight, 
  Zap, 
  Shield, 
  BrainCircuit, 
  LayoutDashboard 
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Redireciona para dashboard se já estiver logado e clicar no plano Free
  const handleAccess = (plan: string) => {
    if (plan === "free") {
        if (isAuthenticated) router.push("/dashboard");
        else router.push("/login");
    } else {
        alert(`O plano ${plan} estará disponível em breve!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32 lg:pt-32">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
            <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Nova Versão 2.0 com IA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Monitoramento Clínico <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
              Inteligente & Preditivo
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            Centralize sinais vitais, receba alertas importantes em tempo real e antecipe riscos com envios automaticos via Telegram ou Whatsapp. A solução completa para hospitais modernos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={() => handleAccess("free")}
                className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition shadow-xl shadow-white/10 flex items-center justify-center gap-2"
            >
                {isAuthenticated ? "Ir para Dashboard" : "Acessar Agora"}
                <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/10 transition backdrop-blur-sm">
                Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="relative z-20 -mt-20 max-w-7xl mx-auto px-6 pb-20">
        
        {/* Toggle Mensal/Anual (Visual) */}
        <div className="flex justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-md p-1 rounded-xl inline-flex border border-white/20">
                <button 
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                >
                    Mensal
                </button>
                <button 
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-md' : 'text-white/70 hover:text-white'}`}
                >
                    Anual <span className="text-[10px] bg-green-500 text-white px-1.5 rounded">-20%</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* PLANO STARTER (FREE) */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Starter</h3>
                    <p className="text-slate-500 text-sm mt-1">Para testes e pequenas clínicas.</p>
                </div>
                <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900">Grátis</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-indigo-600 w-5 h-5" /> Monitoramento em Tempo Real
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-indigo-600 w-5 h-5" /> Até 5 Pacientes
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-indigo-600 w-5 h-5" /> Alertas de Queda Básicos
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-400 line-through decoration-slate-300">
                        Relatórios em PDF
                    </li>
                </ul>

                <button 
                    onClick={() => handleAccess("free")}
                    className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition"
                >
                    {isAuthenticated ? "Acessar Painel" : "Começar Grátis"}
                </button>
            </div>

            {/* PLANO PREMIUM (DESTAQUE) */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl shadow-indigo-500/20 border border-slate-800 flex flex-col relative transform lg:-translate-y-4">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Mais Popular
                </div>
                
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Premium <Zap size={18} className="text-yellow-400 fill-yellow-400"/>
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Para clínicas em crescimento.</p>
                </div>
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg text-slate-400">R$</span>
                        <span className="text-5xl font-black text-white">{billingCycle === 'monthly' ? '199' : '159'}</span>
                        <span className="text-slate-400">/mês</span>
                    </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="text-emerald-400 w-5 h-5" /> <strong>Tudo do Starter</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="text-emerald-400 w-5 h-5" /> Pacientes Ilimitados
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="text-emerald-400 w-5 h-5" /> Histórico de 30 dias
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="text-emerald-400 w-5 h-5" /> Relatórios Semanais PDF
                    </li>
                </ul>

                <button 
                    onClick={() => handleAccess("premium")}
                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
                >
                    Assinar Premium
                </button>
            </div>

            {/* PLANO ENTERPRISE (PLUS) */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col relative overflow-hidden">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Enterprise <BrainCircuit size={18} className="text-purple-600"/>
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Alta escala e inteligência.</p>
                </div>
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg text-slate-400">R$</span>
                        <span className="text-5xl font-black text-slate-900">{billingCycle === 'monthly' ? '499' : '399'}</span>
                        <span className="text-slate-400">/mês</span>
                    </div>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-purple-600 w-5 h-5" /> <strong>Tudo do Premium</strong>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-purple-600 w-5 h-5" /> IA Preditiva de Riscos
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-purple-600 w-5 h-5" /> Acesso à API
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                        <Check className="text-purple-600 w-5 h-5" /> White-label (Sua Marca)
                    </li>
                </ul>

                <button 
                    onClick={() => handleAccess("plus")}
                    className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                >
                    Falar com Vendas
                </button>
            </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-800 font-black text-xl mb-4">
            <Activity className="text-indigo-600" /> VitalMonitor
        </div>
        <p className="text-slate-400 text-sm">
            &copy; 2024 VitalMonitor Tecnologia em Saúde Ltda. <br/>
            Desenvolvido com segurança e precisão.
        </p>
      </footer>
    </div>
  );
}