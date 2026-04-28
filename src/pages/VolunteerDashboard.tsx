import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, updateDoc, doc, getDoc, arrayUnion, arrayRemove, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { 
  User, 
  Map as MapIcon, 
  LogOut, 
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  Power,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "../lib/utils";

// Sub-pages
import VolunteerProfile from "./volunteer/Profile";
import CurrentTasks from "./volunteer/CurrentTasks";
import ProblemsList from "./volunteer/ProblemsList";

export default function VolunteerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState<any>(null);
  const [allProblems, setAllProblems] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubVolunteer = onSnapshot(doc(db, "volunteers", auth.currentUser.uid), (doc) => {
      setVolunteer({ id: doc.id, ...doc.data() });
    });

    const qProblems = query(collection(db, "problems"));
    const unsubProblems = onSnapshot(qProblems, (snapshot) => {
      setAllProblems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubVolunteer();
      unsubProblems();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  const toggleAvailability = async () => {
    if (!volunteer) return;
    await updateDoc(doc(db, "volunteers", volunteer.id), {
      availability: !volunteer.availability
    });
  };

  if (!volunteer) return null;

  const navItems = [
    { name: "My Profile", path: "/volunteer/dashboard", icon: User },
    { name: "Current Tasks", path: "/volunteer/dashboard/tasks", icon: Briefcase },
    { name: "Explore Problems", path: "/volunteer/dashboard/problems", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-ink text-white flex flex-col relative z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center">
            <ShieldCheck className="text-ink w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight uppercase italic">Volunteer</span>
        </div>

        <div className="px-6 py-4">
           <div className={cn(
             "p-4 border transition-colors",
             volunteer.availability ? "border-saffron/40 bg-saffron/5" : "border-white/10 bg-white/5"
           )}>
             <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/50">Status</span>
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "p-1.5 transition-colors",
                    volunteer.availability ? "text-saffron" : "text-white/20"
                  )}
                >
                  <Power className="w-4 h-4" />
                </button>
             </div>
             <div className="flex items-center gap-3">
               <div className={cn("w-1.5 h-1.5 rounded-full", volunteer.availability ? "bg-saffron animate-pulse" : "bg-white/20")} />
               <span className="font-display italic text-lg">{volunteer.availability ? "Online & Ready" : "Offline"}</span>
             </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all",
                (location.pathname === item.path || (item.path !== "/volunteer/dashboard" && location.pathname.startsWith(item.path)))
                  ? "text-saffron bg-white/5"
                  : "text-white/40 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/30 hover:text-red-400 font-sans text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-paper text-ink">
        <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>
        <div className="relative z-10 h-full overflow-y-auto">
          {!volunteer.availability ? (
            <div className="h-full flex items-center justify-center p-8">
               <div className="max-w-md text-center bg-white p-16 border border-ink/10">
                  <div className="w-16 h-16 bg-paper border border-ink/10 text-saffron flex items-center justify-center mx-auto mb-8">
                    <Power className="w-8 h-8" />
                  </div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Protocol Alert</span>
                  <h2 className="text-4xl font-display font-bold mb-4">Signal Inactive</h2>
                  <p className="font-display italic text-lg text-gray-500 mb-10 leading-relaxed">System requires active availability status to synchronize localized missions and problems.</p>
                  <button 
                    onClick={toggleAvailability}
                    className="w-full py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all"
                  >
                    Activate Module
                  </button>
               </div>
            </div>
          ) : (
            <Routes>
              <Route index element={<VolunteerProfile volunteer={volunteer} problems={allProblems} />} />
              <Route path="tasks" element={<CurrentTasks volunteer={volunteer} problems={allProblems} />} />
              <Route path="problems" element={<ProblemsList volunteer={volunteer} problems={allProblems} />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  );
}
