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
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          subscription_status: string | null
          subscription_id: string | null
          credits: number
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
          credits?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          subscription_status?: string | null
          subscription_id?: string | null
          credits?: number
        }
      }
      scripts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          genre: string[] | null
          logline: string | null
          file_path: string
          file_name: string
          file_type: string
          file_size: number
          page_count: number | null
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          genre?: string[] | null
          logline?: string | null
          file_path: string
          file_name: string
          file_type: string
          file_size: number
          page_count?: number | null
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          genre?: string[] | null
          logline?: string | null
          file_path?: string
          file_name?: string
          file_type?: string
          file_size?: number
          page_count?: number | null
          is_public?: boolean
        }
      }
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          script_id: string
          user_id: string
          report_type: string
          status: string
          model_used: string
          content: Json
          feedback: string | null
          rating: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          script_id: string
          user_id: string
          report_type: string
          status?: string
          model_used: string
          content: Json
          feedback?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          script_id?: string
          user_id?: string
          report_type?: string
          status?: string
          model_used?: string
          content?: Json
          feedback?: string | null
          rating?: number | null
        }
      }
      credits: {
        Row: {
          id: string
          created_at: string
          user_id: string
          amount: number
          source: string
          expires_at: string | null
          is_used: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          amount: number
          source: string
          expires_at?: string | null
          is_used?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          amount?: number
          source?: string
          expires_at?: string | null
          is_used?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_credits: {
        Args: { user_id: string }
        Returns: number
      }
      get_script_stats: {
        Args: { script_id: string }
        Returns: { total_reports: number, avg_rating: number }[]
      }
    }
    Enums: {
      report_type: 'coverage' | 'development_notes' | 'market_analysis'
      report_status: 'pending' | 'processing' | 'completed' | 'failed'
      subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise'
    }
  }
}
