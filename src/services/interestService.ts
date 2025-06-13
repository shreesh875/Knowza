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
      console.log('InterestService: Fetching all interests')
      
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('name')

      if (error) {
        console.error('InterestService: Error fetching interests:', error)
        return { interests: [], error: error.message }
      }

      console.log('InterestService: Fetched interests:', data?.length || 0)
      return { interests: data || [], error: null }
    } catch (error) {
      console.error('InterestService: Exception fetching interests:', error)
      return { 
        interests: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch interests' 
      }
    }
  }

  // Single Responsibility: Save user's selected interests
  async saveUserInterests(userId: string, interestIds: string[]): Promise<{ error: string | null }> {
    try {
      console.log('InterestService: Saving user interests for user:', userId, 'interests:', interestIds)
      
      // First, remove existing interests for the user
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('InterestService: Error deleting existing interests:', deleteError)
        return { error: deleteError.message }
      }

      // Then, insert new interests
      if (interestIds.length > 0) {
        const userInterests = interestIds.map(interestId => ({
          user_id: userId,
          interest_id: interestId
        }))

        console.log('InterestService: Inserting user interests:', userInterests)

        const { error: insertError } = await supabase
          .from('user_interests')
          .insert(userInterests)

        if (insertError) {
          console.error('InterestService: Error inserting interests:', insertError)
          return { error: insertError.message }
        }
      }

      console.log('InterestService: Successfully saved user interests')
      return { error: null }
    } catch (error) {
      console.error('InterestService: Exception saving interests:', error)
      return { 
        error: error instanceof Error ? error.message : 'Failed to save interests' 
      }
    }
  }

  // Single Responsibility: Get user's selected interests
  async getUserInterests(userId: string): Promise<{ interests: Interest[], error: string | null }> {
    try {
      console.log('InterestService: Fetching user interests for user:', userId)
      
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
        console.error('InterestService: Error fetching user interests:', error)
        return { interests: [], error: error.message }
      }

      const interests = data?.map(item => item.interests).filter(Boolean) || []
      console.log('InterestService: Fetched user interests:', interests.length)
      return { interests, error: null }
    } catch (error) {
      console.error('InterestService: Exception fetching user interests:', error)
      return { 
        interests: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch user interests' 
      }
    }
  }

  // Single Responsibility: Mark user onboarding as completed
  async completeOnboarding(userId: string): Promise<{ error: string | null }> {
    try {
      console.log('InterestService: Completing onboarding for user:', userId)
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('InterestService: Error completing onboarding:', error)
        return { error: error.message }
      }

      console.log('InterestService: Successfully completed onboarding')
      return { error: null }
    } catch (error) {
      console.error('InterestService: Exception completing onboarding:', error)
      return { 
        error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
      }
    }
  }
}

// Export singleton instance
export const interestService = new InterestService()