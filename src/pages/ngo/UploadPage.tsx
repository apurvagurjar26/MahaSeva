import React, { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { synthesizeProblems } from "../../services/aiService";
import { Upload, FileText, ImageIcon, Loader2, X, CheckCircle, Info, Layers } from "lucide-react";
import { Part } from "@google/genai";

interface SelectedFile {
  id: string;
  part: Part;
  name: string;
  type: 'image' | 'doc';
}

export default function UploadPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  
  const docInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'doc') => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    for (const f of selectedFiles) {
      try {
        const base64 = await fileToBase64(f);
        const part: Part = {
          inlineData: {
            mimeType: f.type,
            data: base64
          }
        };
        setFiles(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9),
          part, 
          name: f.name, 
          type 
        }]);
      } catch (err) {
        console.error("File processing failed:", err);
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleProcess = async () => {
    if (!text.trim() && files.length === 0) return;
    setLoading(true);
    setResults([]);
    try {
      // 1. Fetch existing problems to avoid duplicates
      const querySnapshot = await getDocs(collection(db, "problems"));
      const existingTitles = querySnapshot.docs.map(doc => doc.data().title);

      // 2. Prepare sources for synthesis
      const sources: (string | Part[])[] = [];
      if (text.trim()) sources.push(text.trim());
      files.forEach(f => sources.push([f.part]));

      // 3. Call AI to synthesize multiple reports into unique problems
      const detectedProblems = await synthesizeProblems(sources, existingTitles);
      
      const savedProblems = [];
      for (const data of detectedProblems) {
        // Validation against existing entries
        const isDuplicate = existingTitles.some(t => 
          t.toLowerCase().includes(data.title.toLowerCase()) || 
          data.title.toLowerCase().includes(t.toLowerCase())
        );

        if (isDuplicate) continue;

        // Determine required volunteers based on level
        let req = 3;
        if (data.level === 'High') req = 10;
        else if (data.level === 'Mid') req = 5;

        const problemData = {
          ...data,
          required_volunteers: req,
          assigned_volunteers: [],
          status: "In Progress",
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "problems"), problemData);
        savedProblems.push(problemData);
      }

      setResults(savedProblems);
      setText("");
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <header className="mb-12 text-left border-b border-ink/10 pb-8">
        <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 block font-bold">Input Segment 001</span>
        <h2 className="text-4xl font-display font-bold">Multi-Source Aggregation</h2>
        <p className="font-display italic text-lg text-gray-500">Collectively synthesize multiple reports and images into a unified problem registry.</p>
      </header>
      
      <div className="bg-white/50 backdrop-blur-sm p-12 border border-ink/10">
        <p className="font-display italic text-lg text-gray-500 mb-10 leading-relaxed">System synthesizes narratives, structured documents, and photographic evidence. Redundant findings are merged during planetary analysis.</p>
        
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-0 border border-ink/10">
            <input 
              type="file" 
              ref={docInputRef} 
              className="hidden" 
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileChange(e, 'doc')}
            />
            <button 
              onClick={() => docInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-12 border-r border-ink/10 hover:bg-paper transition-all group relative"
            >
              <FileText className="w-10 h-10 mb-4 text-ink group-hover:text-saffron transition-colors" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-ink transition-colors">Add Documents</span>
            </button>

            <input 
              type="file" 
              ref={imgInputRef} 
              className="hidden" 
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
            />
            <button 
              onClick={() => imgInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-12 hover:bg-paper transition-all group relative"
            >
              <ImageIcon className="w-10 h-10 mb-4 text-ink group-hover:text-saffron transition-colors" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-ink transition-colors">Add Imagery</span>
            </button>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
               <span className="font-sans text-[10px] uppercase tracking-widest text-gray-400 font-bold">Aggregated Source Feed ({files.length})</span>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {files.map(f => (
                   <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-ink/5 group">
                      <div className="flex items-center gap-3">
                        {f.type === 'doc' ? <FileText className="w-4 h-4 text-ink" /> : <ImageIcon className="w-4 h-4 text-saffron" />}
                        <span className="font-sans text-[10px] font-bold uppercase tracking-tight truncate max-w-[200px]">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(f.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          <div className="relative">
            <textarea
              className="w-full h-64 p-8 bg-paper border border-ink/10 font-sans text-sm focus:outline-none focus:border-saffron resize-none placeholder:text-gray-300"
              placeholder="Input mission report or additional description here to append to the aggregate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={handleProcess}
              disabled={loading || (!text.trim() && files.length === 0)}
              className="absolute bottom-8 right-8 px-10 py-4 bg-ink text-white font-sans text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-saffron transition-all disabled:opacity-50 shadow-xl"
            >
              {loading ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Operations </>
              ) : (
                <> <Layers className="w-4 h-4" /> Aggregate & Synthesize </>
              )}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-3 p-4 bg-saffron/10 border-l-4 border-saffron text-ink">
              <Info className="w-5 h-5 text-saffron" />
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest">
                {results.length} unique problem{results.length > 1 ? 's' : ''} detected and logged to registry
              </p>
            </div>
            
            {results.map((res, idx) => (
              <div key={idx} className="p-10 bg-white border border-saffron/20 relative animate-in fade-in slide-in-from-top-4">
                <div className="absolute top-0 right-0 p-2 bg-saffron text-white font-sans text-[8px] font-bold uppercase tracking-widest">Logged #{idx + 1}</div>
                <h4 className="font-display font-bold text-2xl mb-8 border-b border-ink/5 pb-4">
                  AI Detection Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Title Descriptor</p>
                    <p className="font-display font-bold text-lg text-ink">{res.title}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Log Location</p>
                    <p className="font-display font-bold text-lg text-ink">{res.location}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Threat Level</p>
                    <p className="font-display font-bold text-lg text-ink">{res.level}</p>
                  </div>
                  <div>
                    <p className="font-sans text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Field Sector</p>
                    <p className="font-display font-bold text-lg text-ink">{res.field}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading === false && results.length === 0 && (
          // This part is just to handle the case where AI might have found something but they were all duplicates
          // But I'll keep it simple for now and just check results length.
          null
        )}
      </div>
    </div>
  );
}
