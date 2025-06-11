interface DeepSeekMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model = 'deepseek/deepseek-chat-v3-0324:free';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    if (!apiKey.startsWith('sk-or-v1-')) {
      console.warn('API key format may be incorrect. Expected format: sk-or-v1-...');
    }
    this.apiKey = apiKey;
    console.log('DeepSeekService initialized with API key:', apiKey.substring(0, 20) + '...');
  }

  async sendMessage(messages: DeepSeekMessage[]): Promise<string> {
    try {
      console.log('Sending message to DeepSeek V3 via OpenRouter');
      console.log('Model:', this.model);
      console.log('Messages count:', messages.length);

      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: false,
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BrainFeed Educational Platform',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Parse error response if it's JSON
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`OpenRouter API error: ${response.status} - ${errorJson.error?.message || errorText}`);
        } catch (parseError) {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
      }

      const data: OpenRouterResponse = await response.json();
      console.log('OpenRouter response received successfully');
      console.log('Model used:', data.model);
      console.log('Usage:', data.usage);

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const content = data.choices[0].message.content;
        console.log('Response content length:', content?.length || 0);
        return content || 'No content in response';
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('No valid response from OpenRouter API');
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while calling OpenRouter API');
      }
    }
  }

  async streamMessage(messages: DeepSeekMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      console.log('Streaming message to DeepSeek V3 via OpenRouter');
      console.log('Model:', this.model);
      console.log('Messages count:', messages.length);

      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BrainFeed Educational Platform',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Streaming response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter streaming API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`OpenRouter API error: ${response.status} - ${errorJson.error?.message || errorText}`);
        } catch (parseError) {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('Streaming completed');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6);
              
              if (data === '[DONE]') {
                console.log('Received [DONE] signal');
                return;
              }

              if (data.startsWith('{')) {
                try {
                  const parsed: OpenRouterStreamChunk = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    onChunk(content);
                  }
                  
                  // Check for finish reason
                  if (parsed.choices && parsed.choices[0]?.finish_reason) {
                    console.log('Stream finished with reason:', parsed.choices[0].finish_reason);
                    return;
                  }
                } catch (parseError) {
                  console.warn('Failed to parse streaming chunk:', data, parseError);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Error streaming from OpenRouter API:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while streaming from OpenRouter API');
      }
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    try {
      const testMessages: DeepSeekMessage[] = [
        {
          role: 'user',
          content: 'Hello, please respond with just "OK" to test the connection.'
        }
      ];

      const response = await this.sendMessage(testMessages);
      console.log('Connection test response:', response);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default DeepSeekService;
export type { DeepSeekMessage };