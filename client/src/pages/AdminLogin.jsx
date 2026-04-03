import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';

const AdminLogin = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authService.login('admin@portfolio.com', password);
      const token = response.data.token;
      localStorage.setItem('token', token);
      onLogin();
    } catch {
      setError('Incorrect password. Please try again.');
      setPassword(''); // Clear the password field
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 font-sans bg-[#050505] text-white relative overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-indigo-500/10 rounded-full blur-[60px] md:blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-sm border rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 relative overflow-hidden shadow-2xl bg-[#0a0a0c] border-white/10 z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
        {/* Header */}
        <div className="flex flex-col items-center mb-6 md:mb-8 mt-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 md:mb-4 shadow-inner">
            <Lock className="text-indigo-400" size={18} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">CMS Access</h2>
          <p className="text-xs md:text-sm text-zinc-500 text-center px-2">Authenticate to manage your portfolio content.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-zinc-500 tracking-wider">
              Admin Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl px-4 py-3 md:py-3 focus:outline-none focus:border-indigo-500 transition-colors bg-[#030303] border border-white/10 text-white placeholder-zinc-700 text-base"
              placeholder="Enter password..."
              autoComplete="current-password"
            />
            <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <p className="text-rose-500 text-xs font-semibold">{error}</p>
            </div>
          </div>
          <div className="pt-2 space-y-4">
            <button 
              type="submit" 
              className="w-full font-bold py-3 md:py-3.5 rounded-xl transition-all duration-300 bg-white text-black hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] text-base"
            >
              Authenticate
            </button>
              <button 
              type="button" 
              onClick={onCancel} 
              className="w-full flex items-center justify-center gap-2 transition-colors text-sm md:text-sm font-medium text-zinc-500 hover:text-white py-2 mt-2"
            >
              <ArrowLeft size={14} /> Back to site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
