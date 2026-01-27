"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  MoreVertical, 
  Trash2, 
  UserCog,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// Tipagem baseada no seu Schema
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulação de carregamento - Substituir pelo seu GET /users do NestJS
  useEffect(() => {
    const mockUsers: User[] = [
      { id: "1", name: "Dr. Roberto Araújo", email: "roberto@clinica.com", role: "ADMIN", createdAt: "2024-01-10T10:00:00Z" },
      { id: "2", name: "Enf. Ana Paula", email: "ana.paula@clinica.com", role: "STAFF", createdAt: "2024-01-15T14:30:00Z" },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Gestão de Equipe <UserCog className="text-[#06B6D4]" />
            </h1>
            <p className="text-slate-500 mt-1">Gerencie permissões e acesso dos profissionais da saúde.</p>
          </div>

          <button className="flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
            <UserPlus size={20} /> Convidar Membro
          </button>
        </div>

        {/* BARRA DE PESQUISA E FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4] transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">Total: {users.length} membros</span>
          </div>
        </div>

        {/* TABELA DE USUÁRIOS */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Membro</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Nível de Acesso</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Data de Cadastro</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      user.role === 'ADMIN' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      <ShieldCheck size={14} /> {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600">
                        <MoreVertical size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition text-slate-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-medium">Nenhum membro encontrado.</p>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4">
          <ShieldCheck className="text-blue-500 shrink-0" size={24} />
          <div>
            <h4 className="text-blue-900 font-bold text-sm">Controle de Privilégios</h4>
            <p className="text-blue-700 text-xs mt-1 leading-relaxed">
              Usuários <b>ADMIN</b> podem gerenciar dispositivos, configurações da clínica e outros usuários. 
              Usuários <b>STAFF</b> têm acesso apenas ao monitoramento e dashboards de pacientes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}