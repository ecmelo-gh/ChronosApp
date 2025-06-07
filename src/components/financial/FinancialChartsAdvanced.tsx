import { Card, Col, Row, Empty, Spin, Select } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { Transaction, TransactionStatus, PaymentMethod } from '@/hooks/useFinancial';
import { formatCurrency } from '@/utils/format';
import dayjs from 'dayjs';
import { useState, useMemo } from 'react';

// Cores para os gráficos
const COLORS = {
  income: '#3f8600',
  expense: '#cf1322',
  balance: '#1890ff',
  pending: '#faad14',
  completed: '#52c41a',
  cancelled: '#ff4d4f',
  credit: '#722ed1',
  debit: '#13c2c2',
  cash: '#fa541c',
  pix: '#1890ff',
};

interface FinancialChartsAdvancedProps {
  transactions: Transaction[];
  loading?: boolean;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function FinancialChartsAdvanced({ transactions, loading, dateRange }: FinancialChartsAdvancedProps) {
  const [projectionMonths, setProjectionMonths] = useState(3);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!transactions.length) {
    return <Empty description="Nenhuma transação encontrada no período" />;
  }

  // Prepara dados para análise por status
  const statusData = prepareStatusData(transactions);

  // Prepara dados para análise por forma de pagamento
  const paymentData = preparePaymentData(transactions);

  // Prepara dados para projeções
  const projectionData = useMemo(() => 
    prepareProjectionData(transactions, dateRange, projectionMonths),
    [transactions, dateRange, projectionMonths]
  );

  return (
    <Row gutter={[16, 16]}>
      {/* Análise por Status */}
      <Col span={24}>
        <Card title="Análise por Status">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar
                  dataKey="pending"
                  name="Pendente"
                  stackId="status"
                  fill={COLORS.pending}
                />
                <Bar
                  dataKey="completed"
                  name="Concluído"
                  stackId="status"
                  fill={COLORS.completed}
                />
                <Bar
                  dataKey="cancelled"
                  name="Cancelado"
                  stackId="status"
                  fill={COLORS.cancelled}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Análise por Forma de Pagamento */}
      <Col span={24}>
        <Card title="Análise por Forma de Pagamento">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => \`\${value}%\`} />
                <Tooltip
                  formatter={(value: number, name) => 
                    name === 'percentage' ? \`\${value}%\` : formatCurrency(value)
                  }
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="amount"
                  name="Valor"
                  fill={COLORS.balance}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="percentage"
                  name="Percentual"
                  stroke={COLORS.income}
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Projeções */}
      <Col span={24}>
        <Card 
          title="Projeções Financeiras"
          extra={
            <Select
              value={projectionMonths}
              onChange={setProjectionMonths}
              options={[
                { label: '3 meses', value: 3 },
                { label: '6 meses', value: 6 },
                { label: '12 meses', value: 12 },
              ]}
              style={{ width: 120 }}
            />
          }
        >
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Realizado"
                  stroke={COLORS.balance}
                  fill={COLORS.balance}
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="Projeção"
                  stroke={COLORS.income}
                  fill={COLORS.income}
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

// Funções auxiliares para preparar os dados
function prepareStatusData(transactions: Transaction[]) {
  const data = {
    INCOME: { type: 'Receitas', pending: 0, completed: 0, cancelled: 0 },
    EXPENSE: { type: 'Despesas', pending: 0, completed: 0, cancelled: 0 },
  };

  transactions.forEach((transaction) => {
    const statusMap = {
      PENDING: 'pending',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };
    const statusKey = statusMap[transaction.status as TransactionStatus];
    data[transaction.type][statusKey] += transaction.amount;
  });

  return Object.values(data);
}

function preparePaymentData(transactions: Transaction[]) {
  const methodMap: { [key: string]: { amount: number; count: number } } = {
    CREDIT: { amount: 0, count: 0 },
    DEBIT: { amount: 0, count: 0 },
    CASH: { amount: 0, count: 0 },
    PIX: { amount: 0, count: 0 },
  };

  const methodLabels: { [key in PaymentMethod]: string } = {
    CREDIT: 'Crédito',
    DEBIT: 'Débito',
    CASH: 'Dinheiro',
    PIX: 'PIX',
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  transactions.forEach((transaction) => {
    if (transaction.payment_method) {
      methodMap[transaction.payment_method].amount += transaction.amount;
      methodMap[transaction.payment_method].count++;
    }
  });

  return Object.entries(methodMap).map(([method, data]) => ({
    method: methodLabels[method as PaymentMethod],
    amount: data.amount,
    percentage: total > 0 ? (data.amount / total) * 100 : 0,
  }));
}

function prepareProjectionData(
  transactions: Transaction[],
  dateRange: [dayjs.Dayjs, dayjs.Dayjs],
  projectionMonths: number
) {
  const monthlyData: { [key: string]: number } = {};
  
  // Agrupa transações por mês
  transactions.forEach((transaction) => {
    const monthKey = dayjs(transaction.date).format('YYYY-MM');
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + transaction.amount;
  });

  // Calcula média móvel dos últimos 3 meses
  const monthKeys = Object.keys(monthlyData).sort();
  const movingAverage = monthKeys.reduce((acc, key, index, arr) => {
    if (index >= 2) {
      const sum = monthlyData[arr[index]] + monthlyData[arr[index - 1]] + monthlyData[arr[index - 2]];
      acc[key] = sum / 3;
    }
    return acc;
  }, {} as { [key: string]: number });

  // Gera projeções
  const result = [];
  let currentDate = dateRange[0].startOf('month');
  const endDate = dateRange[1].endOf('month').add(projectionMonths, 'month');

  while (currentDate.isBefore(endDate)) {
    const monthKey = currentDate.format('YYYY-MM');
    const monthLabel = currentDate.format('MMM/YY');
    
    const isProjection = currentDate.isAfter(dateRange[1]);
    const lastActualMonth = Object.keys(movingAverage).sort().pop();
    const baseValue = lastActualMonth ? movingAverage[lastActualMonth] : 0;
    
    result.push({
      month: monthLabel,
      actual: isProjection ? null : (monthlyData[monthKey] || 0),
      projected: isProjection ? baseValue * (1 + 0.05) : null, // Crescimento projetado de 5% ao mês
    });

    currentDate = currentDate.add(1, 'month');
  }

  return result;
}
