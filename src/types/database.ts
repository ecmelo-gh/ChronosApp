export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          type: string
          settings: Json
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['organizations']['Insert']>
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          permissions: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['organization_members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['organization_members']['Insert']>
      }
      professionals: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string | null
          specialties: string[]
          schedule: Json
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['professionals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['professionals']['Insert']>
      }
      services: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          duration: string
          price: number
          category: string | null
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['services']['Insert']>
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          external_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          preferences: Json
          metadata: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['customers']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          professional_id: string
          service_id: string
          scheduled_for: string
          duration: string
          status: string
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['appointments']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string
          customer_id: string
          amount: number
          status: string
          payment_method: string | null
          payment_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['transactions']['Insert']>
      }
      loyalty_points: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          points: number
          type: string
          expires_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['loyalty_points']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['loyalty_points']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          type: string
          status: string
          content: Json
          schedule: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['campaigns']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['campaigns']['Insert']>
      }
      campaign_events: {
        Row: {
          id: string
          organization_id: string
          campaign_id: string
          customer_id: string
          type: string
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['campaign_events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Tables['campaign_events']['Insert']>
      }
    }
    Functions: {
      user_has_organization_access: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'professional' | 'customer'
      appointment_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      transaction_status: 'pending' | 'completed' | 'failed' | 'refunded'
      campaign_status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
      campaign_event_status: 'pending' | 'sent' | 'delivered' | 'failed'
    }
  }
}
