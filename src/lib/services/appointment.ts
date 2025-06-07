import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendWhatsAppMessage } from '../whatsapp';
import { dbActions } from '../db/client';
import { logError } from '../errorLogging';

export interface AppointmentNotification {
  customerId: string;
  serviceId: string;
  appointmentDate: Date;
  professionalId: string;
  establishmentId: string;
  userId: string;
}

type AppointmentWithRelations = NonNullable<Awaited<ReturnType<typeof dbActions.appointments.findById>>>

export async function sendAppointmentConfirmation({
  customerId,
  serviceId,
  appointmentDate,
  professionalId,
  establishmentId,
  userId
}: AppointmentNotification) {
  try {
    // Get all required data
    const [customer, service, professional, establishment] = await Promise.all([
      dbActions.customers.findById(customerId),
      dbActions.services.findById(serviceId),
      dbActions.professionals.findById(professionalId),
      dbActions.establishments.findById(establishmentId)
    ]);

    if (!customer?.phone) {
      console.warn('Customer has no phone number:', customerId);
      return;
    }

    if (!service || !professional || !establishment) {
      throw new Error('Missing required data for appointment confirmation');
    }

    // Format date and time
    const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
    const formattedTime = format(appointmentDate, 'HH:mm');

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: customer.phone,
      template: 'appointment_confirmation',
      params: {
        customerName: customer.full_name,
        serviceName: service.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        professionalName: professional.name,
        establishmentName: establishment.name,
        establishmentAddress: establishment.address
      }
    });
  } catch (error) {
    logError({
      error,
      context: 'sendAppointmentConfirmation',
      metadata: { customerId, serviceId, appointmentDate }
    });
  }
}

export async function scheduleAppointmentReminder({
  customerId,
  serviceId,
  appointmentDate,
  professionalId,
  establishmentId,
  userId
}: AppointmentNotification & { userId: string }) {
  try {
    // Schedule reminder for 24h before
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // Add to job queue
    await dbActions.jobs.create({
      type: 'appointment-reminder',
      data: {
        customerId,
        serviceId,
        appointmentDate,
        professionalId,
        establishmentId,
        userId
      },
      runAt: reminderDate,
      userId
    });
  } catch (error) {
    logError({
      error,
      context: 'scheduleAppointmentReminder',
      metadata: { customerId, serviceId, appointmentDate }
    });
  }
}

export async function sendAppointmentReminder({
  customerId,
  serviceId,
  appointmentDate,
  userId
}: AppointmentNotification & { userId: string }) {
  try {
    const [customer, service] = await Promise.all([
      dbActions.customers.findById(customerId),
      dbActions.services.findById(serviceId)
    ]);

    if (!customer?.phone) {
      console.warn('Customer has no phone number:', customerId);
      return;
    }

    if (!service) {
      throw new Error('Service not found');
    }

    // Format date and time
    const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
    const formattedTime = format(appointmentDate, 'HH:mm');

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: customer.phone,
      template: 'appointment_reminder',
      params: {
        customerName: customer.full_name,
        serviceName: service.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime
      }
    });
  } catch (error) {
    logError({
      error,
      context: 'sendAppointmentReminder',
      metadata: { customerId, serviceId, appointmentDate }
    });
  }
}

export async function sendAppointmentRescheduled({
  customerId,
  serviceId,
  oldDate,
  newDate,
  professionalId,
  establishmentId,
  userId
}: AppointmentNotification & { oldDate: Date, newDate: Date, userId: string }) {
  try {
    // Get all required data
    const [customer, service, professional, establishment] = await Promise.all([
      dbActions.customers.findById(customerId),
      dbActions.services.findById(serviceId),
      dbActions.professionals.findById(professionalId),
      dbActions.establishments.findById(establishmentId)
    ]);

    if (!customer?.phone) {
      console.warn('Customer has no phone number:', customerId);
      return;
    }

    if (!service || !professional || !establishment) {
      throw new Error('Missing required data for appointment rescheduling');
    }

    // Format dates and times
    const formattedOldDate = format(oldDate, "dd 'de' MMMM", { locale: ptBR });
    const formattedOldTime = format(oldDate, 'HH:mm');
    const formattedNewDate = format(newDate, "dd 'de' MMMM", { locale: ptBR });
    const formattedNewTime = format(newDate, 'HH:mm');

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: customer.phone,
      template: 'appointment_rescheduling',
      params: {
        customerName: customer.full_name,
        serviceName: service.name,
        oldDate: formattedOldDate,
        oldTime: formattedOldTime,
        newDate: formattedNewDate,
        newTime: formattedNewTime,
        professionalName: professional.name,
        establishmentName: establishment.name,
        establishmentAddress: establishment.address
      }
    });

    // Schedule new reminder
    await scheduleAppointmentReminder({
      customerId,
      serviceId,
      appointmentDate: newDate,
      professionalId,
      establishmentId,
      userId
    });
  } catch (error) {
    logError({
      error,
      context: 'sendAppointmentRescheduled',
      metadata: { customerId, serviceId, oldDate, newDate }
    });
  }
}

export async function sendAppointmentCancellation({
  customerId,
  serviceId,
  appointmentDate,
  reason,
    userId
}: AppointmentNotification & { reason: string, userId: string }) {
  try {
    const [customer, service] = await Promise.all([
      dbActions.customers.findById(customerId),
      dbActions.services.findById(serviceId)
    ]);

    if (!customer?.phone) {
      console.warn('Customer has no phone number:', customerId);
      return;
    }

    if (!service) {
      throw new Error('Service not found');
    }

    // Format date and time
    const formattedDate = format(appointmentDate, "dd 'de' MMMM", { locale: ptBR });
    const formattedTime = format(appointmentDate, 'HH:mm');

    // Send WhatsApp message
    await sendWhatsAppMessage({
      to: customer.phone,
      template: 'appointment_cancellation',
      params: {
        customerName: customer.full_name,
        serviceName: service.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        cancellationReason: reason
      }
    });
  } catch (error) {
    logError({
      error,
      context: 'sendAppointmentCancellation',
      metadata: { customerId, serviceId, appointmentDate, reason }
    });
  }
}
