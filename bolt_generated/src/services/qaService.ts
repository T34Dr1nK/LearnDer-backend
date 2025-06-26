import { supabase } from '../lib/supabase';
import { TextbookProcessor } from './textbookProcessor';
// เปลี่ยนจาก openai มาเป็น groqai
import { AIService } from './groqai';

export interface QARequest {
  question: string;
  bookId: string;
  sessionId?: string;
  userId: string;
}

export interface QAResponse {
  answer: string;
  sources: Array<{
    content: string;
    pageNumber: number;
    section?: string;
    confidence: number;
  }>;
  sessionId: string;
  followUps?: string[]; // เพิ่มตรงนี้
}


export class QAService {
  static async processQuestion(request: QARequest): Promise<QAResponse> {
    try {
      const relevantChunks = await TextbookProcessor.searchSimilarContent(
        request.question,
        request.bookId,
        5
      );

      const sessionId = request.sessionId || await this.createChatSession(
        request.userId,
        request.bookId,
        request.question
      );

      const context = this.buildContext(relevantChunks);

      const answer = await this.generateContextualAnswer(
        request.question,
        context,
        relevantChunks
      );

      await this.saveChatMessage(sessionId, request.question, 'user');
      await this.saveChatMessage(sessionId, answer, 'assistant', {
        sources: relevantChunks.map(chunk => chunk.content),
        confidence: this.calculateConfidence(relevantChunks)
      });

      const sources = relevantChunks.map(chunk => ({
        content: chunk.content.substring(0, 200) + '...',
        pageNumber: chunk.page_number,
        section: chunk.metadata?.section,
        confidence: chunk.similarity || 0.8
      }));

      const followUps = await this.suggestFollowUpQuestions(request.question, answer);

      return {
        answer,
        sources,
        sessionId,
        followUps
      };

    } catch (error) {
      console.error('Error processing question:', error);
      throw new Error('ไม่สามารถประมวลผลคำถามได้ในขณะนี้');
    }
  }

  static async suggestFollowUpQuestions(question: string, answer: string): Promise<string[]> {
    const systemPrompt = `
คุณคือ AI ผู้ช่วยนักเรียน
หลังจากนักเรียนถามว่า "${question}"
และคุณตอบว่า "${answer}"

กรุณาแนะนำคำถามต่อยอด 3-4 ข้อในรูปแบบ array JSON เช่น:
["...", "...", "..."]
`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: 'โปรดสร้างคำถามต่อยอดจากคำถามข้างต้น' }
    ];

    const result = await AIService.generateResponse(messages, {
      temperature: 0.4,
      maxTokens: 200
    });

    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('AI quick action parsing failed:', e);
    }

    return []; // fallback
  }


  private static async createChatSession(
    userId: string,
    bookId: string,
    firstQuestion: string
  ): Promise<string> {
    const sessionTitle = firstQuestion.length > 50
      ? firstQuestion.substring(0, 50) + '...'
      : firstQuestion;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        book_id: bookId,
        title: sessionTitle
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }

    return data.id;
  }

  private static buildContext(chunks: any[]): string {
    if (chunks.length === 0) {
      return 'ไม่พบเนื้อหาที่เกี่ยวข้องในหนังสือ';
    }

    const contextParts = chunks.map((chunk, index) =>
      `[ส่วนที่ ${index + 1}] ${chunk.content}`
    );

    return contextParts.join('\n\n');
  }

  private static async generateContextualAnswer(
    question: string,
    context: string,
    relevantChunks: any[]
  ): Promise<string> {
    const systemPrompt = `
คุณคือผู้ช่วย AI ด้านการศึกษา ที่มีหน้าที่ตอบคำถามนักเรียนเป็นภาษาไทยเท่านั้น

กฎ:
1. ห้ามใช้ภาษาอังกฤษ หรือภาษาต่างประเทศอื่น
2. หากไม่มีข้อมูลที่เกี่ยวข้องในหนังสือ ให้ตอบว่า: "ไม่พบข้อมูลที่เกี่ยวข้องในหนังสือ"
3. ใช้ภาษาไทยที่ชัดเจน เข้าใจง่าย และมีโครงสร้างดี
4. อ้างอิงหน้าหรือหัวข้อจากหนังสือหากมี
5. ห้ามแต่งเรื่องขึ้นเองนอกเหนือจากข้อมูลในหนังสือ

เนื้อหาจากหนังสือ:
${context}

`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: question }
    ];

    return await AIService.generateResponse(messages, {
      temperature: 0.3,
      maxTokens: 800
    });
  }

  private static async saveChatMessage(
    sessionId: string,
    content: string,
    role: 'user' | 'assistant',
    metadata?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content,
        role,
        metadata
      });

    if (error) {
      console.error('Error saving chat message:', error);
    }
  }

  private static calculateConfidence(chunks: any[]): number {
    if (chunks.length === 0) return 0;

    const avgSimilarity = chunks.reduce((sum, chunk) =>
      sum + (chunk.similarity || 0.8), 0
    ) / chunks.length;

    return Math.round(avgSimilarity * 100) / 100;
  }

  static async getChatHistory(sessionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }

    return data || [];
  }

  static async getUserChatSessions(userId: string, bookId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data || [];
  }
}
