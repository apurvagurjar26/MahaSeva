import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function VolunteerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/volunteer/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-paper relative flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>

      <Link to="/signup" className="absolute top-12 left-12 flex items-center gap-2 text-ink/40 hover:text-ink font-sans text-xs uppercase tracking-widest transition-colors z-10">
        <ArrowLeft className="w-4 h-4" /> Back to Signup
      </Link>
      
      <div className="max-w-md w-full relative z-10 bg-white p-12 border border-ink/10">
        <div className="mb-12 text-center">
          <div className="w-12 h-12 bg-ink text-white flex items-center justify-center mx-auto mb-6">
            <User className="w-6 h-6" />
          </div>
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Volunteer Registry Access</span>
          <h1 className="text-4xl font-display font-bold">Personal Portal</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Registry Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors"
              placeholder="volunteer@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Secure Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-[10px] uppercase tracking-widest font-bold mt-2">{error}</p>}
          <button 
            type="submit"
            className="w-full py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all"
          >
            Authenticate Identity
          </button>
        </form>
      </div>
    </div>
  );
}
