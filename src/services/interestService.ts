// Single Responsibility: Handle all interest-related operations
import { supabase } from '../lib/supabase'

export interface Interest {
  id: string
  name: string
  created_at: string
}

export interface UserInterest {
  user_id: string
  interest_id: string
  created_at: string
}

export class InterestService {
  // Single Responsibility: Fetch all available interests
  async getAllInterests(): Promise<{ interests: Interest[], error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('name')

      if (error) {
        return { interests: [], error: error.message }
      }

      return { interests: data || [], error: null }
    } catch (error) {
      return { 
        interests: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch interests' 
      }
    }
  }

  // Single Responsibility: Save user's selected interests
  async saveUserInterests(userId: string, interestIds: string[]): Promise<{ error: string | null }> {
    try {
      // First, remove existing interests for the user
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        return { error: deleteError.message }
      }

      // Then, insert new interests
      if (interestIds.length > 0) {
        const userInterests = interestIds.map(interestId => ({
          user_id: userId,
          interest_id: interestId
        }))

        const { error: insertError } = await supabase
          .from('user_interests')
          .insert(userInterests)

        if (insertError) {
          return { error: insertError.message }
        }
      }

      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to save interests' 
      }
    }
  }

  // Single Responsibility: Get user's selected interests
  async getUserInterests(userId: string): Promise<{ interests: Interest[], error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          interest_id,
          interests (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (error) {
        return { interests: [], error: error.message }
      }

      const interests = data?.map(item => item.interests).filter(Boolean) || []
      return { interests, error: null }
    } catch (error) {
      return { 
        interests: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch user interests' 
      }
    }
  }

  // Single Responsibility: Mark user onboarding as completed
  async completeOnboarding(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
      }
    }
  }
}

// Export singleton instance
export const interestService = new InterestService()