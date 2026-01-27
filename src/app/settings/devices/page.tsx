"use client";

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  Plus, 
  Activity, 
  User, 
  Wifi, 
  WifiOff, 
  MoreHorizontal,
  Settings2,
  Box
} from 'lucide-react';

// Tipagem baseada no seu Schema Prisma (Device + Patient)
interface Device {
  id: string;
  serialNumber: string;
  type: string;
  patientId: string | null;
  patient?: {
    name: string;
  };
  status: 'online' | 'offline'; // Campo calculado ou via status de conexão
}

export default function DeviceInventory() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock inicial - Substituir pelo seu GET /devices do NestJS
    const mockDevices: Device[] = [
      { 
        id: "dev_1", 
        serialNumber: "MAX-30102-X88", 
        type: "Oxímetro de Pulso", 
        patientId: "p1", 
        patient: { name: "Sr. João Silva" },
        status: 'online'
      },
      { 
        id: "dev_2", 
        serialNumber: "MPU-6050-Y99", 
        type: "Sensor de Queda", 
        patientId: null, 
        status: 'offline'
      },
    ];
    setDevices(mockDevices);
  }, []);

  const filteredDevices = devices.filter(d => 
    d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Inventário de Sensores <Cpu className="text-[#06B6D4]" />
            </h1>
            <p className="text-slate-500 mt-1">Gerencie os dispositivos IoT e seus vínculos com pacientes.</p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
            <Plus size={20} /> Provisionar Novo Sensor
          </button>
        </div>

        {/* STATS RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total de Sensores</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{devices.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Em Uso</p>
            <h3 className="text-3xl font-black text-[#06B6D4] mt-1">{devices.filter(d => d.patientId).length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Disponíveis</p>
            <h3 className="text-3xl font-black text-slate-400 mt-1">{devices.filter(d => !d.patientId).length}</h3>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Número de Série ou Paciente..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#06B6D4] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              
              {/* STATUS INDICATOR */}
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  device.status === 'online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {device.status === 'online' ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
                  {device.status}
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition">
                  <Settings2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                  <Box size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 truncate w-40">{device.serialNumber}</h4>
                  <p className="text-xs text-slate-500">{device.type}</p>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vínculo Atual</p>
                {device.patient ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <User size={16} className="text-[#06B6D4]" />
                    {device.patient.name}
                  </div>
                ) : (
                  <div className="text-sm font-medium text-slate-300 italic">
                    Dispositivo Desvinculado
                  </div>
                )}
              </div>

              {/* ACTION OVERLAY (SUBTLE) */}
              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold transition">
                  Editar
                </button>
                <button className="flex-1 bg-[#1E293B] hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition">
                  {device.patientId ? 'Trocar Paciente' : 'Vincular'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-20">
            <Cpu size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">Nenhum sensor encontrado com estes critérios.</p>
          </div>
        )}

      </div>
    </div>
  );
}