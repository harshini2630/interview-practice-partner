import { useState, useRef, useEffect } from 'react';
import Webcam from "react-webcam";
import { Mic, MicOff } from 'lucide-react';

// ASSETS
import bot from "../assets/bot.png";
import botSpeak from "../assets/bot-speak.mp4";

export default function InterviewInterface({ sessionData, onComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQ, setCurrentQ] = useState(sessionData.current_question);
  const [aiText, setAiText] = useState(sessionData.text);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const ROBOT_STATIC = bot; 
  const ROBOT_VIDEO = botSpeak;

  // Auto-play intro
  useEffect(() => {
    if (sessionData.audio_url) {
      playAudio(`http://localhost:8000${sessionData.audio_url}`);
    }
  }, []);

  const playAudio = (url) => {
    const audio = new Audio(url);
    setIsBotSpeaking(true);
    audio.play();
    audio.onended = () => setIsBotSpeaking(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = handleAudioUpload;
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const handleAudioUpload = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('session_id', sessionData.session_id);

    try {
      const res = await fetch('http://localhost:8000/process_response', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setIsProcessing(false);

      if (data.status === 'COMPLETED') {
        onComplete(sessionData.session_id);
      } else {
        setAiText(data.text);
        setCurrentQ(data.current_question);
        playAudio(`http://localhost:8000${data.audio_url}`);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col p-4 md:p-8">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold tracking-tight">LIVE SESSION</div>
        <div className="px-4 py-1 bg-black text-white text-xs font-bold rounded-full uppercase tracking-wider">
          Question {currentQ} / {sessionData.total_questions}
        </div>
      </header>

      {/* SPLIT SCREEN GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        
        {/* LEFT: WEBCAM */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <Webcam 
            audio={false}
            className="w-full h-full object-cover"
            mirrored={true}
          />
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded text-xs font-bold text-black border border-gray-200">
            CANDIDATE
          </div>
          {isRecording && (
             <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
               <div className="w-2 h-2 bg-white rounded-full" /> LIVE
             </div>
          )}
        </div>

        {/* RIGHT: ROBOT + CAPTIONS */}
        <div className="flex flex-col rounded-2xl overflow-hidden bg-gray-50 border border-gray-200">
          
          {/* BOT VISUAL */}
          <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
             <div className="w-full h-full flex items-center justify-center">
               {isBotSpeaking ? (
                 <video src={ROBOT_VIDEO} autoPlay loop muted playsInline className="h-64 object-contain" />
               ) : (
                 <img src={ROBOT_STATIC} alt="AI" className="h-64 object-contain grayscale opacity-80" />
               )}
            </div>
          </div>

          {/* CAPTIONS */}
          <div className="bg-white border-t border-gray-200 p-6 min-h-[150px] flex flex-col justify-center">
             <div className="text-xs font-bold uppercase text-gray-400 mb-2">
               {isBotSpeaking ? "Interviewer Speaking..." : "Listening..."}
             </div>
             <p className="text-lg font-medium text-black leading-relaxed">
               "{aiText}"
             </p>
          </div>
        </div>

      </div>

      {/* FOOTER CONTROLS */}
      <div className="h-20 flex items-center justify-center mt-4">
        {!isProcessing ? (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl ${
              isRecording 
                ? 'bg-red-600 scale-110' 
                : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isRecording ? <MicOff className="text-white" /> : <Mic className="text-white" />}
          </button>
        ) : (
          <div className="text-sm font-bold text-gray-400 animate-pulse">PROCESSING RESPONSE...</div>
        )}
      </div>
    </div>
  );
}