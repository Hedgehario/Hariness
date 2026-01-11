export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          gender: string | null;
          age_group: string | null;
          prefecture: string | null;
          role: string;
          is_push_enabled: boolean;
          is_reminder_notification_enabled: boolean;
          is_alert_notification_enabled: boolean;
          is_news_notification_enabled: boolean;
          created_at: string;
          last_login_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          gender?: string | null;
          age_group?: string | null;
          prefecture?: string | null;
          role?: string;
          is_push_enabled?: boolean;
          is_reminder_notification_enabled?: boolean;
          is_alert_notification_enabled?: boolean;
          is_news_notification_enabled?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          gender?: string | null;
          age_group?: string | null;
          prefecture?: string | null;
          role?: string;
          is_push_enabled?: boolean;
          is_reminder_notification_enabled?: boolean;
          is_alert_notification_enabled?: boolean;
          is_news_notification_enabled?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
      };
      hedgehogs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          gender: string | null;
          birth_date: string | null;
          welcome_date: string | null;
          image_url: string | null;
          features: string | null;
          insurance_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          gender?: string | null;
          birth_date?: string | null;
          welcome_date?: string | null;
          image_url?: string | null;
          features?: string | null;
          insurance_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          gender?: string | null;
          birth_date?: string | null;
          welcome_date?: string | null;
          image_url?: string | null;
          features?: string | null;
          insurance_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      weight_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          weight: number;
          record_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          weight: number;
          record_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          weight?: number;
          record_date?: string;
          created_at?: string;
        };
      };
      meal_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          content: string;
          amount: number | null;
          amount_unit: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          content: string;
          amount?: number | null;
          amount_unit?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          record_date?: string;
          record_time?: string;
          content?: string;
          amount?: number | null;
          amount_unit?: string | null;
          created_at?: string;
        };
      };
      excretion_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          type: string;
          condition: string;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          type: string;
          condition: string;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          record_date?: string;
          record_time?: string;
          type?: string;
          condition?: string;
          details?: string | null;
          created_at?: string;
        };
      };
      environment_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          record_date: string;
          temperature: number | null;
          humidity: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          record_date: string;
          temperature?: number | null;
          humidity?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          record_date?: string;
          temperature?: number | null;
          humidity?: number | null;
          created_at?: string;
        };
      };
      medication_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          medicine_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          record_date: string;
          record_time: string;
          medicine_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          record_date?: string;
          record_time?: string;
          medicine_name?: string;
          created_at?: string;
        };
      };
      memo_records: {
        Row: {
          id: string;
          hedgehog_id: string;
          record_date: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          record_date: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          record_date?: string;
          content?: string;
          created_at?: string;
        };
      };
      hospital_visits: {
        Row: {
          id: string;
          hedgehog_id: string;
          visit_date: string;
          diagnosis: string | null;
          treatment: string | null;
          medicine_prescription: Json | null;
          next_visit_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          hedgehog_id: string;
          visit_date: string;
          diagnosis?: string | null;
          treatment?: string | null;
          medicine_prescription?: Json | null;
          next_visit_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          hedgehog_id?: string;
          visit_date?: string;
          diagnosis?: string | null;
          treatment?: string | null;
          medicine_prescription?: Json | null;
          next_visit_date?: string | null;
          created_at?: string;
        };
      };
      care_reminders: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target_time: string;
          is_repeat: boolean;
          frequency: string | null;
          days_of_week: string | null;
          is_enabled: boolean;
          last_completed_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target_time: string;
          is_repeat?: boolean;
          frequency?: string | null;
          days_of_week?: string | null;
          is_enabled?: boolean;
          last_completed_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          target_time?: string;
          is_repeat?: boolean;
          frequency?: string | null;
          days_of_week?: string | null;
          is_enabled?: boolean;
          last_completed_date?: string | null;
          created_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          event_date: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_date: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_date?: string;
          title?: string;
          created_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          is_published: boolean;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          is_published?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          is_published?: boolean;
          published_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_read_status: {
        Row: {
          user_id: string;
          news_id: string;
          read_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          news_id: string;
          read_at?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          news_id?: string;
          read_at?: string;
          created_at?: string;
        };
      };
      alert_history: {
        Row: {
          id: string;
          user_id: string;
          hedgehog_id: string | null;
          alert_type: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          hedgehog_id?: string | null;
          alert_type: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          hedgehog_id?: string | null;
          alert_type?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      withdrawal_logs: {
        Row: {
          id: string;
          user_id: string;
          email_hash: string;
          reason: string | null;
          withdrawn_at: string;
          age_group: string | null;
          gender: string | null;
          prefecture: string | null;
          hedgehog_count: number | null;
          days_used: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_hash: string;
          reason?: string | null;
          withdrawn_at?: string;
          age_group?: string | null;
          gender?: string | null;
          prefecture?: string | null;
          hedgehog_count?: number | null;
          days_used?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_hash?: string;
          reason?: string | null;
          withdrawn_at?: string;
          age_group?: string | null;
          gender?: string | null;
          prefecture?: string | null;
          hedgehog_count?: number | null;
          days_used?: number | null;
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
      [_ in never]: never;
    };
  };
}
