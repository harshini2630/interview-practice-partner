import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function FeedbackReport({ report, metrics, onRestart }) {
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
        const total = metrics.reduce((sum, m) => sum + (m.value || 0), 0);
        setOverallScore(Math.round(total / metrics.length));
    }
  }, [metrics]); 

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT SECTION: Only title + button (score card removed) */}
        <div className="lg:col-span-1 space-y-8 sticky top-8 h-fit">

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Evaluation Report</h1>
            <p className="text-sm text-gray-400 font-medium">MCP ARCHIVE ANALYSIS COMPLETE</p>
          </div>

          {/* Removed score card here */}

          <button 
            onClick={onRestart} 
            className="w-full py-4 bg-black text-white font-bold tracking-wider hover:bg-gray-900 transition-colors rounded-lg shadow-lg"
          >
            START NEW SESSION
          </button>
        </div>

        {/* RIGHT: DETAILED MARKDOWN REPORT */}
        <div className="lg:col-span-2">
           <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-black">
             <ReactMarkdown>{report}</ReactMarkdown>
           </div>
        </div>

      </div>
    </div>
  );
}
