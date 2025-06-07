import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { Button, Card, Select, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface AppointmentEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    professional: string;
    service: string;
    customer: string;
    status: string;
  };
}

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('week');
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');

  const { appointments, loading: loadingAppointments, loadAppointmentsByDateRange } = useAppointments();
  const { professionals, loading: loadingProfessionals } = useProfessionals();
  const { services } = useServices();

  useEffect(() => {
    const start = moment(selectedDate).startOf(selectedView).toDate();
    const end = moment(selectedDate).endOf(selectedView).toDate();
    loadAppointmentsByDateRange(start, end);
  }, [selectedDate, selectedView, selectedProfessional]);

  useEffect(() => {
    const formattedEvents = appointments
      .filter(app => 
        selectedProfessional === 'all' || 
        app.professional_id === selectedProfessional
      )
      .map(app => ({
        id: app.id,
        title: \`\${app.service.name} - \${app.customer.full_name}\`,
        start: new Date(app.start_time),
        end: new Date(app.end_time),
        resource: {
          professional: app.professional.title,
          service: app.service.name,
          customer: app.customer.full_name,
          status: app.status,
        },
      }));

    setEvents(formattedEvents);
  }, [appointments, selectedProfessional]);

  const handleNavigate = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setSelectedView(newView);
  };

  if (loadingAppointments || loadingProfessionals) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <Select
          className="w-64"
          placeholder="Filtrar por profissional"
          value={selectedProfessional}
          onChange={setSelectedProfessional}
          options={[
            { value: 'all', label: 'Todos os profissionais' },
            ...professionals.map(prof => ({
              value: prof.id,
              label: prof.title,
            })),
          ]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // Abrir modal de novo agendamento
          }}
        >
          Novo Agendamento
        </Button>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 250px)' }}
        date={selectedDate}
        view={selectedView}
        onNavigate={handleNavigate}
        onView={handleViewChange as any}
        tooltipAccessor={event => \`
          Profissional: \${event.resource.professional}
          Serviço: \${event.resource.service}
          Cliente: \${event.resource.customer}
          Status: \${event.resource.status}
        \`}
        messages={{
          today: 'Hoje',
          previous: 'Anterior',
          next: 'Próximo',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
        }}
      />
    </Card>
  );
}
