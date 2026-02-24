import React, { useState } from 'react';
import { User as UserIcon, MapPin, Mail, Phone, Camera, Save, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { User, PROVINCES } from '../types';

export default function Profile({ currentUser, onUpdate }: { currentUser: User; onUpdate: (user: User) => void }) {
  const [formData, setFormData] = useState({ ...currentUser });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // In a real app, we'd have a PUT /api/users/:id endpoint
    // For this demo, we'll just simulate it and update local state
    setTimeout(() => {
      onUpdate(formData);
      setMessage('Perfil atualizado com sucesso!');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <img
            src={currentUser.avatar || `https://picsum.photos/seed/${currentUser.id}/200/200`}
            alt={currentUser.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
            referrerPolicy="no-referrer"
          />
          <button className="absolute bottom-0 right-0 p-2 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-colors">
            <Camera size={20} />
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{currentUser.name}</h1>
          <p className="text-stone-500">{currentUser.province}, Moçambique</p>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Nome</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-stone-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Província</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-stone-400" size={18} />
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none appearance-none bg-white"
                >
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-stone-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-stone-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Sobre Mim</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio || ''}
              onChange={handleChange}
              placeholder="Conte-nos um pouco sobre si e o que procura..."
              className="w-full p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none"
            />
          </div>

          {message && (
            <p className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg text-center font-medium">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-100 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save size={20} />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      <div className="bg-rose-50 rounded-3xl p-8 border border-rose-100 text-center">
        <Heart className="mx-auto text-rose-600 mb-4 fill-rose-600/10" size={32} />
        <h3 className="text-xl font-bold text-rose-900 mb-2">Dica de Amor</h3>
        <p className="text-rose-700 text-sm leading-relaxed">
          Um perfil completo e com uma boa foto aumenta em 3x as suas chances de encontrar um par ideal. Seja autêntico!
        </p>
      </div>
    </div>
  );
}
