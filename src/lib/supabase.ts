import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper types for better TypeScript support
export type Tables = Database['public']['Tables'];

// Row types
export type Organization = Tables['organizations']['Row'];
export type Professional = Tables['professionals']['Row'];
export type Service = Tables['services']['Row'];
export type Customer = Tables['customers']['Row'];
export type Appointment = Tables['appointments']['Row'];
export type Transaction = Tables['transactions']['Row'];
export type LoyaltyPoints = Tables['loyalty_points']['Row'];
export type Campaign = Tables['campaigns']['Row'];
export type CampaignEvent = Tables['campaign_events']['Row'];

// Insert types
export type OrganizationInsert = Tables['organizations']['Insert'];
export type ProfessionalInsert = Tables['professionals']['Insert'];
export type ServiceInsert = Tables['services']['Insert'];
export type CustomerInsert = Tables['customers']['Insert'];
export type AppointmentInsert = Tables['appointments']['Insert'];
export type TransactionInsert = Tables['transactions']['Insert'];
export type LoyaltyPointsInsert = Tables['loyalty_points']['Insert'];
export type CampaignInsert = Tables['campaigns']['Insert'];
export type CampaignEventInsert = Tables['campaign_events']['Insert'];

// Update types
export type OrganizationUpdate = Tables['organizations']['Update'];
export type ProfessionalUpdate = Tables['professionals']['Update'];
export type ServiceUpdate = Tables['services']['Update'];
export type CustomerUpdate = Tables['customers']['Update'];
export type AppointmentUpdate = Tables['appointments']['Update'];
export type TransactionUpdate = Tables['transactions']['Update'];
export type LoyaltyPointsUpdate = Tables['loyalty_points']['Update'];
export type CampaignUpdate = Tables['campaigns']['Update'];
export type CampaignEventUpdate = Tables['campaign_events']['Update'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type TransactionStatus = Database['public']['Enums']['transaction_status'];
export type CampaignStatus = Database['public']['Enums']['campaign_status'];
export type CampaignEventStatus = Database['public']['Enums']['campaign_event_status'];

// Helper function to get organization ID from URL
export const getCurrentOrganizationId = () => {
  const slug = window.location.hostname.split('.')[0];
  return supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()
    .then(({ data }) => data?.id);
};