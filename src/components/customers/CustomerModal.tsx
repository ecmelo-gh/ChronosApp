import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useCustomers } from '@/hooks/useCustomers';

interface CustomerModalProps {
  visible: boolean;
  customer?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerModal({
  visible,
  customer,
  onClose,
  onSuccess,
}: CustomerModalProps) {
  const [form] = Form.useForm();
  const { loading, createCustomer, updateCustomer } = useCustomers();

  useEffect(() => {
    if (visible && customer) {
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: customer.notes,
      });
    } else {
      form.resetFields();
    }
  }, [visible, customer, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (customer) {
        // Atualizar cliente existente
        const updated = await updateCustomer(customer.id, values);
        if (updated) {
          message.success('Cliente atualizado com sucesso!');
          onSuccess();
        }
      } else {
        // Criar novo cliente
        const created = await createCustomer(values);
        if (created) {
          message.success('Cliente criado com sucesso!');
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Form validation error:', err);
    }
  };

  return (
    <Modal
      title={customer ? 'Editar Cliente' : 'Novo Cliente'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText={customer ? 'Atualizar' : 'Criar'}
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Nome"
          rules={[{ required: true, message: 'Digite o nome do cliente' }]}
        >
          <Input placeholder="Nome completo" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Digite o email do cliente' },
            { type: 'email', message: 'Email inválido' },
          ]}
        >
          <Input placeholder="email@exemplo.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Telefone"
          rules={[{ required: true, message: 'Digite o telefone do cliente' }]}
        >
          <Input placeholder="(00) 00000-0000" />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Observações"
        >
          <Input.TextArea
            placeholder="Observações sobre o cliente..."
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
