"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Lock, Loader2, Activity, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

// Imagens mantidas
const HEALTH_IMAGES = [
  "https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?q=80&w=870&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1666262811482-b8e0deaa7aaf?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1719934398679-d764c1410770?w=500&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1664036362129-ca6c57599633?q=80&w=406&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606206873764-fd15e242df52?q=80&w=870&auto=format&fit=crop",
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    // Hidratação segura para evitar mismatch do SSR
    const randomIndex = Math.floor(Math.random() * HEALTH_IMAGES.length);
    setBgImage(HEALTH_IMAGES[randomIndex]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Recomendo mover esta chamada para dentro do seu useAuth()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Trata erro de senha/email ou usuário inativo
        setStatus("error");
        return;
      }

      // O login() deve salvar o token no Cookie ou LocalStorage e 
      // configurar o cabeçalho "Authorization" padrão para as próximas chamadas.
      await login(data.access_token);
      
      // Use replace em vez de push para o usuário não voltar ao login ao clicar em "voltar"
      router.replace("/dashboard");
    } catch (err) {
      console.error("Falha na conexão:", err);
      setStatus("error");
    }
  };

  // Loader de carregamento inicial (Anti-flash)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full font-sans bg-slate-50 text-slate-900">
      
      {/* --- LADO ESQUERDO (Visual/Branding) --- */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between bg-[#1E293B] overflow-hidden">
        {bgImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt="Ambiente Hospitalar Moderno"
              className="h-full w-full object-cover opacity-40 mix-blend-overlay transition-opacity duration-700 ease-in-out"
            />
            {/* Gradiente Overlay usando a cor Azul Escuro (#1E293B) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/60 to-[#06B6D4]/10" />
          </div>
        )}

        {/* Header Flutuante na Imagem */}
        <div className="relative z-10 p-12">
           <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                 <span className="text-white text-lg">H</span>
              </div>
              HealthTech<span className="text-cyan-400">.ai</span>
           </div>
        </div>

        {/* Conteúdo Inferior */}
        <div className="relative z-10 p-16 pb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1E293B]/80 px-4 py-1.5 text-sm font-medium backdrop-blur-md border border-cyan-500/30 shadow-lg shadow-cyan-900/20">
            <Activity size={18} className="text-[#22C55E]" /> {/* Verde Neon */}
            <span className="text-slate-200">Sistema Clínico Operacional</span>
            <span className="ml-2 flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
            Tecnologia precisa <br />
            para <span className="text-[#06B6D4]">decisões vitais</span>.
          </h2>
          <p className="text-slate-300 max-w-md text-lg leading-relaxed">
            Gestão hospitalar inteligente com monitoramento em tempo real e segurança de dados avançada.
          </p>
        </div>
      </div>

      {/* --- LADO DIREITO (Formulário) --- */}
      <div className="flex w-full flex-col justify-center items-center px-6 lg:w-1/2 bg-white relative">
        {/* Barra de progresso superior (Decorativa 'Tech') */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] via-[#22C55E] to-[#06B6D4] opacity-50" />

        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header do Form */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#06B6D4] transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Voltar ao início
            </Link>

            <h1 className="text-3xl font-extrabold text-[#1E293B] tracking-tight">
              Acesse o Portal
            </h1>
            <p className="mt-3 text-slate-500">
              Entre com suas credenciais profissionais para acessar o dashboard.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Email */}
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="text-sm font-semibold text-[#1E293B] flex justify-between"
              >
                Email Corporativo
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#06B6D4] text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="seu.nome@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`
                    w-full pl-11 pr-4 py-3.5 rounded-lg border bg-[#F1F5F9] text-[#1E293B] placeholder:text-slate-400
                    transition-all duration-200 outline-none
                    focus:bg-white focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]
                    hover:border-slate-300
                    ${status === 'error' ? 'border-[#EF4444] ring-[#EF4444]/20' : 'border-transparent'}
                  `}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                 <label htmlFor="password" className="text-sm font-semibold text-[#1E293B]">
                   Senha
                 </label>
                 <a href="#" className="text-xs font-medium text-[#06B6D4] hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                   Esqueceu a senha?
                 </a>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-[#06B6D4] text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  required
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`
                    w-full pl-11 pr-4 py-3.5 rounded-lg border bg-[#F1F5F9] text-[#1E293B] placeholder:text-slate-400
                    transition-all duration-200 outline-none
                    focus:bg-white focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]
                    hover:border-slate-300
                    ${status === 'error' ? 'border-[#EF4444] ring-[#EF4444]/20' : 'border-transparent'}
                  `}
                />
              </div>
            </div>

            {/* Mensagem de Erro Acessível */}
            {status === "error" && (
              <div 
                role="alert" 
                className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-[#EF4444] text-sm animate-shake"
              >
                <Activity size={16} className="rotate-45" />
                <span>Credenciais inválidas. Verifique e tente novamente.</span>
              </div>
            )}

            {/* Botão de Ação */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="
                group w-full py-3.5 rounded-lg font-bold text-white shadow-lg shadow-slate-200
                bg-[#1E293B] hover:bg-slate-800
                active:scale-[0.98] transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E293B]
                disabled:opacity-70 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin text-[#06B6D4]" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <CheckCircle2 size={18} className="text-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500">
            Não tem acesso?{" "}
            <Link 
              href="/register" 
              className="font-semibold text-[#06B6D4] hover:text-cyan-700 transition-colors focus:outline-none focus:underline"
            >
              Contate o admin
            </Link>
          </p>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400">
                &copy; {new Date().getFullYear()} Hospital Tech Solutions. Protegido por criptografia ponta-a-ponta.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}