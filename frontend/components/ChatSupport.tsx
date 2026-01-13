"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Store, ArrowRight, Loader2 } from "lucide-react";
import { getBaseUrl } from "../lib/api";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: any[]; // Products returned by search
}

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'bot', text: "Hi! 👋 I'm your shopping assistant. Tell me what you're looking for! (e.g., 'Cheap gaming laptop under 50000')" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    
    // 1. Add User Message
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Call API
      const res = await fetch(`${getBaseUrl()}/api/stores/chat-search/?q=${encodeURIComponent(userText)}`);
      const data = await res.json();

      // 3. Add Bot Response
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.products.length > 0 ? data.response_text : "I couldn't find anything matching that. Try a different keyword?",
        products: data.products
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Sorry, I'm having trouble connecting to the store server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-indigo-600 hover:scale-110"
        } text-white backdrop-blur-md border border-white/20`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-full max-w-sm sm:w-96 h-[500px] flex flex-col bg-white/10 backdrop-blur-3xl border border-white/30 rounded-3xl shadow-2xl transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-white/10 border-b border-white/10 flex items-center gap-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-indigo-600/80 flex items-center justify-center text-white shadow-lg">
            <Store size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">StoreVille Concierge</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Online
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Text Bubble */}
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white/40 text-slate-800 border border-white/30 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>

              {/* Product Cards (Carousel inside chat) */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 w-full flex gap-3 overflow-x-auto pb-2 snap-x">
                  {msg.products.map((product: any) => (
                    <div key={product.id} className="min-w-[200px] bg-white/60 backdrop-blur-md p-3 rounded-xl border border-white/40 shadow-sm snap-center">
                      <div className="h-24 bg-white/50 rounded-lg mb-2 relative overflow-hidden">
                         {product.image ? (
                           <img src={product.image} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                         )}
                      </div>
                      <h4 className="font-bold text-slate-900 truncate text-sm">{product.name}</h4>
                      <p className="text-indigo-600 font-bold text-xs mb-2">{product.price} ETB</p>
                      <Link 
                        href={`/store/${product.store_slug || 'demo'}`} // Ensure your serializer sends store_slug
                        className="block w-full py-1.5 bg-indigo-600 text-white text-center text-xs rounded-lg font-bold hover:bg-indigo-700 transition"
                      >
                        View Product
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/40 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600"/>
                <span className="text-xs text-slate-500">Searching inventory...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white/20 border-t border-white/20 flex gap-2 backdrop-blur-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a product..."
            className="flex-1 bg-white/40 border border-white/30 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}