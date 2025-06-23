import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Book, Sparkles, BookOpen, Play, Loader, AlertCircle } from 'lucide-react';
import { QAService } from '../services/qaService';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  sources?: Array<{
    content: string;
    pageNumber: number;
    section?: string;
    confidence: number;
  }>;
}

interface ChatBotProps {
  selectedBook?: {
    id: string;
    title: string;
    author: string;
  };
  currentPage?: number;
  currentContent?: {
    title: string;
    content: string;
  };
  onBookSelect?: (bookId: string) => void;
  onReadBook?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({
  selectedBook,
  currentPage,
  currentContent,
  onBookSelect,
  onReadBook
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableBooks = [
    { id: '1', title: 'วิทยาศาสตร์น่ารู้ ชั้นมัธยมศึกษาตอนต้น', author: 'ดร.สมชาย วิทยาคม' },
    { id: '2', title: 'คณิตศาสตร์พื้นฐานเพื่อชีวิต', author: 'อาจารย์สมหญิง เลขคณิต' },
    { id: '3', title: 'ประวัติศาสตร์ไทย เรื่องราวที่น่าทึ่ง', author: 'ศาสตราจารย์พิมพ์ใจ ประวัติศาสตร์' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: selectedBook
        ? (
          currentPage
            ? `สวัสดี! คุณกำลังอ่าน "${selectedBook.title}" หน้า ${currentPage} — ถาม AI ได้เลยครับ!`
            : `ยินดีต้อนรับสู่ "${selectedBook.title}" ของ ${selectedBook.author} — ถาม AI ได้เลยครับ!`
        )
        : `สวัสดี! ฉันเป็น AI ผู้ช่วยของคุณ 🤖\n\nคุณสามารถถามฉันได้เลย ไม่ต้องเลือกหนังสือก็ได้ เช่น:\n• อธิบายเรื่องแรงโน้มถ่วง\n• สรุปสูตรคณิตศาสตร์\n• ช่วยอธิบายประวัติศาสตร์ไทย`,
      isBot: true,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  }, [selectedBook, currentPage]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      if (selectedBook) {
        // Use the new QA service for book-specific questions
        const response = await QAService.processQuestion({
          question: inputText,
          bookId: selectedBook.id,
          sessionId: sessionId || undefined,
          userId: 'current-user-id' // Replace with actual user ID
        });

        if (!sessionId) {
          setSessionId(response.sessionId);
        }

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.answer,
          isBot: true,
          timestamp: new Date(),
          sources: response.sources
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // Fallback to mock response for general questions
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: generateMockResponse(inputText),
            isBot: true,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 1500);
        return;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถาม กรุณาลองใหม่อีกครั้ง',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateMockResponse = (input: string) => {
    const responses = [
      `เกี่ยวกับคำถาม "${input}" ที่คุณถาม ฉันจะอธิบายให้ฟังตามความรู้ทั่วไปนะครับ`,
      `จากคำถาม "${input}" ที่น่าสนใจ ฉันสามารถอธิบายได้ดังนี้...`,
      `คำถามที่ดีเกี่ยวกับ "${input}" ตามความรู้ทั่วไป มีคำตอบคือ...`,
      `เรื่อง "${input}" เป็นหัวข้อที่น่าสนใจ ให้ฉันอธิบายให้ฟังนะครับ...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getQuickActions = () => {
    if (currentPage && currentContent) {
      return [
        `อธิบายเนื้อหาหน้า ${currentPage} ให้ฟังหน่อย`,
        `สรุปประเด็นสำคัญในหน้านี้`,
        `ยกตัวอย่างจากชีวิตจริงเกี่ยวกับเนื้อหานี้`,
        `ให้แบบฝึกหัดจากเนื้อหาหน้านี้`
      ];
    } else if (selectedBook) {
      return [
        'สรุปหนังสือเล่มนี้ให้ฟังหน่อย',
        'เล่าเรื่องในหนังสือให้ฟังหน่อย',
        'ให้แบบฝึกหัดจากเนื้อหาในหนังสือ',
        'อธิบายแนวคิดหลักในหนังสือ'
      ];
    } else {
      return [
        'แนะนำหนังสือที่น่าสนใจ',
        'อยากเรียนรู้เรื่องวิทยาศาสตร์',
        'ช่วยอธิบายคณิตศาสตร์',
        'เล่าประวัติศาสตร์ให้ฟัง'
      ];
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">AI ผู้ช่วยการเรียนรู้</h2>
            <p className="text-blue-100 text-sm">
              {selectedBook ? `กำลังเรียนรู้: ${selectedBook.title}` : 'เลือกหนังสือเพื่อเริ่มต้น'}
            </p>
          </div>
        </div>
      </div>

      {/* Book Selection */}
      {selectedBook && (
        <div className="p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{selectedBook.title}</p>
                <p className="text-xs text-gray-600">{selectedBook.author}</p>
              </div>
            </div>
            {onReadBook && (
              <button
                onClick={onReadBook}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Play className="h-4 w-4" />
                <span>อ่านหนังสือ</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-lg ${message.isBot
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-600 text-white'
                }`}
            >
              <div className="flex items-start space-x-2">
                {message.isBot && (
                  <Bot className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                )}
                {!message.isBot && (
                  <User className="h-5 w-5 mt-0.5 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                  
                  {/* Show sources if available */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">แหล่งข้อมูลจากหนังสือ:</p>
                      <div className="space-y-2">
                        {message.sources.map((source, index) => (
                          <div key={index} className="bg-white p-2 rounded border-l-2 border-blue-400">
                            <p className="text-xs text-gray-700">{source.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-500">
                                หน้า {source.pageNumber}
                                {source.section && ` • ${source.section}`}
                              </span>
                              <span className="text-xs text-blue-600">
                                ความเชื่อมั่น: {Math.round(source.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-blue-100'
                    }`}>
                    {message.timestamp.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="ถามคำถามเกี่ยวกับเนื้อหา..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={2}
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTyping ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {getQuickActions().map((action, index) => (
            <button
              key={index}
              onClick={() => setInputText(action)}
              disabled={isTyping}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Connection status */}
        {selectedBook && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>เชื่อมต่อกับฐานข้อมูล Vector สำเร็จ</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;