import React, { useState } from 'react';
import { BookOpen, User, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

// กำหนด props ที่รับเข้ามาใน component นี้
interface RegisterFormProps {
  // ฟังก์ชันเรียกตอนสมัครสมาชิกสำเร็จ รับพารามิเตอร์ email, password, name และ role
  onRegister: (email: string, password: string, name: string, role: 'teacher' | 'student') => void;
  // ฟังก์ชันเรียกตอนกดปุ่มกลับไปหน้า login
  onBackToLogin: () => void;
  // สถานะโหลด ใช้สำหรับปิดการกดปุ่มสมัครขณะรอโหลด
  isLoading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onBackToLogin, isLoading }) => {
  // สร้าง state เพื่อเก็บข้อมูลในฟอร์มทั้งหมด
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student'); // กำหนดค่าเริ่มต้นเป็น student
  const [showPassword, setShowPassword] = useState(false); // สถานะแสดง/ซ่อนรหัสผ่าน
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // สถานะแสดง/ซ่อนยืนยันรหัสผ่าน
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // เก็บข้อความ error ของแต่ละฟิลด์

  // ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลฟอร์ม
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // เช็คว่าชื่อไม่ว่างเปล่า
    if (!name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล';
    }

    // เช็คว่าอีเมลไม่ว่าง และเป็นรูปแบบอีเมลที่ถูกต้อง
    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // เช็ครหัสผ่านไม่ว่าง และมีความยาวอย่างน้อย 6 ตัวอักษร
    if (!password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    // เช็ครหัสผ่านยืนยันตรงกับรหัสผ่านหรือไม่
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    // อัพเดต error state
    setErrors(newErrors);
    // คืนค่า true ถ้าไม่มี error เลย (ผ่าน validation)
    return Object.keys(newErrors).length === 0;
  };

  // ฟังก์ชันจัดการ submit ฟอร์ม
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันการ reload หน้า
    if (validateForm()) {
      // ถ้าข้อมูลถูกต้อง ให้เรียก onRegister (ส่งข้อมูลไปให้ backend หรือ component แม่)
      onRegister(email, password, name, role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Container กลางหน้า */}
      <div className="max-w-md w-full space-y-8">
        {/* ส่วนหัว */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            {/* ไอคอนโลโก้ */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            {/* ชื่อแอป */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnBooks
            </h1>
          </div>
          {/* หัวข้อสมัครสมาชิก */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">สมัครสมาชิก</h2>
          <p className="text-gray-600">เริ่มต้นการเรียนรู้ด้วย AI ได้เลย</p>
        </div>

        {/* กล่องฟอร์ม */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* ปุ่มกลับไปหน้าเข้าสู่ระบบ */}
          <button
            onClick={onBackToLogin}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </button>

          {/* ปุ่มเลือกบทบาท (นักเรียน หรือ อาจารย์) */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {/* ปุ่มนักเรียน */}
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
              {/* ปุ่มอาจารย์ */}
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

          {/* ฟอร์มสมัครสมาชิก */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ช่องกรอกชื่อ-นามสกุล */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                {/* ไอคอน User */}
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* input ชื่อ */}
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                />
              </div>
              {/* แสดงข้อความ error ชื่อ */}
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* ช่องกรอกอีเมล */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                {/* ไอคอน Mail */}
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* input อีเมล */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
              {/* แสดงข้อความ error อีเมล */}
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* ช่องกรอกรหัสผ่าน */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                {/* ไอคอน Lock */}
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* input รหัสผ่าน (แสดงหรือซ่อนได้) */}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
                {/* ปุ่มแสดง/ซ่อนรหัสผ่าน */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* แสดงข้อความ error รหัสผ่าน */}
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* ช่องยืนยันรหัสผ่าน */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                {/* ไอคอน Lock */}
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {/* input ยืนยันรหัสผ่าน (แสดง/ซ่อนได้) */}
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                />
                {/* ปุ่มแสดง/ซ่อนรหัสผ่านยืนยัน */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* แสดงข้อความ error ยืนยันรหัสผ่าน */}
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* ปุ่มสมัครสมาชิก */}
            <button
              type="submit"
              disabled={isLoading} // ปิดการใช้งานระหว่างโหลด
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${role === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
              {/* แสดง spinner ขณะโหลด */}
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังสมัครสมาชิก...</span>
                </div>
              ) : (
                `สมัครสมาชิกในฐานะ${role === 'student' ? 'นักเรียน' : 'อาจารย์'}`
              )}
            </button>
          </form>

          {/* ข้อความ Terms & Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              การสมัครสมาชิกแสดงว่าคุณยอมรับ{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">เงื่อนไขการใช้งาน</a>{' '}
              และ{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">นโยบายความเป็นส่วนตัว</a>
            </p>
          </div>
        </div>

        {/* ข้อความบอกว่าเชื่อมต่อกับ backend */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔗 เชื่อมต่อกับ Registration API สำหรับการสร้างบัญชีผู้ใช้
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 