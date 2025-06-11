const OPENAI_API_KEY = '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'
const OPENAI_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
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
            content: 'You are BrainMate, an AI learning companion designed to help students learn and understand complex topics. You are knowledgeable, patient, encouraging, and always ready to explain concepts in simple terms. You can help with homework, explain difficult concepts, provide study tips, and engage in educational discussions. Keep your responses helpful, concise, and educational.'
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