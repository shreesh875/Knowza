export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string | null
          points: number
          streak: number
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          avatar_url?: string | null
          points?: number
          streak?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          points?: number
          streak?: number
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest_id?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          description: string | null
          content_type: string
          content_url: string
          thumbnail_url: string | null
          author: string
          published_at: string
          tags: string[]
          likes_count: number
          comments_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content_type: string
          content_url: string
          thumbnail_url?: string | null
          author: string
          published_at?: string
          tags?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content_type?: string
          content_url?: string
          thumbnail_url?: string | null
          author?: string
          published_at?: string
          tags?: string[]
          likes_count?: number
          comments_count?: number
          created_at?: string
        }
      }
      user_post_interactions: {
        Row: {
          id: string
          user_id: string
          post_id: string
          interaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          interaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          interaction_type?: string
          created_at?: string
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string
          post_id: string
          questions: any
          answers: any | null
          score: number | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          questions: any
          answers?: any | null
          score?: number | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          questions?: any
          answers?: any | null
          score?: number | null
          completed_at?: string | null
          created_at?: string
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
  }
}