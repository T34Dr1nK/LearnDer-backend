import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, MessageCircle, TrendingUp, Users, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalBooks: number;
  totalStudents: number;
  totalChats: number;
  averageRating: number;
}

interface PopularBook {
  id: string;
  title: string;
  chats: number;
  rating: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalStudents: 0,
    totalChats: 0,
    averageRating: 0
  });
  const [popularBooks, setPopularBooks] = useState<PopularBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch books count and basic stats
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title')
        .eq('processing_status', 'completed');

      if (booksError) throw booksError;

      // Fetch chat sessions count (as proxy for total chats)
      const { count: chatCount, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true });

      if (chatError) throw chatError;

      // Fetch total messages count
      const { count: messageCount, error: messageError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

      if (messageError) throw messageError;

      // Get unique users count from chat sessions
      const { data: usersData, error: usersError } = await supabase
        .from('chat_sessions')
        .select('user_id')
        .not('user_id', 'is', null);

      if (usersError) throw usersError;

      const uniqueUsers = new Set(usersData?.map(session => session.user_id) || []).size;

      // Calculate popular books based on chat sessions
      const { data: popularBooksData, error: popularError } = await supabase
        .from('chat_sessions')
        .select(`
          book_id,
          books!inner(id, title)
        `);

      if (popularError) throw popularError;

      // Group by book and count sessions
      const bookChatCounts = popularBooksData?.reduce((acc: any, session: any) => {
        const bookId = session.book_id;
        const bookTitle = session.books.title;
        
        if (!acc[bookId]) {
          acc[bookId] = {
            id: bookId,
            title: bookTitle,
            chats: 0,
            rating: 4.5 // Default rating since we don't have ratings yet
          };
        }
        acc[bookId].chats++;
        return acc;
      }, {}) || {};

      const popularBooksArray = Object.values(bookChatCounts)
        .sort((a: any, b: any) => b.chats - a.chats)
        .slice(0, 3) as PopularBook[];

      setStats({
        totalBooks: booksData?.length || 0,
        totalStudents: uniqueUsers,
        totalChats: messageCount || 0,
        averageRating: 4.7 // Default until we implement ratings
      });

      setPopularBooks(popularBooksArray);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <li>• ดึงข้อมูลหนังสือจาก Supabase Database</li>
                <li>• บันทึกการเลือกหนังสือของนักเรียน</li>
                <li>• อัพเดทสถิติการใช้งานแบบ Real-time</li>
                <li>• ระบบค้นหาและกรองหนังสือ</li>
              </ul>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🤖 ระบบ AI Chatbot</h4>
              <ul className="space-y-1 text-white text-opacity-90">
                <li>• เชื่อมต่อ OpenAI API สำหรับตอบคำถาม</li>
                <li>• ดึงเนื้อหาหนังสือจาก Vector Database</li>
                <li>• บันทึกประวัติการสนทนาใน Supabase</li>
                <li>• วิเคราะห์พฤติกรรมการเรียนรู้</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Popular Books - แสดงเฉพาะเมื่อมีข้อมูล */}
        {popularBooks.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">หนังสือยอดนิยม</h3>
            <div className="space-y-3">
              {popularBooks.map((book, index) => (
                <div key={book.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
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
        )}

        {/* แสดงข้อความเมื่อไม่มีข้อมูล */}
        {popularBooks.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">หนังสือยอดนิยม</h3>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีข้อมูลการใช้งาน</p>
              <p className="text-sm text-gray-400 mt-1">เมื่อมีการใช้งานระบบแล้ว ข้อมูลจะแสดงที่นี่</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;