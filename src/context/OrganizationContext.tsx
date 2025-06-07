import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { logError } from '../lib/errorLogging';
import toast from 'react-hot-toast';

interface Organization {
  id: string;
  name: string;
  type: 'barbershop' | 'beauty_salon' | 'nail_salon' | 'spa';
  logo_url?: string;
  theme: {
    primary_color: string;
    secondary_color: string;
  };
  language: string;
  timezone: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (org: Organization | null) => void;
  loading: boolean;
  userRole: 'owner' | 'manager' | 'professional' | 'receptionist' | null;
  loadOrganization: () => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'manager' | 'professional' | 'receptionist' | null>(null);

  const loadOrganization = async () => {
    try {
      if (!user) {
        setOrganization(null);
        setUserRole(null);
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            type,
            logo_url,
            theme,
            language,
            timezone
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }

      if (memberData?.organizations) {
        setOrganization(memberData.organizations as Organization);
        setUserRole(memberData.role);
      } else {
        setOrganization(null);
        setUserRole(null);
      }
    } catch (error) {
      await logError({
        error,
        context: 'OrganizationContext.loadOrganization',
        metadata: { userId: user?.id }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    try {
      if (!organization) return;

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization({ ...organization, ...updates });
      toast.success('Organization updated successfully');
    } catch (error) {
      await logError({
        error,
        context: 'OrganizationContext.updateOrganization',
        metadata: { organizationId: organization?.id, updates }
      });
    }
  };

  useEffect(() => {
    loadOrganization();
  }, [user]);

  const value = {
    organization,
    setOrganization,
    loading,
    userRole,
    loadOrganization,
    updateOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};