import { useState, useCallback } from 'react';
import DeepSeekService, { DeepSeekMessage } from '../services/deepSeekService';
import { ConversationMessage } from '../types/tavus';

export const useDeepSeekChat = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deepSeekService] = useState(() => new DeepSeekService(apiKey));

  const sendMessage = useCallback(async (
    messages: ConversationMessage[],
    onResponse: (response: ConversationMessage) => void,
    onStreamChunk?: (chunk: string) => void
  ) => {
    setIsLoading(true);

    try {
      // Convert conversation messages to DeepSeek format
      const deepSeekMessages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are BrainMate, an advanced AI learning companion powered by DeepSeek V3. You're integrated into BrainFeed, an educational platform where users explore research papers, videos, and articles.

Your personality and approach:
- Friendly, encouraging, and genuinely excited about learning
- Use casual greetings like "Hey there! 👋" or "Welcome back!"
- Reference the user's recent feed topics when relevant
- Break down complex concepts into digestible explanations
- Offer to create quizzes, provide study tips, or dive deeper into topics
- Be supportive and patient, like a helpful study buddy

Recent topics the user has been exploring: Neural Networks, Quantum Computing, Machine Learning, AI Ethics, Data Science.

Keep responses engaging, educational, and conversational. Help users understand concepts, answer questions, and enhance their learning journey.`
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      if (onStreamChunk) {
        // Use streaming for real-time response
        let fullResponse = '';
        
        await deepSeekService.streamMessage(deepSeekMessages, (chunk) => {
          fullResponse += chunk;
          onStreamChunk(chunk);
        });

        // Create final response message
        const responseMessage: ConversationMessage = {
          id: Date.now().toString(),
          content: fullResponse,
          role: 'assistant',
          timestamp: new Date(),
        };

        onResponse(responseMessage);
      } else {
        // Use regular API call
        const responseText = await deepSeekService.sendMessage(deepSeekMessages);
        
        const responseMessage: ConversationMessage = {
          id: Date.now().toString(),
          content: responseText,
          role: 'assistant',
          timestamp: new Date(),
        };

        onResponse(responseMessage);
      }
    } catch (error) {
      console.error('Error getting DeepSeek response:', error);
      
      const errorMessage: ConversationMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again. (DeepSeek V3 via OpenRouter)',
        role: 'assistant',
        timestamp: new Date(),
      };

      onResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [deepSeekService]);

  return {
    sendMessage,
    isLoading,
  };
};