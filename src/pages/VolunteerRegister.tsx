import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function VolunteerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "Other",
    skills: "",
    experience: "",
    education: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Age validation
    const birthDate = new Date(formData.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      setError("You must be at least 18 years old to volunteer.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCred.user;

      await setDoc(doc(db, "volunteers", user.uid), {
        id: user.uid,
        ...formData,
        skills: formData.skills.split(",").map(s => s.trim()),
        age,
        availability: true, // Default to true
        assigned_task_id: null,
        userType: 'volunteer'
      });

      navigate("/volunteer/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-8 relative overflow-hidden">
      <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>

      <Link to="/signup" className="max-w-2xl mx-auto mb-8 flex items-center gap-2 text-ink/40 hover:text-ink font-sans text-xs uppercase tracking-widest transition-colors relative z-10">
        <ArrowLeft className="w-4 h-4" /> Back to Signup
      </Link>
      
      <div className="max-w-2xl mx-auto bg-white border border-ink/10 p-12 relative z-10">
        <div className="mb-12">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">New Registry Application</span>
          <h1 className="text-4xl font-display font-bold mb-2">Volunteer Enrollment</h1>
          <p className="font-display italic text-lg text-gray-500">Establish your profile in the state mobilization database.</p>
        </div>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Legal Full Name</label>
            <input 
              name="name" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="John Doe" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Date of Birth</label>
            <input 
              type="date" 
              name="dob" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Identity Gender</label>
            <select 
              name="gender" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Strategic Skills (Comma separated)</label>
            <input 
              name="skills" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="Healthcare, Teaching, Management" 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Educational Qualification (Optional)</label>
            <input 
              name="education" 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="B.Sc Computer Science, MBA, etc." 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Field Experience (Optional)</label>
            <textarea 
              name="experience" 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors h-24" 
              placeholder="2 years in community health, 1 year teaching..." 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Registry Residence / Address (Optional)</label>
            <textarea 
              name="address" 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors h-24" 
              placeholder="House No, Street, Landmark..." 
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">City (Maharashtra Registry)</label>
            <input 
              name="city" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="Mumbai, Pune, Nagpur..." 
            />
          </div>

          <div className="space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Direct Contact Number</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="+91 XXXX XXX XXX" 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Primary Registry Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="john@example.com" 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Registry Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          {error && <p className="text-red-600 text-[10px] uppercase tracking-widest font-bold md:col-span-2">{error}</p>}
          
          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              className="w-full py-4 bg-ink text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-all"
            >
              Verify & Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
