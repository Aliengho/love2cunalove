import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Check, X, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, FriendRequest } from '../types';

export default function Friends({ currentUser }: { currentUser: User }) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqsRes, friendsRes] = await Promise.all([
        fetch(`/api/friends/requests/${currentUser.id}`),
        fetch(`/api/friends/${currentUser.id}`)
      ]);
      setRequests(await reqsRes.json());
      setFriends(await friendsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: number, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        if (status === 'accepted') fetchData();
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
    <div className="space-y-12">
      {/* Pending Requests */}
      {requests.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-stone-900">
            <h2 className="text-2xl font-bold tracking-tight">Pedidos de Amizade</h2>
            <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                      {req.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{req.name}</h4>
                      <p className="text-stone-500 text-xs flex items-center gap-1">
                        <MapPin size={12} />
                        {req.province}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(req.id, 'accepted')}
                      className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md shadow-rose-100"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => respondToRequest(req.id, 'rejected')}
                      className="p-2 bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Friends List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Meus Amigos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              to={`/chat/${friend.id}`}
              className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center justify-between hover:border-rose-300 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={friend.avatar || `https://picsum.photos/seed/${friend.id}/100/100`}
                    alt={friend.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 group-hover:text-rose-600 transition-colors">{friend.name}</h4>
                  <p className="text-stone-500 text-xs">{friend.province}</p>
                </div>
              </div>
              <div className="text-stone-400 group-hover:text-rose-600 transition-colors">
                <MessageCircle size={24} />
              </div>
            </Link>
          ))}

          {friends.length === 0 && (
            <div className="col-span-full text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-300">
              <Users className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-500">Ainda não tem amigos. Comece a descobrir!</p>
              <Link to="/" className="text-rose-600 font-semibold mt-4 inline-block hover:underline">
                Ver pessoas
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
