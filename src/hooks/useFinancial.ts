import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CREDIT' | 'DEBIT' | 'CASH' | 'PIX';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  description: string;
  category_id: string;
  payment_method: PaymentMethod;
  appointment_id?: string;
  professional_id?: string;
  customer_id?: string;
  created_at: string;
  organization_id: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  parent_id?: string;
  organization_id: string;
}

interface TransactionWithRelations extends Transaction {
  category: Category;
  appointment?: {
    id: string;
    scheduled_at: string;
    service: {
      name: string;
    };
  };
  professional?: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
  };
}

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  search?: string;
}

interface CategoryFilters {
  type?: TransactionType;
  parentId?: string;
  search?: string;
}

interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingIncome: number;
  pendingExpense: number;
  revenueByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  expenseByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  dailyBalance: {
    date: string;
    income: number;
    expense: number;
    balance: number;
  }[];
}

export function useFinancial() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  const fetchTransactions = async (filters?: TransactionFilters): Promise<TransactionWithRelations[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transactions')
        .select(\`
          *,
          category:category_id(*),
          appointment:appointment_id(
            id,
            scheduled_at,
            service:service_id(name)
          ),
          professional:professional_id(id, name),
          customer:customer_id(id, name)
        \`)
        .eq('organization_id', organization?.id);

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters?.search) {
        query = query.or(
          \`description.ilike.%\${filters.search}%,category.name.ilike.%\${filters.search}%\`
        );
      }

      const { data, error: err } = await query.order('date', { ascending: false });

      if (err) throw err;

      return data || [];
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Erro ao carregar transações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (filters?: CategoryFilters): Promise<Category[]> => {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organization?.id);

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.parentId) {
        query = query.eq('parent_id', filters.parentId);
      } else {
        query = query.is('parent_id', null);
      }

      if (filters?.search) {
        query = query.ilike('name', \`%\${filters.search}%\`);
      }

      const { data, error: err } = await query.order('name');

      if (err) throw err;

      return data || [];
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'organization_id'>): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError('Erro ao criar transação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>): Promise<Transaction | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Erro ao atualizar transação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (err) throw err;

      return true;
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Erro ao excluir transação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, 'id' | 'organization_id'>): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('categories')
        .insert({
          ...category,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Erro ao criar categoria');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Erro ao atualizar categoria');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se existem transações usando esta categoria
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (count && count > 0) {
        setError('Não é possível excluir uma categoria que possui transações');
        return false;
      }

      const { error: err } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (err) throw err;

      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Erro ao excluir categoria');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = async (startDate?: string, endDate?: string): Promise<FinancialMetrics> => {
    try {
      let query = supabase
        .from('transactions')
        .select(\`
          *,
          category:category_id(*)
        \`)
        .eq('organization_id', organization?.id)
        .in('status', ['COMPLETED', 'PENDING']);

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data: transactions, error: err } = await query;

      if (err) throw err;

      const metrics: FinancialMetrics = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        pendingIncome: 0,
        pendingExpense: 0,
        revenueByCategory: [],
        expenseByCategory: [],
        dailyBalance: [],
      };

      // Processar transações
      const categoryTotals = new Map<string, { amount: number; name: string }>();
      const dailyTotals = new Map<string, { income: number; expense: number }>();

      transactions?.forEach((transaction) => {
        const amount = transaction.amount;
        const isIncome = transaction.type === 'INCOME';
        const isPending = transaction.status === 'PENDING';
        const category = transaction.category as Category;

        // Totais
        if (isIncome) {
          metrics.totalIncome += amount;
          if (isPending) metrics.pendingIncome += amount;
        } else {
          metrics.totalExpense += amount;
          if (isPending) metrics.pendingExpense += amount;
        }

        // Por categoria
        const categoryKey = \`\${category.id}-\${isIncome ? 'income' : 'expense'}\`;
        const categoryTotal = categoryTotals.get(categoryKey) || { amount: 0, name: category.name };
        categoryTotal.amount += amount;
        categoryTotals.set(categoryKey, categoryTotal);

        // Por dia
        const date = transaction.date.split('T')[0];
        const daily = dailyTotals.get(date) || { income: 0, expense: 0 };
        if (isIncome) {
          daily.income += amount;
        } else {
          daily.expense += amount;
        }
        dailyTotals.set(date, daily);
      });

      // Calcular balanço
      metrics.balance = metrics.totalIncome - metrics.totalExpense;

      // Processar categorias
      const incomeCategories = Array.from(categoryTotals.entries())
        .filter(([key]) => key.endsWith('income'))
        .map(([key, { amount, name }]) => ({
          categoryId: key.split('-')[0],
          categoryName: name,
          amount,
          percentage: (amount / metrics.totalIncome) * 100,
        }));

      const expenseCategories = Array.from(categoryTotals.entries())
        .filter(([key]) => key.endsWith('expense'))
        .map(([key, { amount, name }]) => ({
          categoryId: key.split('-')[0],
          categoryName: name,
          amount,
          percentage: (amount / metrics.totalExpense) * 100,
        }));

      metrics.revenueByCategory = incomeCategories.sort((a, b) => b.amount - a.amount);
      metrics.expenseByCategory = expenseCategories.sort((a, b) => b.amount - a.amount);

      // Processar balanço diário
      metrics.dailyBalance = Array.from(dailyTotals.entries())
        .map(([date, { income, expense }]) => ({
          date,
          income,
          expense,
          balance: income - expense,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return metrics;
    } catch (err) {
      console.error('Error calculating metrics:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    calculateMetrics,
  };
}
