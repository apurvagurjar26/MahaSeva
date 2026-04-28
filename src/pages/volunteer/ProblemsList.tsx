import { useState } from "react";
import { cn } from "../../lib/utils";
import { MapPin, Users, BookOpen, CheckCircle2, ChevronRight, X } from "lucide-react";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ProblemsList({ volunteer, problems }: { volunteer: any, problems: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredProblems = problems.filter(p => !volunteer.resigned_tasks?.includes(p.id));

  const handleAccept = async (pId: string) => {
    if (volunteer.assigned_task_id) {
       return;
    }
    
    setLoadingId(pId);
    try {
      const pRef = doc(db, "problems", pId);
      const pSnap = await getDoc(pRef);
      if (!pSnap.exists()) return;
      const pData = pSnap.data();

      // 2. Update volunteer
      await updateDoc(doc(db, "volunteers", volunteer.id), {
        assigned_task_id: pId
      });

      // 3. Update problem
      const newAssigned = [...(pData.assigned_volunteers || []), volunteer.id];
      await updateDoc(pRef, {
        assigned_volunteers: arrayUnion(volunteer.id),
        status: newAssigned.length >= pData.required_volunteers ? "Completed" : "In Progress"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto">
      <header className="mb-12 text-left border-b border-ink/10 pb-8">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Mobilization Registry</span>
        <h2 className="text-4xl font-display font-bold">Explore Problems</h2>
        <p className="font-display italic text-lg text-gray-500 max-w-2xl">Localized social imperatives identified within the Maharashtra cluster requiring immediate field intervention.</p>
      </header>
      
      {volunteer.assigned_task_id && (
         <div className="mb-12 p-6 bg-saffron/5 border border-saffron/20 flex items-center gap-6">
            <CheckCircle2 className="w-6 h-6 text-saffron" />
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-saffron">Active Engagement Detected: Complete current objectives before enrolling in additional directives.</p>
         </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-ink/10">
        {filteredProblems.map((p) => {
          const isAssignedToThisUser = volunteer.assigned_task_id === p.id;
          const isComplete = (p.assigned_volunteers?.length || 0) >= p.required_volunteers;
          const isNearby = p.location.toLowerCase() === volunteer.city.toLowerCase();

          return (
            <div key={p.id} className={cn(
              "bg-white/50 backdrop-blur-sm border-r border-b border-ink/10 group hover:bg-white transition-all p-10 min-h-[440px] flex flex-col",
              isAssignedToThisUser && "bg-paper ring-1 ring-inset ring-saffron/20"
            )}>
              <div className="mb-8 flex items-center justify-between">
                <span className={cn(
                  "font-sans text-[9px] font-black uppercase tracking-[0.3em] border px-3 py-1",
                  p.level === 'High' ? "border-red-600 text-red-600" : p.level === 'Mid' ? "border-saffron text-saffron" : "border-ink text-ink"
                )}>
                  Priority: {p.level}
                </span>
                <span className="font-sans text-[9px] font-bold text-gray-300 uppercase tracking-widest">{p.field}</span>
              </div>
              
              <h3 className="text-3xl font-display font-bold mb-6 line-clamp-3 leading-tight group-hover:text-saffron transition-colors grow italic">{p.title}</h3>
              
              <div className="space-y-4 mb-10 border-l border-ink/5 pl-4">
                 <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest">
                    <MapPin className={cn("w-4 h-4", isNearby ? "text-saffron" : "text-gray-300")} />
                    <span className={isNearby ? "font-bold text-ink" : "text-gray-500"}>{p.location}</span>
                    {isNearby && <span className="text-[10px] text-gray-400 opacity-50">• Local</span>}
                 </div>
                 <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-gray-500">
                    <Users className="w-4 h-4 text-gray-300" />
                    <span>Resource Load: <span className="text-ink font-bold">{p.assigned_volunteers?.length || 0} / {p.required_volunteers}</span></span>
                 </div>
              </div>

              <div className="flex gap-0 border border-ink">
                <button 
                  disabled={!!volunteer.assigned_task_id || isComplete || loadingId === p.id}
                  onClick={() => handleAccept(p.id)}
                  className={cn(
                    "flex-1 py-4 font-sans text-[10px] font-bold uppercase tracking-widest transition-all",
                    isAssignedToThisUser ? "bg-ink text-white cursor-default" :
                    volunteer.assigned_task_id || isComplete ? "bg-paper text-gray-300 cursor-not-allowed" :
                    "bg-white text-ink hover:bg-ink hover:text-white"
                  )}
                >
                  {isAssignedToThisUser ? "Assigned Objective" : isComplete ? "Capacity Reached" : loadingId === p.id ? "Initializing..." : "Accept Objective"}
                </button>
                <div className="w-14 border-l border-ink flex items-center justify-center bg-paper group-hover:bg-white transition-colors">
                  <ChevronRight className="w-5 h-5 text-ink" />
                </div>
              </div>
            </div>
          );
        })}
        {problems.length === 0 && (
           <div className="col-span-full py-40 text-center border-b border-ink/10">
              <p className="font-display italic text-gray-400 text-2xl">No situational imperatives currently logged in this sector.</p>
           </div>
        )}
      </div>
    </div>
  );
}
