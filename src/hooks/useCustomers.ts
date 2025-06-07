import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Customer {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  created_at: string;
  last_appointment?: string;
  total_appointments: number;
  total_spent: number;
}

interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export function useCustomers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('customers')
        .select(`
          *,
          appointments:appointments(
            id,
            scheduled_at,
            total_amount
          )
        `)
        .eq('organization_id', organization?.id)
        .order('name');

      if (err) throw err;

      // Processar dados para incluir métricas
      return data.map((customer: any) => ({
        ...customer,
        total_appointments: customer.appointments?.length || 0,
        last_appointment: customer.appointments?.[0]?.scheduled_at,
        total_spent: customer.appointments?.reduce((sum: number, app: any) => 
          sum + (app.total_amount || 0), 0
        ) || 0,
      }));
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Erro ao carregar clientes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: CreateCustomerData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: customer, error: err } = await supabase
        .from('customers')
        .insert([
          {
            ...data,
            organization_id: organization?.id,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      return customer;
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Erro ao criar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (id: string, data: UpdateCustomerData) => {
    try {
      setLoading(true);
      setError(null);

      const { data: customer, error: err } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (err) throw err;

      return customer;
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('Erro ao atualizar cliente');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se o cliente tem agendamentos
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('customer_id', id)
        .limit(1);

      if (appointmentsError) throw appointmentsError;

      if (appointments?.length > 0) {
        throw new Error('Não é possível excluir um cliente com agendamentos');
      }

      const { error: err } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (err) throw err;

      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir cliente'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('customers')
        .select()
        .eq('organization_id', organization?.id)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('name')
        .limit(10);

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error searching customers:', err);
      setError('Erro ao pesquisar clientes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
  };
}
