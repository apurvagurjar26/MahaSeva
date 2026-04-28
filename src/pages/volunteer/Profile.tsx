import { useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Trash2, AlertTriangle, X, Edit3, Save, ShieldCheck } from "lucide-react";
import { doc, deleteDoc, updateDoc, arrayRemove, getDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function VolunteerProfile({ volunteer, problems }: { volunteer: any, problems: any[] }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: volunteer.name || "",
    phone: volunteer.phone || "",
    city: volunteer.city || "",
    age: volunteer.age || "",
    education: volunteer.education || "",
    experience: volunteer.experience || "",
    address: volunteer.address || "",
    skills: volunteer.skills ? volunteer.skills.join(", ") : ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const vRef = doc(db, "volunteers", volunteer.id);
      const updatedData = {
        ...editData,
        skills: editData.skills.split(",").map(s => s.trim()).filter(s => s !== "")
      };
      await updateDoc(vRef, updatedData);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found.");

      // 1. If assigned to a task, cleanup the task assignment first
      if (volunteer.assigned_task_id) {
        const pRef = doc(db, "problems", volunteer.assigned_task_id);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          const pData = pSnap.data();
          const newCount = (pData.assigned_volunteers?.length || 0) - 1;
          await updateDoc(pRef, {
            assigned_volunteers: arrayRemove(volunteer.id),
            // Update status if it was completed but now needs more help
            status: newCount < pData.required_volunteers ? "In Progress" : "Completed"
          });
        }
      }

      // 2. Delete the volunteer document from Firestore
      await deleteDoc(doc(db, "volunteers", volunteer.id));

      // 3. Delete the user from Firebase Auth
      await deleteUser(user);

      // 4. Redirect to landing
      navigate("/");
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      if (err.code === 'auth/requires-recent-login') {
        setError("This action requires a recent login. Please log out and log back in to verify your identity.");
      } else {
        setError(err.message || "An error occurred during deletion.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const assignedTask = volunteer.assigned_task_id ? problems.find(p => p.id === volunteer.assigned_task_id) : null;
  return (
    <div className="p-12 max-w-5xl mx-auto">
      {/* Assigned Task Highlight */}
      {assignedTask && (
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-ink p-8 border border-ink/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-saffron mb-4 block font-bold">Active Dispatch Protocol</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-xl">
                  <h3 className="text-4xl font-display font-bold text-white mb-4 italic">{assignedTask.title}</h3>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col">
                      <span className="font-sans text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Operational Locale</span>
                      <span className="font-sans text-xs uppercase tracking-widest text-gray-300 font-bold flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-saffron" /> {assignedTask.location}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Mission Schedule</span>
                      <span className="font-sans text-xs uppercase tracking-widest text-gray-300 font-bold flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-saffron" /> {volunteer.task_schedule?.day} @ {volunteer.task_schedule?.time}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Directive Sector</span>
                      <span className="font-sans text-xs uppercase tracking-widest text-gray-300 font-bold flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-saffron" /> {assignedTask.field}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <div className="px-4 py-2 bg-saffron text-ink font-sans text-[10px] font-bold uppercase tracking-widest mb-2">Deployed</div>
                   <p className="font-sans text-[8px] text-gray-500 uppercase tracking-widest">Awaiting status update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 text-left border-b border-ink/10 pb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Registry Segment 001</span>
          <h2 className="text-4xl font-display font-bold">{isEditing ? "Modify Credentials" : "Personal Profile"}</h2>
          <p className="font-display italic text-lg text-gray-500">
            {isEditing ? "Update your identity and verified field data." : "Identity and verified credentials of the volunteer resource."}
          </p>
        </div>
        <div className="flex gap-4 mb-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 border border-ink text-ink font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all shadow-lg shadow-ink/5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-6 py-2 border border-red-200 text-red-600 font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2 bg-saffron text-ink font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all shadow-lg"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Syncing..." : "Save Changes"}
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-6 py-2 border border-ink/10 text-gray-400 font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-all"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </header>
      
      {error && (
        <div className="mb-12 p-6 bg-red-50 border-l-4 border-red-600 text-red-600 font-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-4">
          <AlertTriangle className="w-5 h-5" />
          <span>Sync Failure: {error}</span>
        </div>
      )}
      
      <div className="grid gap-12">
        {/* Profile Card */}
        <div className="bg-white/50 backdrop-blur-sm p-12 border border-ink/10 flex flex-col md:flex-row items-center gap-12 group">
          <div className="w-40 h-40 border border-ink flex items-center justify-center text-7xl font-display font-bold bg-white group-hover:bg-ink group-hover:text-white transition-all shadow-xl shadow-ink/5 uppercase">
            {editData.name[0] || volunteer.name[0]}
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold">Volunteer Name</label>
                  <input 
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full text-4xl font-display font-bold bg-paper border-b border-ink focus:outline-none focus:border-saffron py-2"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold">City Location</label>
                    <input 
                      type="text"
                      value={editData.city}
                      onChange={(e) => setEditData({...editData, city: e.target.value})}
                      className="w-full font-sans text-xs uppercase tracking-widest bg-paper border-b border-ink/20 focus:outline-none focus:border-saffron py-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold">Age (Years)</label>
                    <input 
                      type="number"
                      value={editData.age}
                      onChange={(e) => setEditData({...editData, age: e.target.value})}
                      className="w-full font-sans text-xs uppercase tracking-widest bg-paper border-b border-ink/20 focus:outline-none focus:border-saffron py-1"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold">Technological & Field Skills (Comma separated)</label>
                  <input 
                    type="text"
                    value={editData.skills}
                    onChange={(e) => setEditData({...editData, skills: e.target.value})}
                    placeholder="e.g. First Aid, Disaster Management, Translation"
                    className="w-full font-sans text-xs uppercase tracking-widest bg-paper border-b border-ink/20 focus:outline-none focus:border-saffron py-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-5xl font-display font-bold mb-4 group-hover:text-saffron transition-colors">{volunteer.name}</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-8 text-gray-400">
                  <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest"><MapPin className="w-4 h-4 text-saffron" /> {volunteer.city}, Maharashtra</span>
                  <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest"><Calendar className="w-4 h-4 text-saffron" /> {volunteer.age} Years Old</span>
                </div>
                <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                  {volunteer.skills?.map((skill: string) => (
                    <span key={skill} className="px-4 py-1.5 border border-ink/10 bg-paper font-sans text-[10px] font-bold uppercase tracking-widest">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white/50 backdrop-blur-sm p-10 border border-ink/10">
            <h4 className="text-xl font-display font-bold mb-10 flex items-center gap-3 border-b border-ink/5 pb-4">
              <User className="w-5 h-5 text-saffron" /> Bio & Contact
            </h4>
            <div className="space-y-8">
              <DetailItem label="Primary Email" value={volunteer.email} icon={Mail} readOnly />
              {isEditing ? (
                <div className="space-y-6">
                  <EditDetailItem 
                    label="Secure Line" 
                    value={editData.phone} 
                    icon={Phone} 
                    onChange={(val) => setEditData({...editData, phone: val})} 
                  />
                   <div className="space-y-2">
                    <label className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold block">Field Experience Report</label>
                    <textarea 
                      value={editData.experience}
                      onChange={(e) => setEditData({...editData, experience: e.target.value})}
                      className="w-full p-4 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron h-32 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <DetailItem label="Secure Line" value={volunteer.phone} icon={Phone} />
                  <DetailItem label="Field Experience" value={volunteer.experience || "No prior records"} icon={Briefcase} />
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm p-10 border border-ink/10">
            <h4 className="text-xl font-display font-bold mb-10 flex items-center gap-3 border-b border-ink/5 pb-4">
              <GraduationCap className="w-5 h-5 text-saffron" /> Education & Address
            </h4>
            
            <div className="mb-10">
              <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 font-bold">Qualification Verification</span>
              {isEditing ? (
                <input 
                  type="text"
                  value={editData.education}
                  onChange={(e) => setEditData({...editData, education: e.target.value})}
                  className="w-full p-6 bg-paper border border-ink/10 font-display italic text-lg text-gray-600 focus:outline-none focus:border-saffron"
                />
              ) : (
                <div className="p-6 bg-paper border border-ink/10 group-hover:bg-white transition-colors">
                  <p className="font-display italic text-lg text-gray-600">{volunteer.education || "No verification on record"}</p>
                </div>
              )}
            </div>
            
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2 font-bold">Registry Residence</span>
              {isEditing ? (
                 <textarea 
                  value={editData.address}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                  className="w-full p-6 bg-paper border border-ink/10 font-sans text-sm text-gray-500 leading-relaxed font-bold tracking-tight focus:outline-none focus:border-saffron h-32 resize-none"
                />
              ) : (
                <p className="font-sans text-sm text-gray-500 leading-relaxed font-bold tracking-tight">{volunteer.address || "Unregistered locale"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-ink/95 backdrop-blur-lg">
          <div className="bg-paper p-12 max-w-lg w-full border border-ink/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="text-gray-400 hover:text-ink transition-colors"
                disabled={isDeleting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-red-600 mb-1 block font-bold">Terminal Action Requested</span>
                <h3 className="text-3xl font-display font-bold">Delete Account</h3>
              </div>
            </div>

            <p className="font-display italic text-xl text-gray-600 mb-8 leading-relaxed">
              "Are you sure you want to delete your account? After completing this action, your account will be permanently deleted."
            </p>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 font-sans text-xs uppercase tracking-widest font-bold leading-relaxed">
                ERROR: {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="py-4 bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all disabled:opacity-50"
              >
                No, Keep Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, icon: Icon, readOnly }: { label: string, value: string, icon: any, readOnly?: boolean }) {
  return (
    <div className={`flex items-start gap-4 group/item ${readOnly ? "opacity-60" : ""}`}>
      <div className="mt-1 p-2 bg-paper border border-ink/5 group-hover/item:border-saffron/30 transition-colors">
        <Icon className="w-4 h-4 text-gray-400 group-hover/item:text-saffron transition-colors" />
      </div>
      <div>
        <p className="font-sans text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{label}</p>
        <p className="font-display text-lg font-bold text-ink">{value || "Unverified"}</p>
      </div>
    </div>
  );
}

function EditDetailItem({ label, value, icon: Icon, onChange }: { label: string, value: string, icon: any, onChange: (val: string) => void }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-paper border border-ink/10">
        <Icon className="w-4 h-4 text-saffron" />
      </div>
      <div className="flex-1">
        <p className="font-sans text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-display text-lg font-bold text-ink bg-transparent border-b border-ink/20 focus:outline-none focus:border-saffron"
        />
      </div>
    </div>
  );
}
