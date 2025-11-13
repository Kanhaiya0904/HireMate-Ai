import google.generativeai as genai

# ✅ Configure Gemini
genai.configure(api_key="AIzaSyB0BMQerLOFT0QrXk--NJndpnho1phyL4s")  # Replace with your actual key

# Use lighter model
model = genai.GenerativeModel("gemini-1.5-flash")

# Function to get multiple questions in one call
def get_questions(model, company, role, resume_summary, num_questions):
    prompt = f"""
    You are an AI interviewer for {company}.
    The candidate has applied for the role of {role}.
    Candidate's resume summary: {resume_summary}

    Generate {num_questions} professional interview questions:
    - Mix of technical, role-specific, and behavioral.
    - Keep them concise and realistic.
    Number them clearly.
    """
    response = model.generate_content(prompt)
    questions = response.text.strip().split("\n")

    cleaned_questions = [q.strip("1234567890. ") for q in questions if q.strip()]
    return cleaned_questions[:num_questions]

# Function to evaluate all answers with scoring
def evaluate_all_answers(model, qa_list, role, resume_summary):
    qa_text = "\n".join([f"Q: {q}\nA: {a}" for q, a in qa_list])
    prompt = f"""
    The following is a mock interview for the role of {role}.
    Candidate resume summary: {resume_summary}

    Here are the questions and candidate's answers:
    {qa_text}

    Evaluate the candidate's performance and provide scores (0–10) for:
    1. Technical Knowledge
    2. Communication Skills
    3. Role Fit

    Then, calculate the Total Score = average of the three.

    Format the response clearly as:
    Technical: X/10
    Communication: Y/10
    Role Fit: Z/10
    Total Score: W/10

    After scoring, provide a short constructive feedback (max 5 sentences).
    """
    response = model.generate_content(prompt)
    return response.text.strip()

# Main interview loop
def run_interview():
    company = input("Enter company name: ")
    role = input("Enter job role: ")
    resume_summary = input("Enter short resume summary: ")
    num_questions = int(input("How many questions do you want in this interview? "))

    print("\nStarting your mock interview...\n")

    # ✅ Fetch custom number of questions
    questions = get_questions(model, company, role, resume_summary, num_questions)
    qa_list = []

    for i, question in enumerate(questions, start=1):
        print(f"Q{i}: {question}")
        answer = input("Your Answer: ")
        qa_list.append((question, answer))

    print("\nInterview complete! Generating final evaluation...\n")

    feedback = evaluate_all_answers(model, qa_list, role, resume_summary)
    print("📊 Final Evaluation:\n")
    print(feedback)

# Run the script
if __name__ == "__main__":
    run_interview()
