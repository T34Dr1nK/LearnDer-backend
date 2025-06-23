import React, { useState } from 'react';
import { User, Mail, Calendar, BookOpen, MessageSquare, Award, Settings, Edit2, Save, X } from 'lucide-react';

// Props สำหรับ Profile Component รับข้อมูล user และฟังก์ชัน onBack สำหรับกดกลับ
interface ProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'teacher' | 'student'; // กำหนดบทบาทของผู้ใช้เป็น teacher หรือ student
  };
  onBack: () => void; // callback function สำหรับกลับไปหน้าก่อนหน้า
}

const Profile: React.FC<ProfileProps> = ({ user, onBack }) => {
  // State สำหรับสลับโหมดแก้ไข และเก็บค่าชื่อและอีเมลที่แก้ไข
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);

  // ข้อมูล mock ของสถิติผู้ใช้ แยกตาม role
  const studentStats = {
    booksRead: 12,
    totalChats: 156,
    averageRating: 4.7,
    favoriteSubject: 'วิทยาศาสตร์',
    joinDate: '2024-01-15',
    readingStreak: 7,
    achievements: [
      { name: 'นักอ่านตัวยง', description: 'อ่านหนังสือครบ 10 บรรทัด', icon: '📚' },
      { name: 'คุยเก่ง', description: 'สนทนากับ AI ครบ 100 คำ', icon: '💬' },
      { name: 'นักเรียนดีเด่น', description: 'ได้คะแนนเฉลี่ยสูงกว่า 4.5', icon: '⭐' }
    ]
  };

  const teacherStats = {
    booksCreated: 8,
    totalStudents: 245,
    totalChats: 1420,
    averageRating: 4.8,
    joinDate: '2023-08-20',
    popularBook: 'วิทยาศาสตร์น่ารู้',
    achievements: [
      { name: 'ครูยอดนิยม', description: 'หนังสือได้รับความนิยมสูง', icon: '👨‍🏫' },
      { name: 'ผู้สร้างสรรค์', description: 'สร้างหนังสือครบ 5 เล่ม', icon: '✍️' },
      { name: 'ที่ปรึกษาดีเด่น', description: 'ช่วยเหลือนักเรียนมากกว่า 1000 ครั้ง', icon: '🏆' }
    ]
  };

  // เลือกสถิติให้เหมาะกับ role ปัจจุบัน
  const stats = user.role === 'student' ? studentStats : teacherStats;

  // ฟังก์ชันบันทึกข้อมูลหลังแก้ไข (ในแอปจริงจะเชื่อม API)
  const handleSave = () => {
    // 🔗 BACKEND CONNECTION: Update user profile
    console.log('Updating profile:', { name: editedName, email: editedEmail });
    setIsEditing(false); // ปิดโหมดแก้ไขหลังบันทึก
  };

  // ฟังก์ชันยกเลิกแก้ไข คืนค่าชื่อและอีเมลกลับเหมือนเดิม
  const handleCancel = () => {
    setEditedName(user.name);
    setEditedEmail(user.email);
    setIsEditing(false);
  };

  return (
    // เปลี่ยนสีพื้นหลังตาม role
    <div className={`min-h-screen ${user.role === 'student'
        ? 'bg-gradient-to-br from-green-50 via-blue-50 to-teal-50'
        : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'
      }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* แถบหัวเรื่อง พร้อมปุ่มกลับ */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>กลับ</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
          <div className="w-16"></div> {/* ช่องว่างเพื่อความสมดุล */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* กล่องโปรไฟล์ด้านซ้าย */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                {/* แสดงตัวอักษรแรกของชื่อ พร้อมพื้นหลังไล่สีตาม role */}
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 ${user.role === 'student' ? 'bg-gradient-to-r from-blue-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                  {user.name.charAt(0)}
                </div>

                {/* ถ้าอยู่ในโหมดแก้ไข ให้แสดง input สำหรับแก้ไข */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-center text-xl font-bold border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full text-center text-gray-600 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {/* ปุ่มบันทึก และ ยกเลิก */}
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>บันทึก</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>ยกเลิก</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // แสดงชื่อ อีเมล และ role พร้อมปุ่มแก้ไข
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${user.role === 'student'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                      }`}>
                      {user.role === 'student' ? 'นักเรียน' : 'อาจารย์'}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors mx-auto"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>แก้ไขโปรไฟล์</span>
                    </button>
                  </div>
                )}
              </div>

              {/* แสดงวันที่เข้าร่วมและอีเมล */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">เข้าร่วมเมื่อ {new Date(stats.joinDate).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* กล่องแสดงสถิติและข้อมูลอื่น ๆ */}
          <div className="lg:col-span-2 space-y-6">

            {/* กล่องสถิติ */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">สถิติการใช้งาน</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {user.role === 'student' ? (
                  <>
                    {/* สถิติของนักเรียน */}
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.booksRead}</p>
                      <p className="text-sm text-gray-600">หนังสือที่อ่าน</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.totalChats}</p>
                      <p className="text-sm text-gray-600">การสนทนา</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.averageRating}</p>
                      <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Settings className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.readingStreak}</p>
                      <p className="text-sm text-gray-600">วันติดต่อกัน</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* สถิติของอาจารย์ */}
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{teacherStats.booksCreated}</p>
                      <p className="text-sm text-gray-600">หนังสือที่สร้าง</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{teacherStats.totalStudents}</p>
                      <p className="text-sm text-gray-600">นักเรียน</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <MessageSquare className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{teacherStats.totalChats}</p>
                      <p className="text-sm text-gray-600">การสนทนา</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-yellow-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{teacherStats.averageRating}</p>
                      <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* กล่องความสำเร็จ (Achievements) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ความสำเร็จ</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* วนลูปแสดง achievements ตาม stats */}
                {stats.achievements.map((achievement, index) => (
                  <div key={index} className={`p-4 rounded-xl border-2 ${user.role === 'student'
                      ? 'bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                    }`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* กล่องข้อมูลเพิ่มเติม */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลเพิ่มเติม</h3>
              <div className="space-y-3">
                {user.role === 'student' ? (
                  <>
                    {/* ข้อมูลเพิ่มเติมสำหรับนักเรียน */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">วิชาที่ชื่นชอบ</span>
                      <span className="font-medium text-gray-900">{studentStats.favoriteSubject}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">อ่านหนังสือติดต่อกัน</span>
                      <span className="font-medium text-gray-900">{studentStats.readingStreak} วัน</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ข้อมูลเพิ่มเติมสำหรับอาจารย์ */}
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">หนังสือยอดนิยม</span>
                      <span className="font-medium text-gray-900">{teacherStats.popularBook}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">นักเรียนทั้งหมด</span>
                      <span className="font-medium text-gray-900">{teacherStats.totalStudents} คน</span>
                    </div>
                  </>
                )}
                {/* สถานะบัญชี */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">สถานะบัญชี</span>
                  <span className="inline-flex px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    ใช้งานได้
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;