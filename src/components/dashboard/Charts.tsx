import { Card } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import dayjs from 'dayjs';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

interface RevenueChartProps {
  data: Array<{ date: string; total: number }>;
  loading?: boolean;
}

export function RevenueChart({ data, loading }: RevenueChartProps) {
  return (
    <Card loading={loading} title="Receita por Dia">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => dayjs(date).format('DD/MM')}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(date) => dayjs(date).format('DD/MM/YYYY')}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

interface StatusChartProps {
  data: Array<{ status: string; total: number }>;
  loading?: boolean;
}

export function StatusChart({ data, loading }: StatusChartProps) {
  return (
    <Card loading={loading} title="Agendamentos por Status">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.status}: ${entry.total}`}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, 'Agendamentos']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

interface TopItemsChartProps {
  data: Array<{ name: string; total: number; revenue: number }>;
  type: 'services' | 'professionals';
  loading?: boolean;
}

export function TopItemsChart({ data, type, loading }: TopItemsChartProps) {
  return (
    <Card
      loading={loading}
      title={type === 'services' ? 'Top Serviços' : 'Top Profissionais'}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
            />
            <Tooltip
              formatter={(value: number, name) => [
                name === 'revenue'
                  ? formatCurrency(value)
                  : value,
                name === 'revenue'
                  ? 'Receita'
                  : 'Agendamentos'
              ]}
            />
            <Bar
              dataKey="total"
              fill="#1890ff"
              name="Agendamentos"
              barSize={20}
            />
            <Bar
              dataKey="revenue"
              fill="#52c41a"
              name="Receita"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
