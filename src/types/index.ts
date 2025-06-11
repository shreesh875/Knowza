export interface User {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  points: number
  streak: number
  last_activity: string
  created_at: string
  updated_at: string
}

export interface Interest {
  id: string
  name: string
  description: string
  icon: string
  color: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  description?: string
  content_type: 'paper' | 'video' | 'article'
  content_url: string
  thumbnail_url?: string
  author: string
  published_at: string
  tags: string[]
  likes_count: number
  comments_count: number
  created_at: string
  isLiked?: boolean
  isSaved?: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface QuizSession {
  id: string
  user_id: string
  post_id: string
  questions: QuizQuestion[]
  answers?: number[]
  score?: number
  completed_at?: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

// Tavus types (keeping existing functionality)
export enum ConversationStatus {
  ACTIVE = "active",
  ENDED = "ended",
  ERROR = "error",
}

export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: ConversationStatus;
  conversation_url: string;
  replica_id: string | null;
  persona_id: string | null;
  created_at: string;
};