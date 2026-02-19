import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Sparkles, Building2, Wallet, Coins, Edit3, Save, X, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Expense, Income, AccountBalance, ReserveItem } from '../types';
import { CATEGORIES } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { useFinance } from '../hooks/useFinance';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, incomes }) => {
  const { accountBalances, reserves, updateAccountBalance, addReserve, removeReserve, updateReserve } = useFinance();
  const [advices, setAdvices] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, number>>({});
  const [editingReserves, setEditingReserves] = useState<ReserveItem[]>([]);

  const stats = useMemo(() => {
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.valor, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.valor, 0);
    const pending = expenses.filter(e => e.status === 'Pendente').reduce((acc, curr) => acc + curr.valor, 0);
    const overdue = expenses.filter(e => e.status === 'Atrasado').reduce((acc, curr) => acc + curr.valor, 0);
    
    const rawAccountSum = accountBalances.reduce((acc, curr) => acc + curr.value, 0);
    const reserveSum = reserves.reduce((acc, curr) => acc + curr.value, 0);
    const totalAvailable = rawAccountSum - reserveSum;
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pending,
      overdue,
      rawAccountSum,
      reserveSum,
      totalAvailable
    };
  }, [expenses, incomes, accountBalances, reserves]);

  const pieData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.categoria] = (categoryTotals[e.categoria] || 0) + e.valor;
    });
    return Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat],
      color: CATEGORIES.find(c => c.label === cat)?.color || '#CBD5E1'
    }));
  }, [expenses]);

  const monthlyData = [
    { name: 'Jan', receita: 4500, despesa: 3200 },
    { name: 'Fev', receita: 4800, despesa: 3100 },
    { name: 'Mar', receita: stats.totalIncome, despesa: stats.totalExpense },
  ];

  useEffect(() => {
    const fetchAdvice = async () => {
      if (expenses.length > 0 || incomes.length > 0) {
        setIsAiLoading(true);
        const tips = await getFinancialAdvice(expenses, incomes);
        setAdvices(tips);
        setIsAiLoading(false);
      }
    };
    fetchAdvice();
  }, [expenses.length, incomes.length]);

  const handleStartEdit = () => {
    const values: Record<string, number> = {};
    accountBalances.forEach(acc => values[acc.id] = acc.value);
    setEditingValues(values);
    setEditingReserves([...reserves]);
    setIsEditingBalances(true);
  };

  const handleSaveBalances = () => {
    // Save account balances
    Object.entries(editingValues).forEach(([id, val]) => {
      updateAccountBalance(id, val as number);
    });

    // Handle reserves (syncing state)
    // In a real app we'd have more robust syncing, here we simple overwrite
    // based on our local editingReserves state
    // We'll clear and re-add or just use a helper in useFinance
    // For simplicity with our existing hook, we'll implement a sync here
    
    // First remove old reserves not in editing
    reserves.forEach(r => {
      if (!editingReserves.find(er => er.id === r.id)) removeReserve(r.id);
    });
    // Add or update
    editingReserves.forEach(er => {
      const existing = reserves.find(r => r.id === er.id);
      if (existing) {
        updateReserve(er.id, er.description, er.value);
      } else {
        addReserve(er.description, er.value);
      }
    });

    setIsEditingBalances(false);
  };

  const getAccountIcon = (name: string) => {
    if (name.includes('Aplicação') || name.includes('Investimentos')) return <TrendingUp size={16} />;
    if (name.includes('Cotas')) return <Coins size={16} />;
    if (name.includes('Dinheiro')) return <Wallet size={16} />;
    return <Building2 size={16} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Visão Geral</h2>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe o desempenho das suas finanças este mês.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patrimônio Bruto</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">R$ {stats.rawAccountSum.toLocaleString('pt-BR')}</p>
        </div>
      </header>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Receitas (Mês)</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {stats.totalIncome.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Despesas (Mês)</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {stats.totalExpense.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Saldo Disponível</h3>
          <p className={`text-2xl font-bold ${stats.totalAvailable >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            R$ {stats.totalAvailable.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Contas em Aberto</h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {(stats.pending + stats.overdue).toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Valores em Conta Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Valores em Conta
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                Disponível: R$ {stats.totalAvailable.toLocaleString('pt-BR')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Patrimônio bruto menos reservas financeiras.</p>
          </div>
          {isEditingBalances ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditingBalances(false)}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
              <button 
                onClick={handleSaveBalances}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <Save size={16} />
                Salvar Alterações
              </button>
            </div>
          ) : (
            <button 
              onClick={handleStartEdit}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            >
              <Edit3 size={16} />
              Editar Contas & Reservas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {accountBalances.map((acc) => (
            <div key={acc.id} className="group bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  {getAccountIcon(acc.name)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight truncate">{acc.name}</span>
              </div>
              
              {isEditingBalances ? (
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                  <input 
                    type="number"
                    className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={editingValues[acc.id] || 0}
                    onChange={(e) => setEditingValues({ ...editingValues, [acc.id]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ) : (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  R$ {acc.value.toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          ))}

          {/* Reserva Card */}
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 transition-all">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
              <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">Reservas</span>
            </div>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              - R$ {stats.reserveSum.toLocaleString('pt-BR')}
            </p>
            <p className="text-[9px] text-amber-500/70 mt-1 uppercase font-bold">
              {reserves.length} item(s)
            </p>
          </div>
        </div>

        {/* Edit Reserves Section (Visible only when editing) */}
        {isEditingBalances && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Gerenciar Detalhamento da Reserva</h4>
              <button 
                onClick={() => setEditingReserves([...editingReserves, { id: crypto.randomUUID(), description: '', value: 0 }])}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus size={14} />
                Nova Reserva
              </button>
            </div>
            
            <div className="space-y-3 max-w-2xl">
              {editingReserves.map((reserve, idx) => (
                <div key={reserve.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <input 
                    type="text"
                    placeholder="Descrição (ex: Fundo de Emergência)"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none"
                    value={reserve.description}
                    onChange={(e) => {
                      const newRes = [...editingReserves];
                      newRes[idx].description = e.target.value;
                      setEditingReserves(newRes);
                    }}
                  />
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">R$</span>
                    <input 
                      type="number"
                      placeholder="Valor"
                      className="w-full pl-7 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white outline-none"
                      value={reserve.value}
                      onChange={(e) => {
                        const newRes = [...editingReserves];
                        newRes[idx].value = parseFloat(e.target.value) || 0;
                        setEditingReserves(newRes);
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => setEditingReserves(editingReserves.filter(r => r.id !== reserve.id))}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {editingReserves.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4">Nenhuma reserva cadastrada. Adicione uma acima.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Advice Card */}
      {advices.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-700 dark:to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={20} className="text-amber-300" />
            <h3 className="font-bold text-lg">Consultoria Inteligente</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advices.map((advice, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 text-sm">
                {advice}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Gastos por Categoria</h3>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Nenhum dado para exibir.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Comparativo Mensal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="despesa" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;