import { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
} from 'antd';
import { TagOutlined } from '@ant-design/icons';

import { Category, TransactionType } from '@/hooks/useFinancial';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'organization_id'>) => Promise<void>;
  category?: Category;
  categories: Category[];
}

export function CategoryModal({ open, onClose, onSave, category, categories }: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (category) {
        form.setFieldsValue(category);
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'INCOME',
        });
      }
    }
  }, [open, category]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSave(values);
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const parentCategories = categories.filter(
    (c) => !c.parent_id && (!category || c.id !== category.id)
  );

  return (
    <Modal
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
        >
          Salvar
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Nome"
          rules={[{ required: true, message: 'Informe o nome' }]}
        >
          <Input
            placeholder="Nome da categoria"
            prefix={<TagOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Tipo"
          rules={[{ required: true, message: 'Selecione o tipo' }]}
        >
          <Select
            options={[
              { label: 'Receita', value: 'INCOME' },
              { label: 'Despesa', value: 'EXPENSE' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="parent_id"
          label="Categoria Pai"
        >
          <Select
            placeholder="Selecione a categoria pai"
            allowClear
            options={parentCategories.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
