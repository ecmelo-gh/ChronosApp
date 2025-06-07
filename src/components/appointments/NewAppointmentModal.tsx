import { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, TimePicker, Input, Button, Alert } from 'antd';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useOrganization } from '@/hooks/useOrganization';
import moment from 'moment';
import { Database } from '@/types/database';

type Service = Database['public']['Tables']['services']['Row'];
type Professional = Database['public']['Tables']['professionals']['Row'];

interface NewAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date;
}

interface FormValues {
  service_id: string;
  professional_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: moment.Moment;
  time: moment.Moment;
}

export function NewAppointmentModal({ visible, onClose, onSuccess, initialDate }: NewAppointmentModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { services } = useServices();
  const { professionals, getProfessionalAvailability } = useProfessionals();
  const { createAppointment } = useAppointments();
  const { organization } = useOrganization();

  // Resetar form quando modal é aberto
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialDate) {
        form.setFieldsValue({
          date: moment(initialDate),
        });
      }
    }
  }, [visible, initialDate]);

  // Atualizar slots disponíveis quando profissional ou data mudam
  useEffect(() => {
    const updateAvailableSlots = async () => {
      const values = form.getFieldsValue();
      if (values.professional_id && values.date) {
        const date = values.date.toDate();
        const { slots } = await getProfessionalAvailability(values.professional_id, date);
        setAvailableSlots(slots);

        // Se o horário selecionado não está disponível, limpar
        if (values.time && !slots.includes(values.time.format('HH:mm'))) {
          form.setFieldValue('time', undefined);
        }
      }
    };

    updateAvailableSlots();
  }, [form.getFieldValue('professional_id'), form.getFieldValue('date')]);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
    
    // Limpar profissional se não atende este serviço
    const currentProfessionalId = form.getFieldValue('professional_id');
    if (currentProfessionalId) {
      const professional = professionals.find(p => p.id === currentProfessionalId);
      if (!professional?.specialties.includes(service?.category || '')) {
        form.setFieldValue('professional_id', undefined);
        form.setFieldValue('time', undefined);
      }
    }
  };

  const handleProfessionalChange = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    setSelectedProfessional(professional || null);
    form.setFieldValue('time', undefined);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Criar ou buscar cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', values.customer_email)
        .eq('organization_id', organization?.id)
        .single();

      let customerId: string;

      if (customerError) {
        // Cliente não existe, criar novo
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert([{
            organization_id: organization?.id,
            full_name: values.customer_name,
            email: values.customer_email,
            phone: values.customer_phone,
          }])
          .select()
          .single();

        if (createError) throw createError;
        customerId = newCustomer.id;
      } else {
        customerId = customerData.id;
      }

      // Criar agendamento
      const startTime = moment(values.date)
        .hours(values.time.hours())
        .minutes(values.time.minutes())
        .seconds(0)
        .milliseconds(0);

      const endTime = moment(startTime).add(selectedService?.duration || '1 hour');

      await createAppointment({
        service_id: values.service_id,
        professional_id: values.professional_id,
        customer_id: customerId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        price: selectedService?.price || 0,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Novo Agendamento"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: initialDate ? moment(initialDate) : moment(),
        }}
      >
        <Form.Item
          name="service_id"
          label="Serviço"
          rules={[{ required: true, message: 'Selecione o serviço' }]}
        >
          <Select
            placeholder="Selecione o serviço"
            onChange={handleServiceChange}
            options={services.map(service => ({
              value: service.id,
              label: \`\${service.name} - R$ \${service.price.toFixed(2)}\`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="professional_id"
          label="Profissional"
          rules={[{ required: true, message: 'Selecione o profissional' }]}
        >
          <Select
            placeholder="Selecione o profissional"
            onChange={handleProfessionalChange}
            options={professionals
              .filter(prof => 
                !selectedService?.category || 
                prof.specialties.includes(selectedService.category)
              )
              .map(prof => ({
                value: prof.id,
                label: prof.title,
              }))}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="date"
            label="Data"
            rules={[{ required: true, message: 'Selecione a data' }]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              disabledDate={current => current && current < moment().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="time"
            label="Horário"
            rules={[{ required: true, message: 'Selecione o horário' }]}
          >
            <Select
              placeholder="Selecione o horário"
              options={availableSlots.map(slot => ({
                value: slot,
                label: slot,
              }))}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="customer_name"
          label="Nome do Cliente"
          rules={[{ required: true, message: 'Digite o nome do cliente' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="customer_email"
          label="E-mail do Cliente"
          rules={[
            { required: true, message: 'Digite o e-mail do cliente' },
            { type: 'email', message: 'E-mail inválido' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="customer_phone"
          label="Telefone do Cliente"
          rules={[{ required: true, message: 'Digite o telefone do cliente' }]}
        >
          <Input />
        </Form.Item>

        {selectedService && (
          <Alert
            className="mb-4"
            message="Detalhes do Serviço"
            description={\`
              Duração: \${selectedService.duration}
              Preço: R$ \${selectedService.price.toFixed(2)}
            \`}
            type="info"
            showIcon
          />
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Agendar
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
