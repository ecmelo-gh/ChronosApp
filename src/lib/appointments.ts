import { supabase } from './supabase';
import type { AppointmentInsert, Appointment } from './supabase';

async function createAppointment(appointment: AppointmentInsert) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles (full_name),
      barbers (name),
      services (name, duration, price)
    `)
    .order('scheduled_for', { ascending: true });

  if (error) throw error;
  return data;
}

async function updateAppointmentStatus(
  id: string, 
  status: 'upcoming' | 'completed' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAvailableTimeSlots(
  barber_id: string,
  date: string
) {
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('scheduled_for, services (duration)')
    .eq('barber_id', barber_id)
    .eq('status', 'upcoming')
    .gte('scheduled_for', `${date}T00:00:00`)
    .lte('scheduled_for', `${date}T23:59:59`);

  if (error) throw error;

  // Business hours: 9:00 AM to 6:00 PM
  const timeSlots = [];
  const startHour = 9;
  const endHour = 18;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Filter out booked slots
  const bookedSlots = new Set(
    appointments?.map(apt => {
      const time = new Date(apt.scheduled_for).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return time;
    })
  );

  return timeSlots.filter(slot => !bookedSlots.has(slot));
}