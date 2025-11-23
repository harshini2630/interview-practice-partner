import { useState } from 'react';
import { ArrowRight, Upload, Check, FileText } from 'lucide-react';

export default function SetupForm({ onLoading, onStart }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null); // Stores the name of the uploaded file

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const formData = new FormData(e.target);
    
    // 1. Notify Parent to show Loading Screen IMMEDIATELY
    onLoading(formData);

    try {
      // 2. Make API Call
      const res = await fetch('http://localhost:8000/start_interview', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      // 3. Artificial Delay to let the "Thesis" animation play (Video requirement)
      setTimeout(() => {
        onStart(data);
      }, 8000); 
      
    } catch (err) {
      alert("Connection Failed. Is Backend Running?");
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-2xl animate-fade-in-up">
        
        <div className="mb-10">
          <div className="inline-block bg-black text-white px-3 py-1 text-xs font-bold tracking-widest mb-4 uppercase">
            System V2.0 // MCP Live Context
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-2">Interview Practice Partner</h1>
          <p className="text-gray-500">
            Powered by real-time MCP Archive Retrieval Protocol.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Full Name</label>
              <input name="name" required className="w-full border-b border-gray-300 py-3 text-lg focus:border-black focus:outline-none transition-colors placeholder-gray-300" placeholder="Jane Doe" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Target Company</label>
              <input name="company" required className="w-full border-b border-gray-300 py-3 text-lg focus:border-black focus:outline-none placeholder-gray-300" placeholder="Google, Amazon..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Target Role</label>
              <input name="role" required className="w-full border-b border-gray-300 py-3 text-lg focus:border-black focus:outline-none placeholder-gray-300" placeholder="Senior Backend Engineer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Years of Exp</label>
              <input name="experience" type="number" required className="w-full border-b border-gray-300 py-3 text-lg focus:border-black focus:outline-none placeholder-gray-300" placeholder="5" />
            </div>
          </div>

          {/* QUESTION COUNT DROPDOWN */}
          <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400">Session Length</label>
              <select name="num_questions" className="w-full border-b border-gray-300 py-3 text-lg focus:border-black focus:outline-none bg-transparent cursor-pointer">
                  <option value="5">Short (5 Questions)</option>
                  <option value="10">Standard (10 Questions)</option>
                  <option value="15">Deep Dive (15 Questions)</option>
              </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-400">Job Description</label>
            <textarea name="jd" rows="3" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-lg focus:border-black focus:outline-none text-sm resize-none" placeholder="Paste JD requirements here for MCP context analysis..."></textarea>
          </div>

          {/* FIXED RESUME UPLOAD UI */}
          <div className={`relative border border-dashed rounded-lg p-6 transition-all cursor-pointer group ${fileName ? 'border-black bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}>
            <input 
                name="resume" 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-black">
              {fileName ? <FileText size={24} className="text-black"/> : <Upload size={24} />}
              <div className="flex flex-col text-left">
                  <span className={`font-bold text-sm ${fileName ? 'text-black' : ''}`}>
                      {fileName ? "Resume Attached" : "Upload Resume (PDF)"}
                  </span>
                  {fileName && <span className="text-xs text-gray-500">{fileName}</span>}
              </div>
              {fileName && <Check size={20} className="text-green-600 ml-2" />}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 text-sm font-bold tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3 mt-4 shadow-lg">
            {loading ? "INITIALIZING AGENT..." : "START INTERVIEW"} <ArrowRight size={16} />
          </button>

        </form>
      </div>
    </div>
  );
}