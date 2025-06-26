import React, { useState, useEffect } from 'react';
import { BookOpen, Filter, Loader, AlertCircle } from 'lucide-react';
import BookCard from './BookCard';
import { supabase } from '../lib/supabase';

// อินเทอร์เฟซสำหรับข้อมูลหนังสือ
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  rating: number;
  studentsCount: number;
  category: string;
}

// อินเทอร์เฟซสำหรับ props ที่คอมโพเนนต์ BookLibrary จะรับ
interface BookLibraryProps {
  onBookSelect: (bookId: string) => void; // ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้เลือกหนังสือ
}

const BookLibrary: React.FC<BookLibraryProps> = ({ onBookSelect }) => {
  const [books, setBooks] = useState<Book[]>([]); // เก็บข้อมูลหนังสือทั้งหมด
  const [loading, setLoading] = useState(true); // สถานะโหลดข้อมูล
  const [error, setError] = useState<string | null>(null); // สถานะ error
  const [selectedCategory, setSelectedCategory] = useState('all'); // หมวดหมู่ที่เลือก
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([
    { id: 'all', name: 'ทั้งหมด' }
  ]); // หมวดหมู่ที่มีอยู่

  // ดึงข้อมูลหนังสือจาก Supabase
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      // ดึงข้อมูลหนังสือที่ประมวลผลเสร็จแล้ว
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false });

      if (booksError) throw booksError;

      // ดึงข้อมูลจำนวนนักเรียนที่ใช้งานแต่ละหนังสือ
      const booksWithStats = await Promise.all(
        (booksData || []).map(async (book) => {
          // นับจำนวน unique users ที่มี chat sessions กับหนังสือนี้
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('chat_sessions')
            .select('user_id')
            .eq('book_id', book.id);

          if (sessionsError) {
            console.error('Error fetching sessions for book:', book.id, sessionsError);
          }

          const uniqueUsers = new Set(sessionsData?.map(session => session.user_id) || []).size;

          return {
            id: book.id,
            title: book.title,
            author: book.author,
            description: book.description || 'ไม่มีคำอธิบาย',
            cover: '/api/placeholder/300/400', // placeholder image
            rating: 4.5, // default rating จนกว่าจะมีระบบ rating
            studentsCount: uniqueUsers,
            category: book.category
          };
        })
      );

      setBooks(booksWithStats);

      // สร้างรายการหมวดหมู่จากข้อมูลที่ดึงมา
      const uniqueCategories = [...new Set(booksWithStats.map(book => book.category))];
      const categoryOptions = [
        { id: 'all', name: 'ทั้งหมด' },
        ...uniqueCategories.map(cat => ({
          id: cat,
          name: getCategoryDisplayName(cat)
        }))
      ];
      setCategories(categoryOptions);

    } catch (err) {
      console.error('Error fetching books:', err);
      setError('ไม่สามารถโหลดข้อมูลหนังสือได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // แปลงชื่อหมวดหมู่เป็นภาษาไทย
  const getCategoryDisplayName = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'science': 'วิทยาศาสตร์',
      'math': 'คณิตศาสตร์',
      'history': 'ประวัติศาสตร์',
      'language': 'ภาษา',
      'social': 'สังคมศึกษา',
      'art': 'ศิลปะ',
      'other': 'อื่นๆ'
    };
    return categoryMap[category] || category;
  };

  // กรองหนังสือตามหมวดหมู่ที่เลือก
  const filteredBooks = selectedCategory === 'all' 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  // แสดงโหลดหน้าจอระหว่างดึงข้อมูล
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดหนังสือจาก Supabase...</p>
        </div>
      </div>
    );
  }

  // แสดง error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBooks}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* หัวข้อหน้า */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ห้องสมุดหนังสือ</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            เลือกหนังสือที่คุณสนใจ แล้วใช้ AI ผู้ช่วยเพื่อเรียนรู้และทำความเข้าใจเนื้อหาอย่างลึกซึ้ง
          </p>
          <div className="mt-4 text-sm text-blue-600">
            📚 ข้อมูลจาก Supabase Database • {books.length} หนังสือ
          </div>
        </div>

        {/* ตัวกรองหมวดหมู่ */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700 font-medium">หมวดหมู่:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* แสดงรายการหนังสือแบบ grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onSelect={onBookSelect}
              />
            ))}
          </div>
        ) : (
          /* กรณีไม่มีหนังสือ */
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            {selectedCategory === 'all' ? (
              <div>
                <p className="text-gray-500 mb-2">ยังไม่มีหนังสือในระบบ</p>
                <p className="text-sm text-gray-400">อาจารย์สามารถอัพโหลดหนังสือใหม่ได้</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 mb-2">ไม่พบหนังสือในหมวดหมู่นี้</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ดูหนังสือทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookLibrary;