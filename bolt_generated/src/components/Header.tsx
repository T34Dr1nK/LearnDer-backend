import React, { useState, useEffect } from 'react';
import { BookOpen, User, Search, LogOut, Menu, X } from 'lucide-react';

interface HeaderProps {
  user?: {
    name: string;
    role: 'teacher' | 'student';
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
}

// Component Header ใช้แสดงแถบเมนูบนสุดของระบบ
const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // state สำหรับเปิด/ปิดเมนูบนมือถือ

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Container ด้านในจำกัดความกว้างไม่เกิน 7xl และมี padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
        {/* แถวหลัก: โลโก้ + ชื่อแอปด้านซ้าย / เมนูด้านขวา */}
        <div className="flex justify-between items-center h-16">
          {/* ซ้าย: โลโก้ + ชื่อ */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">LearnBooks</h1>
            </div>
          </div>
          
           {/* ขวา: Search + Profile + Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 🔍 Search bar — ซ่อนบนมือถือ */}
            <div className="relative hidden sm:block">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาหนังสือ..."
                className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32 sm:w-48 lg:w-64"
              />
            </div>

            {/* 👤 User Profile ปุ่มดูชื่อผู้ใช้ + role */}
            {user && (
              <button
                onClick={onProfileClick}
                className={`flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors hover:bg-opacity-80 ${
                  user.role === 'teacher' 
                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                {/* ชื่อผู้ใช้ แสดงเฉพาะบนหน้าจอใหญ่ */}
                <div className="hidden sm:block">
                  <span className="font-medium text-sm">{user.name}</span>
                  <p className="text-xs opacity-75">
                    {user.role === 'teacher' ? 'อาจารย์' : 'นักเรียน'}
                  </p>
                </div>
                {/* Role แสดงบนมือถือ */}
                <span className="sm:hidden font-medium text-sm">
                  {user.role === 'teacher' ? 'อาจารย์' : 'นักเรียน'}
                </span>
              </button>
            )}

            {/* 📱 ปุ่มเมนูมือถือ (hamburger / close) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* 🚪 ปุ่มออกจากระบบ (เฉพาะ Desktop) */}
            {user && onLogout && (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>

        {/* เมนูแสดงเฉพาะบนมือถือเมื่อเปิด */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t bg-white py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาหนังสือ..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 👤 ปุ่มโปรไฟล์บนมือถือ */}
            {user && onProfileClick && (
              <button
                onClick={() => {
                  onProfileClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 text-gray-700 py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">ดูโปรไฟล์</span>
              </button>
            )}

            {/* 🚪 ปุ่มออกจากระบบบนมือถือ */}
            {user && onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 text-red-600 py-2 px-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">ออกจากระบบ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;