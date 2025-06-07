import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface OrganizationCheckProps {
  children: React.ReactNode;
}

const OrganizationCheck: React.FC<OrganizationCheckProps> = ({ children }) => {
  const { organization, loading: orgLoading } = useOrganization();
  const { user } = useAuth();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('organization_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(); // Changed to maybeSingle()

      setShowWelcome(!data);
      setHasChecked(true);
    };

    checkFirstLogin();
  }, [user]);

  if (orgLoading || !hasChecked) {
    return <div>Loading...</div>;
  }

  // If no organization and not on setup page, show welcome modal or redirect
  if (!organization && location.pathname !== '/setup') {
    if (showWelcome) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Welcome to BarberConnect!</h2>
              <button onClick={() => setShowWelcome(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To get started, you'll need to set up your organization. This will help us customize the system for your business.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWelcome(false)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Set Up My Organization
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/setup" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OrganizationCheck
