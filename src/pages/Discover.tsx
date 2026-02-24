import { useState, useEffect } from 'react';
import { Heart, MapPin, UserPlus, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

export default function Discover({ currentUser }: { currentUser: User }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/users?userId=${currentUser.id}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (receiverId: number) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, receiverId }),
      });
      if (res.ok) {
        setSentRequests(prev => new Set(prev).add(receiverId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Descobrir</h1>
        <p className="text-stone-500">Encontre pessoas interessantes perto de si.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="aspect-[4/3] relative bg-stone-100">
                <img
                  src={user.avatar || `https://picsum.photos/seed/${user.id}/600/450`}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">{user.name}</h3>
                    <div className="flex items-center gap-1 text-stone-500 text-sm">
                      <MapPin size={14} />
                      <span>{user.province}</span>
                    </div>
                  </div>
                  <div className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {user.gender}
                  </div>
                </div>
                
                <p className="text-stone-600 text-sm line-clamp-2 mb-6 h-10">
                  {user.bio || "Olá! Estou à procura de alguém especial para partilhar momentos."}
                </p>

                <button
                  onClick={() => sendRequest(user.id)}
                  disabled={sentRequests.has(user.id)}
                  className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    sentRequests.has(user.id)
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200'
                  }`}
                >
                  {sentRequests.has(user.id) ? (
                    <>
                      <Check size={18} />
                      <span>Pedido Enviado</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Enviar Pedido</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
          <Heart className="mx-auto text-stone-300 mb-4" size={48} />
          <p className="text-stone-500">Ninguém novo por aqui ainda. Volte mais tarde!</p>
        </div>
      )}
    </div>
  );
}
