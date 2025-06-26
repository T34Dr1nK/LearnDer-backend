import { supabase } from '../lib/supabase';
import { AIService } from './groqai';

export interface ProcessingResult {
  success: boolean;
  chunksProcessed?: number;
  error?: string;
}

export interface SearchResult {
  content: string;
  page_number: number;
  chunk_index: number;
  metadata: any;
  similarity: number;
}

export class TextbookProcessor {
  private static readonly CHUNK_SIZE = 500; // words per chunk
  private static readonly CHUNK_OVERLAP = 50; // words overlap between chunks

  static async processPDFFile(
    file: File,
    bookId: string,
    metadata: { title: string; author: string }
  ): Promise<ProcessingResult> {
    try {
      await supabase
        .from('books')
        .update({ processing_status: 'processing' })
        .eq('id', bookId);

      const text = await this.extractTextFromPDF(file);
      const chunks = this.chunkText(text);
      
      let processedCount = 0;
      const batchSize = 10;

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (chunk, index) => {
            try {
              // เรียกใช้ generateEmbedding จาก groqai
              const embedding = await AIService.generateEmbedding(chunk.content);

              await supabase
                .from('book_embeddings')
                .insert({
                  book_id: bookId,
                  content: chunk.content,
                  embedding: embedding,
                  page_number: chunk.pageNumber,
                  chunk_index: chunk.chunkIndex,
                  metadata: {
                    ...metadata,
                    word_count: chunk.content.split(' ').length
                  }
                });

              processedCount++;
            } catch (error) {
              console.error(`Error processing chunk ${i + index}:`, error);
            }
          })
        );

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Update book status to completed
      await supabase
        .from('books')
        .update({ processing_status: 'completed' })
        .eq('id', bookId);

      return {
        success: true,
        chunksProcessed: processedCount
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      await supabase
        .from('books')
        .update({ processing_status: 'failed' })
        .eq('id', bookId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async searchSimilarContent(
    query: string,
    bookId: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      // เรียกใช้ generateEmbedding จาก groqai
      const queryEmbedding = await AIService.generateEmbedding(query);

      const { data, error } = await supabase.rpc('match_book_embeddings', {
        query_embedding: queryEmbedding,
        book_id: bookId,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) {
        console.error('Error searching embeddings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in similarity search:', error);
      return [];
    }
  }

  /**
   * Extract text from PDF file (simplified version)
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    // This is a simplified version. In production, you would use:
    // - pdf-parse library on the backend
    // - Or a PDF processing service
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // This is a mock implementation
        // In reality, you'd need proper PDF parsing
        const mockText = `
        บทที่ 1: การเคลื่อนที่ของวัตถุ
        
        การเคลื่อนที่เป็นปรากฏการณ์ที่เราพบเห็นในชีวิตประจำวันอยู่เสมอ ไม่ว่าจะเป็นการเดินของคน การวิ่งของสัตว์ หรือการเคลื่อนที่ของยานพาหนะต่างๆ

        ในบทนี้เราจะมาเรียนรู้เกี่ยวกับ:
        • ความหมายของการเคลื่อนที่
        • ประเภทของการเคลื่อนที่
        • ความเร็วและความเร่ง
        • กฎการเคลื่อนที่ของนิวตัน

        การเคลื่อนที่ (Motion) หมายถึง การเปลี่ยนแปลงตำแหน่งของวัตถุเมื่อเทียบกับจุดอ้างอิงหนึ่งๆ ตามเวลาที่ผ่านไป

        ตัวอย่างการเคลื่อนที่ในชีวิตประจำวัน:
        1. รถยนต์วิ่งบนถนน - เป็นการเคลื่อนที่แบบเส้นตรง
        2. เข็มนาฬิกา - เป็นการเคลื่อนที่แบบหมุน
        3. ลูกบอลที่ถูกโยนขึ้นไปในอากาศ - เป็นการเคลื่อนที่แบบโค้ง

        บทที่ 2: ความเร็วและความเร่ง
        
        ความเร็ว (Speed) คือ อัตราการเปลี่ยนแปลงของระยะทางต่อหน่วยเวลา

        สูตรการคำนวณความเร็ว:
        ความเร็ว = ระยะทาง ÷ เวลา
        v = s ÷ t

        หน่วยของความเร็ว:
        • เมตรต่อวินาที (m/s)
        • กิโลเมตรต่อชั่วโมง (km/h)
        • ไมล์ต่อชั่วโมง (mph)

        ความเร่ง (Acceleration) คือ อัตราการเปลี่ยนแปลงของความเร็วต่อหน่วยเวลา

        สูตรการคำนวณความเร่ง:
        ความเร่ง = การเปลี่ยนแปลงความเร็ว ÷ เวลา
        a = (v₂ - v₁) ÷ t
        `;
        
        resolve(mockText);
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsText(file); // This won't work for real PDFs
    });
  }

  /**
   * Split text into chunks with overlap
   */
  private static chunkText(text: string): Array<{
    content: string;
    pageNumber: number;
    chunkIndex: number;
  }> {
    const words = text.split(/\s+/);
    const chunks = [];
    let chunkIndex = 0;

    for (let i = 0; i < words.length; i += this.CHUNK_SIZE - this.CHUNK_OVERLAP) {
      const chunkWords = words.slice(i, i + this.CHUNK_SIZE);
      const content = chunkWords.join(' ');
      
      if (content.trim().length > 0) {
        chunks.push({
          content: content.trim(),
          pageNumber: Math.floor(i / 300) + 1, // Estimate page number
          chunkIndex: chunkIndex++
        });
      }
    }

    return chunks;
  }

  /**
   * Get processing status for a book
   */
  static async getProcessingStatus(bookId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('processing_status')
        .eq('id', bookId)
        .single();

      if (error) {
        console.error('Error fetching processing status:', error);
        return null;
      }

      return data?.processing_status || null;
    } catch (error) {
      console.error('Error getting processing status:', error);
      return null;
    }
  }

  /**
   * Delete all embeddings for a book
   */
  static async deleteBookEmbeddings(bookId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('book_embeddings')
        .delete()
        .eq('book_id', bookId);

      if (error) {
        console.error('Error deleting embeddings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting book embeddings:', error);
      return false;
    }
  }
}