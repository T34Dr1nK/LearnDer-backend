import { supabase } from '../lib/supabase';
import { openai } from './openai';

export interface TextChunk {
  content: string;
  pageNumber: number;
  chunkIndex: number;
  metadata: {
    title?: string;
    author?: string;
    section?: string;
  };
}

export interface ProcessingResult {
  success: boolean;
  bookId: string;
  chunksProcessed: number;
  error?: string;
}

export class TextbookProcessor {
  private static readonly CHUNK_SIZE = 1000;
  private static readonly CHUNK_OVERLAP = 200;

  /**
   * Process a PDF file and extract text chunks with embeddings
   */
  static async processPDFFile(
    file: File,
    bookId: string,
    metadata: { title: string; author: string }
  ): Promise<ProcessingResult> {
    try {
      // Update book status to processing
      await supabase
        .from('books')
        .update({ processing_status: 'processing' })
        .eq('id', bookId);

      // Extract text from PDF
      const textChunks = await this.extractTextFromPDF(file, metadata);
      
      // Generate embeddings for each chunk
      const embeddedChunks = await this.generateEmbeddings(textChunks, bookId);
      
      // Save to Supabase
      await this.saveEmbeddingsToDatabase(embeddedChunks);
      
      // Update book status to completed
      await supabase
        .from('books')
        .update({ processing_status: 'completed' })
        .eq('id', bookId);

      return {
        success: true,
        bookId,
        chunksProcessed: embeddedChunks.length
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      
      // Update book status to failed
      await supabase
        .from('books')
        .update({ processing_status: 'failed' })
        .eq('id', bookId);

      return {
        success: false,
        bookId,
        chunksProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract text from PDF file
   */
  private static async extractTextFromPDF(
    file: File,
    metadata: { title: string; author: string }
  ): Promise<TextChunk[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // For demo purposes, we'll simulate PDF text extraction
          // In production, you'd use a proper PDF parsing library
          const mockText = this.generateMockTextContent(metadata.title);
          const chunks = this.splitTextIntoChunks(mockText, metadata);
          
          resolve(chunks);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generate mock text content for demonstration
   */
  private static generateMockTextContent(title: string): string {
    const sections = [
      {
        title: "บทที่ 1: บทนำ",
        content: `${title} เป็นหนังสือที่รวบรวมความรู้พื้นฐานที่สำคัญ โดยมีเนื้อหาที่ครอบคลุมและเข้าใจง่าย เหมาะสำหรับผู้เรียนทุกระดับ การเรียนรู้จากหนังสือเล่มนี้จะช่วยให้ผู้อ่านได้รับความรู้ที่มีประโยชน์และสามารถนำไปประยุกต์ใช้ในชีวิตประจำวันได้`
      },
      {
        title: "บทที่ 2: แนวคิดพื้นฐาน",
        content: "แนวคิดพื้นฐานที่สำคัญในการเรียนรู้ ประกอบด้วยหลักการต่างๆ ที่จำเป็นต้องเข้าใจ เพื่อเป็นรากฐานในการศึกษาต่อไป ผู้เรียนควรทำความเข้าใจกับแนวคิดเหล่านี้ให้ชัดเจนก่อนที่จะไปสู่เนื้อหาที่ซับซ้อนมากขึ้น"
      },
      {
        title: "บทที่ 3: การประยุกต์ใช้",
        content: "การนำความรู้ที่ได้เรียนมาประยุกต์ใช้ในสถานการณ์จริง เป็นสิ่งสำคัญที่จะทำให้การเรียนรู้มีความหมายและเกิดประโยชน์สูงสุด ตัวอย่างการประยุกต์ใช้ในชีวิตประจำวันจะช่วยให้เข้าใจได้ดียิ่งขึ้น"
      }
    ];

    return sections.map(section => `${section.title}\n\n${section.content}`).join('\n\n');
  }

  /**
   * Split text into chunks for embedding
   */
  private static splitTextIntoChunks(
    text: string,
    metadata: { title: string; author: string }
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    let pageNumber = 1;

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > this.CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          pageNumber,
          chunkIndex,
          metadata: {
            title: metadata.title,
            author: metadata.author,
            section: this.extractSectionTitle(currentChunk)
          }
        });
        
        chunkIndex++;
        currentChunk = paragraph;
        
        // Simulate page breaks
        if (chunkIndex % 3 === 0) {
          pageNumber++;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    // Add the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        pageNumber,
        chunkIndex,
        metadata: {
          title: metadata.title,
          author: metadata.author,
          section: this.extractSectionTitle(currentChunk)
        }
      });
    }

    return chunks;
  }

  /**
   * Extract section title from chunk content
   */
  private static extractSectionTitle(content: string): string {
    const lines = content.split('\n');
    const firstLine = lines[0].trim();
    
    // Check if first line looks like a title (contains "บทที่" or is short and capitalized)
    if (firstLine.includes('บทที่') || (firstLine.length < 100 && firstLine === firstLine.toUpperCase())) {
      return firstLine;
    }
    
    return '';
  }

  /**
   * Generate embeddings for text chunks
   */
  private static async generateEmbeddings(
    chunks: TextChunk[],
    bookId: string
  ): Promise<any[]> {
    const embeddedChunks = [];

    for (const chunk of chunks) {
      try {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk.content,
        });

        embeddedChunks.push({
          id: crypto.randomUUID(),
          book_id: bookId,
          content: chunk.content,
          embedding: embedding.data[0].embedding,
          page_number: chunk.pageNumber,
          chunk_index: chunk.chunkIndex,
          metadata: chunk.metadata,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error generating embedding for chunk:', error);
        // Continue with other chunks even if one fails
      }
    }

    return embeddedChunks;
  }

  /**
   * Save embeddings to Supabase database
   */
  private static async saveEmbeddingsToDatabase(embeddedChunks: any[]): Promise<void> {
    const { error } = await supabase
      .from('book_embeddings')
      .insert(embeddedChunks);

    if (error) {
      throw new Error(`Failed to save embeddings: ${error.message}`);
    }
  }

  /**
   * Search for relevant content using vector similarity
   */
  static async searchSimilarContent(
    query: string,
    bookId: string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
      });

      // Search for similar embeddings using Supabase's vector similarity
      const { data, error } = await supabase.rpc('match_book_embeddings', {
        query_embedding: queryEmbedding.data[0].embedding,
        book_id: bookId,
        match_threshold: 0.7,
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
}