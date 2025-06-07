import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Button,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { Transaction, TransactionType, PaymentMethod, TransactionStatus, Category } from '@/hooks/useFinancial';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useCustomers } from '@/hooks/useCustomers';
import { formatCurrency } from '@/utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'created_at' | 'organization_id'>) => Promise<void>;
  transaction?: Transaction;
  categories: Category[];
}

export function TransactionModal({ open, onClose, onSave, transaction, categories }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(
    transaction?.type || 'INCOME'
  );

  const { fetchProfessionals } = useProfessionals();
  const { fetchCustomers } = useCustomers();
  const [professionals, setProfessionals] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (open) {
      loadRelatedData();
      if (transaction) {
        form.setFieldsValue({
          ...transaction,
          date: dayjs(transaction.date),
        });
        setTransactionType(transaction.type);
      } else {
        form.resetFields();
        form.setFieldsValue({
          type: 'INCOME',
          status: 'PENDING',
          date: dayjs(),
        });
      }
    }
  }, [open, transaction]);

  const loadRelatedData = async () => {
    const [professionalsData, customersData] = await Promise.all([
      fetchProfessionals(),
      fetchCustomers(),
    ]);

    setProfessionals(professionalsData);
    setCustomers(customersData);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      await onSave({
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      });
      
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) => category.type === transactionType
  );

  return (
    <Modal
      title={transaction ? 'Editar Transação' : 'Nova Transação'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Salvar
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <div className="grid grid-cols-2 gap-4">
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
              onChange={(value) => setTransactionType(value)}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Selecione o status' }]}
          >
            <Select
              options={[
                { label: 'Pendente', value: 'PENDING' },
                { label: 'Concluído', value: 'COMPLETED' },
                { label: 'Cancelado', value: 'CANCELLED' },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="amount"
            label="Valor"
            rules={[{ required: true, message: 'Informe o valor' }]}
          >
            <InputNumber
              className="w-full"
              prefix={<DollarOutlined />}
              precision={2}
              min={0}
              formatter={(value) =>
                value ? formatCurrency(value, { symbol: false }) : ''
              }
              parser={(value) => {
                const parsed = parseFloat(value!.replace(/\D/g, '')) / 100;
                return isNaN(parsed) ? 0 : parsed;
              }}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Data"
            rules={[{ required: true, message: 'Selecione a data' }]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Selecione a data"
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="category_id"
          label="Categoria"
          rules={[{ required: true, message: 'Selecione a categoria' }]}
        >
          <Select
            placeholder="Selecione a categoria"
            options={filteredCategories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            suffixIcon={<TagOutlined />}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="payment_method"
          label="Forma de Pagamento"
          rules={[{ required: true, message: 'Selecione a forma de pagamento' }]}
        >
          <Select
            placeholder="Selecione a forma de pagamento"
            options={[
              { label: 'Cartão de Crédito', value: 'CREDIT' },
              { label: 'Cartão de Débito', value: 'DEBIT' },
              { label: 'Dinheiro', value: 'CASH' },
              { label: 'PIX', value: 'PIX' },
            ]}
            suffixIcon={<CreditCardOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, message: 'Informe a descrição' }]}
        >
          <Input.TextArea
            placeholder="Descreva a transação"
            rows={3}
          />
        </Form.Item>

        <Divider />

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="professional_id"
            label="Profissional"
          >
            <Select
              placeholder="Selecione o profissional"
              allowClear
              options={professionals.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
              suffixIcon={<UserOutlined />}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="customer_id"
            label="Cliente"
          >
            <Select
              placeholder="Selecione o cliente"
              allowClear
              options={customers.map((c: any) => ({
                label: c.name,
                value: c.id,
              }))}
              suffixIcon={<UserOutlined />}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
