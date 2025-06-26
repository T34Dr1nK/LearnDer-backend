/*
  # Create Book Embeddings and Processing System

  1. New Tables
    - `book_embeddings` - Store text chunks with vector embeddings
    - Update existing tables to support processing status

  2. Extensions
    - Enable vector extension for embeddings

  3. Functions
    - Vector similarity search function

  4. Security
    - RLS policies for new tables
*/

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum types if they don't exist
DO $$ BEGIN
  CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE message_role AS ENUM ('user', 'assistant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add processing_status column to existing books table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE books ADD COLUMN processing_status processing_status DEFAULT 'pending';
  END IF;
END $$;

-- Add file_path column to books table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE books ADD COLUMN file_path text;
  END IF;
END $$;

-- Add description column to books table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'description'
  ) THEN
    ALTER TABLE books ADD COLUMN description text;
  END IF;
END $$;

-- Add category column to books table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'category'
  ) THEN
    ALTER TABLE books ADD COLUMN category text;
  END IF;
END $$;

-- Create book_embeddings table
CREATE TABLE IF NOT EXISTS book_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  page_number integer,
  chunk_index integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create chat_sessions table (separate from existing chat table)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table (for the new chat system)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  role message_role NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE book_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for book_embeddings table
CREATE POLICY "Users can view embeddings for accessible books"
  ON book_embeddings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_embeddings.book_id 
      AND (books.processing_status = 'completed' OR books.uploaded_by = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage embeddings for their books"
  ON book_embeddings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_embeddings.book_id 
      AND books.uploaded_by = auth.uid()
    )
  );

-- Create policies for chat_sessions table
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for chat_messages table
CREATE POLICY "Users can manage messages in their own sessions"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_book_embeddings_book_id ON book_embeddings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_embeddings_embedding ON book_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_book_id ON chat_sessions(book_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_book_embeddings(
  query_embedding vector(1536),
  book_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  book_id uuid,
  content text,
  page_number int,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    book_embeddings.id,
    book_embeddings.book_id,
    book_embeddings.content,
    book_embeddings.page_number,
    book_embeddings.chunk_index,
    book_embeddings.metadata,
    1 - (book_embeddings.embedding <=> query_embedding) AS similarity
  FROM book_embeddings
  WHERE book_embeddings.book_id = match_book_embeddings.book_id
    AND 1 - (book_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY book_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();