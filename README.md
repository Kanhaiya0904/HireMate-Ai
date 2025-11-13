# HireMate-Ai

📌 Overview

This project is a fully integrated AI-based interview preparation system that analyzes resumes, generates intelligent interview questions, evaluates candidate answers, and even supports voice-based mock interviews. Built with Flask, Google Gemini AI, and advanced speech-processing tools, it provides a realistic, interactive, and automated interview experience.

The system simulates a complete hiring workflow — from resume assessment to interview scoring — making it highly useful for students, job seekers, and interview preparation platforms.

🚀 Key Features
🔍 1. AI Resume Analysis

Extracts resume content from PDF and TXT files.

Uses Gemini AI to:

Score role suitability (out of 10)

Provide concise improvement feedback

Integrated via /resume-score API endpoint.

🎤 2. Voice-Based Mock Interview

Asks questions aloud using Text-to-Speech (pyttsx3)

Records user answers using SpeechRecognition

Automatically adds punctuation using DeepMultilingualPunctuation

Converts speech to text for accurate evaluation

Delivers a real-life interview experience.

❓ 3. AI-Generated Interview Questions

The system generates customized questions based on:

Job role

Company

Resume summary

Uses Gemini 1.5 Flash to produce short, clear, professional questions.

📝 4. Smart Answer Evaluation

For every interview session, the system evaluates:

Category	Score
Technical Knowledge	0–10
Communication Skills	0–10
Role Fit	0–10
Final Score	Average

It also provides short, constructive feedback to guide improvement.

🧩 5. Flask Backend API

The backend includes routes for:

Uploading & scoring resumes

Generating interview questions

Evaluating user answers

Running mock interview sessions

Built with:

Flask

Flask-CORS

pdfminer.six

google-generativeai

SpeechRecognition

pyttsx3

🔊 6. Speech Processing Utilities

stt.py

Converts speech to text

Adds punctuation for clarity

Handles noisy environments

tts.py

Generates offline speech output

Used to speak interview questions

🛠 Tech Stack
Backend

Python

Flask

Flask-CORS

AI Models

Google Gemini 1.5 Flash (question generation + evaluation)

DeepMultilingualPunctuation (answer correction)

Speech Processing

SpeechRecognition

pyttsx3 (offline TTS)

Resume Parsing

pdfminer.six

📁 Project Structure
📦 AI-Mock-Interview-System
├── app.py                 # Flask backend & API endpoints
├── Resume_Scoring.py      # Resume extraction + AI scoring
├── CE.py                  # Main evaluation engine
├── Execution.py           # End-to-end voice-based interview
├── Interview_agent.py     # Text-based interview agent
├── stt.py                 # Speech-to-text with punctuation
├── tts.py                 # Offline text-to-speech
├── requirements.txt       # Dependencies
└── eval_payload.json      # Example evaluation structure

⚙️ How It Works
1️⃣ User uploads a resume

→ System extracts text and sends it to Gemini
→ Gets a score + feedback

2️⃣ User starts an interview

→ Gemini creates role-specific questions
→ User answers via text or voice

3️⃣ System evaluates all answers

→ Generates scores
→ Provides overall feedback
→ Displays final report

🧪 API Endpoints
POST /resume-score

Upload a resume + job role → get AI evaluation.

POST /evaluate

Send Q&A list → get performance scoring.

POST /interview

Fetch default interview questions.

🎯 Use Cases

Interview preparation platforms

Resume screening automation

HR training tools

College final-year projects

Personal interview practice

🛠 Installation
pip install -r requirements.txt


Run backend:

python app.py


Run voice interview:

python Execution.py


Run text interview:

python Interview_agent.py


Run resume scoring:

python Resume_Scoring.py

📌 Future Improvements

Frontend UI (React / Next.js / Flutter)

Dashboard for scores & analytics

Multi-language interview support

Integration with ATS (Applicant Tracking Systems)

⭐ Conclusion

This project brings together AI, speech processing, and automation to create a smart, interactive, and realistic interview preparation platform. Its modular design and strong backend architecture make it highly scalable and easily extendable for real-world use.
