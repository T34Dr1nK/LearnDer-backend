/*
  # Textbook Processing and Q&A System

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `author` (text)
      - `description` (text, optional)
      - `category` (text)
      - `file_path` (text, optional)
      - `processing_status` (enum: pending, processing, completed, failed)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `book_embeddings`
      - `id` (uuid, primary key)
      - `book_id` (uuid, references books)
      - `content` (text)
      - `embedding` (vector)
      - `page_number` (integer)
      - `chunk_index` (integer)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
    
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `book_id` (uuid, references books)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references chat_sessions)
      - `content` (text)
      - `role` (enum: user, assistant)
      - `metadata` (jsonb, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Teachers can manage books they created
    - Students can access published books and their own chat sessions

  3. Functions
    - Vector similarity search function for embeddings
    - Full-text search capabilities
*/

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enum types
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  category text NOT NULL,
  file_path text,
  processing_status processing_status DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create book_embeddings table with vector column
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

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content text NOT NULL,
  role message_role NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for books table
CREATE POLICY "Users can view published books"
  ON books
  FOR SELECT
  TO authenticated
  USING (processing_status = 'completed');

CREATE POLICY "Teachers can manage their own books"
  ON books
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for book_embeddings table
CREATE POLICY "Users can view embeddings for accessible books"
  ON book_embeddings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_embeddings.book_id 
      AND (books.processing_status = 'completed' OR books.created_by = auth.uid())
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
      AND books.created_by = auth.uid()
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
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status);

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

-- Create triggers for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();