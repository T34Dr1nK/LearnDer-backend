import React from 'react';
import { Book, Users, Star } from 'lucide-react'; // ไอคอนต่าง ๆ ที่ใช้ใน Card

// กำหนดชนิดของ props ที่ BookCard ต้องรับ
interface BookCardProps {
  id: string; // รหัสหนังสือ
  title: string; // ชื่อหนังสือ
  author: string; // ชื่อผู้แต่ง
  description: string; // คำอธิบายหนังสือ
  cover: string; // URL ปกหนังสือ (ยังไม่ได้ใช้ในโค้ดนี้)
  rating: number; // คะแนนรีวิว
  studentsCount: number; // จำนวนผู้เรียน
  onSelect: (bookId: string) => void; // ฟังก์ชันที่เรียกเมื่อกดปุ่ม "เริ่มอ่าน"
}

// คอมโพเนนต์ BookCard ที่แสดงข้อมูลหนังสือ
const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  description,
  cover,
  rating,
  studentsCount,
  onSelect
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100 hover:border-blue-200 transform hover:-translate-y-1">
      {/* ส่วนหัวของ Card */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-green-100 to-teal-100 flex items-center justify-center">
        {/* ไอคอนหนังสือ */}
        <Book className="h-16 w-16 text-blue-600" />

        {/* คะแนนรีวิวด้านมุมขวาบน */}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-sm">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      
      {/* ส่วนเนื้อหา */}
      <div className="p-6">
        {/* ชื่อหนังสือ */}
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
        </div>

        {/* ชื่อผู้แต่ง */}
        <p className="text-gray-600 text-sm mb-2">โดย {author}</p>

        {/* คำอธิบายหนังสือ */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{description}</p>
        
        {/* จำนวนผู้เรียน */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-sm">{studentsCount} นักเรียน</span>
          </div>
        </div>
        
        {/* ปุ่มเริ่มอ่านหนังสือ */}
        <button
          onClick={() => onSelect(id)} // 🔗 จุดเชื่อม Backend: เรียกฟังก์ชันเพื่อส่ง bookId ไปยัง backend เช่น GET /api/books/:id หรือ POST /api/user/start-reading
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {/* 🔗 BACKEND CONNECTION: API call to select book */}
          เริ่มอ่านหนังสือ
        </button>
      </div>
    </div>
  );
};

export default BookCard;
