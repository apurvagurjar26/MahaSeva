import { useState } from "react";
import { CheckCircle2, Clock, MapPin, Calendar, X, AlertTriangle, Users, PenTool, ClipboardList } from "lucide-react";
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function CurrentTasks({ volunteer, problems }: { volunteer: any, problems: any[] }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isResigning, setIsResigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [summaryData, setSummaryData] = useState({ people_helped: 0, resources_used: "", notes: "" });
  
  const currentTask = problems.find(p => p.id === volunteer.assigned_task_id);
  const pastTasks = problems.filter(p => (volunteer.completed_tasks || []).includes(p.id));

  const handleCompleteInitiate = () => {
    setShowSummary(true);
  };

  const handleSubmitImpact = async () => {
    if (!currentTask) return;
    setIsUpdatingStatus(true);
    try {
      const vRef = doc(db, "volunteers", volunteer.id);
      const pRef = doc(db, "problems", currentTask.id);

      // 1. Log impact on problem
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const pData = pSnap.data();
        const completedBy = [...(pData.completed_by || []), volunteer.id];
        const assignedVolunteers = pData.assigned_volunteers || [];
        
        // Add impact metric
        await updateDoc(pRef, {
          completed_by: arrayUnion(volunteer.id),
          impact_metrics: arrayUnion({
            volunteer_id: volunteer.id,
            people_helped: Number(summaryData.people_helped),
            resources_used: summaryData.resources_used,
            notes: summaryData.notes
          })
        });

        // 2. Check if all assigned volunteers have completed
        // We filter out any volunteers that might have resigned but are still in assigned_volunteers? 
        // Actually handleResign removes them from assigned_volunteers.
        // So we check if completedBy (including current) covers assignedVolunteers.
        const allCompleted = assignedVolunteers.every((vId: string) => completedBy.includes(vId));
        
        if (allCompleted && assignedVolunteers.length > 0) {
          await updateDoc(pRef, {
            status: "Completed"
          });
        }
      }
      
      // 3. Update volunteer state
      await updateDoc(vRef, {
        assigned_task_id: "",
        completed_tasks: arrayUnion(currentTask.id)
      });

      setShowSummary(false);
    } catch (err) {
      console.error("Impact submission failed:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResign = async () => {
    if (!currentTask) return;
    setIsResigning(true);
    try {
      const vRef = doc(db, "volunteers", volunteer.id);
      const pRef = doc(db, "problems", currentTask.id);

      // 1. Update volunteer
      await updateDoc(vRef, {
        assigned_task_id: "",
        resigned_tasks: arrayUnion(currentTask.id)
      });

      // 2. Update problem
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const pData = pSnap.data();
        const newAssignedCount = (pData.assigned_volunteers?.length || 0) - 1;
        await updateDoc(pRef, {
          assigned_volunteers: arrayRemove(volunteer.id),
          status: newAssignedCount < pData.required_volunteers ? "In Progress" : "Completed"
        });
      }

      setShowConfirm(false);
    } catch (err) {
      console.error("Resignation failed:", err);
    } finally {
      setIsResigning(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <header className="mb-12 text-left border-b border-ink/10 pb-8">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Mission Management</span>
        <h2 className="text-4xl font-display font-bold">Active Assignments</h2>
        <p className="font-display italic text-lg text-gray-500">Live operational status and field directives.</p>
      </header>
      
      {!currentTask ? (
        <div className="bg-white/50 p-24 border-2 border-dashed border-ink/10 text-center">
           <div className="w-16 h-16 bg-paper border border-ink/10 text-gray-300 flex items-center justify-center mx-auto mb-8">
             <CheckCircle2 className="w-8 h-8" />
           </div>
           <h3 className="text-3xl font-display font-bold text-ink mb-4">No active missions logged</h3>
           <p className="font-display italic text-lg text-gray-500 mb-8">Synchronize with the registry to identify localized interventions.</p>
           <button className="px-10 py-4 bg-ink text-white font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-saffron transition-all" onClick={() => window.location.href = '/volunteer/dashboard/problems'}>
             Scan Regional Problems
           </button>
        </div>
      ) : (
        <div className="bg-white border border-ink shadow-2xl shadow-ink/5 overflow-hidden">
           <div className="p-12 bg-ink text-white relative">
              <div className="absolute top-0 right-0 p-4">
                 <span className="px-4 py-1.5 border border-white/20 font-sans text-[9px] font-bold uppercase tracking-[0.2em] bg-white/5">Operational</span>
              </div>
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2 block">Direct Command</span>
              <h3 className="text-5xl font-display font-bold mb-6 italic">{currentTask.title}</h3>
              <div className="flex flex-wrap gap-10 text-white/60 items-center">
                 <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest"><MapPin className="w-4 h-4 text-saffron" /> {currentTask.location}</span>
                 <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest"><Clock className="w-4 h-4 text-saffron" /> Status: {currentTask.status}</span>
                 <button 
                   onClick={handleCompleteInitiate}
                   className="ml-auto px-4 py-2 border border-saffron text-saffron font-sans text-[9px] font-bold uppercase tracking-widest hover:bg-saffron hover:text-ink transition-all flex items-center gap-2"
                 >
                   <CheckCircle2 className="w-3 h-3" />
                   Mark as Completed
                 </button>
              </div>
           </div>
           <div className="p-12 grid md:grid-cols-2 gap-12">
              <div>
                 <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block">Time Synchronization</span>
                 <div className="flex items-center gap-6 bg-paper p-6 border border-ink/5">
                    <Calendar className="w-8 h-8 text-saffron" />
                    <div>
                       <p className="font-display font-bold text-xl leading-none mb-1">May 20, 2026</p>
                       <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">09:00 — 17:00 Hours</p>
                    </div>
                 </div>
              </div>
              <div>
                 <span className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6 block">Field Directives</span>
                 <p className="font-display italic text-xl text-gray-600 leading-relaxed">
                    "Report to regional operations center. Coordinate with localized NGO units for data synthesis and essential supply mobilization."
                 </p>
              </div>
           </div>
           <div className="p-8 bg-paper border-t border-ink/5 flex justify-end px-12">
              <button 
                onClick={() => setShowConfirm(true)}
                className="px-8 py-3 bg-white border border-ink font-sans text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
              >
                Resign from Mission
              </button>
           </div>
        </div>
      )}

      {/* Impact Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-ink/90 backdrop-blur-md">
          <div className="bg-paper p-12 max-w-2xl w-full border border-ink/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <button onClick={() => setShowSummary(false)} className="text-gray-400 hover:text-ink"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-8 border-b border-ink/5 pb-6">
              <div className="w-12 h-12 bg-saffron border border-saffron/20 flex items-center justify-center text-ink">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-1 block font-bold">Post-Mission Debrief</span>
                <h3 className="text-3xl font-display font-bold">Impact Summary</h3>
              </div>
            </div>

            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="font-sans text-[10px] uppercase tracking-widest text-ink font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-saffron" /> People Helped
                     </label>
                     <input 
                        type="number"
                        min="0"
                        value={summaryData.people_helped}
                        onChange={(e) => setSummaryData({...summaryData, people_helped: Number(e.target.value)})}
                        className="w-full p-4 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron"
                        placeholder="e.g. 50"
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="font-sans text-[10px] uppercase tracking-widest text-ink font-bold flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-saffron" /> Resources Used
                     </label>
                     <input 
                        type="text"
                        value={summaryData.resources_used}
                        onChange={(e) => setSummaryData({...summaryData, resources_used: e.target.value})}
                        className="w-full p-4 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron"
                        placeholder="e.g. 10 kits, 50L water"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="font-sans text-[10px] uppercase tracking-widest text-ink font-bold">Field Notes & Observations</label>
                  <textarea 
                     value={summaryData.notes}
                     onChange={(e) => setSummaryData({...summaryData, notes: e.target.value})}
                     className="w-full h-32 p-4 bg-white border border-ink/10 font-sans text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-saffron resize-none"
                     placeholder="Share any critical insights from the field..."
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button 
                disabled={isUpdatingStatus}
                onClick={() => setShowSummary(false)}
                className="py-4 border border-ink text-ink font-sans text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={isUpdatingStatus}
                onClick={handleSubmitImpact}
                className="py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all shadow-xl shadow-ink/20"
              >
                {isUpdatingStatus ? "Syncing Artifacts..." : "Finalize Mission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-ink/90 backdrop-blur-md">
          <div className="bg-paper p-12 max-w-lg w-full border border-ink/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-ink"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-red-600 mb-1 block font-bold">Priority Authorization Required</span>
                <h3 className="text-3xl font-display font-bold">Mission Resignation</h3>
              </div>
            </div>

            <p className="font-display italic text-xl text-gray-600 mb-8 leading-relaxed">
              "Are you sure you want to resign from mission? After doing so, you won't be able to be a part of this task again."
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={isResigning}
                onClick={handleResign}
                className="py-4 bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                {isResigning ? "Processing..." : "Yes, Resign"}
              </button>
              <button 
                disabled={isResigning}
                onClick={() => setShowConfirm(false)}
                className="py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all"
              >
                No, Stand Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Tasks */}
      <h3 className="text-2xl font-display font-bold mt-20 mb-8 border-b border-ink/5 pb-4">Past Operations</h3>
      {pastTasks.length === 0 ? (
        <div className="py-12 border border-ink/5 text-center bg-paper/30">
          <p className="font-display italic text-gray-400">No mission history found in registry archives.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastTasks.map(t => (
            <div key={t.id} className="bg-white p-8 border border-ink/10 flex items-center justify-between group hover:border-saffron transition-colors">
              <div>
                 <p className="font-display font-bold text-xl uppercase italic group-hover:text-saffron transition-colors">{t.title}</p>
                 <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{t.location} • Completed Mission</p>
              </div>
              <div className="text-ink font-display font-bold text-lg tracking-widest border border-ink/10 px-4 py-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                DONE
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
