// นำเข้า React hooks และไอคอนจาก lucide-react
import React, { useState } from 'react';
import { BookOpen, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';

// กำหนด props ของ LoginForm component
interface LoginFormProps {
  onLogin: (email: string, password: string, role: 'teacher' | 'student') => void;
  onShowRegister: () => void;
  isLoading: boolean; // สำหรับแสดง spinner ระหว่างรอ login
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onShowRegister, isLoading }) => {
  // State สำหรับ input form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student'); // ค่า default เป็น student
  const [showPassword, setShowPassword] = useState(false); // toggle แสดงรหัสผ่าน

  // ฟังก์ชันเมื่อ submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกัน reload หน้า
    onLogin(email, password, role); // เรียกใช้ callback ที่ส่งมาจาก parent
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* ส่วนหัว */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnBooks
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
          <p className="text-gray-600">แพลตฟอร์มการเรียนรู้จากหนังสือด้วย AI</p>
        </div>

        {/* กล่องฟอร์ม */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* ปุ่มเลือกบทบาท */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                นักเรียน
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${role === 'teacher'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                อาจารย์
              </button>
            </div>
          </div>

          {/* ฟอร์มกรอกข้อมูล */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ช่องกรอกอีเมล */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="กรอกอีเมลของคุณ"
                  required
                />
              </div>
            </div>

            {/* ช่องกรอกรหัสผ่าน */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'} // toggle แสดงรหัสผ่าน
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="แสดงหรือซ่อนรหัสผ่าน"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* ปุ่มเข้าสู่ระบบ */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${role === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              {isLoading ? (
                // แสดง spinner ขณะรอโหลด
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังเข้าสู่ระบบ...</span>
                </div>
              ) : (
                `เข้าสู่ระบบในฐานะ${role === 'student' ? 'นักเรียน' : 'อาจารย์'}`
              )}
            </button>
          </form>

          {/* ปุ่มลิงก์ไปสมัครสมาชิก */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <button
                onClick={onShowRegister}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                สมัครสมาชิก
              </button>
            </p>
          </div>

          {/* แสดงข้อมูลบัญชีทดสอบ */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 font-medium">ข้อมูลทดสอบ:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>นักเรียน:</strong> student@demo.com / password123</p>
              <p><strong>อาจารย์:</strong> teacher@demo.com / password123</p>
            </div>
          </div>
        </div>

        {/* หมายเหตุเกี่ยวกับการเชื่อมต่อ API */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔗 เชื่อมต่อกับ Authentication API สำหรับการยืนยันตัวตน
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;