"use client";

import { useState } from "react";
import { UserPlus, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CadastroPaciente() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    customId: "SENSOR-PATIENT-", // Já deixamos um prefixo para facilitar
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("http://localhost:3001/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        // Limpa o form após sucesso, mantendo o prefixo
        setFormData({ name: "", birthDate: "", customId: "SENSOR-PATIENT-" });
        
        // Volta para estado normal após 3 segundos
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* HEADER */}
      <header className="bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
            <p className="text-xs opacity-80 uppercase font-medium tracking-widest">Cadastrar Sensor e Dados</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Nome Completo
              </label>
              <input 
                required
                type="text" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-medium text-slate-700"
                placeholder="Ex: João da Silva"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Data Nascimento */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Data de Nascimento
              </label>
              <input 
                required
                type="date" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-medium text-slate-700"
                value={formData.birthDate}
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
              />
            </div>

            {/* ID do Sensor */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex justify-between">
                ID do Dispositivo (Firmware)
                <span className="text-xs text-indigo-600 normal-case bg-indigo-50 px-2 py-0.5 rounded">Deve ser igual ao código C</span>
              </label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors font-mono text-slate-700"
                  value={formData.customId}
                  onChange={(e) => setFormData({...formData, customId: e.target.value})}
                />
                <UserPlus className="absolute right-4 top-4 text-slate-400 w-6 h-6" />
              </div>
            </div>

            {/* Botão Salvar */}
            <button 
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`w-full py-4 rounded-xl font-black text-white text-lg tracking-widest transition-all transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg
                ${status === "success" ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"}
                ${status === "error" ? "bg-red-500" : ""}
              `}
            >
              {status === "loading" && <span className="animate-spin">⏳</span>}
              {status === "success" && <><CheckCircle2 /> SALVO COM SUCESSO!</>}
              {status === "error" && "ERRO AO SALVAR"}
              {status === "idle" && <><Save className="w-5 h-5" /> CADASTRAR PACIENTE</>}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
}