
import React, { useState, useMemo } from 'react';
import { Calendar, Download, FileText, Table as TableIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Expense, Income } from '../types';
import { CATEGORIES } from '../constants';

interface ReportsPageProps {
  expenses: Expense[];
  incomes: Income[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ expenses, incomes }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const periodExpenses = expenses.filter(e => {
      const d = new Date(e.dataVencimento);
      return d >= start && d <= end;
    });

    const periodIncomes = incomes.filter(i => {
      const d = new Date(i.dataRecebimento);
      return d >= start && d <= end;
    });

    const totalExp = periodExpenses.reduce((acc, curr) => acc + curr.valor, 0);
    const totalInc = periodIncomes.reduce((acc, curr) => acc + curr.valor, 0);

    const catTotals: Record<string, number> = {};
    periodExpenses.forEach(e => {
      catTotals[e.categoria] = (catTotals[e.categoria] || 0) + e.valor;
    });

    const pieData = Object.keys(catTotals).map(cat => ({
      name: cat,
      value: catTotals[cat],
      color: CATEGORIES.find(c => c.label === cat)?.color || '#94A3B8'
    }));

    return {
      expenses: periodExpenses,
      incomes: periodIncomes,
      totalExpense: totalExp,
      totalIncome: totalInc,
      balance: totalInc - totalExp,
      pieData
    };
  }, [expenses, incomes, startDate, endDate]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${new Date(startDate).toLocaleDateString()} até ${new Date(endDate).toLocaleDateString()}`, 14, 30);
    
    doc.text(`Total Receitas: R$ ${filteredData.totalIncome.toFixed(2)}`, 14, 45);
    doc.text(`Total Despesas: R$ ${filteredData.totalExpense.toFixed(2)}`, 14, 52);
    doc.text(`Saldo: R$ ${filteredData.balance.toFixed(2)}`, 14, 59);

    doc.text('Resumo por Categoria:', 14, 75);
    let y = 82;
    filteredData.pieData.forEach(item => {
      doc.text(`${item.name}: R$ ${item.value.toFixed(2)}`, 20, y);
      y += 7;
    });

    doc.save(`relatorio_${startDate}_a_${endDate}.pdf`);
  };

  const exportExcel = () => {
    const expenseData = filteredData.expenses.map(e => ({
      Data: e.dataVencimento,
      Descrição: e.descricao,
      Categoria: e.categoria,
      Valor: e.valor,
      Status: e.status,
      Pagamento: e.formaPagamento
    }));

    const incomeData = filteredData.incomes.map(i => ({
      Data: i.dataRecebimento,
      Fonte: i.fonte,
      Tipo: i.tipo,
      Valor: i.valor
    }));

    const wb = XLSX.utils.book_new();
    const wsExp = XLSX.utils.json_to_sheet(expenseData);
    const wsInc = XLSX.utils.json_to_sheet(incomeData);

    XLSX.utils.book_append_sheet(wb, wsExp, "Despesas");
    XLSX.utils.book_append_sheet(wb, wsInc, "Receitas");

    XLSX.writeFile(wb, `financeiro_${startDate}_a_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Relatórios Avançados</h2>
          <p className="text-slate-500 dark:text-slate-400">Analise seu fluxo financeiro em períodos customizados.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors font-medium border border-rose-100 dark:border-rose-800"
          >
            <FileText size={18} />
            PDF
          </button>
          <button 
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors font-medium border border-emerald-100 dark:border-emerald-800"
          >
            <TableIcon size={18} />
            Excel
          </button>
        </div>
      </header>

      {/* Date Selectors */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-end gap-4 transition-colors">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Data Início</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-900 dark:text-slate-100"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Data Fim</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-900 dark:text-slate-100"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Receitas</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">R$ {filteredData.totalIncome.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Despesas</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">R$ {filteredData.totalExpense.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo no Período</p>
            <p className={`text-xl font-bold ${filteredData.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
              R$ {filteredData.balance.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorization Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Gastos no Período</h3>
          <div className="h-[300px]">
            {filteredData.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {filteredData.pieData.map((entry, index) => (
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
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <p>Sem despesas no período selecionado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">Detalhamento</h3>
          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredData.pieData.sort((a,b) => b.value - a.value).map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">R$ {item.value.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                    {((item.value / filteredData.totalExpense) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
            {filteredData.pieData.length === 0 && (
              <p className="text-center text-slate-400 dark:text-slate-500 py-8">Nenhuma despesa para detalhar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
