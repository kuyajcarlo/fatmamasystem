import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useLocation } from 'react-router';
import chatbotIcon from '../../imports/image-13.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === '/') {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Fat Mama Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Menu-related responses
    if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
      return "We offer a variety of delicious items including Chocolate Cakes, Cheesecakes (Biscoff & Blueberry), and Filipino Desserts (Halo Halo & Mais Con Yelo)! You can check out our Products page to see all the options with pictures and prices.";
    }

    // Hours-related responses
    if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
      return "Our main store is open Monday-Friday: 6:00 AM - 8:00 PM, Saturday: 7:00 AM - 9:00 PM, and Sunday: 7:00 AM - 7:00 PM. We have multiple locations with varying hours!";
    }

    // Location-related responses
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
      return "We have 4 locations! Our main store is at 123 Bakery Street, Sweet City. Check our Branches page for all locations and their specific details.";
    }

    // Cake-related responses
    if (lowerMessage.includes('cake') || lowerMessage.includes('custom')) {
      return "We specialize in custom cakes and delicious chocolate cakes! Visit our Design page to create your dream cake with AI customization. Our signature items include BG2 Jr Chocolate Moist Decadent Cake and BG9 Chocolate Moist Decadent Cake. We offer various sizes, flavors, and frostings!";
    }

    // Order-related responses
    if (lowerMessage.includes('order') || lowerMessage.includes('delivery')) {
      return "You can order directly from our website! Browse our menu, add items to your cart, and proceed to checkout. We offer pickup and delivery options for your convenience.";
    }

    // Price-related responses
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return "Our prices vary by item. Cakes start from ₱179, Cheesecakes from ₱439, and Filipino Desserts from ₱119. Check our Products page for detailed pricing!";
    }

    // Catering-related responses
    if (lowerMessage.includes('cater') || lowerMessage.includes('event') || lowerMessage.includes('party')) {
      return "Yes, we offer full catering services for weddings, corporate events, and parties! Visit our Inquiries page or call us at (555) 123-4567 to discuss your event needs.";
    }

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Welcome to Fat Mama! How can I assist you today? Feel free to ask about our menu, hours, locations, or custom cakes!";
    }

    // Thank you responses
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! If you have any other questions, feel free to ask. Have a wonderful day!";
    }

    // Default response
    return "I'm here to help! You can ask me about our menu, hours, locations, custom cakes, catering services, or anything else. What would you like to know?";
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What's on the menu?",
    "What are your hours?",
    "Where are you located?",
    "Can I order a custom cake?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#D4A843] hover:bg-[#B8923A] text-white rounded-full shadow-lg transition-all hover:scale-110 z-40 overflow-hidden w-16 h-16 flex items-center justify-center"
        >
          <img src={chatbotIcon} alt="Chat" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-[#D4A843] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full overflow-hidden w-10 h-10 flex items-center justify-center">
                <img src={chatbotIcon} alt="Mama & Co." className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Fat Mama Assistant</h3>
                <p className="text-xs text-amber-100">Online • Ready to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#B8923A] p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-[#D4A843] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-amber-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-3 rounded-lg border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A843]"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-[#D4A843] hover:bg-[#B8923A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
