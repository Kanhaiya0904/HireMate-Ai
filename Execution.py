

# ✅ Configure Gemini
#genai.configure(api_key="AIzaSyB0BMQerLOFT0QrXk--NJndpnho1phyL4s")  # replace with your Gemini API key
import os
import warnings
import time
import pyttsx3
import speech_recognition as sr
import google.generativeai as genai

# Suppress TensorFlow & warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

# ✅ Configure Gemini
genai.configure(api_key="AIzaSyB0BMQerLOFT0QrXk--NJndpnho1phyL4s")  # replace with your Gemini API key
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize STT
recognizer = sr.Recognizer()
recognizer.pause_threshold = 1.3  # wait before considering speech finished

# 🔹 Speak text aloud
def speak(text):
    print(f"\nAI Agent: {text}")
    engine = pyttsx3.init()
    engine.setProperty('rate', 150)
    engine.say(text)
    engine.runAndWait()
    engine.stop()
    time.sleep(0.8)

# 🔹 Listen to user's voice and transcribe
def listen():
    with sr.Microphone() as source:
        print("🎤 Listening...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        audio = recognizer.listen(source)
    try:
        response = recognizer.recognize_google(audio)
        print(f"👤 You said: {response}")
        return response
    except sr.UnknownValueError:
        return "Sorry, I couldn't understand."
    except sr.RequestError:
        return "Speech recognition service error."

# 🔹 Get plain interview questions
def get_questions(company, role, resume_summary, num_questions):
    prompt = f"""
    You are an AI interviewer for {company}.
    The candidate has applied for {role}.
    Candidate resume summary: {resume_summary}

    Generate {num_questions} interview questions.
    Rules:
    - Do NOT mention the type (technical, behavioral, etc.)
    - Keep them clear, short, and realistic.
    - Number them clearly.
    """
    response = model.generate_content(prompt)
    questions = response.text.strip().split("\n")
    cleaned = [q.strip("1234567890. ") for q in questions if q.strip()]
    return cleaned[:num_questions]

# 🔹 Evaluate all answers with scoring
def evaluate_all(qa_list, role, resume_summary):
    qa_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in qa_list])
    prompt = f"""
    The following is a mock interview for the role of {role}.
    Candidate resume summary: {resume_summary}

    Interview:
    {qa_text}

    Please provide an evaluation with:
    Technical Score: (out of 10)
    Communication Score: (out of 10)
    Role-fit Score: (out of 10)
    Final Score: (average of above three)
    Short feedback: (max 5 sentences, plain text only, no symbols or formatting)
    """
    response = model.generate_content(prompt)
    return response.text.strip()

# 🔹 Main interview flow
def run_interview():
    company = input("Enter company name: ")
    role = input("Enter job role: ")
    resume_summary = input("Enter short resume summary: ")
    num_questions = int(input("Number of interview questions: "))

    speak("Starting your mock interview now.")
    questions = get_questions(company, role, resume_summary, num_questions)
    qa_list = []

    for i, q in enumerate(questions, 1):
        speak(f"Question {i}: {q}")
        answer = listen()
        qa_list.append((q, answer))

    speak("Thank you. The interview is complete. Here are your final results and feedback.")
    feedback = evaluate_all(qa_list, role, resume_summary)

    print("\n📋 Final Scorecard & Feedback:\n")
    print(feedback)

# Run
if __name__ == "__main__":
    run_interview()

