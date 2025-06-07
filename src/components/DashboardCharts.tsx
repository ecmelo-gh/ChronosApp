'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

const monthlyData = [
  { name: 'Jan', appointments: 400, revenue: 2400, satisfaction: 95 },
  { name: 'Fev', appointments: 300, revenue: 1398, satisfaction: 98 },
  { name: 'Mar', appointments: 200, revenue: 9800, satisfaction: 92 },
  { name: 'Abr', appointments: 278, revenue: 3908, satisfaction: 97 },
  { name: 'Mai', appointments: 189, revenue: 4800, satisfaction: 94 },
  { name: 'Jun', appointments: 239, revenue: 3800, satisfaction: 96 },
]

const weeklyData = [
  { name: 'Seg', appointments: 40, revenue: 240, satisfaction: 95 },
  { name: 'Ter', appointments: 30, revenue: 139, satisfaction: 98 },
  { name: 'Qua', appointments: 20, revenue: 980, satisfaction: 92 },
  { name: 'Qui', appointments: 27, revenue: 390, satisfaction: 97 },
  { name: 'Sex', appointments: 18, revenue: 480, satisfaction: 94 },
  { name: 'Sáb', appointments: 23, revenue: 380, satisfaction: 96 },
  { name: 'Dom', appointments: 15, revenue: 280, satisfaction: 93 },
]

type TimeRange = 'weekly' | 'monthly'

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' },
]

const chartTypes = [
  { label: 'Agendamentos e Receita', value: 'revenue' },
  { label: 'Satisfação do Cliente', value: 'satisfaction' },
]

export function DashboardCharts() {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly')
  const [chartType, setChartType] = useState('revenue')

  const data = timeRange === 'monthly' ? monthlyData : weeklyData

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 font-inter">
          Dashboard Analytics
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-inter',
                  timeRange === range.value
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-gray-200 p-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-inter',
                  chartType === type.value
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'revenue' ? (
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="appointments"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.1}
                name="Agendamentos"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                fill="#059669"
                fillOpacity={0.1}
                name="Receita"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[80, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Bar
                dataKey="satisfaction"
                fill="#2563EB"
                name="Satisfação (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
