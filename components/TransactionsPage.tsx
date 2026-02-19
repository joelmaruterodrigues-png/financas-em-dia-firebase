
import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, CheckCircle2, Clock, AlertTriangle, Briefcase, User as UserIcon, Target, CalendarDays, Coins, Save, X } from 'lucide-react';
import { Expense, Income, TransactionStatus } from '../types';
import { CATEGORIES, INCOME_TYPES, PAYMENT_METHODS, TRANSACTION_TYPES } from '../constants';
import { useFinance } from '../hooks/useFinance';

interface TransactionsPageProps {
  type: 'expense' | 'income';
  data: (Expense | Income)[];
  onAdd: any;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, updated: any) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ type, data, onAdd, onRemove, onUpdate }) => {
  const { monthlyExpenseGoal, setMonthlyExpenseGoal, incomes } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(monthlyExpenseGoal.toString());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<any>({
    descricao: '',
    fonte: '',
    valor: '',
    categoria: 'Outros',
    tipo: type === 'expense' ? 'Variável' : 'Pessoal',
    dataVencimento: new Date().toISOString().split('T')[0],
    dataRecebimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    formaPagamento: 'Pix',
    observacoes: ''
  });

  const budgetStats = useMemo(() => {
    if (type !== 'expense') return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const remainingDays = daysInMonth - now.getDate() + 1;

    // Filtra apenas despesas do mês atual para cálculo da meta
    const currentMonthExpenses = (data as Expense[]).filter(e => {
      const d = new Date(e.dataVencimento);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.valor, 0);

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.valor, 0);
    const availableBudget = monthlyExpenseGoal - currentMonthExpenses;
    
    let dailyLimit = remainingDays > 0 ? availableBudget / remainingDays : 0;
    
    // REGRA: Se a meta for maior que a receita, o limite diário fica negativo como alerta
    const goalExceedsIncome = monthlyExpenseGoal > totalIncome;
    if (goalExceedsIncome) {
      dailyLimit = -Math.abs(dailyLimit);
    }

    const spentPercentageOfGoal = monthlyExpenseGoal > 0 ? (currentMonthExpenses / monthlyExpenseGoal) * 100 : 0;

    return {
      currentMonthExpenses,
      availableBudget,
      dailyLimit,
      remainingDays,
      spentPercentageOfGoal,
      totalIncome,
      goalExceedsIncome
    };
  }, [type, data, monthlyExpenseGoal, incomes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, valor: parseFloat(formData.valor) };
    onAdd(payload);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      fonte: '',
      valor: '',
      categoria: 'Outros',
      tipo: type === 'expense' ? 'Variável' : 'Pessoal',
      dataVencimento: new Date().toISOString().split('T')[0],
      dataRecebimento: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      formaPagamento: 'Pix',
      observacoes: ''
    });
  };

  const handleSaveGoal = () => {
    setMonthlyExpenseGoal(parseFloat(goalValue) || 0);
    setIsEditingGoal(false);
  };

  const filteredData = data.filter(item => {
    const label = type === 'expense' ? (item as Expense).descricao : (item as Income).fonte;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'Pago': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Pendente': return <Clock size={16} className="text-amber-500" />;
      case 'Atrasado': return <AlertTriangle size={16} className="text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{type === 'expense' ? 'Despesas' : 'Receitas'}</h2>
          <p className="text-slate-500 dark:text-slate-400">Total de {filteredData.length} registros no período.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={20} />
          Novo Registro
        </button>
      </header>

      {type === 'expense' && budgetStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Widget Meta */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
              <Target size={100} />
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-indigo-500" />
                Meta Mensal
              </h3>
              {!isEditingGoal ? (
                <button onClick={() => setIsEditingGoal(true)} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg">Editar</button>
              ) : (
                <div className="flex gap-1">
                   <button onClick={handleSaveGoal} className="text-emerald-500"><Save size={16}/></button>
                   <button onClick={() => setIsEditingGoal(false)} className="text-rose-500"><X size={16}/></button>
                </div>
              )}
            </div>
            {isEditingGoal ? (
              <input 
                autoFocus
                type="number"
                className="w-full text-2xl font-black bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-2 outline-none focus:ring-2 ring-indigo-500"
                value={goalValue}
                onChange={e => setGoalValue(e.target.value)}
                onBlur={handleSaveGoal}
              />
            ) : (
              <div>
                <p className={`text-2xl font-black ${budgetStats.goalExceedsIncome ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  R$ {monthlyExpenseGoal.toLocaleString('pt-BR')}
                </p>
                {budgetStats.goalExceedsIncome && (
                  <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1 bg-rose-50 dark:bg-rose-900/20 p-1 rounded-md">
                    <AlertTriangle size={10} /> Meta maior que a receita!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Widget Limite Diário */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <CalendarDays size={14} className="text-indigo-500" />
              Gasto Diário (Ideal)
            </h3>
            <p className={`text-2xl font-black ${budgetStats.dailyLimit >= 0 && !budgetStats.goalExceedsIncome ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'}`}>
              R$ {budgetStats.dailyLimit.toLocaleString('pt-BR')}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Válido para os próximos <span className="text-indigo-500 font-bold">{budgetStats.remainingDays} dias</span>.
            </p>
          </div>

          {/* Widget Progresso */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Coins size={14} className="text-indigo-500" />
              Uso do Orçamento
            </h3>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">R$ {budgetStats.currentMonthExpenses.toLocaleString('pt-BR')}</span>
              <span className={budgetStats.spentPercentageOfGoal > 100 ? 'text-rose-500' : 'text-indigo-500'}>{budgetStats.spentPercentageOfGoal.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${budgetStats.spentPercentageOfGoal > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(budgetStats.spentPercentageOfGoal, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Busca e Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="O que você procura?" 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Itens (Mobile First) */}
      <div className="grid grid-cols-1 gap-3">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
               {type === 'expense' ? (
                <div className="p-3 rounded-2xl" style={{ backgroundColor: CATEGORIES.find(c => c.label === (item as Expense).categoria)?.color + '15', color: CATEGORIES.find(c => c.label === (item as Expense).categoria)?.color }}>
                  {CATEGORIES.find(c => c.label === (item as Expense).categoria)?.icon}
                </div>
               ) : (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                  <UserIcon size={20} />
                </div>
               )}
               <div>
                 <p className="font-bold text-slate-900 dark:text-slate-100">{(item as any).descricao || (item as any).fonte}</p>
                 <p className="text-xs text-slate-400 font-medium">{new Date((item as any).dataVencimento || (item as any).dataRecebimento).toLocaleDateString('pt-BR')}</p>
               </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <p className={`font-black ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {type === 'expense' ? '-' : '+'} R$ {item.valor.toLocaleString('pt-BR')}
                </p>
                {type === 'expense' && <p className="text-[10px] font-bold text-slate-400 uppercase">{(item as Expense).status}</p>}
              </div>
              <button onClick={() => onRemove(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lateral (Inserção) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-end">
           <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-8 shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Novo Registro</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><X size={24}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">{type === 'expense' ? 'O que é?' : 'De onde vem?'}</label>
                  <input 
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-lg font-bold"
                    value={type === 'expense' ? formData.descricao : formData.fonte}
                    onChange={e => setFormData({...formData, [type === 'expense' ? 'descricao' : 'fonte']: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Valor</label>
                    <input 
                      required type="number" step="0.01"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-lg font-bold text-indigo-500"
                      value={formData.valor}
                      onChange={e => setFormData({...formData, valor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Data</label>
                    <input 
                      required type="date"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold"
                      value={type === 'expense' ? formData.dataVencimento : formData.dataRecebimento}
                      onChange={e => setFormData({...formData, [type === 'expense' ? 'dataVencimento' : 'dataRecebimento']: e.target.value})}
                    />
                  </div>
                </div>

                {type === 'expense' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Categoria</label>
                      <select 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold"
                        value={formData.categoria}
                        onChange={e => setFormData({...formData, categoria: e.target.value})}
                      >
                        {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Status</label>
                      <select 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl font-bold"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Pago">Pago</option>
                        <option value="Atrasado">Atrasado</option>
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                  Confirmar
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
