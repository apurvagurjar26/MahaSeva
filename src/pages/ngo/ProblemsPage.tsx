import { useState } from "react";
import { cn } from "../../lib/utils";
import { reanalyzeProblem } from "../../services/aiService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { RefreshCw, CheckCircle2, Loader2, Clock } from "lucide-react";

export default function ProblemsPage({ problems }: { problems: any[] }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleReclassifyAll = async () => {
    setIsUpdating(true);
    setProgress(0);
    try {
      for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        const analysis = await reanalyzeProblem(p.title, p.location);
        await updateDoc(doc(db, "problems", p.id), {
          field: analysis.field,
          severity: analysis.severity,
          level: analysis.level
        });
        setProgress(Math.round(((i + 1) / problems.length) * 100));
      }
    } catch (err) {
      console.error("Bulk update failed:", err);
    } finally {
      setIsUpdating(false);
      setProgress(0);
    }
  };

  const levelMap: { [key: string]: number } = { 'High': 3, 'Mid': 2, 'Low': 1 };
  const sortedProblems = [...problems].sort((a, b) => {
    // 1. Primary Sort: Priority Level
    const levelA = levelMap[a.level] || 0;
    const levelB = levelMap[b.level] || 0;
    if (levelA !== levelB) return levelB - levelA;

    // 2. Secondary Sort: Severity within same level
    const severityA = a.severity || 0;
    const severityB = b.severity || 0;
    return severityB - severityA;
  });

  const inProgress = sortedProblems.filter(p => p.status !== 'Completed');
  const completed = sortedProblems.filter(p => p.status === 'Completed');

  const totalImpact = problems.reduce((acc, p) => {
    const metrics = p.impact_metrics || [];
    return acc + metrics.reduce((sum: number, m: any) => sum + (m.people_helped || 0), 0);
  }, 0);

  return (
    <div className="p-12 max-w-6xl mx-auto space-y-16">
      <header className="text-left border-b border-ink/10 pb-8 flex justify-between items-end">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Intelligence Feed 002</span>
          <h2 className="text-4xl font-display font-bold">Operational Status</h2>
          <p className="font-display italic text-lg text-gray-500">Live classification of localized social interventions.</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right border-r border-ink/10 pr-8">
             <span className="font-sans text-[8px] uppercase tracking-[0.3em] text-gray-400 font-bold block mb-1">Human Collective Impact</span>
             <p className="font-display font-bold text-3xl text-ink italic leading-none">{totalImpact.toLocaleString()} <span className="text-xs uppercase font-sans tracking-widest text-saffron">Helped</span></p>
          </div>
          {problems.length > 0 && (
            <button 
              onClick={handleReclassifyAll}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-paper border border-ink/10 text-ink font-sans text-[10px] font-bold uppercase tracking-widest hover:border-saffron transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Refining {progress}%
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Refine All Categories
                </>
              )}
            </button>
          )}
        </div>
      </header>
      
      {/* Active Table */}
      <div className="bg-white/50 backdrop-blur-sm border border-ink/10 overflow-hidden shadow-xl shadow-ink/5">
        <div className="p-6 bg-ink text-white font-sans text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-between">
           <span>Active Deployments</span>
           <span className="text-saffron">{inProgress.length} Signals</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper text-ink font-sans text-[9px] uppercase tracking-[0.2em] border-b border-ink/10">
                <th className="px-6 py-4 font-bold border-r border-ink/10">ID</th>
                <th className="px-6 py-4 font-bold border-r border-ink/10">Descriptor</th>
                <th className="px-6 py-4 font-bold border-r border-ink/10">Location</th>
                <th className="px-6 py-4 font-bold border-r border-ink/10">Priority</th>
                <th className="px-6 py-4 font-bold border-r border-ink/10">Status</th>
                <th className="px-6 py-4 font-bold border-r border-ink/10">Field</th>
                <th className="px-6 py-4 font-bold">Matching</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {inProgress.map((p, idx) => (
                <tr key={p.id} className="hover:bg-white transition-colors group">
                  <td className="px-6 py-6 text-gray-400 font-sans text-xs border-r border-ink/10">{idx + 1}</td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <p className="font-display font-bold text-lg group-hover:text-saffron transition-colors">{p.title}</p>
                    {p.severity && (
                      <span className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold">Intensity: {p.severity}/10</span>
                    )}
                  </td>
                  <td className="px-6 py-6 font-sans text-xs text-gray-500 uppercase tracking-widest border-r border-ink/10">{p.location}</td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <span className={cn(
                      "px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest border",
                      p.level === 'High' ? "border-red-600 text-red-600 shadow-sm shadow-red-100" : p.level === 'Mid' ? "border-saffron text-saffron shadow-sm shadow-saffron/10" : "border-ink text-ink shadow-sm shadow-ink/5"
                    )}>
                      {p.level}
                    </span>
                  </td>
                  <td className="px-6 py-6 border-r border-ink/10">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-saffron flex items-center gap-2">
                       <Clock className="w-3 h-3" /> {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-sans text-xs text-gray-500 uppercase tracking-widest border-r border-ink/10">{p.field}</td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between font-sans text-[9px] font-bold uppercase tracking-tighter">
                         <span className="text-gray-400">Assigned</span>
                         <span className="text-ink">{p.assigned_volunteers?.length || 0} / {p.required_volunteers}</span>
                       </div>
                       <div className="h-1 bg-paper border border-ink/10 overflow-hidden">
                         <div 
                           className="h-full bg-ink transition-all" 
                           style={{ width: `${Math.min(((p.assigned_volunteers?.length || 0) / p.required_volunteers) * 100, 100)}%` }}
                         />
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
              {inProgress.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <p className="font-display italic text-gray-400 text-xl">No active classifications currently logged.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Archive */}
      {completed.length > 0 && (
        <div className="space-y-8">
           <div className="flex items-end gap-6 border-b border-ink/10 pb-4">
              <h3 className="text-3xl font-display font-bold italic">Decommissioned Signals</h3>
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Impact Archive</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {completed.map(p => {
                 const pImpact = (p.impact_metrics || []).reduce((sum: number, m: any) => sum + (m.people_helped || 0), 0);
                 return (
                   <div key={p.id} className="bg-white p-8 border border-ink/10 group hover:border-ink transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <CheckCircle2 className="w-24 h-24 text-ink" />
                      </div>
                      <div className="relative z-10">
                         <div className="flex justify-between items-start mb-6">
                            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-saffron border border-saffron/20 px-3 py-1 bg-saffron/5">Validated Achievement</span>
                            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-gray-400 italic">Sector: {p.field}</span>
                         </div>
                         <h4 className="text-2xl font-display font-bold mb-2 italic group-hover:text-saffron transition-colors">{p.title}</h4>
                         <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-8">{p.location}</p>
                         
                         <div className="grid grid-cols-2 gap-8 border-t border-ink/5 pt-6">
                            <div>
                               <span className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Human Impact</span>
                               <p className="font-display font-bold text-2xl text-ink leading-none">{pImpact} <span className="text-[10px] uppercase font-sans tracking-widest text-gray-400 font-bold">Lives</span></p>
                            </div>
                            <div>
                               <span className="font-sans text-[8px] uppercase tracking-widest text-gray-400 font-bold block mb-1">Resources Utilized</span>
                               <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-ink line-clamp-1">{(p.impact_metrics || []).map((m: any) => m.resources_used).join(", ")}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );
}
