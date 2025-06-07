import { Card, Col, Row, Empty, Spin } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Transaction, Category } from '@/hooks/useFinancial';
import { formatCurrency } from '@/utils/format';
import dayjs from 'dayjs';

// Cores para os gráficos
const COLORS = {
  income: '#3f8600',
  expense: '#cf1322',
  balance: '#1890ff',
  pieColors: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#fa541c', '#a0d911'],
};

interface FinancialChartsProps {
  transactions: Transaction[];
  categories: Category[];
  loading?: boolean;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function FinancialCharts({ transactions, categories, loading, dateRange }: FinancialChartsProps) {
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

  // Prepara dados para o gráfico de evolução
  const evolutionData = prepareEvolutionData(transactions, dateRange);

  // Prepara dados para os gráficos de categoria
  const { incomeByCategory, expenseByCategory } = prepareCategoryData(transactions, categories);

  // Prepara dados para o comparativo mensal
  const monthlyComparison = prepareMonthlyComparison(transactions, dateRange);

  return (
    <Row gutter={[16, 16]}>
      {/* Gráfico de Evolução */}
      <Col span={24}>
        <Card title="Evolução no Tempo">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={COLORS.income}
                  name="Receitas"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke={COLORS.expense}
                  name="Despesas"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={COLORS.balance}
                  name="Saldo"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Gráficos de Categoria */}
      <Col xs={24} lg={12}>
        <Card title="Receitas por Categoria">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={renderCustomizedLabel}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Despesas por Categoria">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={renderCustomizedLabel}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      {/* Comparativo Mensal */}
      <Col span={24}>
        <Card title="Comparativo Mensal">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" name="Receitas" fill={COLORS.income} />
                <Bar dataKey="expense" name="Despesas" fill={COLORS.expense} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={COLORS.balance}
                  name="Saldo"
                  strokeWidth={2}
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
function prepareEvolutionData(transactions: Transaction[], dateRange: [dayjs.Dayjs, dayjs.Dayjs]) {
  const dailyData: { [key: string]: { income: number; expense: number } } = {};
  const startDate = dateRange[0];
  const endDate = dateRange[1];

  // Inicializa todos os dias do período
  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    dailyData[dateStr] = { income: 0, expense: 0 };
    currentDate = currentDate.add(1, 'day');
  }

  // Soma transações por dia
  transactions.forEach((transaction) => {
    const dateStr = dayjs(transaction.date).format('YYYY-MM-DD');
    if (dailyData[dateStr]) {
      if (transaction.type === 'INCOME') {
        dailyData[dateStr].income += transaction.amount;
      } else {
        dailyData[dateStr].expense += transaction.amount;
      }
    }
  });

  // Converte para array e calcula saldo
  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    income: data.income,
    expense: data.expense,
    balance: data.income - data.expense,
  }));
}

function prepareCategoryData(transactions: Transaction[], categories: Category[]) {
  const incomeByCategory: { [key: string]: number } = {};
  const expenseByCategory: { [key: string]: number } = {};

  transactions.forEach((transaction) => {
    const category = categories.find((c) => c.id === transaction.categoryId);
    if (category) {
      const map = transaction.type === 'INCOME' ? incomeByCategory : expenseByCategory;
      map[category.name] = (map[category.name] || 0) + transaction.amount;
    }
  });

  return {
    incomeByCategory: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })),
    expenseByCategory: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
  };
}

function prepareMonthlyComparison(transactions: Transaction[], dateRange: [dayjs.Dayjs, dayjs.Dayjs]) {
  const monthlyData: {
    [key: string]: { month: string; income: number; expense: number; balance: number };
  } = {};

  // Inicializa todos os meses do período
  let currentDate = dateRange[0].startOf('month');
  const endDate = dateRange[1].endOf('month');
  while (currentDate.isBefore(endDate)) {
    const monthKey = currentDate.format('YYYY-MM');
    monthlyData[monthKey] = {
      month: currentDate.format('MMM/YY'),
      income: 0,
      expense: 0,
      balance: 0,
    };
    currentDate = currentDate.add(1, 'month');
  }

  // Soma transações por mês
  transactions.forEach((transaction) => {
    const monthKey = dayjs(transaction.date).format('YYYY-MM');
    if (monthlyData[monthKey]) {
      if (transaction.type === 'INCOME') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    }
  });

  // Calcula saldo e converte para array
  return Object.values(monthlyData).map((data) => ({
    ...data,
    balance: data.income - data.expense,
  }));
}

// Função para renderizar labels no gráfico de pizza
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};
