import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Clock, User, Scissors, Star } from 'lucide-react';
import RatingModal from './RatingModal';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  barber: string;
  barberId: string;
  organizationId: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const { darkMode } = useAppContext();
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <>
      <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
          {appointment.clientName.charAt(0)}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{appointment.clientName}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <Scissors size={14} className="mr-1" />
                <span>{appointment.service}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
              
              {appointment.status === 'completed' && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  <Star size={16} className="text-amber-500" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex text-sm text-gray-500 mt-1">
            <div className="flex items-center mr-3">
              <Clock size={14} className="mr-1" />
              <span>{appointment.time}</span>
            </div>
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{appointment.barber}</span>
            </div>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          appointmentId={appointment.id}
          professionalId={appointment.barberId}
          professionalName={appointment.barber}
          organizationId={appointment.organizationId}
          onClose={() => setShowRatingModal(false)}
          onSuccess={() => {
            // Optionally refresh appointment data
          }}
        />
      )}
    </>
  );
};

export default AppointmentCard;