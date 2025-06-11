const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const sendChatMessage = async (messages: ChatMessage[], feedContext?: string[]): Promise<string> => {
  // Check if API key is available
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
  }

  try {
    // Create context-aware system prompt
    const contextPrompt = feedContext && feedContext.length > 0 
      ? `You are BrainMate, an AI learning companion integrated with an educational platform. The user has been exploring these topics in their feed: ${feedContext.join(', ')}. 

Your role is to:
- Help users understand concepts from their feed content
- Answer questions related to their recent learning topics
- Create personalized quizzes based on their interests
- Provide study tips and learning strategies
- Explain complex topics in simple, digestible terms
- Act as a supportive learning buddy and coach

Always reference their feed context when relevant and provide educational, encouraging responses. Keep responses concise but informative.`
      : `You are BrainMate, an AI learning companion designed to help students learn and understand complex topics. You are knowledgeable, patient, encouraging, and always ready to explain concepts in simple terms. You can help with homework, explain difficult concepts, provide study tips, and engage in educational discussions. Keep your responses helpful, concise, and educational.`

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'BrainFeed Educational Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: contextPrompt
          },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Error sending chat message:', error)
    throw new Error('Failed to send message. Please try again.')
  }
}