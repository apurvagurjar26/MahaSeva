import { Building2, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function SignupChoice() {
  return (
    <div className="min-h-screen bg-paper relative flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>
      
      <Link to="/" className="absolute top-12 left-12 flex items-center gap-2 text-ink/40 hover:text-ink font-sans text-xs uppercase tracking-widest transition-colors z-10">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4 block">Registration Gateway</span>
          <h1 className="font-display text-6xl md:text-7xl font-bold leading-none">Sign up as an</h1>
        </div>
        
        <div className="grid md:grid-cols-2 gap-0 border border-ink/10 bg-white/50 backdrop-blur-sm">
          {/* NGO Login Card */}
          <motion.div 
            whileHover={{ backgroundColor: "rgba(255,255,255,1)" }}
            className="p-12 border-r border-ink/10 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-ink text-white rounded-none flex items-center justify-center mb-8 group-hover:bg-saffron transition-colors">
              <Building2 className="w-8 h-8" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block underline decoration-saffron underline-offset-8">Portal Alpha</span>
            <h2 className="font-display text-3xl mb-4">NGO LOGIN</h2>
            <p className="font-sans text-sm text-gray-500 mb-10 leading-relaxed">Administrative access for verified non-governmental organizations operating in Maharashtra.</p>
            <Link 
              to="/ngo/login"
              className="w-full py-4 bg-ink text-white font-sans text-xs font-bold tracking-widest uppercase hover:bg-saffron transition-all"
            >
              Access Dashboard
            </Link>
          </motion.div>

          {/* Volunteer Card */}
          <motion.div 
            whileHover={{ backgroundColor: "rgba(255,255,255,1)" }}
            className="p-12 flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-ink text-white rounded-none flex items-center justify-center mb-8 group-hover:bg-saffron transition-colors">
              <User className="w-8 h-8" />
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 block underline decoration-saffron underline-offset-8">Portal Beta</span>
            <h2 className="font-display text-3xl mb-4">VOLUNTEER</h2>
            <p className="font-sans text-sm text-gray-500 mb-10 leading-relaxed">Join the localized mobilization force. Register or login to participate in active social missions.</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Link 
                to="/volunteer/login"
                className="py-4 bg-ink text-white font-sans text-xs font-bold tracking-widest uppercase hover:bg-saffron transition-all text-center"
              >
                Login
              </Link>
              <Link 
                to="/volunteer/register"
                className="py-4 border border-ink text-ink font-sans text-xs font-bold tracking-widest uppercase hover:bg-ink hover:text-white transition-all text-center"
              >
                Register
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
