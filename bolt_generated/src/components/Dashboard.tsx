import React, { useState } from 'react';
import { BarChart3, BookOpen, MessageCircle, TrendingUp, Users } from 'lucide-react';

//  Dashboard แสดงภาพรวมของระบบ
const Dashboard = () => {
  const [stats] = useState({ // ใช้ useState สำหรับเก็บค่าสถิติเบื้องต้น (mock data)
    totalBooks: 156,
    totalStudents: 2847,
    totalChats: 12439,
    averageRating: 4.7
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section: Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ภาพรวมระบบ</h2>
          <p className="text-gray-600">สถิติการใช้งานแพลตฟอร์มการเรียนรู้</p>
        </div>

        {/* Section: การ์ดสถิติ 4 ช่อง */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* การ์ด: จำนวนหนังสือทั้งหมด */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">หนังสือทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* การ์ด: จำนวนผู้ใช้งาน */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">นักเรียนที่ใช้งาน</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* การ์ด: จำนวนบทสนทนาทั้งหมด */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การสนทนาทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalChats.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* การ์ด: คะแนนเฉลี่ย */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Backend/Database Features Highlight */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8" />
            <h3 className="text-xl font-bold">🔗 จุดเชื่อมต่อ Backend/Database</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📚 ระบบจัดการหนังสือ</h4>
              <ul className="space-y-1 text-white text-opacity-90">
                <li>• ดึงข้อมูลหนังสือจาก Database</li>
                <li>• บันทึกการเลือกหนังสือของนักเรียน</li>
                <li>• อัพเดทสถิติการใช้งาน</li>
                <li>• ระบบค้นหาและกรองหนังสือ</li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🤖 ระบบ AI Chatbot</h4>
              <ul className="space-y-1 text-white text-opacity-90">
                <li>• เชื่อมต่อ AI API สำหรับตอบคำถาม</li>
                <li>• ดึงเนื้อหาหนังสือจาก Vector Database</li>
                <li>• บันทึกประวัติการสนทนา</li>
                <li>• วิเคราะห์พฤติกรรมการเรียนรู้</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Popular Books */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">หนังสือยอดนิยม</h3>
          <div className="space-y-3">
            {[
              { title: 'วิทยาศาสตร์น่ารู้ ชั้นมัธยมศึกษาตอนต้น', chats: 1420, rating: 4.8 },
              { title: 'ประวัติศาสตร์ไทย เรื่องราวที่น่าทึ่ง', chats: 1205, rating: 4.9 },
              { title: 'คณิตศาสตร์พื้นฐานเพื่อชีวิต', chats: 892, rating: 4.6 },
            ].map((book, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{book.title}</p>
                  <p className="text-sm text-gray-600">{book.chats} การสนทนา</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">★ {book.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;