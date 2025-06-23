export interface User {
  id: string;                  // รหัสผู้ใช้ (unique identifier) เช่น "1" หรือ UUID
  email: string;               // อีเมลของผู้ใช้ เช่น "user@example.com"
  name: string;                // ชื่อเต็มของผู้ใช้ เช่น "อาจารย์สมชาย" หรือ "นักเรียนสมหญิง"
  role: 'teacher' | 'student'; // บทบาทของผู้ใช้ในระบบ จะต้องเป็น 'teacher' หรือ 'student' เท่านั้น
  avatar?: string;             // (optional) URL หรือ path ของรูปโปรไฟล์ผู้ใช้ ถ้าไม่มีได้ (เครื่องหมาย ? คือ optional)
}


export interface AuthState {
  user: User | null;          // ข้อมูลผู้ใช้ที่ล็อกอินอยู่ หรือ null ถ้ายังไม่ล็อกอิน
  isAuthenticated: boolean;  // สถานะว่าได้ผ่านการยืนยันตัวตน (login) แล้วหรือยัง
  isLoading: boolean;        // สถานะว่ากำลังโหลดข้อมูลเกี่ยวกับ authentication อยู่หรือไม่ (เช่น กำลังตรวจสอบ token)
}
