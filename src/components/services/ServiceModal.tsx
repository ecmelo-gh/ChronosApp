import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, message } from 'antd';
import { Service } from '@/hooks/useServices';

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id' | 'created_at' | 'organization_id'>) => Promise<void>;
  service?: Service;
  categories: string[];
}

export function ServiceModal({
  open,
  onClose,
  onSave,
  service,
  categories,
}: ServiceModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (open && service) {
      form.setFieldsValue(service);
    } else {
      form.resetFields();
    }
  }, [open, service, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSave(values);
      message.success(
        service ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!'
      );
      onClose();
    } catch (err) {
      console.error('Error saving service:', err);
      message.error('Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (value: string) => {
    if (value && !categories.includes(value)) {
      setNewCategory('');
      return value;
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      title={service ? 'Editar Serviço' : 'Novo Serviço'}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          active: true,
          duration: 60,
        }}
      >
        <Form.Item
          name="name"
          label="Nome"
          rules={[{ required: true, message: 'Informe o nome do serviço' }]}
        >
          <Input placeholder="Nome do serviço" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, message: 'Informe a descrição do serviço' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Descrição detalhada do serviço"
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="duration"
            label="Duração (minutos)"
            rules={[{ required: true, message: 'Informe a duração do serviço' }]}
          >
            <InputNumber
              min={1}
              max={480}
              className="w-full"
              placeholder="Duração em minutos"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Preço"
            rules={[{ required: true, message: 'Informe o preço do serviço' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              className="w-full"
              placeholder="Preço do serviço"
              prefix="R$"
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Categoria"
            rules={[{ required: true, message: 'Selecione a categoria' }]}
          >
            <Select
              showSearch
              placeholder="Selecione a categoria"
              options={categories.map((cat) => ({ label: cat, value: cat }))}
              allowClear
              onSearch={setNewCategory}
              onSelect={handleAddCategory}
              notFoundContent={
                newCategory ? (
                  <div className="p-2 text-sm text-gray-600">
                    Pressione Enter para adicionar "{newCategory}"
                  </div>
                ) : null
              }
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="Ativo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
