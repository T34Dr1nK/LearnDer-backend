import { pipeline } from '@xenova/transformers';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '../lib/supabase';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_CHARS_PER_CHUNK = 800;

export const TextbookProcessor = {
  async processPDFFile(file: File, bookId: string, metadata: { title: string; author: string }
  ): Promise<{ success: true; chunksProcessed: number } | { success: false; error: string }> {
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      const chunks = splitIntoChunks(fullText, MAX_CHARS_PER_CHUNK);
      const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await embedder(chunks[i]);
        const vector = Array.from(embedding.data[0]); // 384-dim vector

        const { error } = await supabase.from('book_sections').insert({
          book_id: bookId,
          section_num: i,
          content: chunks[i],
          embedding: vector,
        });

        if (error) {
          throw new Error(`Supabase insert failed: ${error.message}`);
        }
      }

      return { success: true, chunksProcessed: chunks.length };
    } catch (err) {
      console.error('[TextbookProcessor] Error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
};

function splitIntoChunks(text: string, maxLen: number): string[] {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  let chunk = '';

  for (const sentence of sentences) {
    if ((chunk + sentence).length > maxLen) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += sentence + ' ';
  }
  if (chunk.trim()) chunks.push(chunk.trim());

  return chunks;
}
