import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  bio: string;
  avatar_url?: string;
  active: boolean;
  commission_rate: number; // Porcentagem de comissão
  working_hours: {
    [key: string]: { // dia da semana (0-6)
      start: string; // HH:mm
      end: string; // HH:mm
      break_start?: string; // HH:mm
      break_end?: string; // HH:mm
    };
  };
  created_at: string;
  organization_id: string;
}

interface ProfessionalMetrics {
  totalAppointments: number;
  totalRevenue: number;
  totalCommission: number;
  lastAppointment?: string;
  averageRating: number;
  completionRate: number; // Taxa de conclusão de agendamentos
}

interface ProfessionalWithMetrics extends Professional {
  metrics: ProfessionalMetrics;
}

interface ProfessionalFilters {
  search?: string;
  specialty?: string;
  active?: boolean;
}

export function useProfessionals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  const fetchProfessionals = async (filters?: ProfessionalFilters): Promise<ProfessionalWithMetrics[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('professionals')
        .select(`
          *,
          appointments:appointments(
            id,
            scheduled_at,
            total_amount,
            status,
            rating
          )
        `)
        .eq('organization_id', organization?.id);

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      if (typeof filters?.active === 'boolean') {
        query = query.eq('active', filters.active);
      }

      const { data, error: err } = await query.order('name');

      if (err) throw err;

      // Processar métricas para cada profissional
      return (data || []).map((professional) => {
        const appointments = professional.appointments || [];
        const completedAppointments = appointments.filter(
          (app: any) => app.status === 'completed'
        );

        const totalRevenue = completedAppointments.reduce(
          (sum: number, app: any) => sum + (app.total_amount || 0),
          0
        );

        const totalCommission = totalRevenue * (professional.commission_rate / 100);

        const ratings = completedAppointments
          .filter((app: any) => app.rating)
          .map((app: any) => app.rating);

        const metrics: ProfessionalMetrics = {
          totalAppointments: appointments.length,
          totalRevenue,
          totalCommission,
          lastAppointment: appointments.length
            ? appointments.sort((a: any, b: any) =>
                new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
              )[0].scheduled_at
            : undefined,
          averageRating:
            ratings.length > 0
              ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
              : 0,
          completionRate:
            appointments.length > 0
              ? (completedAppointments.length / appointments.length) * 100
              : 0,
        };

        return {
          ...professional,
          metrics,
        };
      });
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Erro ao carregar profissionais');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProfessional = async (professional: Omit<Professional, 'id' | 'created_at' | 'organization_id'>): Promise<Professional | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('professionals')
        .insert({
          ...professional,
          organization_id: organization?.id,
        })
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error creating professional:', err);
      setError('Erro ao criar profissional');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfessional = async (id: string, professional: Partial<Professional>): Promise<Professional | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('professionals')
        .update(professional)
        .eq('id', id)
        .eq('organization_id', organization?.id)
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error updating professional:', err);
      setError('Erro ao atualizar profissional');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessional = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Verificar se existem agendamentos futuros
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', id)
        .gt('scheduled_at', new Date().toISOString());

      if (count && count > 0) {
        setError('Não é possível excluir um profissional com agendamentos futuros');
        return false;
      }

      const { error: err } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (err) throw err;

      return true;
    } catch (err) {
      console.error('Error deleting professional:', err);
      setError('Erro ao excluir profissional');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async (): Promise<string[]> => {
    try {
      const { data, error: err } = await supabase
        .from('professionals')
        .select('specialties')
        .eq('organization_id', organization?.id);

      if (err) throw err;

      // Extrair todas as especialidades únicas
      const allSpecialties = data
        .flatMap((p) => p.specialties || [])
        .filter(Boolean);

      return Array.from(new Set(allSpecialties));
    } catch (err) {
      console.error('Error fetching specialties:', err);
      return [];
    }
  };

  const uploadAvatar = async (id: string, file: File): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;
      const filePath = `${organization?.id}/professionals/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfessional(id, { avatar_url: publicUrl });

      return publicUrl;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Erro ao fazer upload da foto');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    fetchSpecialties,
    uploadAvatar,
  };
}
