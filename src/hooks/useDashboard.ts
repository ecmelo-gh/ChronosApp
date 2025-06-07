import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import dayjs from 'dayjs';

interface DashboardMetrics {
  // Métricas gerais
  totalAppointments: number;
  totalCustomers: number;
  totalRevenue: number;
  totalProfessionals: number;

  // Métricas do período
  periodAppointments: number;
  periodRevenue: number;
  appointmentsGrowth: number;
  revenueGrowth: number;

  // Dados para gráficos
  revenueByDay: Array<{ date: string; total: number }>;
  appointmentsByStatus: Array<{ status: string; total: number }>;
  topServices: Array<{ name: string; total: number; revenue: number }>;
  topProfessionals: Array<{ name: string; total: number; revenue: number }>;
}

interface DateRange {
  start: Date;
  end: Date;
}

export function useDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();

  const fetchMetrics = async (period: DateRange): Promise<DashboardMetrics | null> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar total de agendamentos
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id);

      // Buscar total de clientes
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id);

      // Buscar total de profissionais
      const { count: totalProfessionals } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization?.id);

      // Buscar receita total
      const { data: revenueData } = await supabase
        .from('appointments')
        .select('total_amount')
        .eq('organization_id', organization?.id)
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce(
        (sum, app) => sum + (app.total_amount || 0),
        0
      ) || 0;

      // Buscar dados do período
      const { data: periodData } = await supabase
        .from('appointments')
        .select('id, scheduled_at, total_amount, status')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', period.start.toISOString())
        .lte('scheduled_at', period.end.toISOString());

      const periodAppointments = periodData?.length || 0;
      const periodRevenue = periodData?.reduce(
        (sum, app) => sum + (app.total_amount || 0),
        0
      ) || 0;

      // Calcular crescimento (comparando com período anterior)
      const previousStart = dayjs(period.start)
        .subtract(dayjs(period.end).diff(period.start, 'day'), 'day')
        .toDate();

      const { data: previousData } = await supabase
        .from('appointments')
        .select('id, total_amount')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', previousStart.toISOString())
        .lt('scheduled_at', period.start.toISOString());

      const previousAppointments = previousData?.length || 0;
      const previousRevenue = previousData?.reduce(
        (sum, app) => sum + (app.total_amount || 0),
        0
      ) || 0;

      const appointmentsGrowth =
        previousAppointments === 0
          ? 100
          : ((periodAppointments - previousAppointments) / previousAppointments) * 100;

      const revenueGrowth =
        previousRevenue === 0
          ? 100
          : ((periodRevenue - previousRevenue) / previousRevenue) * 100;

      // Buscar dados para gráficos
      const { data: revenueByDay } = await supabase
        .from('appointments')
        .select('scheduled_at, total_amount')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', period.start.toISOString())
        .lte('scheduled_at', period.end.toISOString())
        .order('scheduled_at');

      const { data: appointmentsByStatus } = await supabase
        .from('appointments')
        .select('status')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', period.start.toISOString())
        .lte('scheduled_at', period.end.toISOString());

      const { data: servicesData } = await supabase
        .from('appointments')
        .select('service:service_id(name), total_amount')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', period.start.toISOString())
        .lte('scheduled_at', period.end.toISOString());

      const { data: professionalsData } = await supabase
        .from('appointments')
        .select('professional:professional_id(name), total_amount')
        .eq('organization_id', organization?.id)
        .gte('scheduled_at', period.start.toISOString())
        .lte('scheduled_at', period.end.toISOString());

      // Processar dados para gráficos
      const revenueByDayProcessed = Object.entries(
        revenueByDay?.reduce((acc: any, curr) => {
          const date = dayjs(curr.scheduled_at).format('YYYY-MM-DD');
          acc[date] = (acc[date] || 0) + (curr.total_amount || 0);
          return acc;
        }, {}) || {}
      ).map(([date, total]) => ({ date, total: total as number }));

      const appointmentsByStatusProcessed = Object.entries(
        appointmentsByStatus?.reduce((acc: any, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {}) || {}
      ).map(([status, total]) => ({ status, total: total as number }));

      const topServicesProcessed = Object.values(
        servicesData?.reduce((acc: any, curr) => {
          const name = curr.service?.name || 'Sem serviço';
          if (!acc[name]) {
            acc[name] = { name, total: 0, revenue: 0 };
          }
          acc[name].total += 1;
          acc[name].revenue += curr.total_amount || 0;
          return acc;
        }, {}) || {}
      )
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      const topProfessionalsProcessed = Object.values(
        professionalsData?.reduce((acc: any, curr) => {
          const name = curr.professional?.name || 'Sem profissional';
          if (!acc[name]) {
            acc[name] = { name, total: 0, revenue: 0 };
          }
          acc[name].total += 1;
          acc[name].revenue += curr.total_amount || 0;
          return acc;
        }, {}) || {}
      )
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        totalAppointments: totalAppointments || 0,
        totalCustomers: totalCustomers || 0,
        totalRevenue,
        totalProfessionals: totalProfessionals || 0,
        periodAppointments,
        periodRevenue,
        appointmentsGrowth,
        revenueGrowth,
        revenueByDay: revenueByDayProcessed,
        appointmentsByStatus: appointmentsByStatusProcessed,
        topServices: topServicesProcessed,
        topProfessionals: topProfessionalsProcessed,
      };
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError('Erro ao carregar métricas do dashboard');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchMetrics,
  };
}
