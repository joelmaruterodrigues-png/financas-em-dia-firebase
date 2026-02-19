export type Category = 
  | 'Água' 
  | 'Alimentação' 
  | 'Benício' 
  | 'Compras Online'
  | 'Ecogis' 
  | 'Energia' 
  | 'Extras' 
  | 'Farmácia' 
  | 'Gasolina C' 
  | 'Gasolina M' 
  | 'Outros'
  | 'Padaria' 
  | 'Telefone';

export type TransactionStatus = 'Pago' | 'Pendente' | 'Atrasado';

export type PaymentMethod = 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto' | 'Débito';

export type TransactionType = 'Fixo' | 'Variável';

export type IncomeType = 'Empresarial' | 'Pessoal';

export interface AccountBalance {
  id: string;
  name: string;
  value: number;
  updatedAt: string;
}

export interface ReserveItem {
  id: string;
  description: string;
  value: number;
}

export interface Expense {
  id: string;
  userId: string;
  descricao: string;
  categoria: Category;
  tipo: TransactionType;
  valor: number;
  dataVencimento: string;
  status: TransactionStatus;
  formaPagamento: PaymentMethod;
  observacoes?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  userId: string;
  fonte: string;
  tipo: IncomeType;
  valor: number;
  dataRecebimento: string;
  observacoes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  nome: string;
}