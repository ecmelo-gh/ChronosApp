import React from 'react';
import { useAppContext } from '../context/AppContext';

interface StatusCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  positive 
}) => {
  const { darkMode } = useAppContext();
  
  return (
    <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <span className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-1">from last period</span>
      </div>
    </div>
  );
};

export default StatusCard;