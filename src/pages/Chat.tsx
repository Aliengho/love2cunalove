import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Message } from '../types';

export default function Chat({ currentUser }: { currentUser: User }) {
  const { friendId } = useParams();
  const [friend, setFriend] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (friendId) {
      fetchFriend();
      fetchMessages();
      setupWebSocket();
    }
    return () => ws?.close();
  }, [friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFriend = async () => {
    const res = await fetch(`/api/users/${friendId}`);
    setFriend(await res.json());
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/messages/${currentUser.id}/${friendId}`);
    setMessages(await res.json());
  };

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'auth', userId: currentUser.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat' && data.senderId === Number(friendId)) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender_id: data.senderId,
          receiver_id: currentUser.id,
          content: data.content,
          created_at: data.timestamp
        }]);
      }
    };

    setWs(socket);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    const msg = {
      type: 'chat',
      senderId: currentUser.id,
      receiverId: Number(friendId),
      content: newMessage
    };

    ws.send(JSON.stringify(msg));
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: Number(friendId),
      content: newMessage,
      created_at: new Date().toISOString()
    }]);
    
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!friend) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xl">
      {/* Chat Header */}
      <header className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/friends')} className="p-2 -ml-2 text-stone-400 hover:text-rose-600 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={friend.avatar || `https://picsum.photos/seed/${friend.id}/100/100`}
                alt={friend.name}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 leading-none mb-1">{friend.name}</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-stone-400">
          <button className="p-2 hover:text-rose-600 transition-colors"><Phone size={20} /></button>
          <button className="p-2 hover:text-rose-600 transition-colors"><Video size={20} /></button>
          <button className="p-2 hover:text-rose-600 transition-colors"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUser.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                isMe 
                  ? 'bg-rose-600 text-white rounded-tr-none' 
                  : 'bg-white text-stone-800 rounded-tl-none border border-stone-100'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-stone-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-stone-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-rose-600 text-white p-3 rounded-2xl hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-lg shadow-rose-100"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
