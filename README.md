# 🎙️ **README.md — Interview Practice Partner**

### *AI-Powered Interview Simulation with Real-Time Context & Voice I/O*

-----

## 🚀 **Overview** :

**Interview Practice Partner** is a full-stack, AI-powered system designed to conduct **highly realistic, customized mock interviews**. It leverages a **Model Context Protocol (MCP)** tool to fetch real-world interview data, ensuring questions are specifically tailored to the target company, role, and the candidate's uploaded resume/JD.

The platform simulates a complete interview experience, from a voice-to-voice conversation to a final, strict performance analysis report from an "expert Bar Raiser."

The system integrates:

  * **Custom Context Retrieval** via an MCP Web Search Tool (DuckDuckGo).
  * **Voice I/O** (Whisper for transcription, Edge-TTS for synthesis).
  * **LLM Intelligence** for dynamic conversation and feedback (Groq Llama 3.3).
  * **Full-Stack Application** (FastAPI Backend, React Frontend).

-----

## 🧠 **Core Capabilities** :

### **1. Real-Time Context-Aware Interviewing**

The AI interviewer primes itself using multiple data sources before the session starts:

  * **Live Web Search (MCP Tool):** Fetches recent, company-specific interview questions, processes, or leadership principles (e.g., "Amazon Leadership Principles").
  * **Resume/JD Analysis:** Parses uploaded PDF resume and Job Description text to tailor questions to the candidate's background.
  * **LLM Synthesis:** Combines all context into a single, comprehensive **System Prompt** for the Groq LLM.

### **2. Full Voice Input/Output (I/O)**

The entire interview is conducted hands-free using voice:

  * **Audio Transcription:** Candidate's spoken response (WebM) is transcribed to text using the **Whisper** model.
  * **Text-to-Speech:** The AI interviewer's response is converted to natural-sounding speech using **Edge-TTS** and streamed back to the user.

### **3. Expert Feedback Generation**

Upon completion, the system generates a detailed, rigorous performance report:

  * **Bar Raiser Persona:** Feedback is given from the perspective of a senior company interviewer (e.g., "Senior Bar Raiser at Google").
  * **Detailed Metrics:** Scores are provided for **Technical Accuracy**, **Communication**, **Critical Thinking**, and **Culture Fit** (based on MCP context).
  * **Final Decision:** A clear **HIRE / NO HIRE** recommendation is given, supported by specific quotes from the transcript.

### **4. Dynamic Session Management**

The FastAPI backend manages the state of the conversation, ensuring:

  * **Conversation History:** Session context is maintained to ensure conversational flow and adherence to instructions.
  * **Question Limits:** The interview progresses for a pre-set number of questions before automatically moving to the feedback stage.

-----

## 🏛️ **Architecture Overview** :

The system follows a classic full-stack, decoupled architecture optimized for real-time performance.

```
                       ┌──────────────────────────┐
                       │         Frontend         │
                       │          React.js        │
                       └──────────────┬───────────┘
                                      │ (REST API)
                                      ▼
                         ┌────────────────────────┐
                         │     FastAPI Backend    │
                         │ (Session Management)   │
                         └─────────────┬──────────┘
                                       │
   ┌───────────────────────────────────┼──────────────────────────────┐
   │                                   │                              │
   ▼                                   ▼                              ▼
┌──────────────────┐          ┌───────────────────┐          ┌───────────────────┐
│ Speech/Audio I/O │          │  MCP Tools (Web)  │          │  LLM Engine (Groq)│
│ Whisper (STT)    │          │ DuckDuckGo Search │          │ llama-3.3-70b/8b  │
│ Edge-TTS (TTS)   │          │ for Real Qs/Context│         │ + System Prompts  │
└──────────────────┘          └───────────────────┘          └───────────────────┘
```

-----

## ⚙️ **Tech Stack** :

### **Backend** :

  * **FastAPI:** High-performance Python framework for handling API routes and session state.
  * **Groq LLM:** Used for high-speed, dynamic conversation flow and strict feedback generation.
  * **Groq Whisper API:** Used for accurate, real-time transcription of candidate's audio responses.
  * **Edge-TTS:** Used for natural-sounding Text-to-Speech (TTS).
  * **Custom MCP Tool:** `mcp_search_interview_questions` using **DuckDuckGo Search** for context retrieval.
  * **PDF Parsing:** `pypdf` for extracting text from uploaded resumes.

### **Frontend (React)** :

  * **React + Tailwind CSS:** Modern, responsive UI for the setup form, live interview, and feedback report.
  * **Webcam/Microphone API:** Used for video presence and capturing audio responses.
  * **`ReactMarkdown`:** Used to render the final structured feedback report.

-----

## 🔄 **End-to-End Flow** :

### **1. Setup & Context Injection**

  * User inputs **Name, Company, Role, Experience**, pastes a **JD**, and uploads a **Resume (PDF)**.
  * The system executes the **MCP Web Search** to fetch real interview data based on the target Company/Role.
  * All context is combined into a powerful **System Prompt**.

### **2. Live Interview**

  * The AI generates the first question (Text $\rightarrow$ Edge-TTS $\rightarrow$ Audio).
  * Candidate speaks their answer, which is captured (Audio $\rightarrow$ Whisper $\rightarrow$ Text).
  * The LLM uses the candidate's answer and the full context to generate the next question.
  * This cycle repeats for the set number of questions.

### **3. Feedback Generation**

  * The full conversation transcript and the initial context are passed to the LLM with a strict "Bar Raiser" feedback prompt.
  * The LLM generates a comprehensive markdown report with detailed metrics and a final decision.

-----

## 🛠️ **Running the Project Locally** :

### **1. Install Dependencies**

```bash
pip install -r requirements.txt
# (And install Node.js dependencies for the React frontend)
```

### **2. Environment Variables**

Create a `.env` file or set environment variables for the Groq and Serper/Web Search APIs.

```
GROQ_API_KEY=

```

### **3. Start Backend**

```bash
uvicorn backend.app:app --reload --port 8000
```

### **4. Start Frontend**

*Navigate to the frontend directory and run:*

```bash
npm install
npm run dev
```
App will be available at `http://localhost:5173` (default Vite port).

### **5. Access UI**

Open your browser to the local development address.

-----

## 📁 **Project Structure** :

```
.
├── backend/
│   ├── app.py                      # FastAPI routes, Session management, I/O
│   └── temp_audio/                 # Storage for generated audio files and PDFs
├── src/
│   ├── App.jsx                     # Main React application logic
│   └── components/
│       ├── SetupForm.jsx           # Interview setup form
│       ├── InterviewInterface.jsx  # Live interview UI (Webcam, Voice I/O)
│       ├── FeedbackReport.jsx      # Final markdown report viewer
│       └── LoadingScreen.jsx       # Context-building visualization
└── ... (other config files)
```


## How to use (demo flow)

1. Open frontend and fill SetupForm: Name, Company, Role, Years of Experience, optionally upload Resume (PDF) and paste Job Description. Select session length (5/10/15). Click **START INTERVIEW**.
2. Loading screen visualizes the MCP tool building tech context (live web search + prompt synthesis).
3. The interviewer greets and asks the first question (TTS audio + on-screen text). Press and hold the mic button to answer; release to send recording.
4. Backend transcribes audio and decides to ask a follow-up or move to the next question. Assistant reply is played back using Edge-TTS.
5. After configured number of questions, the session completes; call **Generate Feedback** to get a structured Markdown report with executive summary, metrics, strengths, areas for improvement, and hiring recommendation.
6. Restart session if desired.

---

## API Endpoints (summary)

- `POST /start_interview` — form data: `name`, `company`, `role`, `experience`, `num_questions`, `jd` (optional), `resume` (file). Returns `session_id`, first question `text`, and TTS `audio_url`.
- `POST /process_response` — form data: `session_id`, `audio` (file). Returns `status` (`IN_PROGRESS` | `COMPLETED`), assistant reply `text`, TTS `audio_url`, and `current_question` index.
- `POST /generate_feedback` — form data: `session_id`. Returns `report` (markdown string).
- `GET /get_audio/{filename}` — serves TTS audio files.

---

## Design decisions & rationale

- **Voice-first**: Mimics realistic interview conditions; helps evaluate verbal communication and spontaneity.  
- **Live web search (MCP)**: Adds company-specific realism (Amazon LPs, Google GCA cues, etc.) for higher relevance.  
- **Structured feedback**: Markdown report is easy to render on frontend and portable for download.  
- **In-memory sessions (demo)**: Simple for demo; recommend Redis or DB for persistence in production.  
- **API Keys via env**: Never hardcode secrets in codebase; use `.env` and secure deployment variables.

---

## Security & Production Notes

- Move API keys to environment variables and remove any hard-coded secrets.  
- Restrict CORS to the frontend origin for production.  
- Sanitize uploaded filenames and store temporary audio in a dedicated folder; implement a cleanup routine.  
- Rate-limit endpoints to control costs and abuse.  
- Consider authentication, usage quotas, and audit logging for larger deployments.

---

## Testing & Validation

- Functional tests: verify start → record → process → feedback flows.  
- Persona tests: simulate "confused", "efficient" and "chatty" responses to validate prompt adaptations.  
- Edge cases: silence/no-input, very short answers, off-topic responses.  
- Cross-browser: Chrome, Firefox, Safari; test mobile recording fallback if required.

---

## Future Improvements (stretch ideas)

- Export feedback as downloadable PDF.  
- Track user progress across multiple sessions (persistent user profiles).  
- Integrate prosody/sentiment analysis for richer feedback.  
- Add multilingual support and accent robustness.  
- Replace DuckDuckGo with a cached, rate-limited web-indexer for reliability.

---

## Credits & References

- Built with: FastAPI, Groq LLM & Whisper, Edge-TTS, DuckDuckGo search, React, TailwindCSS.  
- Demo assets: AI avatar images & short looping video for interviewer animation.  

---
