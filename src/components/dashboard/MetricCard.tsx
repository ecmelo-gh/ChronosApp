import { Card, Statistic, Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  growth?: number;
  loading?: boolean;
  tooltip?: string;
  format?: (value: number) => string;
}

export function MetricCard({
  title,
  value,
  prefix,
  suffix,
  growth,
  loading,
  tooltip,
  format,
}: MetricCardProps) {
  return (
    <Card loading={loading}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">{title}</span>
          {tooltip && (
            <Tooltip title={tooltip}>
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          )}
        </div>

        {typeof growth === 'number' && (
          <div
            className={`flex items-center gap-1 ${
              growth >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span className="text-sm">{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <Statistic
        value={value}
        prefix={prefix}
        suffix={suffix}
        formatter={format}
      />
    </Card>
  );
}
