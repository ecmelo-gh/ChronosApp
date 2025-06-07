import { useEffect, useState } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '../types/database';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];

interface UseOrganizationReturn {
  organization: Organization | null;
  members: OrganizationMember[];
  loading: boolean;
  error: PostgrestError | null;
  createOrganization: (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  addMember: (email: string, role: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  updateMember: (userId: string, data: Partial<OrganizationMember>) => Promise<void>;
}

export function useOrganization(): UseOrganizationReturn {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    if (!user) {
      setOrganization(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    try {
      // Buscar organização do usuário atual
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (memberError) throw memberError;

      if (memberData) {
        // Buscar detalhes da organização
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', memberData.organization_id)
          .single();

        if (orgError) throw orgError;
        setOrganization(orgData);

        // Buscar membros da organização
        const { data: membersData, error: membersError } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', memberData.organization_id);

        if (membersError) throw membersError;
        setMembers(membersData);
      }
    } catch (error) {
      setError(error as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([data])
        .select()
        .single();

      if (orgError) throw orgError;

      // Adicionar usuário atual como admin
      const { error: memberError } = await supabase.from('organization_members').insert([
        {
          organization_id: orgData.id,
          user_id: user?.id,
          role: 'admin',
          permissions: {
            manage_users: true,
            manage_services: true,
            manage_professionals: true,
            manage_customers: true,
            manage_appointments: true,
            manage_campaigns: true,
            manage_finances: true,
          },
        },
      ]);

      if (memberError) throw memberError;

      await loadOrganization();
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const updateOrganization = async (id: string, data: Partial<Organization>) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await loadOrganization();
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const addMember = async (email: string, role: string) => {
    try {
      // Buscar usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) throw userError;

      // Adicionar membro
      const { error } = await supabase.from('organization_members').insert([
        {
          organization_id: organization?.id,
          user_id: userData.id,
          role,
          permissions: {},
        },
      ]);

      if (error) throw error;
      await loadOrganization();
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organization?.id)
        .eq('user_id', userId);

      if (error) throw error;
      await loadOrganization();
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  const updateMember = async (userId: string, data: Partial<OrganizationMember>) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update(data)
        .eq('organization_id', organization?.id)
        .eq('user_id', userId);

      if (error) throw error;
      await loadOrganization();
    } catch (error) {
      setError(error as PostgrestError);
      throw error;
    }
  };

  return {
    organization,
    members,
    loading,
    error,
    createOrganization,
    updateOrganization,
    addMember,
    removeMember,
    updateMember,
  };
}
