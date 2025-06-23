import React, { useState, useEffect } from 'react'; // นำเข้า React และ Hook ต่างๆ ที่จำเป็น
import { ArrowLeft, MessageSquare, BookOpen, ZoomIn, ZoomOut, RotateCcw, Bot, CheckCircle, Home } from 'lucide-react';// นำเข้าไอคอนจาก lucide-react
import ChatBot from './ChatBot'; // นำเข้าคอมโพเนนต์ ChatBot

// ประกาศประเภทของ props ที่จะรับเข้ามา
interface BookReaderProps { 
  book: {
    id: string;
    title: string;
    author: string;
  };
  onBack: () => void; // ฟังก์ชันสำหรับกลับไปหน้าเดิม
  onBackToLibrary: () => void; // ฟังก์ชันสำหรับกลับไปยังห้องสมุด
}

// คอมโพเนนต์หลัก BookReader
const BookReader: React.FC<BookReaderProps> = ({ book, onBack, onBackToLibrary }) => {
  const [showChat, setShowChat] = useState(false); // สถานะสำหรับแสดงหรือซ่อน AI Chat
  const [currentPage, setCurrentPage] = useState(1); // สถานะสำหรับเก็บหน้าปัจจุบันที่อ่านอยู่
  const [zoom, setZoom] = useState(100); // สถานะการซูม (ปรับขนาดตัวหนังสือ)
  const [totalPages] = useState(45); // จำนวนหน้าทั้งหมดของหนังสือ (mock แบบจำลองไว้ 45 หน้า)
  const [isFinished, setIsFinished] = useState(false); // ตรวจสอบว่าผู้อ่านอ่านจบหรือยัง

  // useEffect จะทำงานเมื่อ currentPage เปลี่ยน
  useEffect(() => {
    if (currentPage >= totalPages) { // ถ้าอ่านถึงหน้าสุดท้ายให้ถือว่าอ่านจบ
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  }, [currentPage, totalPages]);

  // เนื้อหาหนังสือตัวอย่างแบบ mock , this would come from API/PDF
  const mockContent = {
    1: {
      title: "บทที่ 1: การเคลื่อนที่ของวัตถุ",
      content: `การเคลื่อนที่เป็นปรากฏการณ์ที่เราพบเห็นในชีวิตประจำวันอยู่เสมอ ไม่ว่าจะเป็นการเดินของคน การวิ่งของสัตว์ หรือการเคลื่อนที่ของยานพาหนะต่างๆ

ในบทนี้เราจะมาเรียนรู้เกี่ยวกับ:
• ความหมายของการเคลื่อนที่
• ประเภทของการเคลื่อนที่
• ความเร็วและความเร่ง
• กฎการเคลื่อนที่ของนิวตัน

การเคลื่อนที่ (Motion) หมายถึง การเปลี่ยนแปลงตำแหน่งของวัตถุเมื่อเทียบกับจุดอ้างอิงหนึ่งๆ ตามเวลาที่ผ่านไป

ตัวอย่างการเคลื่อนที่ในชีวิตประจำวัน:
1. รถยนต์วิ่งบนถนน - เป็นการเคลื่อนที่แบบเส้นตรง
2. เข็มนาฬิกา - เป็นการเคลื่อนที่แบบหมุน
3. ลูกบอลที่ถูกโยนขึ้นไปในอากาศ - เป็นการเคลื่อนที่แบบโค้ง

การศึกษาการเคลื่อนที่จะช่วยให้เราเข้าใจธรรมชาติและสามารถนำไปประยุกต์ใช้ในการออกแบบเครื่องจักรและเทคโนโลยีต่างๆ ได้`
    },
    2: {
      title: "ความเร็วและความเร่ง",
      content: `ความเร็ว (Speed) คือ อัตราการเปลี่ยนแปลงของระยะทางต่อหน่วยเวลา

สูตรการคำนวณความเร็ว:
ความเร็ว = ระยะทาง ÷ เวลา
v = s ÷ t

หน่วยของความเร็ว:
• เมตรต่อวินาที (m/s)
• กิโลเมตรต่อชั่วโมง (km/h)
• ไมล์ต่อชั่วโมง (mph)

ความเร่ง (Acceleration) คือ อัตราการเปลี่ยนแปลงของความเร็วต่อหน่วยเวลา

สูตรการคำนวณความเร่ง:
ความเร่ง = การเปลี่ยนแปลงความเร็ว ÷ เวลา
a = (v₂ - v₁) ÷ t

ตัวอย่างการคำนวณ:
รถยนต์เคลื่อนที่ด้วยความเร็ว 60 km/h เป็นเวลา 2 ชั่วโมง
ระยะทางที่รถเคลื่อนที่ได้ = 60 × 2 = 120 กิโลเมตร`
    }
  };
 
  // ฟังก์ชันดึงเนื้อหาปัจจุบันตามหน้าที่กำลังอ่าน
  const getCurrentContent = () => {
    return mockContent[currentPage as keyof typeof mockContent] || {
      title: `หน้า ${currentPage}`,
      content: "เนื้อหาของหน้านี้กำลังโหลด..."
    };
  };
  
  // ฟังก์ชันสำหรับควบคุมการซูม
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  // แสดงหน้าจอเมื่ออ่านหนังสือจบแล้ว
  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12">
            {/* ไอคอนสำเร็จ */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              {/* ข้อความแสดงความยินดี */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                🎉 ยินดีด้วย!
              </h1>
              <h2 className="text-xl sm:text-2xl text-gray-700 mb-2">
                คุณอ่านจบแล้ว
              </h2>
              <p className="text-lg text-blue-600 font-medium mb-6">
                "{book.title}"
              </p>
              <p className="text-gray-600 mb-8">
                คุณได้เรียนรู้เนื้อหาครบทั้งหมด {totalPages} หน้า
                <br />
                พร้อมแล้วสำหรับการเรียนรู้หนังสือเล่มใหม่!
              </p>
            </div>

            {/* ปุ่มเลือกหนังสือเล่มใหม่หรืออ่านซ้ำ */}
            <div className="space-y-4">
              <button
                onClick={onBackToLibrary}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>กลับไปเลือกหนังสือเล่มใหม่</span>
              </button>
              
              <button
                onClick={() => {
                  setCurrentPage(1);
                  setIsFinished(false);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>อ่านหนังสือเล่มนี้อีกครั้ง</span>
              </button>
            </div>

            {/* 🔗 จุดเชื่อมต่อกับ backend */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="text-sm text-green-700">
                🔗 <strong>Backend Connection:</strong> บันทึกความสำเร็จในการอ่านหนังสือจบ
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ส่วนหลักของหน้าจออ่านหนังสือ
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">กลับไปห้องสมุด</span>
              </button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm sm:text-base">{book.title}</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">{book.author}</p>
                </div>
              </div>
            </div>
            
            {/* ปุ่มควบคุมซูม และ AI Chat */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="ซูมออก"
                >
                  <ZoomOut className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-xs text-gray-600 px-2">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="ซูมเข้า"
                >
                  <ZoomIn className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="รีเซ็ตซูม"
                >
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* ปุ่มเปิด/ปิด AI */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                  showChat
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI ผู้ช่วย</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* เนื้อหาและ ChatBot */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* ส่วนแสดงเนื้อหาหนังสือ */}
        <div className={`transition-all duration-300 ${showChat ? 'w-1/2' : 'w-full'}`}>
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              {/* ปุ่มเปลี่ยนหน้า */}
              <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  หน้าก่อน
                </button>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    หน้า {currentPage} จาก {totalPages}
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentPage / totalPages) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  หน้าถัดไป
                </button>
              </div>

              {/* แสดงเนื้อหาหนังสือ */}
              <div 
                className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12 min-h-[600px]"
                style={{ fontSize: `${zoom}%` }}
              >
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                    {getCurrentContent().title}
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {getCurrentContent().content}
                  </div>
                </div>

                {/* 🔗 คอมเมนต์: จุดเชื่อมต่อกับ backend สำหรับโหลดเนื้อหา */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700">
                    🔗 <strong>Backend Connection:</strong> เนื้อหาหนังสือจะถูกดึงจาก Database/PDF Processing API
                  </p>
                </div>
              </div>

              {/* ปุ่มเปิด AI */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>ถาม AI เกี่ยวกับเนื้อหานี้</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar แชทกับ AI */}
        {showChat && (
          <div className="w-1/2 border-l bg-white">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">AI ผู้ช่วยการอ่าน</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-blue-100 mt-1">
                  ถามคำถามเกี่ยวกับ "{book.title}" หน้า {currentPage}
                </p>
              </div>
              {/* เนื้อหาแชท */}
              <div className="flex-1">
                <ChatBot 
                  selectedBook={book} 
                  currentPage={currentPage}
                  currentContent={getCurrentContent()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;