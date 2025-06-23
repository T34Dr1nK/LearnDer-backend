import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface BookEmbedding {
  id: string;
  book_id: string;
  content: string;
  embedding: number[];
  page_number: number;
  chunk_index: number;
  metadata: {
    title?: string;
    author?: string;
    section?: string;
  };
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  category: string;
  file_path?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  book_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  metadata?: {
    sources?: string[];
    confidence?: number;
  };
  created_at: string;
}