import { useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';
import { Database } from '../types/database';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Professional = Database['public']['Tables']['professionals']['Row'];

interface AppointmentWithDetails extends Appointment {
  service: Service;
  professional: Professional;
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
}

interface UseAppointmentsReturn {
  appointments: AppointmentWithDetails[];
  loading: boolean;
  error: PostgrestError | null;
  createAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getAvailableSlots: (professionalId: string, date: Date) => Promise<string[]>;
  loadAppointmentsByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
}

export function useAppointments(): UseAppointmentsReturn {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    if (organization) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      loadAppointmentsByDateRange(today, nextWeek);
    }
  }, [organization]);

  const loadAppointmentsByDateRange = async (startDate: Date, endDate: Date) => {
    if (!organization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(\`
          *,
          service:service_id(*),
          professional:professional_id(*),
          customer:customer_id(full_name, email, phone)
        \`)
        .eq('organization_id', organization.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data as AppointmentWithDetails[]);
    } catch (error) {
      setError(error as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('appointments').insert([
        {
          ...data,
          organization_id: organization?.id,
        },
      ]);

      if (error) throw error;

      // Recarregar agendamentos
      const startDate = new Date(data.start_time);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      await loadAppointmentsByDateRange(startDate, endDate);
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (error) throw error;

      // Recarregar agendamentos
      const startDate = new Date(data.start_time || appointments.find(a => a.id === id)?.start_time || '');
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      await loadAppointmentsByDateRange(startDate, endDate);
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) throw new Error('Appointment not found');

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('organization_id', organization?.id);

      if (error) throw error;

      // Recarregar agendamentos
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      await loadAppointmentsByDateRange(startDate, endDate);
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const getAvailableSlots = async (professionalId: string, date: Date): Promise<string[]> => {
    try {
      // Buscar profissional e seus horários
      const { data: professional, error: profError } = await supabase
        .from('professionals')
        .select('schedule')
        .eq('id', professionalId)
        .single();

      if (profError) throw profError;

      // Buscar agendamentos existentes
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: existingAppointments, error: appError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .eq('organization_id', organization?.id)
        .gte('start_time', dayStart.toISOString())
        .lte('start_time', dayEnd.toISOString())
        .neq('status', 'cancelled');

      if (appError) throw appError;

      // Calcular slots disponíveis
      const dayOfWeek = date.toLocaleLowerCase().split(',')[0];
      const schedule = professional.schedule[dayOfWeek];
      
      if (!schedule) return [];

      const slots: string[] = [];
      const startHour = parseInt(schedule.start.split(':')[0]);
      const endHour = parseInt(schedule.end.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);

        // Verificar se o slot não conflita com agendamentos existentes
        const isAvailable = !existingAppointments.some(
          app => 
            new Date(app.start_time) <= slotDate && 
            new Date(app.end_time) > slotDate
        );

        if (isAvailable) {
          slots.push(timeSlot);
        }
      }

      return slots;
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots,
    loadAppointmentsByDateRange,
  };
}
