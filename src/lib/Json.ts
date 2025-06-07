type Json = string |
  number |
  boolean |
  null |
{ [key: string]: Json | undefined; } |
  Json[];

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          client_id: string | null;
          barber_id: string | null;
          service_id: string | null;
          scheduled_for: string;
          status: 'upcoming' | 'completed' | 'cancelled';
          created_at: string | null;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          barber_id?: string | null;
          service_id?: string | null;
          scheduled_for: string;
          status?: 'upcoming' | 'completed' | 'cancelled';
          created_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          barber_id?: string | null;
          service_id?: string | null;
          scheduled_for?: string;
          status?: 'upcoming' | 'completed' | 'cancelled';
          created_at?: string | null;
        };
      };
      barbers: {
        Row: {
          id: string;
          name: string;
          specialties: string[] | null;
          rating: number | null;
          appointments_count: number | null;
          image_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          specialties?: string[] | null;
          rating?: number | null;
          appointments_count?: number | null;
          image_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          specialties?: string[] | null;
          rating?: number | null;
          appointments_count?: number | null;
          image_url?: string | null;
          created_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          favorite_team: string | null;
          last_visit: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          favorite_team?: string | null;
          last_visit?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          favorite_team?: string | null;
          last_visit?: string | null;
          created_at?: string | null;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          price: number;
          duration: number;
          description: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          duration: number;
          description?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          duration?: number;
          description?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      appointment_status: 'upcoming' | 'completed' | 'cancelled';
    };
  };
}
