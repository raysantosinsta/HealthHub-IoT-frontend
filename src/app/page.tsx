"use client";

import {
  Droplets,
  Heart,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
// MUDANÇA 1: Importar Socket.IO em vez de MQTT
import { io, Socket } from "socket.io-client";

// --- Tipagens ---
type ConnectionStatus = "connected" | "disconnected" | "connecting";
type FallType = "none" | "free_fall" | "impact" | "confirmed";

// Defina a URL do seu Backend NestJS aqui
const BACKEND_URL = "http://localhost:3001"; 

export default function PatientMonitor() {
  // Estados de Sinais Vitais
  const [bpm, setBpm] = useState<number>(0);
  const [spo2, setSpo2] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  
  // Estados de Queda
  const [fallType, setFallType] = useState<FallType>("none");
  const [fallGForce, setFallGForce] = useState<number>(0);
  const [fallTime, setFallTime] = useState<string>("");

  const lastPacketTime = useRef<number>(Date.now());

  // --- EFEITO: CONEXÃO WEBSOCKET (SOCKET.IO) ---
  useEffect(() => {
    console.log("🔌 Tentando conectar ao WebSocket em:", BACKEND_URL);

    // FORÇANDO O ENDEREÇO CORRETO AQUI 👇
    const socketURL = "http://localhost:3001"; 
    
    console.log("🔌 Tentando conectar HARDCODED em:", socketURL);

    const socket: Socket = io(socketURL, {
      transports: ['websocket'], // Vamos forçar Websocket direto para evitar Polling
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket CONECTADO! ID:", socket.id);
      setConnectionStatus("connected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erro de Conexão WebSocket:", err.message);
      setConnectionStatus("disconnected");
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ WebSocket Desconectado. Motivo:", reason);
      setConnectionStatus("disconnected");
    });

    // --- LOGS DOS DADOS ---
    
    socket.on("dados_vitais", (data: any) => {
        console.log("💙 DADOS VITAIS RECEBIDOS:", data); // <--- OLHE AQUI NO CONSOLE
        lastPacketTime.current = Date.now();
        
        if (data.bpm > 0 || data.spo2 > 0) {
            setBpm(data.bpm);
            setSpo2(data.spo2);
            setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
        } else {
            console.log("Dados recebidos mas ignorados (zeros):", data);
        }
    });

    socket.on("dados_quedas", (data: any) => {
        console.log("🚨 DADOS QUEDA RECEBIDOS:", data); // <--- OLHE AQUI NO CONSOLE
        lastPacketTime.current = Date.now();
        const now = new Date().toLocaleTimeString("pt-BR");

        if (data.g) setFallGForce(data.g);

        if (data.status === "queda_livre") { setFallType("free_fall"); setFallTime(now); }
        else if (data.status === "impacto") { setFallType("impact"); setFallTime(now); }
        else if (data.status === "QUEDA_CONFIRMADA") { setFallType("confirmed"); setFallTime(now); }
    });

    return () => {
      console.log("Desmontando componente e fechando socket...");
      socket.disconnect();
    };
  }, []);

  // --- EFEITO: WATCHDOG (Igual ao anterior) ---
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastPacketTime.current > 4000) {
        if (bpm !== 0 || spo2 !== 0) {
          setBpm(0);
          setSpo2(0);
        }
      }
    }, 1000);
    return () => clearInterval(watchdogInterval);
  }, [bpm, spo2]);

  const resetFallStatus = () => {
    setFallType("none");
    setFallGForce(0);
    setFallTime("");
  };

  // --- Funções Auxiliares de Estilo (Iguais ao anterior) ---
  const getHeaderStatus = () => {
    if (fallType === "confirmed") return "EMERGÊNCIA DETECTADA";
    if (fallType === "impact") return "ALERTA DE IMPACTO";
    if (bpm === 0) return "AGUARDANDO SENSOR...";
    return "MONITORAMENTO ATIVO";
  };

  const getHeaderColor = () => {
    if (fallType === "confirmed") return "bg-red-700";
    if (fallType === "impact") return "bg-orange-600";
    if (bpm === 0) return "bg-slate-600";
    return "bg-indigo-700";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* HEADER */}
      <header className={`${getHeaderColor()} text-white p-6 transition-colors duration-500 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{getHeaderStatus()}</h1>
              <p className="text-xs opacity-80 uppercase font-medium tracking-widest">Painel de Controle do Paciente</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full backdrop-blur-md ${connectionStatus === 'connected' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {connectionStatus === "connected" ? <Wifi className="w-4 h-4 text-green-300"/> : <WifiOff className="w-4 h-4 text-red-300"/>}
            <span className="font-semibold">{connectionStatus === "connected" ? "Servidor Online" : "Servidor Offline"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 -mt-6">
        
        {/* ALERTA DE QUEDA */}
        {fallType !== "none" && (
          <div className={`rounded-2xl p-6 shadow-2xl border-2 flex flex-col md:flex-row justify-between items-center gap-6 animate-bounce-short ${
            fallType === 'confirmed' ? 'bg-white border-red-500' : 'bg-white border-orange-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${fallType === 'confirmed' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <AlertCircle className="w-10 h-10" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${fallType === 'confirmed' ? 'text-red-600' : 'text-orange-600'}`}>
                  {fallType === "confirmed" ? "QUEDA CONFIRMADA!" : "IMPACTO DETECTADO"}
                </h2>
                <p className="text-slate-700 font-medium">
                  Evento registrado às <span className="font-bold underline">{fallTime}</span>.
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-sm font-mono text-slate-600">
                  Intensidade: <b>{fallGForce.toFixed(2)}G</b>
                </div>
              </div>
            </div>

            <button 
              onClick={resetFallStatus}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-black text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                fallType === 'confirmed' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              LIMPAR ALERTA
            </button>
          </div>
        )}

        {/* GRID DE SINAIS VITAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BPM */}
          <div className={`bg-white p-8 rounded-3xl shadow-sm border-b-8 transition-all duration-500 transform
            ${bpm > 0 ? 'border-rose-500' : 'border-slate-200 opacity-60'}
          `}>
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Frequência Cardíaca</p>
                 <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-black text-slate-800 tracking-tighter">
                      {bpm > 0 ? bpm : "--"}
                    </span>
                    <span className="text-slate-400 font-bold text-xl uppercase">bpm</span>
                 </div>
               </div>
               <div className={`p-4 rounded-2xl ${bpm > 0 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-300'}`}>
                  <Heart className={`w-10 h-10 ${bpm > 0 ? 'animate-pulse' : ''}`} />
               </div>
             </div>
             
             <div className="mt-6 flex gap-2">
                {bpm > 0 && bpm < 60 && <Badge color="bg-blue-100 text-blue-700">Bradicardia</Badge>}
                {bpm >= 60 && bpm <= 100 && <Badge color="bg-green-100 text-green-700">Normal</Badge>}
                {bpm > 100 && <Badge color="bg-rose-100 text-rose-700">Taquicardia</Badge>}
                {bpm === 0 && <span className="text-sm text-slate-400 font-medium italic">Sem sinal do servidor</span>}
             </div>
          </div>

          {/* SpO2 */}
          <div className={`bg-white p-8 rounded-3xl shadow-sm border-b-8 transition-all duration-500 transform
            ${spo2 > 0 ? 'border-sky-500' : 'border-slate-200 opacity-60'}
          `}>
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Saturação de O₂</p>
                 <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-black text-slate-800 tracking-tighter">
                      {spo2 > 0 ? spo2 : "--"}
                    </span>
                    <span className="text-slate-400 font-bold text-xl uppercase">%</span>
                 </div>
               </div>
               <div className={`p-4 rounded-2xl ${spo2 > 0 ? 'bg-sky-50 text-sky-500' : 'bg-slate-50 text-slate-300'}`}>
                  <Droplets className="w-10 h-10" />
               </div>
             </div>

             <div className="mt-6 flex gap-2">
                {spo2 > 0 && spo2 < 92 && <Badge color="bg-amber-100 text-amber-700">Hipóxia Leve</Badge>}
                {spo2 >= 92 && <Badge color="bg-green-100 text-green-700">Estável</Badge>}
                {spo2 === 0 && <span className="text-sm text-slate-400 font-medium italic">Aguardando dados...</span>}
             </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="flex flex-col items-center gap-3 pt-6">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-slate-500 text-xs font-bold uppercase tracking-widest">
              <RefreshCw className={`w-3 h-3 ${bpm > 0 ? 'animate-spin' : ''}`}/>
              Última atualização: {lastUpdate || "---"}
           </div>
           <p className="text-[10px] text-slate-400 font-bold uppercase">v2.1 - Conexão Segura via Backend</p>
        </div>

      </main>

      <style jsx global>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite;
        }
      `}</style>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${color}`}>
      {children}
    </span>
  );
}