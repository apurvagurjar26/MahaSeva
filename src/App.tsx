import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";

import Landing from "./pages/Landing";
import SignupChoice from "./pages/Signup";
import NGOLogin from "./pages/NGOLogin";
import VolunteerLogin from "./pages/VolunteerLogin";
import VolunteerRegister from "./pages/VolunteerRegister";
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper relative">
        <div className="absolute inset-0 maharashtra-grid pointer-events-none opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border border-ink border-t-saffron rounded-full animate-spin mb-6"></div>
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">Synchronizing Registry</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignupChoice />} />
        
        {/* Auth Routes */}
        <Route path="/ngo/login" element={<NGOLogin />} />
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/register" element={<VolunteerRegister />} />

        {/* Protected Routes */}
        <Route 
          path="/ngo/dashboard/*" 
          element={user ? <NGODashboard /> : <Navigate to="/ngo/login" />} 
        />
        <Route 
          path="/volunteer/dashboard/*" 
          element={user ? <VolunteerDashboard /> : <Navigate to="/volunteer/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
