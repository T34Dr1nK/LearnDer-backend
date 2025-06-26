import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { TextbookProcessor } from '../services/textbookProcessor';
import { supabase } from '../lib/supabase';

interface BookUploaderProps {
  userId: string;
  onUploadComplete: (bookId: string) => void;
  onClose: () => void;
}

interface UploadProgress {
  stage: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  progress: number;
}

const BookUploader: React.FC<BookUploaderProps> = ({ userId, onUploadComplete, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategory, setBookCategory] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    message: '',
    progress: 0
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!bookTitle) {
        // Auto-fill title from filename
        const nameWithoutExt = file.name.replace('.pdf', '');
        setBookTitle(nameWithoutExt);
      }
    } else {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
  }, [bookTitle]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!bookTitle) {
        const nameWithoutExt = file.name.replace('.pdf', '');
        setBookTitle(nameWithoutExt);
      }
    } else {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
  }, [bookTitle]);

  const handleUpload = async () => {
    if (!selectedFile || !bookTitle || !bookAuthor || !bookCategory) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      setUploadProgress({
        stage: 'uploading',
        message: 'กำลังสร้างข้อมูลหนังสือ...',
        progress: 10
      });

      // Create book record in database
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          title: bookTitle,
          author: bookAuthor,
          description: bookDescription,
          category: bookCategory,
          processing_status: 'pending',
          created_by: userId
        })
        .select('id')
        .single();

      if (bookError) {
        throw new Error(`Failed to create book: ${bookError.message}`);
      }

      const bookId = bookData.id;

      setUploadProgress({
        stage: 'processing',
        message: 'กำลังประมวลผลไฟล์ PDF และสร้าง embeddings...',
        progress: 30
      });

      // Process the PDF file
      const result = await TextbookProcessor.processPDFFile(
        selectedFile,
        bookId,
        { title: bookTitle, author: bookAuthor }
      );

      if (result.success) {
        setUploadProgress({
          stage: 'completed',
          message: `ประมวลผลสำเร็จ! สร้าง ${result.chunksProcessed} ส่วนข้อมูล`,
          progress: 100
        });

        setTimeout(() => {
          onUploadComplete(bookId);
        }, 2000);
      } else {
        throw new Error(result.error || 'การประมวลผลล้มเหลว');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพโหลด',
        progress: 0
      });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setBookTitle('');
    setBookAuthor('');
    setBookCategory('');
    setBookDescription('');
    setUploadProgress({ stage: 'idle', message: '', progress: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">อัพโหลดหนังสือใหม่</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={uploadProgress.stage === 'processing'}
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">อัพโหลดไฟล์ PDF และระบบจะประมวลผลเพื่อสร้าง AI Chatbot อัตโนมัติ</p>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ไฟล์หนังสือ (PDF)
            </label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                  <p className="text-xs text-gray-500">รองรับไฟล์ PDF เท่านั้น (ขนาดไม่เกิน 50MB)</p>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
                disabled={uploadProgress.stage === 'processing'}
              />
              <label
                htmlFor="pdf-upload"
                className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
              >
                เลือกไฟล์
              </label>
            </div>
          </div>

          {/* Book Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อหนังสือ *
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="กรอกชื่อหนังสือ"
                disabled={uploadProgress.stage === 'processing'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ผู้แต่ง *
              </label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="กรอกชื่อผู้แต่ง"
                disabled={uploadProgress.stage === 'processing'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมวดหมู่ *
            </label>
            <select
              value={bookCategory}
              onChange={(e) => setBookCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={uploadProgress.stage === 'processing'}
            >
              <option value="">เลือกหมวดหมู่</option>
              <option value="science">วิทยาศาสตร์</option>
              <option value="math">คณิตศาสตร์</option>
              <option value="history">ประวัติศาสตร์</option>
              <option value="language">ภาษา</option>
              <option value="social">สังคมศึกษา</option>
              <option value="art">ศิลปะ</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              value={bookDescription}
              onChange={(e) => setBookDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="กรอกคำอธิบายหนังสือ (ไม่บังคับ)"
              disabled={uploadProgress.stage === 'processing'}
            />
          </div>

          {/* Progress Display */}
          {uploadProgress.stage !== 'idle' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {uploadProgress.stage === 'processing' && (
                  <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                )}
                {uploadProgress.stage === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {uploadProgress.stage === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium text-gray-900">{uploadProgress.message}</span>
              </div>
              
              {uploadProgress.progress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.stage === 'error'
                        ? 'bg-red-500'
                        : uploadProgress.stage === 'completed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Processing Info */}
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-900 mb-2">🤖 การประมวลผล AI</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• แยกข้อความจากไฟล์ PDF</li>
              <li>• สร้าง Text Embeddings สำหรับการค้นหา</li>
              <li>• บันทึกข้อมูลลงฐานข้อมูล Vector</li>
              <li>• เตรียมระบบ Q&A อัตโนมัติ</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end space-x-3">
          {uploadProgress.stage === 'completed' ? (
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              อัพโหลดหนังสือเล่มใหม่
            </button>
          ) : uploadProgress.stage === 'error' ? (
            <>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                เริ่มใหม่
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                ลองอีกครั้ง
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={uploadProgress.stage === 'processing'}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  !selectedFile || 
                  !bookTitle || 
                  !bookAuthor || 
                  !bookCategory || 
                  uploadProgress.stage === 'processing'
                }
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadProgress.stage === 'processing' ? 'กำลังประมวลผล...' : 'อัพโหลดและประมวลผล'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookUploader;