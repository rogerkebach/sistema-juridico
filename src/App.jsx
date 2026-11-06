import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, DollarSign, FileText, Calendar, Shield, Clock, AlertTriangle, 
  CheckCircle, Plus, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Printer, 
  Lock, Eye, ChevronRight, Scale, Briefcase, FileCheck, ExternalLink, Filter, Download
} from 'lucide-react';

// Dados iniciais de simulação para fallback ou testes locais
const INITIAL_DATA = {
  financeiro: [
    { id: '1', descricao: 'Honorários Iniciais - Processo 0001234-56.2024.5.04.0661', tipo: 'receita', valor: 4500, data: '2026-11-01', categoria: 'Honorários', cliente: 'João da Silva', status: 'pago', rateioSocio: 3600, rateioParceiro: 900, parceiro: 'Dr. Roberto' },
    { id: '2', descricao: 'Mensalidade Retainer - Construtora Norte', tipo: 'receita', valor: 3500, data: '2026-11-05', categoria: 'Retainer', cliente: 'Construtora Norte Ltda', status: 'pago', rateioSocio: 3500, rateioParceiro: 0, parceiro: '-' },
    { id: '3', descricao: 'Honorários Sucumbenciais - Ação Trabalhista', tipo: 'receita', valor: 8200, data: '2026-10-15', categoria: 'Sucumbência', cliente: 'Empresa Metalúrgica', status: 'pendente', rateioSocio: 6560, rateioParceiro: 1640, parceiro: 'Dra. Maria' },
    { id: '4', descricao: 'Software de Gestão de Prazos', tipo: 'despesa', valor: 450, data: '2026-11-02', categoria: 'Sistemas', cliente: '-', status: 'pago', rateioSocio: 0, rateioParceiro: 0, parceiro: '-' }
  ],
  clientes: [
    { id: 'c1', nome: 'João da Silva', cpfCnpj: '123.456.789-00', email: 'joao@email.com', telefone: '(54) 99999-1111', status: 'Adimplente', inadimplente: false },
    { id: 'c2', nome: 'Construtora Norte Ltda', cpfCnpj: '12.345.678/0001-90', email: 'contato@norte.com', telefone: '(54) 3311-2233', status: 'Adimplente', inadimplente: false },
    { id: 'c3', nome: 'Empresa Metalúrgica', cpfCnpj: '98.765.432/0001-10', email: 'financeiro@metalurgica.com', telefone: '(54) 3314-5566', status: 'Inadimplente', inadimplente: true }
  ],
  processos: [
    { id: 'p1', cnj: '0001234-56.2024.5.04.0661', cliente: 'João da Silva', tribunal: 'TRT4', polo: 'Reclamante', acao: 'Trabalhista', valorCausa: 45000, status: 'Em Andamento', ultimaMov: '2026-11-02 - Juntada de Petição de Manifestação' },
    { id: 'p2', cnj: '5004321-88.2025.8.21.0021', cliente: 'Construtora Norte Ltda', tribunal: 'TJRS', polo: 'Réu', acao: 'Cobrança', valorCausa: 120000, status: 'Fase de Provas', ultimaMov: '2026-10-28 - Despacho: Designada Audiência de Instrução' }
  ],
  prazos: [
    { id: 'z1', processo: '0001234-56.2024.5.04.0661', tipo: 'Réplica à Contestação', dataFatal: '2026-11-10', responsavel: 'Dr. Roberto', status: 'Pendente', prioridade: 'Alta' },
    { id: 'z2', processo: '5004321-88.2025.8.21.0021', tipo: 'Agravo de Instrumento', dataFatal: '2026-11-18', responsavel: 'Dra. Maria', status: 'Pendente', prioridade: 'Média' }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('socio'); // 'socio' | 'advogado'
  
  // Estados dos dados da aplicação
  const [financeiro, setFinanceiro] = useState(INITIAL_DATA.financeiro);
  const [clientes, setClientes] = useState(INITIAL_DATA.clientes);
  const [processos, setProcessos] = useState(INITIAL_DATA.processos);
  const [prazos, setPrazos] = useState(INITIAL_DATA.prazos);
  
  // Modais e seletores
  const [selectedRecibo, setSelectedRecibo] = useState(null);
  const [filterParceiro, setFilterParceiro] = useState('todos');
  const [newLancamento, setNewLancamento] = useState({
    descricao: '', tipo: 'receita', valor: '', data: '', categoria: 'Honorários', cliente: '', parceiro: '', pctParceiro: 20
  });

  // Métricas Calculadas
  const totalReceita = financeiro.filter(f => f.tipo === 'receita' && f.status === 'pago').reduce((acc, f) => acc + Number(f.valor), 0);
  const totalDespesa = financeiro.filter(f => f.tipo === 'despesa' && f.status === 'pago').reduce((acc, f) => acc + Number(f.valor), 0);
  const totalInadimplencia = financeiro.filter(f => f.tipo === 'receita' && f.status === 'pendente').reduce((acc, f) => acc + Number(f.valor), 0);
  const saldoLiquido = totalReceita - totalDespesa;

  const handleAddLancamento = (e) => {
    e.preventDefault();
    if (!newLancamento.descricao || !newLancamento.valor) return;
    
    const val = parseFloat(newLancamento.valor);
    const pct = parseFloat(newLancamento.pctParceiro || 0);
    const valParceiro = newLancamento.parceiro ? (val * pct) / 100 : 0;
    const valSocio = val - valParceiro;

    const item = {
      id: Date.now().toString(),
      descricao: newLancamento.descricao,
      tipo: newLancamento.tipo,
      valor: val,
      data: newLancamento.data || new Date().toISOString().split('T')[0],
      categoria: newLancamento.categoria,
      cliente: newLancamento.cliente || '-',
      status: 'pago',
      rateioSocio: valSocio,
      rateioParceiro: valParceiro,
      parceiro: newLancamento.parceiro || '-'
    };

    setFinanceiro([item, ...financeiro]);
    setNewLancamento({ descricao: '', tipo: 'receita', valor: '', data: '', categoria: 'Honorários', cliente: '', parceiro: '', pctParceiro: 20 });
  };

  const handleImprimirRecibo = (item) => {
    setSelectedRecibo(item);
    setTimeout(() => {
      window.print();
    }, 300);
  };
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg text-slate-950 font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              LEX MANAGEMENT <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-normal border border-amber-500/30">Advocacia Integrada</span>
            </h1>
            <p className="text-xs text-slate-400">Escritório Jurídico & Controle Financeiro</p>
          </div>
        </div>

        {/* Nível de Acesso (Sócio vs Advogado) */}
        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${userRole === 'socio' ? 'text-amber-400' : 'text-blue-400'}`} />
            <span className="text-xs font-medium text-slate-300">Perfil Ativo:</span>
          </div>
          <select 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded text-xs px-3 py-1 text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="socio">Sócio / Administrador</option>
            <option value="advogado">Advogado / Colaborador</option>
          </select>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Menu */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Building2 className="w-4 h-4" /> Dashboard Geral
            </button>
            <button 
              onClick={() => setActiveTab('financeiro')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'financeiro' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <DollarSign className="w-4 h-4" /> Fluxo de Caixa
            </button>

            {userRole === 'socio' && (
              <button 
                onClick={() => setActiveTab('rateios')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'rateios' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
              >
                <Users className="w-4 h-4" /> Rateio de Parceiros
              </button>
            )}

            <button 
              onClick={() => setActiveTab('processos')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'processos' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Briefcase className="w-4 h-4" /> Processos & Tribunais
            </button>

            <button 
              onClick={() => setActiveTab('prazos')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'prazos' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Clock className="w-4 h-4" /> Agenda de Prazos
            </button>

            <button 
              onClick={() => setActiveTab('clientes')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'clientes' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Cadastro de Clientes
            </button>

            <button 
              onClick={() => setActiveTab('minutas')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'minutas' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <FileCheck className="w-4 h-4" /> Contratos & Minutas
            </button>

            {userRole === 'socio' && (
              <button 
                onClick={() => setActiveTab('relatorios')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'relatorios' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" /> Relatórios Estratégicos
              </button>
            )}
          </nav>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Status da Base:</p>
            <p className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-3 h-3" /> Sincronizado na Nuvem</p>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Visão Geral do Escritório</h2>
              
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Receita Arrecadada</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs text-emerald-500 flex items-center gap-1 mt-2"><ArrowUpRight className="w-3 h-3"/> Entradas confirmadas</span>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Despesas Operacionais</p>
                  <p className="text-2xl font-bold text-rose-400 mt-1">R$ {totalDespesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs text-rose-500 flex items-center gap-1 mt-2"><ArrowDownRight className="w-3 h-3"/> Saídas operacionais</span>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Honorários Pendentes / Inadimplência</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">R$ {totalInadimplencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs text-amber-500 flex items-center gap-1 mt-2"><AlertTriangle className="w-3 h-3"/> A receber / Vencidos</span>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Saldo Líquido</p>
                  <p className="text-2xl font-bold text-white mt-1">R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs text-slate-400 mt-2 block">Resultado operacional</span>
                </div>
              </div>

              {/* Quick Actions & Recent Processes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Próximos Prazos Fatais</h3>
                  <div className="space-y-2">
                    {prazos.map(pz => (
                      <div key={pz.id} className="p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-white">{pz.tipo}</p>
                          <p className="text-xs text-slate-400">Proc: {pz.processo} • Resp: {pz.responsavel}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-semibold">
                          Fatal: {pz.dataFatal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400" /> Movimentações Recentes</h3>
                  <div className="space-y-2">
                    {processos.map(pr => (
                      <div key={pr.id} className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-mono font-bold text-amber-400">{pr.cnj}</p>
                          <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{pr.tribunal}</span>
                        </div>
                        <p className="text-xs text-slate-300">{pr.ultimaMov}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLUXO DE CAIXA */}
          {activeTab === 'financeiro' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Fluxo de Caixa & Lançamentos</h2>
              </div>

              {/* Form Lançamento */}
              <form onSubmit={handleAddLancamento} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-2">Novo Lançamento Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Descrição</label>
                    <input type="text" placeholder="Ex: Honorários iniciais" value={newLancamento.descricao} onChange={e => setNewLancamento({...newLancamento, descricao: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tipo</label>
                    <select value={newLancamento.tipo} onChange={e => setNewLancamento({...newLancamento, tipo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500">
                      <option value="receita">Receita (Honorários/Retainer)</option>
                      <option value="despesa">Despesa Operacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Valor (R$)</label>
                    <input type="number" placeholder="0.00" value={newLancamento.valor} onChange={e => setNewLancamento({...newLancamento, valor: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Cliente</label>
                    <input type="text" placeholder="Nome do cliente" value={newLancamento.cliente} onChange={e => setNewLancamento({...newLancamento, cliente: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Parceiro Associado (Rateio)</label>
                    <input type="text" placeholder="Ex: Dr. Roberto" value={newLancamento.parceiro} onChange={e => setNewLancamento({...newLancamento, parceiro: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">% do Parceiro</label>
                    <input type="number" placeholder="20" value={newLancamento.pctParceiro} onChange={e => setNewLancamento({...newLancamento, pctParceiro: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2 rounded text-sm transition flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Registrar Lançamento
                    </button>
                  </div>
                </div>
              </form>

              {/* Tabela de Lançamentos */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Data</th>
                      <th className="p-4">Descrição</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Valor Total</th>
                      <th className="p-4">Parceiro</th>
                      <th className="p-4">Recibo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {financeiro.map(f => (
                      <tr key={f.id} className="hover:bg-slate-900/50">
                        <td className="p-4">{f.data}</td>
                        <td className="p-4 font-medium text-white">{f.descricao}</td>
                        <td className="p-4">{f.cliente}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${f.tipo === 'receita' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {f.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">R$ {Number(f.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td className="p-4 text-xs text-slate-400">{f.parceiro !== '-' ? `${f.parceiro} (R$ ${f.rateioParceiro})` : '-'}</td>
                        <td className="p-4">
                          {f.tipo === 'receita' && f.status === 'pago' && (
                            <button onClick={() => handleImprimirRecibo(f)} className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 rounded text-slate-300 transition">
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: RATEIOS */}
          {activeTab === 'rateios' && userRole === 'socio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Divisão de Rateios (Parceiros & Sócios)</h2>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-300">Apuração por Advogado Parceiro</h3>
                  <select value={filterParceiro} onChange={e => setFilterParceiro(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded text-white">
                    <option value="todos">Todos os Parceiros</option>
                    <option value="Dr. Roberto">Dr. Roberto</option>
                    <option value="Dra. Maria">Dra. Maria</option>
                  </select>
                </div>

                <div className="divide-y divide-slate-800">
                  {financeiro.filter(f => f.parceiro !== '-' && (filterParceiro === 'todos' || f.parceiro === filterParceiro)).map(r => (
                    <div key={r.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{r.parceiro}</p>
                        <p className="text-xs text-slate-400">Ref: {r.descricao} ({r.cliente})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-amber-400">R$ {r.rateioParceiro.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <p className="text-xs text-slate-500">Retido Escritório: R$ {r.rateioSocio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROCESSOS */}
          {activeTab === 'processos' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Controle de Processos</h2>
              <div className="grid grid-cols-1 gap-4">
                {processos.map(p => (
                  <div key={p.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">{p.tribunal}</span>
                        <h3 className="text-lg font-bold text-white mt-1 font-mono">{p.cnj}</h3>
                        <p className="text-xs text-slate-400">Cliente: <span className="text-slate-200 font-medium">{p.cliente}</span> ({p.polo})</p>
                      </div>
                      <button onClick={() => alert(`Simulando consulta nos servidores do ${p.tribunal}... Nenhuma nova movimentação encontrada.`)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Consultar Tribunal
                      </button>
                    </div>
                    <div className="bg-slate-900 p-3 rounded text-xs text-slate-300 border border-slate-800">
                      <p className="font-semibold text-slate-400 mb-0.5">Último Andamento Processual:</p>
                      <p>{p.ultimaMov}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRAZOS */}
          {activeTab === 'prazos' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Agenda & Prazos Processuais</h2>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Data Fatal</th>
                      <th className="p-4">Tipo de Prazo</th>
                      <th className="p-4">Processo CNJ</th>
                      <th className="p-4">Responsável</th>
                      <th className="p-4">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {prazos.map(z => (
                      <tr key={z.id} className="hover:bg-slate-900/50">
                        <td className="p-4 font-bold text-rose-400">{z.dataFatal}</td>
                        <td className="p-4 font-medium text-white">{z.tipo}</td>
                        <td className="p-4 font-mono text-xs">{z.processo}</td>
                        <td className="p-4">{z.responsavel}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-bold">
                            {z.prioridade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CLIENTES */}
          {activeTab === 'clientes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Cadastro de Clientes</h2>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Nome / Razão Social</th>
                      <th className="p-4">CPF / CNPJ</th>
                      <th className="p-4">Contato</th>
                      <th className="p-4">Status Financeiro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {clientes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="p-4 font-medium text-white">{c.nome}</td>
                        <td className="p-4 text-xs font-mono">{c.cpfCnpj}</td>
                        <td className="p-4 text-xs">{c.email} • {c.telefone}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.inadimplente ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MINUTAS & CONTRATOS */}
          {activeTab === 'minutas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Repositório de Minutas & Contratos Padrão</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-amber-400">Contrato de Honorários Quota Litis</h3>
                  <p className="text-xs text-slate-400">Modelo padrão para ações trabalhistas e cíveis com percentual sobre o êxito final.</p>
                  <button onClick={() => navigator.clipboard.writeText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS...')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded border border-slate-700 flex items-center gap-1.5">
                    Copiar Minuta Padrão
                  </button>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="font-bold text-amber-400">Contrato de Retainer Mensal Empresarial</h3>
                  <p className="text-xs text-slate-400">Modelo para assessoria jurídica continuada com valor fixo mensal.</p>
                  <button onClick={() => navigator.clipboard.writeText('CONTRATO DE ASSESSORIA JURÍDICA MENSAL...')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded border border-slate-700 flex items-center gap-1.5">
                    Copiar Minuta Padrão
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RELATÓRIOS ESTRATÉGICOS */}
          {activeTab === 'relatorios' && userRole === 'socio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Relatórios Gerenciais</h2>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400">Relatório de Inadimplência Ativa</h3>
                <div className="divide-y divide-slate-800">
                  {financeiro.filter(f => f.status === 'pendente').map(i => (
                    <div key={i.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-white">{i.cliente}</p>
                        <p className="text-xs text-slate-400">Vencimento/Ref: {i.descricao}</p>
                      </div>
                      <p className="text-sm font-bold text-rose-400">R$ {Number(i.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Visão de Impressão de Recibo Modal (Invisível na tela, ativo na impressão) */}
      {selectedRecibo && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-8 font-serif">
          <div className="border-2 border-slate-900 p-8 space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center tracking-widest uppercase border-b-2 border-slate-900 pb-4">RECIBO DE HONORÁRIOS JURÍDICOS</h1>
            <p className="text-justify leading-relaxed">
              Recebemos de <strong>{selectedRecibo.cliente}</strong> a quantia de <strong>R$ {Number(selectedRecibo.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> referente ao pagamento de <i>{selectedRecibo.descricao}</i>.
            </p>
            <p className="text-right mt-12">Passo Fundo - RS, {selectedRecibo.data}.</p>
            <div className="mt-20 text-center border-t border-slate-900 pt-2 max-w-xs mx-auto">
              <p className="font-bold">LEX MANAGEMENT ADVOCACIA</p>
              <p className="text-xs text-slate-600">OAB/RS nº XXX.XXX</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
