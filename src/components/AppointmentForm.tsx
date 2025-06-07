import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getAvailableTimeSlots } from '../lib/appointments';
import type { Barber, Service } from '../lib/supabase';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    loadBarbers();
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedBarber, selectedDate]);

  const loadBarbers = async () => {
    const { data, error } = await supabase
      .from('barbers')
      .select('*');
    
    if (error) {
      toast.error('Failed to load barbers');
      return;
    }
    
    setBarbers(data);
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
    if (error) {
      toast.error('Failed to load services');
      return;
    }
    
    setServices(data);
  };

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableTimeSlots(selectedBarber, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to load available time slots');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledFor = `${selectedDate}T${selectedTime}:00`;
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user?.id,
          barber_id: selectedBarber,
          service_id: selectedService,
          scheduled_for: scheduledFor,
          status: 'upcoming'
        });

      if (error) throw error;

      toast.success('Appointment booked successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="inline-block mr-2" size={16} />
            Select Barber
          </label>
          <select
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Choose a barber</option>
            {barbers.map(barber => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Scissors className="inline-block mr-2" size={16} />
            Select Service
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Choose a service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.duration} min)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="inline-block mr-2" size={16} />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="inline-block mr-2" size={16} />
            Select Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={!selectedBarber || !selectedDate}
          >
            <option value="">Choose a time</option>
            {availableSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;