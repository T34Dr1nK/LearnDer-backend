export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class AIService {
  private static readonly DEFAULT_MODEL = 'gpt-3.5-turbo';
  private static readonly DEFAULT_TEMPERATURE = 0.7;
  private static readonly DEFAULT_MAX_TOKENS = 500;

  /**
   * Generate a response using OpenAI's chat completion API
   */
  static async generateResponse(
    messages: ChatMessage[],
    options: AIOptions = {}
  ): Promise<string> {
    const {
      temperature = this.DEFAULT_TEMPERATURE,
      maxTokens = this.DEFAULT_MAX_TOKENS,
      model = this.DEFAULT_MODEL
    } = options;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from OpenAI');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback response for development/demo
      if (error instanceof Error && error.message.includes('API')) {
        return `ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI: ${error.message}\n\nนี่คือการตอบกลับแบบจำลองสำหรับการทดสอบ`;
      }
      
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          encoding_format: 'float'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI Embedding API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  /**
   * Validate API key by making a simple request
   */
  static async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating OpenAI API key:', error);
      return false;
    }
  }
}