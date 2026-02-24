import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Phone, Lock, User as UserIcon, MapPin, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, PROVINCES } from '../types';

export default function Register({ onLogin }: { onLogin: (user: User) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    province: '',
    gender: 'Outro'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // Auto login after register
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: formData.email, password: formData.password }),
        });
        const loginData = await loginRes.json();
        onLogin(loginData.user);
        navigate('/');
      } else {
        setError(data.error || 'Erro ao registar');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/3 bg-rose-600 items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Heart className="w-12 h-12 mb-6 fill-white/20" />
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Crie a sua conta</h1>
          <p className="text-lg text-rose-100 font-light">
            Junte-se a milhares de moçambicanos que encontraram o amor aqui.
          </p>
          
          <div className="mt-12 space-y-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step === s ? 'bg-white text-rose-600 border-white' : 'border-rose-400 text-rose-400'}`}>
                  {s}
                </div>
                <span className={step === s ? 'text-white font-medium' : 'text-rose-400'}>
                  {s === 1 ? 'Credenciais' : 'Perfil'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 text-rose-600 font-bold text-2xl mb-8">
            <Heart className="fill-current" />
            <span>Love2CunaLove</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Primeiro, as suas credenciais</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="84 000 0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    onClick={nextStep}
                    className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Próximo
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Fale-nos sobre si</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 text-stone-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="Como quer ser chamado?"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Província</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-stone-400" size={18} />
                      <select
                        name="province"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none appearance-none bg-white"
                      >
                        <option value="">Selecione a província</option>
                        {PROVINCES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Género</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Masculino', 'Feminino', 'Outro'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${formData.gender === g ? 'bg-rose-600 border-rose-600 text-white' : 'border-stone-200 text-stone-600 hover:border-rose-300'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-rose-600 text-sm bg-rose-50 p-3 rounded-lg">{error}</p>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 border border-stone-200 text-stone-600 py-3 rounded-xl font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Criando...' : 'Criar Conta'}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-stone-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-rose-600 font-semibold hover:underline">
              Entre aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
