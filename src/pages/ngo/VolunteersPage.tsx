import { useState } from "react";
import { cn } from "../../lib/utils";
import { Search, Filter, UserCog, UserMinus, UserPlus, ShieldCheck } from "lucide-react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function VolunteersPage({ volunteers, problems }: { volunteers: any[], problems: any[] }) {
  const [locationFilter, setLocationFilter] = useState("All");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState({ day: "", time: "" });

  const currentVolunteer = volunteers.find(v => v.id === assigningId);

  // Intelligent matching & scoring engine
  const calculateMatchScore = (v: any, p: any) => {
    if (!v || !p) return 0;
    let score = 0;
    const skills = (v.skills || []).map((s: string) => s.toLowerCase());
    const field = (p.field || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    const vCity = (v.city || "").toLowerCase();
    const pLoc = (p.location || "").toLowerCase();

    // 1. Location Proximity (Primary Driver)
    if (vCity === pLoc) score += 50;

    // 2. Field Match (Subject Matter Expertise)
    if (skills.some(s => field.includes(s))) score += 30;

    // 3. Keyword Semantic Match
    skills.forEach(skill => {
      if (title.includes(skill)) score += 10;
    });

    // 4. Urgency Weighting
    if (p.level === "High") score += 20;
    if (p.level === "Mid") score += 10;

    return score;
  };

  const getRankedMatchingProblems = (v: any) => {
    if (!v) return [];
    
    return problems
      .filter(p => p.status === "In Progress")
      .map(p => ({ ...p, matchScore: calculateMatchScore(v, p) }))
      .filter(p => p.matchScore > 0 || (v.skills?.length === 0)) 
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const matchingProblems = currentVolunteer ? getRankedMatchingProblems(currentVolunteer) : [];

  const handleAssignConfirm = async () => {
    if (!assigningId || !selectedProblemId || !schedule.day || !schedule.time) return;
    setIsSubmitting(true);
    try {
      const vRef = doc(db, "volunteers", assigningId);
      const pRef = doc(db, "problems", selectedProblemId);

      await updateDoc(vRef, {
        assigned_task_id: selectedProblemId,
        task_schedule: schedule
      });

      await updateDoc(pRef, {
        assigned_volunteers: arrayUnion(assigningId)
      });

      setAssigningId(null);
      setSelectedProblemId("");
      setSchedule({ day: "", time: "" });
    } catch (err) {
      console.error("Assignment failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (locationFilter === "All") return true;
    return v.city.toLowerCase() === locationFilter.toLowerCase();
  });

  const cities = ["All", ...Array.from(new Set(volunteers.map(v => v.city)))];

  const handleAssign = async (vId: string) => {
    // This would typically open a modal to pick a problem
    // For simplicity, we'll assume we're assigning to a "manual" task ID if needed
    // or just toggling a status for this demo.
    // Real implementation: User picks a problem from a dropdown.
    setAssigningId(vId);
  };

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-ink/10 pb-8">
        <div className="text-left">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Registry Segment 003</span>
          <h2 className="text-4xl font-display font-bold">Active Volunteers</h2>
          <p className="font-display italic text-lg text-gray-500">Resource inventory and mobilization status.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron appearance-none min-w-[200px]"
            >
              {cities.map(c => <option key={c} value={c}>{c === "All" ? "All Districts" : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink text-white font-sans text-[9px] uppercase tracking-[0.2em]">
                <th className="px-6 py-4 font-bold border-r border-white/10">ID</th>
                <th className="px-6 py-4 font-bold border-r border-white/10">Resource Name</th>
                <th className="px-6 py-4 font-bold border-r border-white/10">Location</th>
                <th className="px-6 py-4 font-bold border-r border-white/10">Directives / Skills</th>
                <th className="px-6 py-4 font-bold border-r border-white/10">Status</th>
                <th className="px-6 py-4 font-bold">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filteredVolunteers.map((v, idx) => (
                <tr key={v.id} className="hover:bg-white transition-colors group">
                  <td className="px-6 py-6 text-gray-400 font-sans text-xs border-r border-ink/10">{idx + 1}</td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-ink flex items-center justify-center font-display font-bold text-lg bg-white group-hover:bg-ink group-hover:text-white transition-all uppercase">
                        {(v.name || v.email || "?")[0]}
                      </div>
                      <div>
                        <p className="font-display font-bold text-lg group-hover:text-saffron transition-colors">
                          {v.name || (v.email ? v.email.split('@')[0] : "Anonymous Resource")}
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-widest text-gray-400">Verified Personnel</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-sans text-xs text-gray-500 uppercase tracking-widest border-r border-ink/10">{v.city}</td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {v.skills?.slice(0, 2).map((s: string) => (
                          <span key={s} className="px-2 py-1 border border-ink/10 bg-paper font-sans text-[9px] font-bold uppercase tracking-tight">{s}</span>
                        ))}
                        {v.skills?.length > 2 && <span className="font-sans text-[9px] text-gray-400 uppercase tracking-tighter">+{v.skills.length - 2}</span>}
                      </div>
                      {(() => {
                        const matches = getRankedMatchingProblems(v);
                        if (matches.length > 0) {
                          return (
                            <div className="flex items-center gap-1.5 mt-1 border-t border-ink/5 pt-1.5">
                              <ShieldCheck className="w-2.5 h-2.5 text-saffron" />
                              <span className="font-sans text-[8px] font-bold uppercase tracking-widest text-saffron">
                                {matches.length} Intelligence Matches Found
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <span className={cn(
                      "font-sans text-[10px] font-bold uppercase tracking-widest",
                      v.assigned_task_id ? "text-saffron" : "text-ink"
                    )}>
                      {v.assigned_task_id ? "Deployed" : "Available"}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <button 
                      onClick={() => handleAssign(v.id)}
                      className={cn(
                        "w-full py-2 font-sans text-[9px] font-bold uppercase tracking-widest transition-all border block text-center",
                        v.assigned_task_id 
                          ? "border-ink/5 text-gray-300 cursor-not-allowed" 
                          : "border-ink bg-ink text-white hover:bg-saffron hover:border-saffron shadow-lg shadow-ink/10"
                      )}
                      disabled={!!v.assigned_task_id}
                    >
                      {(() => {
                        const matches = getRankedMatchingProblems(v);
                        if (matches.length > 0 && !v.assigned_task_id) {
                          return `Assign: ${matches[0].title.slice(0, 15)}...`;
                        }
                        return "Assign Task";
                      })()}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <p className="font-display italic text-gray-400 text-xl">No resources matching selection criteria found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assigningId && currentVolunteer && (
         <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8 z-50 overflow-y-auto">
            <div className="bg-paper p-12 max-w-2xl w-full border border-ink/10 relative">
               <button onClick={() => setAssigningId(null)} className="absolute top-8 right-8 text-gray-400 hover:text-ink">
                  <UserMinus className="w-6 h-6" />
               </button>
               
               <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Matching Intelligence System</span>
               <h3 className="text-4xl font-display font-bold mb-6 italic">Assign Task</h3>
               
               <div className="grid md:grid-cols-2 gap-12 mb-10">
                  <div>
                     <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-ink/5 pb-2">Target Resource</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border border-ink flex items-center justify-center font-display font-bold text-xl bg-white">
                           {(currentVolunteer.name || "?")[0]}
                        </div>
                        <div>
                           <p className="font-display font-bold text-xl">{currentVolunteer.name}</p>
                           <p className="font-sans text-[10px] uppercase tracking-widest text-saffron">{currentVolunteer.city}</p>
                        </div>
                     </div>
                     <div className="mt-6 space-y-4">
                        <div>
                           <p className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Verified Skills</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                              {currentVolunteer.skills?.map((s: string) => (
                                 <span key={s} className="px-2 py-1 bg-ink text-white font-sans text-[9px] font-bold uppercase tracking-widest">{s}</span>
                              ))}
                           </div>
                        </div>
                        <div>
                           <p className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Legacy Experience</p>
                           <p className="font-display italic text-gray-600">{currentVolunteer.experience || "Fresh Recruit"}</p>
                        </div>
                     </div>
                  </div>

                  <div>
                     <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-ink/5 pb-2">Directive Selection</p>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Select Matching Problem</label>
                           <select 
                              value={selectedProblemId}
                              onChange={(e) => setSelectedProblemId(e.target.value)}
                              className="w-full p-4 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron"
                           >
                              <option value="">-- Choose Problem --</option>
                              {matchingProblems.map((p: any) => (
                                 <option key={p.id} value={p.id}>
                                    {p.matchScore >= 50 && "📍 "}{p.title} ({p.level}) - {p.matchScore}% Match
                                 </option>
                              ))}
                           </select>
                           {matchingProblems.length === 0 && (
                              <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mt-1 italic">No direct matches for these credentials.</p>
                           )}
                        </div>

                        {selectedProblemId && (
                           <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Operation Day</label>
                                    <input 
                                       type="text" 
                                       placeholder="e.g. Monday"
                                       value={schedule.day}
                                       onChange={(e) => setSchedule({...schedule, day: e.target.value})}
                                       className="w-full p-3 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Timeline</label>
                                    <input 
                                       type="text" 
                                       placeholder="e.g. 09:00 - 17:00"
                                       value={schedule.time}
                                       onChange={(e) => setSchedule({...schedule, time: e.target.value})}
                                       className="w-full p-3 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron"
                                    />
                                 </div>
                              </div>
                              
                              {/* Better Match Warning for High Level */}
                              {(() => {
                                 const p = problems.find(pr => pr.id === selectedProblemId);
                                 if (p?.level === "High") {
                                    // Rule: "If High level, assign to one with higher experience and nearest."
                                    // We check if there's a better volunteer for THIS problem.
                                    const others = volunteers.filter(v => 
                                       v.id !== currentVolunteer.id && 
                                       !v.assigned_task_id && 
                                       calculateMatchScore(v, p) > 0
                                    );
                                    
                                    const vScore = calculateMatchScore(currentVolunteer, p);
                                    const isBest = others.every(o => {
                                       const oScore = calculateMatchScore(o, p);
                                       if (oScore > vScore) return false;
                                       
                                       // If scores are equal, tie-break on experience
                                       if (oScore === vScore) {
                                          const vExp = (currentVolunteer.experience || "").match(/\d+/) ? parseInt((currentVolunteer.experience || "").match(/\d+/)![0]) : 0;
                                          const oExp = (o.experience || "").match(/\d+/) ? parseInt((o.experience || "").match(/\d+/)![0]) : 0;
                                          if (oExp > vExp) return false;
                                       }
                                       return true;
                                    });

                                    if (!isBest) {
                                       return (
                                          <div className="p-4 bg-orange-50 border border-orange-200">
                                             <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-orange-600">
                                                Matching Flag: Better qualified resources exist for this high-urgency mission.
                                             </p>
                                          </div>
                                       );
                                    }
                                 }
                                 return null;
                              })()}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-10 border-t border-ink/10">
                  <button 
                    onClick={() => setAssigningId(null)} 
                    className="py-4 border border-ink text-ink font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all shadow-lg shadow-ink/5"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAssignConfirm}
                    disabled={isSubmitting || !selectedProblemId || !schedule.day || !schedule.time}
                    className="py-4 bg-ink text-white font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-saffron transition-all disabled:opacity-30 shadow-xl"
                  >
                    {isSubmitting ? "Syncing..." : "Assign Task"}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
