import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  MessageSquare,
  Plus,
  BarChart3,
  Settings,
  Upload,
  Edit,
  Trash2,
  Eye,
  Cpu,
  Database
} from 'lucide-react';
import BookUploader from './BookUploader';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  studentsCount: number;
  chatsCount: number;
  rating: number;
  status: 'active' | 'draft' | 'processing' | 'failed';
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'analytics'>('overview');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [books, setBooks] = useState<Book[]>([
    {
      id: '1',
      title: 'วิทยาศาสตร์น่ารู้ ชั้นมัธยมศึกษาตอนต้น',
      author: 'ดร.สมชาย วิทยาคม',
      category: 'science',
      studentsCount: 1205,
      chatsCount: 3420,
      rating: 4.8,
      status: 'active',
      processingStatus: 'completed'
    },
    {
      id: '2',
      title: 'คณิตศาสตร์พื้นฐานเพื่อชีวิต',
      author: 'อาจารย์สมหญิง เลขคณิต',
      category: 'math',
      studentsCount: 892,
      chatsCount: 2156,
      rating: 4.6,
      status: 'active',
      processingStatus: 'completed'
    }
  ]);

  const stats = {
    totalBooks: books.length,
    totalStudents: books.reduce((sum, book) => sum + book.studentsCount, 0),
    totalChats: books.reduce((sum, book) => sum + book.chatsCount, 0),
    averageRating: books.reduce((sum, book) => sum + book.rating, 0) / books.length,
    processingBooks: books.filter(book => book.processingStatus === 'processing').length,
    completedBooks: books.filter(book => book.processingStatus === 'completed').length
  };

  const handleUploadComplete = (bookId: string) => {
    // Refresh books list or update the specific book
    console.log('Book uploaded successfully:', bookId);
    setShowAddBookModal(false);
    // In a real app, you would fetch the updated book data
  };

  const getStatusBadge = (status: string, processingStatus?: string) => {
    if (processingStatus === 'processing') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          <Cpu className="h-3 w-3 mr-1 animate-spin" />
          กำลังประมวลผล
        </span>
      );
    }
    
    if (processingStatus === 'failed') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          ประมวลผลล้มเหลว
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            เปิดใช้งาน
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            ร่าง
          </span>
        );
      default:
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">แดชบอร์ดอาจารย์</h1>
              <p className="text-purple-100 mt-1">จัดการหนังสือและติดตามการเรียนรู้ของนักเรียน</p>
            </div>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="mt-4 sm:mt-0 bg-white text-blue-800 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>อัพโหลดหนังสือ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
              { id: 'books', label: 'จัดการหนังสือ', icon: BookOpen },
              { id: 'analytics', label: 'วิเคราะห์', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">หนังสือทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">นักเรียนทั้งหมด</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">การสนทนา AI</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalChats.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Processing Status */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="h-8 w-8" />
                <h3 className="text-xl font-bold">🤖 สถานะระบบ AI</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📚 การประมวลผลหนังสือ</h4>
                  <ul className="space-y-1 text-white text-opacity-90">
                    <li>• หนังสือที่ประมวลผลแล้ว: {stats.completedBooks}</li>
                    <li>• กำลังประมวลผล: {stats.processingBooks}</li>
                    <li>• Text Embeddings: {stats.completedBooks * 150} chunks</li>
                    <li>• Vector Database: พร้อมใช้งาน</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🔍 ระบบค้นหา</h4>
                  <ul className="space-y-1 text-white text-opacity-90">
                    <li>• Semantic Search: เปิดใช้งาน</li>
                    <li>• Similarity Threshold: 0.7</li>
                    <li>• Response Time: ~2.3s</li>
                    <li>• Accuracy Rate: 94.2%</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🤖 AI Model</h4>
                  <ul className="space-y-1 text-white text-opacity-90">
                    <li>• Embedding: text-embedding-3-small</li>
                    <li>• Chat Model: GPT-3.5-turbo</li>
                    <li>• Context Window: 4,096 tokens</li>
                    <li>• Temperature: 0.3</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">กิจกรรมล่าสุด</h3>
              <div className="space-y-4">
                {[
                  { action: 'หนังสือใหม่ประมวลผลเสร็จ', book: 'ฟิสิกส์ขั้นสูง', time: '10 นาทีที่แล้ว', type: 'success' },
                  { action: 'นักเรียนใหม่เข้าร่วม', book: 'วิทยาศาสตร์น่ารู้', time: '15 นาทีที่แล้ว', type: 'info' },
                  { action: 'การสนทนา AI ใหม่', book: 'คณิตศาสตร์พื้นฐาน', time: '25 นาทีที่แล้ว', type: 'info' },
                  { action: 'รีวิวใหม่', book: 'ประวัติศาสตร์ไทย', time: '1 ชั่วโมงที่แล้ว', type: 'info' },
                ].map((activity, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                    activity.type === 'success' ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gradient-to-r from-purple-50 to-pink-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {activity.type === 'success' && <Cpu className="h-5 w-5 text-green-600" />}
                      {activity.type === 'info' && <MessageSquare className="h-5 w-5 text-blue-600" />}
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.book}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Books Management Tab */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-purple-100">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-900">จัดการหนังสือ</h3>
                <p className="text-sm text-gray-600 mt-1">อัพโหลด แก้ไข และจัดการหนังสือพร้อมระบบ AI</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หนังสือ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นักเรียน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Chats</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คะแนน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((book) => (
                      <tr key={book.id} className="hover:bg-purple-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{book.title}</p>
                            <p className="text-sm text-gray-600">{book.author}</p>
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                              {book.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{book.studentsCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{book.chatsCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">★ {book.rating}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(book.status, book.processingStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800" title="ดูรายละเอียด">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-800" title="แก้ไข">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800" title="ลบ">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">การวิเคราะห์การใช้งาน AI</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">หนังสือยอดนิยม (AI Chats)</h4>
                  <div className="space-y-2">
                    {books.map((book, index) => (
                      <div key={book.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{index + 1}. {book.title}</span>
                        <span className="text-sm font-medium text-purple-600">{book.chatsCount} chats</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🔗 AI Performance Metrics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• คำถามที่ถูกถามบ่อยที่สุด: "อธิบายแนวคิดหลัก"</li>
                    <li>• หัวข้อที่นักเรียนสนใจ: วิทยาศาสตร์ 45%</li>
                    <li>• ประสิทธิภาพการตอบคำถาม: 94.2%</li>
                    <li>• เวลาการตอบเฉลี่ย: 2.3 วินาที</li>
                    <li>• Embedding Accuracy: 96.8%</li>
                    <li>• Context Relevance: 91.5%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Uploader Modal */}
      {showAddBookModal && (
        <BookUploader
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowAddBookModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;