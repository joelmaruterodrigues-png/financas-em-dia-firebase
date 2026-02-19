
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';
import ReportsPage from './components/ReportsPage';
import { useFinance } from './hooks/useFinance';
import { Moon, Sun, Download, Upload, ShieldCheck, CreditCard } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('fin_dark_mode');
    return saved === 'true';
  });

  const { 
    expenses, incomes, loading, 
    addExpense, removeExpense, updateExpense, 
    addIncome, removeIncome, importBackup 
  } = useFinance();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fin_dark_mode', darkMode.toString());
  }, [darkMode]);

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('Importar dados substituirá o estado atual. Continuar?')) {
          importBackup(json);
        }
      } catch (err) {
        alert('Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard expenses={expenses} incomes={incomes} />;
      case 'expenses': return <TransactionsPage type="expense" data={expenses} onAdd={addExpense} onRemove={removeExpense} onUpdate={updateExpense} />;
      case 'incomes': return <TransactionsPage type="income" data={incomes} onAdd={addIncome} onRemove={removeIncome} />;
      case 'reports': return <ReportsPage expenses={expenses} incomes={incomes} />;
      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl mx-auto pb-24">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Ajustes</h2>
            
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800 shadow-sm transition-all overflow-hidden">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-between p-6 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[28px] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 group-hover:scale-110 transition-transform">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Tema do Aplicativo</p>
                    <p className="text-sm text-slate-400 font-medium">Atualmente em modo {darkMode ? 'escuro' : 'claro'}</p>
                  </div>
                </div>
                <div className={`w-14 h-7 rounded-full p-1 transition-all duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </div>
              </button>

              <div className="h-px bg-slate-50 dark:bg-slate-800 mx-6"></div>

              <div className="flex items-center justify-between p-6 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Download size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Backup de Segurança</p>
                    <p className="text-sm text-slate-400 font-medium">Exportar todos os dados para JSON</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const data = { expenses, incomes, goal: localStorage.getItem('fin_expense_goal') };
                    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}
                  className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Baixar
                </button>
              </div>

              <div className="h-px bg-slate-50 dark:bg-slate-800 mx-6"></div>

              <label className="flex items-center justify-between p-6 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 group-hover:scale-110 transition-transform">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">Restaurar Dados</p>
                    <p className="text-sm text-slate-400 font-medium">Importar arquivo de backup anterior</p>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                  Upload
                </div>
                <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
              </label>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black">Dados Privados</h4>
                <p className="text-indigo-100 text-sm font-medium opacity-80">Suas informações financeiras são armazenadas apenas neste dispositivo e nunca enviadas para servidores externos.</p>
              </div>
            </div>
          </div>
        );
      default: return <Dashboard expenses={expenses} incomes={incomes} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
