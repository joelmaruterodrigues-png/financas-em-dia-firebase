import React from 'react';
import { 
  Droplets, Utensils, Baby, Leaf, PlusCircle, 
  Pill, Fuel, Zap, Coffee, Phone, HelpCircle, ShoppingBag 
} from 'lucide-react';
import { Category, IncomeType } from './types';

export const CATEGORIES: { label: Category; icon: React.ReactNode; color: string }[] = [
  { label: 'Água', icon: <Droplets size={18} />, color: '#34D399' },
  { label: 'Alimentação', icon: <Utensils size={18} />, color: '#F87171' },
  { label: 'Benício', icon: <Baby size={18} />, color: '#F472B6' },
  { label: 'Compras Online', icon: <ShoppingBag size={18} />, color: '#6366F1' },
  { label: 'Ecogis', icon: <Leaf size={18} />, color: '#10B981' },
  { label: 'Energia', icon: <Zap size={18} />, color: '#FBBF24' },
  { label: 'Extras', icon: <PlusCircle size={18} />, color: '#A78BFA' },
  { label: 'Farmácia', icon: <Pill size={18} />, color: '#FB7185' },
  { label: 'Gasolina C', icon: <Fuel size={18} />, color: '#FB923C' },
  { label: 'Gasolina M', icon: <Fuel size={18} />, color: '#F59E0B' },
  { label: 'Outros', icon: <HelpCircle size={18} />, color: '#94A3B8' },
  { label: 'Padaria', icon: <Coffee size={18} />, color: '#92400E' },
  { label: 'Telefone', icon: <Phone size={18} />, color: '#60A5FA' },
];

export const INCOME_SOURCES = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'];
export const INCOME_TYPES: IncomeType[] = ['Empresarial', 'Pessoal'];
export const PAYMENT_METHODS = ['Pix', 'Cartão', 'Dinheiro', 'Boleto', 'Débito'];
export const TRANSACTION_TYPES = ['Fixo', 'Variável'];
