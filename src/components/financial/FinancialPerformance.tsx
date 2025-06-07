import { Card, Col, Row, Empty, Spin, Statistic, Select } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Transaction } from '@/hooks/useFinancial';
import { formatCurrency } from '@/utils/format';
import dayjs from 'dayjs';
import { useState, useMemo } from 'react';

// Cores para os gráficos
const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa541c',
  blue: '#1890ff',
};

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#fa541c'];

interface Professional {
  id: string;
  name: string;
  commission: number;
  services: string[];
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface FinancialPerformanceProps {
  transactions: Transaction[];
  loading?: boolean;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function FinancialPerformance({ transactions, loading, dateRange }: FinancialPerformanceProps) {
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Mock data - Em produção, isso viria do backend
  const professionals: Professional[] = [
    { id: '1', name: 'Dr. João Silva', commission: 0.3, services: ['1', '2'] },
    { id: '2', name: 'Dra. Maria Santos', commission: 0.35, services: ['1', '3'] },
    { id: '3', name: 'Dr. Pedro Costa', commission: 0.25, services: ['2', '3'] },
  ];

  const services: Service[] = [
    { id: '1', name: 'Consulta Regular', price: 200, duration: 30 },
    { id: '2', name: 'Tratamento Específico', price: 350, duration: 45 },
    { id: '3', name: 'Avaliação Completa', price: 500, duration: 60 },
  ];

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

  // Prepara dados para faturamento por profissional
  const revenueByProfessional = prepareRevenueByProfessional(transactions, professionals);

  // Prepara dados para mix de serviços
  const servicesMix = prepareServicesMix(transactions, services);

  // Prepara dados para evolução individual
  const individualEvolution = prepareIndividualEvolution(
    transactions,
    professionals,
    selectedProfessional,
    timeframe
  );

  // Prepara dados para horários de pico
  const peakHours = preparePeakHours(transactions);

  // Calcula KPIs
  const kpis = calculateKPIs(transactions, professionals, services);

  return (
    <Row gutter={[16, 16]}>
      {/* KPIs */}
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Taxa de Conversão"
                value={kpis.conversionRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: COLORS.primary }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ticket Médio"
                value={kpis.averageTicket}
                precision={2}
                prefix="R$"
                valueStyle={{ color: COLORS.success }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Ocupação"
                value={kpis.occupancyRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: COLORS.warning }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Satisfação"
                value={kpis.satisfactionRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: COLORS.purple }}
              />
            </Card>
          </Col>
        </Row>
      </Col>

      {/* Faturamento por Profissional */}
      <Col span={12}>
        <Card title="Faturamento por Profissional">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByProfessional}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="revenue" name="Faturamento" fill={COLORS.primary} />
                <Bar dataKey="commission" name="Comissão" fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Mix de Serviços */}
      <Col span={12}>
        <Card title="Mix de Serviços">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicesMix}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry) => \`\${entry.name} (\${entry.percentage}%)\`}
                >
                  {servicesMix.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Evolução Individual */}
      <Col span={24}>
        <Card
          title="Evolução Individual"
          extra={
            <div className="flex gap-4">
              <Select
                placeholder="Selecione um profissional"
                value={selectedProfessional}
                onChange={setSelectedProfessional}
                style={{ width: 200 }}
                options={professionals.map(p => ({ label: p.name, value: p.id }))}
              />
              <Select
                value={timeframe}
                onChange={setTimeframe}
                style={{ width: 120 }}
                options={[
                  { label: 'Diário', value: 'daily' },
                  { label: 'Semanal', value: 'weekly' },
                  { label: 'Mensal', value: 'monthly' },
                ]}
              />
            </div>
          }
        >
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={individualEvolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => \`\${value}%\`} />
                <Tooltip
                  formatter={(value: number, name) => 
                    name === 'occupancy' ? \`\${value}%\` : formatCurrency(value)
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Faturamento"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupancy"
                  name="Ocupação"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Horários de Pico */}
      <Col span={24}>
        <Card title="Horários de Pico">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="appointments"
                  name="Atendimentos"
                  fill={COLORS.primary}
                />
                <Bar
                  dataKey="revenue"
                  name="Faturamento"
                  fill={COLORS.success}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
}

// Funções auxiliares para preparar os dados
function prepareRevenueByProfessional(transactions: Transaction[], professionals: Professional[]) {
  const data = professionals.map(professional => ({
    name: professional.name,
    revenue: Math.random() * 10000, // Mock - substituir por dados reais
    commission: Math.random() * 3000, // Mock - substituir por dados reais
  }));

  return data;
}

function prepareServicesMix(transactions: Transaction[], services: Service[]) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  return services.map(service => ({
    name: service.name,
    value: Math.random() * total, // Mock - substituir por dados reais
    percentage: Math.floor(Math.random() * 100), // Mock - substituir por dados reais
  }));
}

function prepareIndividualEvolution(
  transactions: Transaction[],
  professionals: Professional[],
  selectedProfessional: string | null,
  timeframe: 'daily' | 'weekly' | 'monthly'
) {
  // Mock - substituir por dados reais
  const periods = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : 6;
  const data = [];

  for (let i = 0; i < periods; i++) {
    data.push({
      period: \`Período \${i + 1}\`,
      revenue: Math.random() * 5000,
      occupancy: Math.floor(Math.random() * 100),
    });
  }

  return data;
}

function preparePeakHours(transactions: Transaction[]) {
  // Mock - substituir por dados reais
  const data = [];
  for (let hour = 8; hour <= 20; hour++) {
    data.push({
      hour: \`\${hour}:00\`,
      appointments: Math.floor(Math.random() * 10),
      revenue: Math.random() * 1000,
    });
  }
  return data;
}

function calculateKPIs(transactions: Transaction[], professionals: Professional[], services: Service[]) {
  // Mock - substituir por dados reais
  return {
    conversionRate: 75.5,
    averageTicket: 350.0,
    occupancyRate: 82.3,
    satisfactionRate: 94.7,
  };
}
