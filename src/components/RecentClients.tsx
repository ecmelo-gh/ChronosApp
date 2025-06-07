import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, Calendar } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  favoriteTeam?: string;
}

interface RecentClientsProps {
  clients: Client[];
}

const RecentClients: React.FC<RecentClientsProps> = ({ clients }) => {
  const { darkMode } = useAppContext();
  
  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <div key={client.id} className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {client.name.charAt(0)}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium">{client.name}</h4>
            </div>
            <p className="text-sm text-gray-500">{client.phone}</p>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <MessageSquare size={16} />
            </button>
            <button className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              <Calendar size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentClients;