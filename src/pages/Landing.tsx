import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink relative overflow-hidden flex flex-col">
      {/* Background Texture */}
      <div className="absolute inset-0 maharashtra-grid pointer-events-none"></div>

      {/* Top Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-12 py-8 border-b border-ink/10">
        <div className="flex items-center gap-3 select-none pointer-events-none">
          <div className="w-10 h-10 bg-ink flex items-center justify-center">
            <span className="text-white font-display font-bold text-xl leading-none">M</span>
          </div>
          <span className="font-sans font-semibold tracking-tighter text-xl uppercase italic">MahaSeva</span>
        </div>
        <Link 
          to="/signup" 
          id="signup-btn"
          className="px-8 py-3 bg-ink text-white font-sans text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-opacity-90 transition-all z-10"
        >
          Sign Up to Platform
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col justify-center items-center px-12 text-center select-none">
        <div className="mb-16">
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-4 block">An AI-Powered Initiative for Social Impact</span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-7xl md:text-9xl font-bold leading-[0.9] mb-6"
          >
            MAHASEVA<br/>
            <span className="italic font-normal text-6xl md:text-8xl text-saffron">Maharashtra</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display italic text-2xl text-gray-500 max-w-2xl mx-auto"
          >
            "The best way to find yourself is to lose yourself in the service of others."
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-0 border border-ink/10 w-full max-w-6xl text-left bg-white/50 backdrop-blur-sm">
          <Card 
            number="01"
            title="Our Achievements" 
            text="Scaling impact across districts. Successfully deployed AI-driven resource allocation in Vidarbha and Konkan regions, prioritizing critical care."
            stats={[
              { label: "Volunteers", value: "52k+" },
              { label: "NGO partners", value: "120" }
            ]}
          />
          <Card 
            number="02"
            title="Vision & Mission" 
            text="Unity in grassroots action. To build a resilient Maharashtra where every citizen's skill is matched precisely to the community's need."
            missionLabel="Mission 2025"
          />
          <Card 
            number="03"
            title="Get In Touch" 
            text="Connect with our regional offices or reach our 24/7 support line for emergency social interventions."
            contactInfo={[
              { label: "Inquiries", value: "hello@mahaseva.mh.gov.in" },
              { label: "Office", value: "Nariman Point, Mumbai" }
            ]}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-12 py-6 flex flex-col md:flex-row justify-between items-center border-t border-ink/10 text-[10px] font-sans uppercase tracking-[0.2em] text-gray-400">
        <div>Platform Limited to Maharashtra State Jurisdiction</div>
        <div className="flex gap-8 my-4 md:my-0">
          <span>Privacy Protocol</span>
          <span>NGO Database</span>
          <span>Volunteer Registry</span>
        </div>
        <div className="flex items-center gap-2 text-saffron">
          <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse"></span>
          <span>Powered by MH-AI Engine</span>
        </div>
      </footer>
    </div>
  );
}

function Card({ 
  number, 
  title, 
  text, 
  stats, 
  missionLabel, 
  contactInfo 
}: { 
  number: string, 
  title: string, 
  text: string, 
  stats?: { label: string, value: string }[],
  missionLabel?: string,
  contactInfo?: { label: string, value: string }[]
}) {
  return (
    <div className="p-10 border-r border-ink/10 last:border-r-0 hover:bg-white transition-colors group">
      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 block underline decoration-saffron underline-offset-8">
        {number} — {title}
      </span>
      <h3 className="font-display text-2xl mb-4 group-hover:text-saffron transition-colors">
        {title === "Get In Touch" ? "Connect with MahaSeva" : title}
      </h3>
      <p className="font-sans text-sm text-gray-600 leading-relaxed mb-6">
        {text}
      </p>

      {stats && (
        <div className="flex gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className={cn(i > 0 && "border-l border-ink/10 pl-4")}>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="font-sans text-[9px] uppercase tracking-tighter text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {missionLabel && (
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-saffron animate-pulse"></div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest">{missionLabel}</span>
        </div>
      )}

      {contactInfo && (
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <div key={info.label} className="flex flex-col">
              <span className="font-sans text-[10px] uppercase text-gray-400">{info.label}</span>
              <span className="font-display text-lg">{info.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { cn } from "../lib/utils";
