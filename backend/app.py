import os
import uuid
import logging
import json
from typing import Dict, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pypdf import PdfReader
from groq import Groq
import edge_tts
from duckduckgo_search import DDGS

# --- CONFIGURATION ---
app = FastAPI()
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# REPLACE WITH YOUR KEY
GROQ_CLIENT = Groq(api_key="[REDACTED_GROQ_KEY]") 

active_sessions: Dict[str, dict] = {}
os.makedirs("temp_audio", exist_ok=True)

# --- REAL MCP TOOL: WEB SEARCH ---
def mcp_search_interview_questions(company: str, role: str) -> str:
    """
    REAL MCP TOOL: Searches the live web for recent interview questions.
    Uses DuckDuckGo to find actual interview experiences.
    """
    query = f"{company} {role} interview questions and process 2024 2025"
    print(f"DEBUG: MCP Tool Invoked - Searching for: {query}")
    
    try:
        # Searches for real results on the web
        results = DDGS().text(query, max_results=5)
        context = "REAL INTERVIEW DATA FROM WEB:\n"
        for r in results:
            context += f"- Source: {r['title']}\n  Snippet: {r['body']}\n"
        return context
    except Exception as e:
        print(f"MCP Search Error: {e}")
        return "Could not fetch live data. Using standard competency matrix."

# --- HELPERS ---

async def text_to_speech_file(text: str) -> str:
    output_file = f"temp_audio/{uuid.uuid4()}.mp3"
    communicate = edge_tts.Communicate(text, "en-US-BrianNeural")
    await communicate.save(output_file)
    return output_file

def parse_resume(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text[:3000]
    except Exception:
        return ""

# --- ENDPOINTS ---

@app.post("/start_interview")
async def start_interview(
    name: str = Form(...),
    company: str = Form(...),
    role: str = Form(...),
    experience: str = Form(...),
    num_questions: int = Form(...), # Added this field
    jd: str = Form(""),
    resume: UploadFile = File(None)
):
    session_id = str(uuid.uuid4())
    resume_text = ""
    
    if resume:
        temp_pdf_path = f"temp_audio/{resume.filename}"
        with open(temp_pdf_path, "wb") as f:
            f.write(await resume.read())
        resume_text = parse_resume(temp_pdf_path)
        os.remove(temp_pdf_path)

    # 1. EXECUTE REAL MCP SEARCH
    # This fetches actual data like "Amazon Leadership Principles" or "Google GCA" from the web
    search_context = mcp_search_interview_questions(company, role)

    # 2. Build Intelligent Context
    system_prompt = f"""
    You are an expert technical interviewer for {company}. 
    Candidate: {name}. Role: {role}. Exp: {experience} years.
    
    LIVE WEB SEARCH CONTEXT (REAL QUESTIONS):
    {search_context}
    
    JOB DESCRIPTION: 
    {jd[:800]}
    
    RESUME SUMMARY: 
    {resume_text[:1500]}
    
    INSTRUCTIONS:
    - Use the 'Live Web Search Context' to ask REAL questions that {company} actually asks.
    - If {company} is Amazon, focus heavily on Leadership Principles found in the search context.
    - Keep responses professional but conversational.
    - Ask exactly {num_questions} questions in total.
    - Start by welcoming them and asking the first question.
    -keep the questions short 2-4 lines
    """
    
    # Store session
    active_sessions[session_id] = {
        "candidate_name": name,
        "company": company,
        "role": role,
        "system_prompt": system_prompt,
        "conversation_history": [],
        "question_count": 0,
        "max_questions": num_questions
    }
    
    # Generate Intro
    completion = GROQ_CLIENT.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system_prompt}],
        temperature=0.7
    )
    
    initial_text = completion.choices[0].message.content
    active_sessions[session_id]["conversation_history"].append({"role": "assistant", "content": initial_text})
    
    audio_path = await text_to_speech_file(initial_text)
    
    return JSONResponse({
        "session_id": session_id, 
        "audio_url": f"/get_audio/{os.path.basename(audio_path)}",
        "text": initial_text,
        "current_question": 1,
        "total_questions": num_questions
    })

@app.post("/process_response")
async def process_response(session_id: str = Form(...), audio: UploadFile = File(...)):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = active_sessions[session_id]
    
    # 1. Transcribe
    temp_webm = f"temp_audio/{uuid.uuid4()}.webm"
    with open(temp_webm, "wb") as f:
        f.write(await audio.read())
        
    with open(temp_webm, "rb") as file:
        transcription = GROQ_CLIENT.audio.transcriptions.create(
            file=(temp_webm, file.read()),
            model="whisper-large-v3",
            response_format="text"
        )
    os.remove(temp_webm)
    
    user_text = transcription
    session["conversation_history"].append({"role": "user", "content": user_text})
    
    # 2. Check Limits
    session["question_count"] += 1
    if session["question_count"] >= session["max_questions"]:
         return JSONResponse({"status": "COMPLETED"})

    # 3. Generate Response
    # We pass the system prompt again to ensure it remembers the "Amazon/Google" context
    messages = [{"role": "system", "content": session["system_prompt"]}] + session["conversation_history"][-6:]
    
    completion = GROQ_CLIENT.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.6
    )
    
    ai_response = completion.choices[0].message.content
    session["conversation_history"].append({"role": "assistant", "content": ai_response})
    
    audio_path = await text_to_speech_file(ai_response)
    
    return JSONResponse({
        "status": "IN_PROGRESS",
        "audio_url": f"/get_audio/{os.path.basename(audio_path)}",
        "text": ai_response,
        "current_question": session["question_count"] + 1
    })

@app.post("/generate_feedback")
async def generate_feedback(session_id: str = Form(...)):
    session = active_sessions[session_id]
    
    # Highly strict feedback prompt
    prompt = f"""
    You are a senior Bar Raiser at {session['company']}. 
    Analyze this interview transcript strictly.
    
    TRANSCRIPT:
    {session['conversation_history']}
    
    GENERATE A REPORT IN MARKDOWN FORMAT:
    
    # Executive Summary
    (2-3 sentences on overall performance)
    
    # Detailed Metrics
    - **Technical Accuracy:** [Score/100] - (Explain why)
    - **Communication:** [Score/100] - (Explain clarity/conciseness)
    - **Critical Thinking:** [Score/100] - (Did they handle ambiguity?)
    - **{session['company']} Culture Fit:** [Score/100] - (Based on search context)
    
    # Strengths
    - (Quote specific things the candidate said)
    - (Quote specific things the candidate said)
    
    # Areas for Improvement
    - (Specific actionable advice)
    
    # Final Decision
    **[HIRE / NO HIRE]**
    """
    
    completion = GROQ_CLIENT.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return {"report": completion.choices[0].message.content}

@app.get("/get_audio/{filename}")
async def get_audio(filename: str):
    return FileResponse(f"temp_audio/{filename}")