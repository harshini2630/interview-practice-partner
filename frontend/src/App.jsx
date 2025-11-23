import { useState } from 'react';
import SetupForm from './components/SetupForm';
import LoadingScreen from './components/LoadingScreen';
import InterviewInterface from './components/InterviewInterface';
import FeedbackReport from './components/FeedbackReport';

export default function App() {
  const [view, setView] = useState('setup'); 
  const [sessionData, setSessionData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState({ company: '', role: '' });
  
  // Store both text report and JSON metrics
  const [feedbackData, setFeedbackData] = useState({ report: '', metrics: [] });

  const handleStartProcess = (formData) => {
    setLoadingDetails({ 
        company: formData.get('company'), 
        role: formData.get('role') 
    });
    setView('loading');
  };

  const handleInterviewStart = (data) => {
    setSessionData(data);
    setView('interview');
  };

  const handleComplete = async (sessionId) => {
    setView('generating_report');
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    try {
        const res = await fetch('http://localhost:8000/generate_feedback', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        // Save the full data packet (Report + Metrics JSON)
        setFeedbackData({
            report: data.report,
            metrics: data.metrics || [] 
        });
        
        setView('feedback');
    } catch (e) {
        alert("Error generating report");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {view === 'setup' && (
        <SetupForm onLoading={handleStartProcess} onStart={handleInterviewStart} />
      )}
      {view === 'loading' && (
        <LoadingScreen company={loadingDetails.company} role={loadingDetails.role} />
      )}
      {view === 'interview' && sessionData && (
        <InterviewInterface sessionData={sessionData} onComplete={handleComplete} />
      )}
      {view === 'generating_report' && (
        <div className="flex h-screen items-center justify-center">
             <div className="animate-pulse text-xl font-bold">GENERATING FINAL METRICS...</div>
        </div>
      )}
      {view === 'feedback' && (
        <FeedbackReport 
            report={feedbackData.report} 
            metrics={feedbackData.metrics} // Pass metrics explicitly
            onRestart={() => window.location.reload()} 
        />
      )}
    </div>
  );
}