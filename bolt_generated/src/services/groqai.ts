export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIServiceOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

type AIProvider = 'openai' | 'groq';

export class AIService {
  private static provider: AIProvider = (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'openai';
  private static openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  private static groqApiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  private static readonly DEFAULT_MODEL_OPENAI = 'gpt-3.5-turbo';
  private static readonly DEFAULT_MODEL_GROQ = 'llama3-8b-8192';
  private static readonly EMBEDDING_MODEL_OPENAI = 'text-embedding-3-large'; // ตัวอย่าง model embedding ของ OpenAI
  private static readonly EMBEDDING_MODEL_GROQ = 'text-embedding-3-large';    // ปรับตาม Groq API

  static async generateResponse(
    messages: ChatMessage[],
    options: AIServiceOptions = {}
  ): Promise<string> {
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 1000;
    const model = options.model ?? (this.provider === 'groq' ? this.DEFAULT_MODEL_GROQ : this.DEFAULT_MODEL_OPENAI);

    if (this.provider === 'groq') {
      if (!this.groqApiKey) throw new Error('กรุณาตั้งค่า GROQ API Key ในไฟล์ .env');

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Groq API error: ${errorText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No response from Groq API');
      return content.trim();
    } else {
      if (!this.openaiApiKey) throw new Error('กรุณาตั้งค่า OpenAI API Key ในไฟล์ .env');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI API');
      return content.trim();
    }
  }

  // --- เพิ่ม generateEmbedding method ---
  static async generateEmbedding(text: string): Promise<number[]> {
    if (this.provider === 'groq') {
      if (!this.groqApiKey) throw new Error('กรุณาตั้งค่า GROQ API Key ในไฟล์ .env');

      const res = await fetch('https://api.groq.com/openai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`,
        },
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL_GROQ,
          input: text
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Groq API error (embedding): ${errorText}`);
      }

      const data = await res.json();
      const embedding = data.data?.[0]?.embedding;
      if (!embedding) throw new Error('No embedding returned from Groq API');
      return embedding;
    } else {
      if (!this.openaiApiKey) throw new Error('กรุณาตั้งค่า OpenAI API Key ในไฟล์ .env');

      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL_OPENAI,
          input: text
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API error (embedding): ${errorText}`);
      }

      const data = await res.json();
      const embedding = data.data?.[0]?.embedding;
      if (!embedding) throw new Error('No embedding returned from OpenAI API');
      return embedding;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      if (this.provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
          },
        });
        return res.ok;
      } else {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
          },
        });
        return res.ok;
      }
    } catch {
      return false;
    }
  }
}
