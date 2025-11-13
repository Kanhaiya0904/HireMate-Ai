from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile

app = Flask(__name__)

# Allow origins via environment variable for production; default to local dev port used by Vite
allowed_origin = os.environ.get('FRONTEND_ORIGIN', 'http://localhost:5173')
CORS(app, origins=[allowed_origin], supports_credentials=True)

# Import existing project evaluation utilities
try:
    import Resume_Scoring as rs
except Exception as e:
    rs = None
    print('Warning: could not import Resume_Scoring:', e)

try:
    import CE
except Exception as e:
    CE = None
    print('Warning: could not import CE:', e)


@app.route('/resume-score', methods=['POST'])
def resume_score():
    # Basic test implementation: accept a file and return a mock score
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    role = request.form.get('role', '')
    resume = request.files['resume']
    filename = resume.filename
    print(f"Received resume: {filename} for role: {role}")

    # Save uploaded file to a temp file and call existing resume scoring if available
    tmp_path = None
    try:
        suffix = os.path.splitext(filename)[1] or '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            resume.save(tmp.name)
            tmp_path = tmp.name

        if rs:
            resume_text = rs.extract_resume_text(tmp_path)
            evaluation = rs.evaluate_resume(resume_text, role)
            return jsonify({
                'filename': filename,
                'role': role,
                'evaluation': evaluation,
            })
        else:
            return jsonify({'error': 'Resume scoring module not available'}), 500
    except Exception as e:
        print('Error handling resume upload:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


@app.route('/evaluate', methods=['POST'])
def evaluate():
    payload = request.get_json(force=True, silent=True) or {}
    print('Evaluate payload:', payload)

    try:
        # If CE module (existing evaluation) is available, use it
        if CE and hasattr(CE, 'evaluate_all'):
            # Convert qa array of {question,answer} into list of tuples (q,a)
            qa = payload.get('qa', [])
            qa_list = [(item.get('question', ''), item.get('answer', '')) for item in qa]
            role = payload.get('jobRole') or payload.get('role') or ''
            resume_summary = payload.get('resume_summary', '')
            result_text = CE.evaluate_all(qa_list, role, resume_summary)
            return jsonify({'result': result_text})

        # Fallback simple scoring if module not present
        qa = payload.get('qa', [])
        if qa:
            scores = []
            for item in qa:
                ans = (item.get('answer') or '')
                scores.append(min(10, max(0, len(ans.split()) // 5)))
            avg = sum(scores) / len(scores)
            total_score = int(min(100, avg * 10))
        else:
            total_score = 50

        return jsonify({
            'total_score': total_score,
            'feedback': 'This is a fallback mock evaluation. Install and enable CE module for full evaluations.'
        })
    except Exception as e:
        print('Evaluation error:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/interview', methods=['POST'])
def interview():
    data = request.get_json(force=True, silent=True) or {}
    print('Interview request:', data)
    # Echo back a sample question list
    questions = [
        {'id': 1, 'text': 'Tell me about yourself.'},
        {'id': 2, 'text': 'Why this company?'}
    ]
    return jsonify({'questions': questions})


if __name__ == '__main__':
    # Use port 5000 by default; enable debug in development
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
