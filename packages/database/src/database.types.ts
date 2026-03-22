export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/* ─── Enum Types ──────────────────────────────────────────── */
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationType = 'ticket_update' | 'system' | 'feedback_request' | 'assignment'
export type UserRole = 'admin' | 'user'

/* ─── Database Schema ─────────────────────────────────────── */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: UserRole
        }
        Insert: {
          id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
        }
        Update: {
          id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: TicketStatus
          priority: TicketPriority
          category: string
          assigned_admin_id: string | null
          stream_channel_id: string | null
          rating: number | null
          rating_comment: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
          internal_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: TicketStatus
          priority?: TicketPriority
          category?: string
          assigned_admin_id?: string | null
          stream_channel_id?: string | null
          rating?: number | null
          rating_comment?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          internal_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: TicketStatus
          priority?: TicketPriority
          category?: string
          assigned_admin_id?: string | null
          stream_channel_id?: string | null
          rating?: number | null
          rating_comment?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          internal_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          author_id: string | null
          is_published: boolean
          view_count: number
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string
          tags?: string[]
          author_id?: string | null
          is_published?: boolean
          view_count?: number
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          author_id?: string | null
          is_published?: boolean
          view_count?: number
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string | null
          is_read: boolean
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: NotificationType
          title: string
          message?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string | null
          is_read?: boolean
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
      notification_type: NotificationType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/* ─── Convenience Row Types ───────────────────────────────── */
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type KnowledgeBaseArticle = Database['public']['Tables']['knowledge_base']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ActivityLogEntry = Database['public']['Tables']['activity_log']['Row']
