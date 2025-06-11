import { useState, useCallback, useMemo } from 'react';
import DeepSeekService, { DeepSeekMessage } from '../services/deepSeekService';
import { ConversationMessage } from '../types/tavus';

export const useDeepSeekChat = (apiKey: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const deepSeekService = useMemo(() => {
    if (!apiKey) {
      console.warn('No OpenRouter API key provided');
      return null;
    }
    try {
      return new DeepSeekService(apiKey);
    } catch (error) {
      console.error('Failed to create DeepSeekService:', error);
      return null;
    }
  }, [apiKey]);

  const sendMessage = useCallback(async (
    messages: ConversationMessage[],
    onResponse: (response: ConversationMessage) => void,
    onStreamChunk?: (chunk: string) => void
  ) => {
    if (!deepSeekService) {
      const errorMessage: ConversationMessage = {
        id: Date.now().toString(),
        content: 'OpenRouter API key is not configured. Please check your environment variables.',
        role: 'assistant',
        timestamp: new Date(),
      };
      onResponse(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      // Convert conversation messages to DeepSeek format
      const deepSeekMessages: DeepSeekMessage[] = [
        {
          role: 'system',
          content: `You are BrainMate, an AI learning companion powered by DeepSeek V3. You're part of an educational platform called BrainFeed where users explore academic content, research papers, and educational videos.

Your role is to:
- Help users understand concepts from their feed content
- Answer questions related to their recent learning topics  
- Create personalized quizzes based on their interests
- Provide study tips and learning strategies
- Explain complex topics in simple, digestible terms
- Act as a supportive learning buddy and coach

Keep your responses engaging, educational, and encouraging. Reference the user's learning context when relevant. Be conversational but informative.`
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
    isConfigured: !!deepSeekService,
  };
};