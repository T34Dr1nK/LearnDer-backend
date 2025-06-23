import React, { useState, useEffect } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import BookCard from './BookCard';

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
  const [selectedCategory, setSelectedCategory] = useState('all'); // หมวดหมู่ที่เลือก

  // 🔗 BACKEND CONNECTION: ดึงข้อมูลหนังสือจาก Database หรือ API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // 👉 TODO: เปลี่ยน mockBooks ให้กลายเป็น fetch จริงจาก backend
        const mockBooks: Book[] = [
          {
            id: '1',
            title: 'วิทยาศาสตร์น่ารู้ ชั้นมัธยมศึกษาตอนต้น',
            author: 'ดร.สมชาย วิทยาคม',
            description: 'หนังสือวิทยาศาสตร์ที่อธิบายเรื่องราวต่างๆ ในธรรมชาติอย่างน่าสนใจ พร้อมการทดลองที่สามารถทำได้ที่บ้าน',
            cover: '/api/placeholder/300/400', // 🔗 อาจเชื่อมกับ URL รูปจาก backend
            rating: 4.8,
            studentsCount: 1205,
            category: 'science'
          },
          {
            id: '2',
            title: 'คณิตศาสตร์พื้นฐานเพื่อชีวิต',
            author: 'อาจารย์สมหญิง เลขคณิต',
            description: 'เรียนรู้คณิตศาสตร์ผ่านสถานการณ์จริงในชีวิตประจำวัน ทำให้เข้าใจง่ายและนำไปใช้ได้จริง',
            cover: '/api/placeholder/300/400',
            rating: 4.6,
            studentsCount: 892,
            category: 'math'
          },
          {
            id: '3',
            title: 'ประวัติศาสตร์ไทย เรื่องราวที่น่าทึ่ง',
            author: 'ศาสตราจารย์พิมพ์ใจ ประวัติศาสตร์',
            description: 'ค้นพบเรื่องราวที่น่าสนใจในประวัติศาสตร์ไทย ผ่านมุมมองใหม่ที่ทำให้เยาวชนหลงใหล',
            cover: '/api/placeholder/300/400',
            rating: 4.9,
            studentsCount: 756,
            category: 'history'
          },
          {
            id: '4',
            title: 'ภาษาอังกฤษเพื่อการสื่อสาร',
            author: 'ครูสมใจ ภาษาดี',
            description: 'เรียนรู้ภาษาอังกฤษผ่านสถานการณ์จริง พร้อมเทคนิคการฝึกฝนที่ได้ผลจริง',
            cover: '/api/placeholder/300/400',
            rating: 4.7,
            studentsCount: 634,
            category: 'language'
          }
        ];

        // 🔗 MOCK: จำลองการโหลดข้อมูล ควรแทนที่ด้วย API เช่น fetch('/api/books')
        setTimeout(() => {
          setBooks(mockBooks);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching books:', error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // ตัวเลือกหมวดหมู่
  const categories = [
    { id: 'all', name: 'ทั้งหมด' },
    { id: 'science', name: 'วิทยาศาสตร์' },
    { id: 'math', name: 'คณิตศาสตร์' },
    { id: 'history', name: 'ประวัติศาสตร์' },
    { id: 'language', name: 'ภาษา' }
  ];

  // กรองหนังสือตามหมวดหมู่ที่เลือก
  const filteredBooks = selectedCategory === 'all' 
    ? books 
    : books.filter(book => book.category === selectedCategory);

  // แสดงโหลดหน้าจอระหว่างดึงข้อมูล
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดหนังสือ...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              {...book}
              onSelect={onBookSelect} // 🔗 BACKEND CONNECTION: ใช้ฟังก์ชันนี้เพื่อทำ action เช่น update ว่าผู้ใช้เริ่มอ่านเล่มไหน
            />
          ))}
        </div>

        {/* กรณีไม่มีหนังสือในหมวดหมู่ที่เลือก */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ไม่พบหนังสือในหมวดหมู่นี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookLibrary;
