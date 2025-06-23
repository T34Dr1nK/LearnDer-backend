import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not found. AI features will be limited.');
}

export const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  static async generateResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    try {
      if (!apiKey) {
        return this.generateMockResponse(messages[messages.length - 1]?.content || '');
      }

      const completion = await openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      });

      return completion.choices[0]?.message?.content || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้';
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.generateMockResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private static generateMockResponse(userMessage: string): string {
    const responses = [
      `เกี่ยวกับคำถาม "${userMessage}" ที่คุณถาม ฉันจะอธิบายให้ฟังตามเนื้อหาในหนังสือนะครับ`,
      `จากเนื้อหาที่เกี่ยวข้องกับ "${userMessage}" ในหนังสือ สามารถสรุปได้ดังนี้...`,
      `คำถามที่น่าสนใจเกี่ยวกับ "${userMessage}" ตามที่ระบุไว้ในหนังสือ มีคำตอบคือ...`,
      `ตามเนื้อหาในหนังสือที่กล่าวถึง "${userMessage}" สามารถอธิบายได้ว่า...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}