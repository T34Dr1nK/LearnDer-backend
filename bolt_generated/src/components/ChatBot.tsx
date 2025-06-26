import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Book, Sparkles, BookOpen, Play, Loader, AlertCircle, Zap, Minimize, Maximize } from 'lucide-react';
import { AIService, ChatMessage } from '../services/groqai';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isTyping?: boolean;
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
  const [availableBooks, setAvailableBooks] = useState<Array<{ id: string, title: string, author: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // ref สำหรับเลื่อนแชท
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // ref สำหรับโฟกัสช่องพิมพ์
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ฟังก์ชันเลื่อนแชทไปล่างสุด
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    fetchAvailableBooks();
    checkAPIConnection();
  }, []);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: selectedBook
        ? (
          currentPage
            ? `สวัสดี! คุณกำลังอ่าน "${selectedBook.title}" หน้า ${currentPage}\n\nฉันพร้อมตอบคำถามเกี่ยวกับเนื้อหาในหนังสือ หรือคำถามทั่วไปอื่นๆ ได้เลยครับ! 🤖✨`
            : `ยินดีต้อนรับสู่ "${selectedBook.title}" ของ ${selectedBook.author}\n\nฉันพร้อมช่วยอธิบายเนื้อหา ตอบคำถาม และช่วยให้คุณเข้าใจบทเรียนได้ดีขึ้น! 📚💡`
        )
        : `สวัสดีครับ! ฉันเป็น AI ผู้ช่วยการเรียนรู้ 🤖\n\nคุณสามารถถามฉันได้เลย เช่น:\n• อธิบายเรื่องแรงโน้มถ่วง\n• สรุปสูตรคณิตศาสตร์\n• ช่วยอธิบายประวัติศาสตร์ไทย\n• หรือคำถามอื่นๆ ที่อยากรู้\n\nพร้อมช่วยเหลือคุณแล้ว! ✨`,
      isBot: true,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  }, [selectedBook, currentPage]);

  // เมื่อ messages เปลี่ยน ให้เลื่อนแชทและโฟกัส input
  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  const checkAPIConnection = async () => {
    try {
      setApiStatus('checking');
      const isConnected = await AIService.testConnection();
      setApiStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiStatus('error');
    }
  };

  const fetchAvailableBooks = async () => {
    try {
      const { data: booksData, error } = await supabase
        .from('books')
        .select('id, title, author')
        .eq('processing_status', 'completed')
        .limit(10);

      if (error) {
        console.error('Error fetching books:', error);
        return;
      }

      setAvailableBooks(booksData || []);
    } catch (error) {
      console.error('Error fetching available books:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputText;
    setInputText('');
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing-' + Date.now(),
      text: 'กำลังคิด...',
      isBot: true,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      let systemPrompt = 'คุณเป็น AI ผู้ช่วยตอบคำถามด้านการเรียนรู้อย่างเป็นมิตรและกระชับ';

      if (selectedBook) {
        systemPrompt += ` เนื้อหาเกี่ยวกับหนังสือชื่อ "${selectedBook.title}" โดย ${selectedBook.author}`;
        if (currentPage) {
          systemPrompt += ` หน้าที่ ${currentPage}`;
        }
        if (currentContent) {
          systemPrompt += `. เนื้อหา: ${currentContent.content.substring(0, 200)}...`;
        }
      }

      const chatMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: currentQuestion }
      ];

      const aiResponse = await AIService.generateResponse(chatMessages, {
        temperature: 0.3,
        maxTokens: 800
      });

      setMessages(prev => prev.filter(msg => !msg.isTyping));

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isBot: true,
        timestamp: new Date(),
        sources: currentContent ? [{
          content: currentContent.content.substring(0, 200) + '...',
          pageNumber: currentPage || 1,
          section: currentContent.title,
          confidence: 0.95
        }] : undefined
      };

      setMessages(prev => [...prev, botResponse]);

      if (selectedBook) {
        try {
          if (!sessionId) {
            const newSessionId = await createChatSession(currentQuestion);
            setSessionId(newSessionId);
          }

          if (sessionId) {
            await saveChatMessage(sessionId, currentQuestion, 'user');
            await saveChatMessage(sessionId, aiResponse, 'assistant');
          }
        } catch (error) {
          console.error('Error saving chat:', error);
        }
      }

    } catch (error) {
      console.error('Error getting AI response:', error);

      setMessages(prev => prev.filter(msg => !msg.isTyping));

      let errorMessage = 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ AI';

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'กรุณาตั้งค่า API Key ในไฟล์ .env';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota หมด กรุณาตรวจสอบการใช้งาน';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'เรียกใช้ API บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
        }
      }

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage + '\n\nกรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // เปลี่ยนเป็น function declaration เพื่อไม่ให้ error ใช้ก่อนประกาศ
  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const createChatSession = async (firstQuestion: string): Promise<string> => {
    const sessionTitle = firstQuestion.length > 50
      ? firstQuestion.substring(0, 50) + '...'
      : firstQuestion;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: 'current-user-id', // Replace with actual user ID
        book_id: selectedBook?.id,
        title: sessionTitle
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }

    return data.id;
  };

  const saveChatMessage = async (
    sessionId: string,
    content: string,
    role: 'user' | 'assistant'
  ): Promise<void> => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        content,
        role
      });

    if (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const extractTopicKeyword = (text: string): string | null => {
    const keywords = [
      { keyword: 'แรงโน้มถ่วง', topic: 'gravity' },
      { keyword: 'คณิตศาสตร์', topic: 'math' },
      { keyword: 'ประวัติศาสตร์', topic: 'history' },
      { keyword: 'คอมพิวเตอร์', topic: 'computer' },
      { keyword: 'ฟิสิกส์', topic: 'physics' },
      { keyword: 'ชีววิทยา', topic: 'biology' },
      { keyword: 'เคมี', topic: 'chemistry' },
      { keyword: 'ปรัชญา', topic: 'philosophy' }
    ];

    const lower = text.toLowerCase();
    for (const item of keywords) {
      if (lower.includes(item.keyword)) {
        return item.topic;
      }
    }
    return null;
  };


  const getQuickActions = () => {
    const lastUserMessage = [...messages].reverse().find(m => !m.isBot)?.text || '';
    const topic = extractTopicKeyword(lastUserMessage);

    switch (topic) {
      case 'gravity':
        return [
          'กฎของนิวตันมีอะไรบ้าง',
          'แรงโน้มถ่วงคืออะไร',
          'แรงโน้มถ่วงส่งผลต่อชีวิตประจำวันอย่างไร',
          'ใครค้นพบแรงโน้มถ่วง'
        ];
      case 'math':
        return [
          'อธิบายสูตรพีทาโกรัส',
          'โจทย์คณิตศาสตร์พื้นฐาน',
          'สรุปการแยกตัวประกอบ',
          'คณิตศาสตร์ในชีวิตจริง'
        ];
      case 'computer':
        return [
          'คอมพิวเตอร์ทำงานอย่างไร',
          'ส่วนประกอบของคอมพิวเตอร์',
          'ภาษาโปรแกรมเบื้องต้น',
          'AI คืออะไร'
        ];
      case 'history':
        return [
          'สมัยอยุธยาเกิดอะไรขึ้น',
          'พระนเรศวรคือใคร',
          'เหตุการณ์ 14 ตุลา',
          'สรุปประวัติศาสตร์ไทยสั้นๆ'
        ];
      // default fallback
      default:
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
            'อธิบายเรื่องแรงโน้มถ่วง',
            'สูตรคณิตศาสตร์พื้นฐาน',
            'ประวัติศาสตร์ไทยสมัยสุโขทัย',
            'หลักการทำงานของคอมพิวเตอร์'
          ];
        }
    }
  };


  const getAPIStatusIndicator = () => {
    switch (apiStatus) {
      case 'checking':
        return (
          <div className="flex items-center space-x-2 text-xs text-yellow-600">
            <Loader className="h-3 w-3 animate-spin" />
            <span>กำลังตรวจสอบการเชื่อมต่อ AI...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center space-x-2 text-xs text-green-600">
            <Zap className="h-3 w-3" />
            <span>เชื่อมต่อ AI สำเร็จ</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>ไม่สามารถเชื่อมต่อ AI ได้ - ตรวจสอบ API Key</span>
          </div>
        );
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${isExpanded ? 'fixed top-[64px] left-0 right-0 bottom-0 z-50 rounded-none' : 'h-[500px] sm:h-[600px] rounded-2xl'} flex flex-col bg-white shadow-lg overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 relative">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">AI ผู้ช่วยการเรียนรู้</h2>
            <p className="text-blue-100 text-sm">
              {selectedBook ? `กำลังเรียนรู้: ${selectedBook.title}` : 'พร้อมตอบคำถามทุกเรื่อง'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-4 top-4 text-white bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition"
          title={isExpanded ? 'ย่อหน้าต่างแชท' : 'ขยายหน้าต่างแชท'}
        >
          {isExpanded ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
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
                {currentPage && (
                  <p className="text-xs text-blue-600">หน้า {currentPage}</p>
                )}
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
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
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
                  <div className="flex-shrink-0">
                    {message.isTyping ? (
                      <Loader className="h-5 w-5 mt-0.5 text-blue-600 animate-spin" />
                    ) : (
                      <Bot className="h-5 w-5 mt-0.5 text-blue-600" />
                    )}
                  </div>
                )}
                {!message.isBot && (
                  <User className="h-5 w-5 mt-0.5 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.isTyping ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">กำลังคิด</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              apiStatus === 'connected'
                ? "ถามคำถามเกี่ยวกับเนื้อหา หรือเรื่องอื่นๆ ที่อยากรู้..."
                : "รอการเชื่อมต่อ AI..."
            }
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={2}
            disabled={isTyping || apiStatus !== 'connected'}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputText.trim() || apiStatus !== 'connected'}
            className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="ส่งข้อความ"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {getQuickActions().map((action, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(action);
                inputRef.current?.focus();
              }}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
              type="button"
            >
              {action}
            </button>
          ))}
        </div>
        <div className="mt-2">
          {getAPIStatusIndicator()}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
