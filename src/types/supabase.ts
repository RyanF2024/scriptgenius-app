export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
        }
      }
      scripts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json | null
          created_at: string
          updated_at: string | null
          is_public: boolean
          genre: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: Json | null
          created_at?: string
          updated_at?: string | null
          is_public?: boolean
          genre?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: Json | null
          created_at?: string
          updated_at?: string | null
          is_public?: boolean
          genre?: string | null
          tags?: string[] | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          price_id: string
          quantity: number | null
          cancel_at_period_end: boolean | null
          created: string
          current_period_start: string
          current_period_end: string
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
        }
        Insert: {
          id: string
          user_id: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          price_id: string
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid'
          price_id?: string
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
