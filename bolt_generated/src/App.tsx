import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BookLibrary from './components/BookLibrary';
import BookReader from './components/BookReader';
import ChatBot from './components/ChatBot';
import TeacherDashboard from './components/TeacherDashboard';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Profile from './components/Profile';
import { Home, BookOpen, MessageSquare, BarChart3, Users, Settings } from 'lucide-react';
import { User } from './types/auth';

function App() {
  // state เก็บข้อมูลผู้ใช้งาน (null = ยังไม่ล็อกอิน)
  const [user, setUser] = useState<User | null>(null);

  // state ควบคุมสถานะการโหลด (เช่น ระหว่างรอ login/register)
  const [isLoading, setIsLoading] = useState(false);

  // state สำหรับแสดงฟอร์มลงทะเบียนแทน login หรือไม่ (true = แสดงฟอร์มลงทะเบียน)
  const [showRegister, setShowRegister] = useState(false);

  // state เก็บหน้าปัจจุบันที่แอปแสดง เช่น dashboard, library, chat, profile, teacher-dashboard, etc.
  // กำหนดค่าเริ่มต้นเป็น 'dashboard'
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'library' | 'reader' | 'chat' | 'teacher-dashboard' | 'teacher-books' | 'teacher-analytics' | 'profile'
  >('dashboard');

  // state เก็บข้อมูลหนังสือที่ถูกเลือก (id, title, author)
  const [selectedBook, setSelectedBook] = useState<{
    id: string;
    title: string;
    author: string;
  } | null>(null);

  // ฟังก์ชันจำลองการล็อกอิน (ต้องแก้ให้เชื่อม API จริง)
  // รับ email, password และ role (teacher หรือ student)
  const handleLogin = async (email: string, password: string, role: 'teacher' | 'student') => {
    setIsLoading(true); // ตั้งสถานะกำลังโหลดเป็น true

    try {
      // mock API call โดยใช้ setTimeout จำลองการตอบกลับ 1.5 วินาที
      setTimeout(() => {
        // สร้าง mock user object
        const mockUser: User = {
          id: '1',
          email,
          name: role === 'teacher' ? 'อาจารย์สมชาย' : 'นักเรียนสมหญิง',
          role
        };

        setUser(mockUser); // เก็บ user ลง state
        // เปลี่ยนหน้าปัจจุบันให้เป็น 'teacher-dashboard' ถ้าเป็นครู, หรือ 'chat' ถ้าเป็นนักเรียน
        setCurrentView(role === 'teacher' ? 'teacher-dashboard' : 'chat');
        setIsLoading(false); // โหลดเสร็จแล้ว
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  // ฟังก์ชันจำลองการลงทะเบียน (ต้องแก้ให้เชื่อม API จริง)
  // รับ email, password, name และ role
  const handleRegister = async (email: string, password: string, name: string, role: 'teacher' | 'student') => {
    setIsLoading(true);

    try {
      setTimeout(() => {
        // สร้าง mock user object
        const mockUser: User = {
          id: Date.now().toString(), // ใช้ timestamp เป็น id ชั่วคราว
          email,
          name,
          role
        };

        setUser(mockUser);
        setCurrentView(role === 'teacher' ? 'teacher-dashboard' : 'chat'); // เปลี่ยนหน้า
        setShowRegister(false); // ซ่อนฟอร์มลงทะเบียน
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
    }
  };

  // ฟังก์ชันสำหรับ logout
  const handleLogout = () => {
    setUser(null);            // ล้างข้อมูลผู้ใช้
    setCurrentView('dashboard'); // กลับไปหน้า dashboard เริ่มต้น
    setSelectedBook(null);    // ล้างหนังสือที่เลือก
    setShowRegister(false);   // ซ่อนฟอร์มลงทะเบียน
  };

  // ฟังก์ชันเมื่อผู้ใช้เลือกหนังสือจากห้องสมุด
  const handleBookSelect = (bookId: string) => {
    // mock ข้อมูลหนังสือ (ในแอปจริงต้องดึงจาก API)
    const books = {
      '1': { id: '1', title: 'วิทยาศาสตร์น่ารู้ ชั้นมัธยมศึกษาตอนต้น', author: 'ดร.สมชาย วิทยาคม' },
      '2': { id: '2', title: 'คณิตศาสตร์พื้นฐานเพื่อชีวิต', author: 'อาจารย์สมหญิง เลขคณิต' },
      '3': { id: '3', title: 'ประวัติศาสตร์ไทย เรื่องราวที่น่าทึ่ง', author: 'ศาสตราจารย์พิมพ์ใจ ประวัติศาสตร์' }
    };

    const book = books[bookId as keyof typeof books];
    if (book) {
      setSelectedBook(book);      // เก็บหนังสือที่เลือก
      setCurrentView('chat');     // เปลี่ยนหน้าจอไปที่ ChatBot (ฟีเจอร์หลักสำหรับนักเรียน)
    }
  };

  // ฟังก์ชันกลับไปหน้า Library
  const handleBackToLibrary = () => {
    setCurrentView('library');
    setSelectedBook(null); // เคลียร์หนังสือที่เลือก
  };

  // ฟังก์ชันกลับไปหน้า Chat
  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  // ฟังก์ชันเมื่อคลิกดูโปรไฟล์
  const handleProfileClick = () => {
    setCurrentView('profile');
  };

  // ฟังก์ชันย้อนกลับจากหน้าโปรไฟล์
  const handleBackFromProfile = () => {
    // ถ้าเป็นครู ให้กลับไป dashboard ครู
    // ถ้าเป็นนักเรียน ให้กลับไป chat
    setCurrentView(user?.role === 'teacher' ? 'teacher-dashboard' : 'chat');
  };

  // ถ้ายังไม่ล็อกอิน ให้แสดงหน้าล็อกอิน หรือถ้าเลือกลงทะเบียน ให้แสดงฟอร์มลงทะเบียนแทน
  if (!user) {
    if (showRegister) {
      return (
        <RegisterForm
          onRegister={handleRegister}       // ส่งฟังก์ชันลงทะเบียนให้ RegisterForm
          onBackToLogin={() => setShowRegister(false)} // ฟังก์ชันย้อนกลับไป login form
          isLoading={isLoading}             // ส่งสถานะโหลดไป
        />
      );
    }
    return (
      <LoginForm
        onLogin={handleLogin}               // ส่งฟังก์ชันล็อกอินให้ LoginForm
        onShowRegister={() => setShowRegister(true)} // ฟังก์ชันแสดงฟอร์มลงทะเบียน
        isLoading={isLoading}
      />
    );
  }

  // ฟังก์ชันแสดง component ตามหน้าปัจจุบัน
  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        // หน้าโปรไฟล์ผู้ใช้
        return <Profile user={user} onBack={handleBackFromProfile} />;
      case 'dashboard':
        // หน้า dashboard ทั่วไป (นักเรียน)
        return (
          <div className={`min-h-screen ${user.role === 'student'
            ? 'bg-gradient-to-br from-green-50 via-blue-50 to-teal-50'
            : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'
            }`}>
            <div className="pt-8">
              <Dashboard />
            </div>
          </div>
        );
      case 'library':
        // หน้าแสดงห้องสมุดหนังสือ (นักเรียน)
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
            <div className="pt-8">
              <BookLibrary onBookSelect={handleBookSelect} />
            </div>
          </div>
        );
      case 'reader':
        // หน้าอ่านหนังสือ (ถ้ามีหนังสือถูกเลือก)
        return selectedBook ? (
          <BookReader
            book={selectedBook}
            onBack={handleBackToChat}
            onBackToLibrary={handleBackToLibrary}
          />
        ) : (
          // ถ้าไม่มีหนังสือ ให้กลับไปห้องสมุด
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
            <div className="pt-8">
              <BookLibrary onBookSelect={handleBookSelect} />
            </div>
          </div>
        );
      case 'chat':
        // หน้าจอ chat bot สำหรับนักเรียน
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 py-4 sm:py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)] space-y-4">

                {/* ปุ่มย้อนกลับไปเลือกหนังสือ ถ้ามีหนังสือถูกเลือก */}
                {selectedBook && (
                  <div className="flex justify-start">
                    <button
                      onClick={() => setSelectedBook(null)} // เคลียร์หนังสือที่เลือก
                      className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>← ย้อนกลับไปเลือกหนังสือ</span>
                    </button>
                  </div>
                )}

                <ChatBot
                  selectedBook={selectedBook}
                  onBookSelect={handleBookSelect}
                  onReadBook={() => setCurrentView('reader')}
                />
              </div>
            </div>
          </div>
        );

      // หน้าจอแดชบอร์ดครู แยกตามแท็บในแดชบอร์ดครู
      case 'teacher-dashboard':
      case 'teacher-books':
      case 'teacher-analytics':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
            <TeacherDashboard />
          </div>
        );
      default:
        // fallback กรณีไม่รู้จักหน้าที่ระบุ
        return (
          <div className={`min-h-screen ${user.role === 'student'
            ? 'bg-gradient-to-br from-green-50 via-blue-50 to-teal-50'
            : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'
            }`}>
            <div className="pt-8">
              <Dashboard />
            </div>
          </div>
        );
    }
  };

  // ฟังก์ชันคืน array ของเมนู navigation แยกตาม role
  const getNavigationItems = () => {
    if (user.role === 'teacher') {
      // เมนูสำหรับครู
      return [
        { id: 'teacher-dashboard', label: 'ภาพรวม', icon: BarChart3 },
        { id: 'teacher-books', label: 'จัดการหนังสือ', icon: BookOpen },
        { id: 'teacher-analytics', label: 'วิเคราะห์', icon: Users },
      ];
    } else {
      // เมนูสำหรับนักเรียน
      return [
        { id: 'chat', label: 'AI ผู้ช่วย', icon: MessageSquare },
        { id: 'library', label: 'ห้องสมุด', icon: BookOpen },
        { id: 'dashboard', label: 'ภาพรวม', icon: Home },
      ];
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header bar บนสุด แสดงข้อมูล user และปุ่ม logout */}
      <Header
        user={user}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />

      {/* Navigation bar เฉพาะสำหรับนักเรียน */}
      {user.role === 'student' && currentView !== 'reader' && currentView !== 'profile' && (
        <nav className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
              {getNavigationItems().map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${currentView === item.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* เนื้อหาหลักในแต่ละหน้า */}
      <main className={
        user.role === 'teacher'
          ? '' // ครูไม่มี padding-top พิเศษ
          : currentView === 'reader' || currentView === 'profile'
            ? '' // นักเรียนดู reader หรือ profile ไม่มี padding-top
            : 'pt-0' // นักเรียนดูหน้าอื่น ๆ (dashboard/library/chat) ก็มี padding-top ปรับตาม layout
      }>
        {renderCurrentView()}
      </main>

      {/* Footer เฉพาะนักเรียนที่ไม่อยู่หน้า reader หรือ profile */}
      {user.role === 'student' && currentView !== 'reader' && currentView !== 'profile' && (
        <footer className="bg-gray-700 text-white py-6 sm:py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* รายละเอียด Backend */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">🔗 ระบบ Backend</h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                  <li>• RESTful API สำหรับจัดการหนังสือ</li>
                  <li>• WebSocket สำหรับ Real-time Chat</li>
                  <li>• Authentication & Authorization</li>
                </ul>
              </div>
              {/* รายละเอียดฐานข้อมูล */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">🗄️ ฐานข้อมูล</h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                  <li>• PostgreSQL สำหรับข้อมูลหลัก</li>
                  <li>• Vector Database สำหรับ AI Search</li>
                  <li>• Redis สำหรับ Session Management</li>
                </ul>
              </div>
              {/* รายละเอียด AI Integration */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">🤖 AI Integration</h3>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                  <li>• OpenAI API สำหรับ Chatbot</li>
                  <li>• Document Embedding & Retrieval</li>
                  <li>• Natural Language Processing</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
