
import { useState, useEffect } from 'react';
import { Expense, Income, AccountBalance, ReserveItem } from '../types';

const DEFAULT_ACCOUNTS = [
  "Conta Viacredi PF", "Aplicação Viacredi PF", "Cotas Capitais PF",
  "Conta Viacredi PJ", "Aplicação Viacredi PJ", "Cotas Capitais PJ",
  "Investimentos", "Conta CEF Joelma", "Conta BB André", "Dinheiro"
];

export function useFinance() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [reserves, setReserves] = useState<ReserveItem[]>([]);
  const [monthlyExpenseGoal, setMonthlyExpenseGoal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedExpenses = localStorage.getItem('fin_expenses');
    const storedIncomes = localStorage.getItem('fin_incomes');
    const storedBalances = localStorage.getItem('fin_balances');
    const storedReserves = localStorage.getItem('fin_reserves');
    const storedGoal = localStorage.getItem('fin_expense_goal');

    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    if (storedIncomes) setIncomes(JSON.parse(storedIncomes));
    if (storedReserves) setReserves(JSON.parse(storedReserves));
    if (storedGoal) setMonthlyExpenseGoal(parseFloat(storedGoal));
    
    if (storedBalances) {
      setAccountBalances(JSON.parse(storedBalances));
    } else {
      const initialBalances: AccountBalance[] = DEFAULT_ACCOUNTS.map(name => ({
        id: crypto.randomUUID(),
        name,
        value: 0,
        updatedAt: new Date().toISOString()
      }));
      setAccountBalances(initialBalances);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('fin_expenses', JSON.stringify(expenses));
      localStorage.setItem('fin_incomes', JSON.stringify(incomes));
      localStorage.setItem('fin_balances', JSON.stringify(accountBalances));
      localStorage.setItem('fin_reserves', JSON.stringify(reserves));
      localStorage.setItem('fin_expense_goal', monthlyExpenseGoal.toString());
    }
  }, [expenses, incomes, accountBalances, reserves, monthlyExpenseGoal, loading]);

  const updateAccountBalance = (id: string, newValue: number) => {
    setAccountBalances(prev => prev.map(acc => 
      acc.id === id ? { ...acc, value: newValue, updatedAt: new Date().toISOString() } : acc
    ));
  };

  const addReserve = (description: string, value: number) => {
    setReserves(prev => [...prev, { id: crypto.randomUUID(), description, value }]);
  };

  const removeReserve = (id: string) => {
    setReserves(prev => prev.filter(r => r.id !== id));
  };

  const updateReserve = (id: string, description: string, value: number) => {
    setReserves(prev => prev.map(r => r.id === id ? { ...r, description, value } : r));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      userId: 'user-1',
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const addIncome = (income: Omit<Income, 'id' | 'createdAt' | 'userId'>) => {
    const newIncome: Income = {
      ...income,
      id: crypto.randomUUID(),
      userId: 'user-1',
      createdAt: new Date().toISOString()
    };
    setIncomes(prev => [...prev, newIncome]);
  };

  const removeIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const importBackup = (data: any) => {
    if (data.expenses) setExpenses(data.expenses);
    if (data.incomes) setIncomes(data.incomes);
    if (data.balances) setAccountBalances(data.balances);
    if (data.reserves) setReserves(data.reserves);
    if (data.monthlyExpenseGoal) setMonthlyExpenseGoal(data.monthlyExpenseGoal);
  };

  return {
    expenses,
    incomes,
    accountBalances,
    reserves,
    monthlyExpenseGoal,
    setMonthlyExpenseGoal,
    loading,
    addExpense,
    removeExpense,
    updateExpense,
    addIncome,
    removeIncome,
    updateAccountBalance,
    addReserve,
    removeReserve,
    updateReserve,
    importBackup
  };
}
