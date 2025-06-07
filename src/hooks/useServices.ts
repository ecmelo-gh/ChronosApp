import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  category: string;
  active: boolean;
  created_at: string;
  organization_id: string;
}

interface ServiceMetrics {
  totalAppointments: number;
  totalRevenue: number;
  lastAppointment?: string;
}

interface ServiceWithMetrics extends Service {
  metrics: ServiceMetrics;
}

interface ServiceFilters {
  search?: string;
  category?: string;
  active?: boolean;
}

export function useServices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  const fetchServices = async (filters?: ServiceFilters): Promise<ServiceWithMetrics[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('services')
        .select(`
          *,
          appointments:appointments(
            id,
            scheduled_at,
            total_amount,
            status
          )
        `)
        .eq('organization_id', organization?.id);

      // Aplicar filtros
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (typeof filters?.active === 'boolean') {
        query = query.eq('active', filters.active);
      }

      const { data, error: err } = await query.order('name');

      if (err) throw err;

      // Processar métricas para cada serviço
      return (data || []).map((service) => {
        const appointments = service.appointments || [];
        const completedAppointments = appointments.filter(
          (app: any) => app.status === 'completed'
        );

        const metrics: ServiceMetrics = {
          totalAppointments: appointments.length,
          totalRevenue: completedAppointments.reduce(
            (sum: number, app: any) => sum + (app.total_amount || 0),
            0
          ),
          lastAppointment: appointments.length
            ? appointments.sort((a: any, b: any) =>
                new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
              )[0].scheduled_at
            : undefined,
        };

        return {
          ...service,
          metrics,
        };
      });
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Erro ao carregar serviços');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createService = async (service: Omit<Service, 'id' | 'created_at' | 'organization_id'>): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('services')
        .insert({
          ...service,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error creating service:', err);
      setError('Erro ao criar serviço');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: string, service: Partial<Service>): Promise<Service | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Erro ao atualizar serviço');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se existem agendamentos para este serviço
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('service_id', id);

      if (count && count > 0) {
        setError('Não é possível excluir um serviço que possui agendamentos');
        return false;
      }

      const { error: err } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (err) throw err;

      return true;
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Erro ao excluir serviço');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (): Promise<string[]> => {
    try {
      const { data, error: err } = await supabase
        .from('services')
        .select('category')
        .eq('organization_id', organization?.id)
        .not('category', 'is', null);

      if (err) throw err;

      // Retornar categorias únicas
      return Array.from(new Set(data.map((s) => s.category)));
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchCategories,
  };
}
