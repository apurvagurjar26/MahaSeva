import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { 
  Building2, 
  Upload, 
  AlertCircle, 
  Users, 
  Map as MapIcon, 
  LogOut, 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { classifyProblem } from "../services/aiService";

// Sub-pages
import UploadPage from "./ngo/UploadPage";
import ProblemsPage from "./ngo/ProblemsPage";
import VolunteersPage from "./ngo/VolunteersPage";
import MapPage from "./ngo/MapPage";

export default function NGODashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [problems, setProblems] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);

  useEffect(() => {
    const qProblems = query(collection(db, "problems"));
    const unsubProblems = onSnapshot(qProblems, (snapshot) => {
      setProblems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qVolunteers = query(collection(db, "volunteers"), where("availability", "==", true));
    const unsubVolunteers = onSnapshot(qVolunteers, (snapshot) => {
      setVolunteers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProblems();
      unsubVolunteers();
    };
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/ngo/dashboard", icon: LayoutDashboard },
    { name: "Upload Data", path: "/ngo/dashboard/upload", icon: Upload },
    { name: "Problems Detected", path: "/ngo/dashboard/problems", icon: AlertCircle },
    { name: "Active Volunteers", path: "/ngo/dashboard/volunteers", icon: Users },
    { name: "Map", path: "/ngo/dashboard/map", icon: MapIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-ink/10 flex flex-col relative z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-ink flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight uppercase italic">MahaSeva</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-sans text-xs font-bold uppercase tracking-widest transition-all",
                (location.pathname === item.path || (item.path !== "/ngo/dashboard" && location.pathname.startsWith(item.path)))
                  ? "text-saffron border-l-2 border-saffron bg-paper"
                  : "text-gray-400 hover:text-ink hover:bg-paper"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-ink/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-600 font-sans text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-paper">
        <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>
        <div className="relative z-10 h-full overflow-y-auto">
          <Routes>
            <Route index element={<DashboardHome problems={problems} volunteers={volunteers} />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="problems" element={<ProblemsPage problems={problems} />} />
            <Route path="volunteers" element={<VolunteersPage volunteers={volunteers} problems={problems} />} />
            <Route path="map" element={<MapPage problems={problems} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function DashboardHome({ problems, volunteers }: { problems: any[], volunteers: any[] }) {
  const stats = [
    { name: "Active Issues", value: problems.length, icon: AlertCircle, color: "text-saffron", border: "border-saffron/20" },
    { name: "Volunteers Online", value: volunteers.length, icon: Users, color: "text-ink", border: "border-ink/10" },
    { name: "Completed Tasks", value: problems.filter(p => p.status === 'Completed').length, icon: CheckCircle2, color: "text-ink", border: "border-ink/10" },
    { name: "Pending Matching", value: problems.filter(p => p.status === 'In Progress').length, icon: Clock, color: "text-ink", border: "border-ink/10" },
  ];

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <header className="mb-16 text-left border-b border-ink/10 pb-12">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">NGO Administrative Portal</span>
        <h1 className="text-6xl font-display font-bold mb-2">Dashboard Overview</h1>
        <p className="font-display italic text-xl text-gray-500">"Efficiency in service, precision in action."</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-ink/10 mb-16 bg-white/50 backdrop-blur-sm">
        {stats.map((stat) => (
          <div key={stat.name} className="p-8 border-r border-ink/10 last:border-r-0 hover:bg-white transition-colors group">
            <div className="flex items-center justify-between mb-4">
               <stat.icon className={cn("w-5 h-5", stat.color)} />
               <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Stat {stats.indexOf(stat) + 1}</span>
            </div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.name}</p>
            <p className="text-5xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white/50 backdrop-blur-sm p-10 border border-ink/10 group">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold">Recent Problems</h2>
            <Link to="problems" className="text-saffron text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline decoration-2 underline-offset-4">View All <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-0 divide-y divide-ink/10">
            {problems.slice(0, 5).map(p => (
              <div key={p.id} className="py-6 flex items-center justify-between group/item">
                <div>
                  <p className="font-display text-lg font-bold group-hover/item:text-saffron transition-colors">{p.title}</p>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400 mt-1">{p.location} • {p.field}</p>
                </div>
                <span className={cn(
                  "px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest border",
                  p.level === 'High' ? "border-red-600 text-red-600" : p.level === 'Mid' ? "border-saffron text-saffron" : "border-ink text-ink"
                )}>
                  {p.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm p-10 border border-ink/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold">Active Volunteers</h2>
            <Link to="volunteers" className="text-saffron text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline decoration-2 underline-offset-4">View All <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-0 divide-y divide-ink/10">
            {volunteers.slice(0, 5).map(v => (
              <div key={v.id} className="py-6 flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-ink flex items-center justify-center font-display font-bold text-lg bg-white group-hover/item:bg-ink group-hover/item:text-white transition-all uppercase">
                    {(v.name || v.email || "?")[0]}
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold group-hover/item:text-saffron transition-colors">
                      {v.name || (v.email ? v.email.split('@')[0] : "Anonymous Resource")}
                    </p>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400 mt-1">{v.city}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest border",
                   v.assigned_task_id ? "border-saffron text-saffron" : "border-ink text-ink"
                )}>
                  {v.assigned_task_id ? "Assigned" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
