import os
import google.generativeai as genai
from pdfminer.high_level import extract_text

# ✅ Configure Gemini API
genai.configure(api_key="AIzaSyB0BMQerLOFT0QrXk--NJndpnho1phyL4s")  
model = genai.GenerativeModel("gemini-1.5-flash")

# 🔹 Function to extract text from resume
def extract_resume_text(file_path):
    if file_path.endswith(".pdf"):
        try:
            return extract_text(file_path)
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            return ""
    elif file_path.endswith(".txt"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            return ""
    else:
        print("⚠️ Unsupported file type:", file_path)
        return ""

# 🔹 Function to evaluate resume with Gemini
def evaluate_resume(resume_text, role):
    prompt = f"""
    You are an AI resume evaluator. A candidate has applied for the role of **{role}**.
    Here is the candidate’s resume text:

    {resume_text}

    Based on this resume, provide:
    - Role-fit Score (out of 10)
    - Short feedback (2 sentences, concise and constructive)
    """

    response = model.generate_content(prompt)
    return response.text.strip()

# 🔹 Main function
def run_resume_scoring():
    role = input("Enter Job Role: ")
    file_path = input("Enter path to resume file (.pdf or .txt): ").strip().strip('"')

    resume_text = extract_resume_text(file_path)
    if not resume_text:
        print("❌ Could not extract resume text. Exiting.")
        return

    print("\n📄 Resume successfully extracted. Sending to Gemini for evaluation...\n")
    result = evaluate_resume(resume_text, role)

    print("📋 Evaluation Result:\n")
    print(result)

# Run script
if __name__ == "__main__":
    run_resume_scoring()
