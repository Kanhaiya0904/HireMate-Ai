import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Play, 
  CheckCircle, 
  Building, 
  Briefcase, 
  FileText,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  User,
  X,
  BarChart3,
  Target,
  Clock,
  MessageSquare
} from 'lucide-react';

interface InterviewData {
  companyName: string;
  jobRole: string;
  numQuestions: number;
  resume: File | null;
}

interface Question {
  id: number;
  text: string;
  answer?: string;
}

function App() {
  const [currentSection, setCurrentSection] = useState<'landing' | 'setup' | 'upload' | 'interview' | 'results'>('landing');
  const [interviewData, setInterviewData] = useState<InterviewData>({
    companyName: '',
    jobRole: '',
    numQuestions: 5,
    resume: null
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [roleScore, setRoleScore] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showAvatarPulse, setShowAvatarPulse] = useState(true);

  // Backend base URL. For development this defaults to localhost:5000.
  // For production set VITE_API_BASE in your environment (e.g. VITE_API_BASE=https://api.yourdomain.com)
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

  const [backendLoading, setBackendLoading] = useState(false);
  const [backendFeedback, setBackendFeedback] = useState<string | null>(null);

  const sampleQuestions = [
    { id: 1, text: "Tell me about yourself and your professional background." },
    { id: 2, text: "What specifically interests you about this role and our company?" },
    { id: 3, text: "Describe a challenging project you've worked on and how you overcame obstacles." },
    { id: 4, text: "How do you handle working under pressure and tight deadlines?" },
    { id: 5, text: "Where do you see yourself professionally in the next 5 years?" },
    { id: 6, text: "What would you say is your greatest professional strength?" },
    { id: 7, text: "Describe a time when you had to work with a difficult team member." },
    { id: 8, text: "How do you stay updated with industry trends and technologies?" },
    { id: 9, text: "What motivates you to do your best work?" },
    { id: 10, text: "Do you have any questions about our company or this position?" }
  ];

  useEffect(() => {
    if (currentSection === 'results') {
      // Animate score counting up
      let count = 0;
      const target = 87; // Sample score shown while waiting for backend
      const increment = target / 60;
      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          count = target;
          clearInterval(timer);
        }
        setRoleScore(Math.floor(count));
      }, 25);

      // Send interview data to backend for evaluation
      (async () => {
        try {
          setBackendLoading(true);
          const payload = {
            companyName: interviewData.companyName,
            jobRole: interviewData.jobRole,
            qa: questions.map(q => ({ question: q.text, answer: q.answer || '' })),
          };
          console.log('[frontend] Sending interview data to', `${API_BASE}/evaluate`, payload);
          const resp = await fetch(`${API_BASE}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!resp.ok) {
            const txt = await resp.text();
            console.error('[frontend] /evaluate error', resp.status, txt);
            setBackendFeedback('Evaluation failed');
            return;
          }

          const result = await resp.json();
          console.log('[frontend] /evaluate result', result);
          // map backend result into UI
          if (typeof result.total_score === 'number') setRoleScore(Math.floor(result.total_score));
          if (result.feedback) setBackendFeedback(result.feedback);
        } catch (err) {
          console.error('[frontend] evaluateInterview exception', err);
          setBackendFeedback('Error during evaluation');
        } finally {
          setBackendLoading(false);
        }
      })();
    }
  }, [currentSection]);

  useEffect(() => {
    if (currentSection === 'interview') {
      const pulseTimer = setInterval(() => {
        setShowAvatarPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(pulseTimer);
    }
  }, [currentSection]);

  const handleFileUpload = (file: File) => {
    setInterviewData({ ...interviewData, resume: file });
    console.log('[frontend] Selected resume:', file.name, file.type, file.size);

    // Simulate upload progress for UI polish
    let progress = 0;
    const interval = setInterval(() => {
      progress += 8;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => startInterview(), 800);
      }
    }, 80);

    // Send file to backend for resume scoring (fire-and-forget, UI still proceeds)
    uploadResume(file).catch(err => console.error('[frontend] uploadResume error', err));
  };

  // Upload resume to backend /resume-score
  const uploadResume = async (file: File) => {
    try {
      setBackendLoading(true);
      const fd = new FormData();
      fd.append('resume', file);
      fd.append('role', interviewData.jobRole || '');

      console.log('[frontend] Sending resume to', `${API_BASE}/resume-score`);
      const res = await fetch(`${API_BASE}/resume-score`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('[frontend] /resume-score response not ok', res.status, text);
        setBackendFeedback('Resume upload failed');
        return null;
      }

      const data = await res.json();
      console.log('[frontend] /resume-score response', data);
      setBackendFeedback(JSON.stringify(data));
      return data;
    } catch (err) {
      console.error('[frontend] uploadResume exception', err);
      setBackendFeedback('Error uploading resume');
      return null;
    } finally {
      setBackendLoading(false);
    }
  };

  const startInterview = () => {
    setQuestions(sampleQuestions.slice(0, interviewData.numQuestions));
    setCurrentSection('interview');
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (answer: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = answer;
    setQuestions(updatedQuestions);
    setCurrentAnswer('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 500);
    } else {
      setTimeout(() => setCurrentSection('results'), 1000);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate recording and answer after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        const sampleAnswers = [
          "Thank you for the question. I have over 5 years of experience in software development, specializing in full-stack web applications using modern technologies like React, Node.js, and cloud platforms.",
          "I'm particularly excited about this role because it combines my technical expertise with the opportunity to work on innovative projects that can make a real impact on user experiences.",
          "One challenging project involved rebuilding our entire legacy system within a tight 6-month deadline. I led a team of 4 developers and implemented agile methodologies to ensure we met all milestones.",
          "I thrive under pressure by staying organized, prioritizing tasks effectively, and maintaining clear communication with my team. I also use stress as motivation to push for creative solutions."
        ];
        const randomAnswer = sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)];
        setCurrentAnswer(randomAnswer);
        setTimeout(() => handleAnswer(randomAnswer), 1000);
      }, 3000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        handleFileUpload(file);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-inter">
      {/* Custom Styles */}
  <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #0AF7D3;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 0 10px #0AF7D3;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #0AF7D3;
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 0 10px #0AF7D3;
        }

        .wave-animation {
          animation: wave 0.6s ease-in-out infinite alternate;
        }
        
        @keyframes wave {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1.5); }
        }

        .glow-text {
          text-shadow: 0 0 20px #0AF7D3, 0 0 40px #0AF7D3, 0 0 80px #0AF7D3;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-bubble-ai {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .chat-bubble-user {
          animation: slideInRight 0.5s ease-out;
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Landing Section */}
      {currentSection === 'landing' && (
        <div className="relative min-h-screen flex flex-col">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-20 h-20 border border-[#0AF7D3] rounded-full animate-bounce opacity-20"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-[#0AF7D3] rounded-full animate-pulse opacity-10"></div>
            <div className="absolute top-1/2 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-[#0AF7D3] to-transparent opacity-30"></div>
            <div className="absolute top-1/3 right-0 w-1 h-40 bg-gradient-to-b from-transparent via-[#0AF7D3] to-transparent opacity-20"></div>
          </div>

          {/* Header */}
          <header className="relative z-10 p-6">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-[#0AF7D3]" />
                <span className="text-2xl font-bold">HireMate AI</span>
              </div>
              <button 
                onClick={() => setCurrentSection('setup')}
                className="bg-[#0AF7D3] text-black px-6 py-3 rounded-xl font-semibold hover:bg-opacity-80 transition-all duration-300 hover:shadow-[0_0_20px_#0AF7D3] hover:scale-105"
              >
                Get Started
              </button>
            </nav>
          </header>

          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-6 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* AI Avatar */}
              <div className="mb-12 relative">
                <div className="w-48 h-48 mx-auto mb-8 relative group">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0AF7D3] shadow-[0_0_50px_#0AF7D3] transform group-hover:scale-110 transition-all duration-500 bg-gradient-to-r from-[#0AF7D3] to-blue-500 p-1">
                    <img 
                      src="/Avatar.jpg" 
                      alt="AI Interviewer Avatar" 
                      className="w-full h-full rounded-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -inset-6 rounded-full border border-[#0AF7D3] opacity-30 animate-spin"></div>
                  <div className="absolute -inset-3 rounded-full border-2 border-[#0AF7D3] opacity-20 animate-pulse"></div>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-[#0AF7D3] to-white bg-clip-text text-transparent">
                  HireMate AI
                </h1>
                <div className="relative">
                  <p className="text-3xl md:text-4xl font-bold text-[#0AF7D3] mb-8 glow-text animate-pulse">
                    From candidate to career fit in seconds
                  </p>
                </div>
                <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                  Experience the future of hiring with our AI-powered interview platform. 
                  Get instant role-fit analysis, comprehensive feedback, and accelerate your hiring process with cutting-edge technology.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-[#0AF7D3] transition-all duration-300 hover:shadow-[0_0_20px_rgba(10,247,211,0.1)] group">
                  <Zap className="h-8 w-8 text-[#0AF7D3] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-lg mb-2">AI-Powered Analysis</h3>
                  <p className="text-gray-400 text-sm">Advanced algorithms evaluate responses in real-time</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-[#0AF7D3] transition-all duration-300 hover:shadow-[0_0_20px_rgba(10,247,211,0.1)] group">
                  <Clock className="h-8 w-8 text-[#0AF7D3] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-lg mb-2">Instant Results</h3>
                  <p className="text-gray-400 text-sm">Get comprehensive feedback within seconds</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-[#0AF7D3] transition-all duration-300 hover:shadow-[0_0_20px_rgba(10,247,211,0.1)] group">
                  <Target className="h-8 w-8 text-[#0AF7D3] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="font-bold text-lg mb-2">Perfect Role Match</h3>
                  <p className="text-gray-400 text-sm">Tailored questions based on job requirements</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button 
                  onClick={() => setCurrentSection('setup')}
                  className="group bg-[#0AF7D3] text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_30px_#0AF7D3] hover:scale-105 flex items-center space-x-3"
                >
                  <span>Start Interview</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-[#0AF7D3] text-[#0AF7D3] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#0AF7D3] hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_#0AF7D3] hover:scale-105">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Setup Section */}
      {currentSection === 'setup' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full animate-fade-in">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#0AF7D3] to-blue-500 flex items-center justify-center">
                <Briefcase className="h-10 w-10 text-black" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0AF7D3]">
                Interview Setup
              </h2>
              <p className="text-xl text-gray-300">
                Configure your AI-powered interview session
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-[#0AF7D3] transition-all duration-300 hover:shadow-[0_0_30px_rgba(10,247,211,0.1)]">
              <div className="space-y-8">
                {/* Company Name */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-lg font-semibold mb-3 text-[#0AF7D3]">
                    <Building className="h-5 w-5" />
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    value={interviewData.companyName}
                    onChange={(e) => setInterviewData({ ...interviewData, companyName: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full bg-black border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-[#0AF7D3] focus:ring-2 focus:ring-[#0AF7D3] focus:ring-opacity-30 transition-all duration-300 focus:shadow-[0_0_20px_rgba(10,247,211,0.1)] text-lg"
                  />
                </div>

                {/* Job Role */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-lg font-semibold mb-3 text-[#0AF7D3]">
                    <User className="h-5 w-5" />
                    <span>Job Role</span>
                  </label>
                  <input
                    type="text"
                    value={interviewData.jobRole}
                    onChange={(e) => setInterviewData({ ...interviewData, jobRole: e.target.value })}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full bg-black border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-[#0AF7D3] focus:ring-2 focus:ring-[#0AF7D3] focus:ring-opacity-30 transition-all duration-300 focus:shadow-[0_0_20px_rgba(10,247,211,0.1)] text-lg"
                  />
                </div>

                {/* Number of Questions */}
                <div className="group">
                  <label className="flex items-center justify-between text-lg font-semibold mb-4 text-[#0AF7D3]">
                    <span className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Number of Questions</span>
                    </span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#0AF7D3] to-blue-500 bg-clip-text text-transparent">{interviewData.numQuestions}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      value={interviewData.numQuestions}
                      onChange={(e) => setInterviewData({ ...interviewData, numQuestions: parseInt(e.target.value) })}
                      className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #0AF7D3 0%, #0AF7D3 ${((interviewData.numQuestions - 3) / 7) * 100}%, #374151 ${((interviewData.numQuestions - 3) / 7) * 100}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>3 min</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>10 questions</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={() => setCurrentSection('upload')}
                  disabled={!interviewData.companyName || !interviewData.jobRole}
                  className="w-full bg-[#0AF7D3] text-black px-6 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_30px_#0AF7D3] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-2"
                >
                  <span>Continue to Resume Upload</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Section */}
      {currentSection === 'upload' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full animate-fade-in">
            <div className="text-center mb-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#0AF7D3] to-blue-500 flex items-center justify-center">
                <Upload className="h-10 w-10 text-black" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0AF7D3]">
                Upload Resume
              </h2>
              <p className="text-xl text-gray-300">
                Upload your resume for AI analysis and tailored questions
              </p>
            </div>

            {uploadProgress > 0 ? (
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="w-full h-full rounded-full border-4 border-gray-700">
                      <div 
                        className="w-full h-full rounded-full border-4 border-[#0AF7D3] transition-all duration-300"
                        style={{
                          clipPath: `polygon(0 0, ${uploadProgress}% 0, ${uploadProgress}% 100%, 0 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-[#0AF7D3]">{uploadProgress}%</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Processing Resume...</h3>
                  <p className="text-gray-400">AI is analyzing your resume to generate personalized questions</p>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-gray-900 rounded-2xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(10,247,211,0.1)] ${
                  isDragOver ? 'border-[#0AF7D3] bg-gray-800' : 'border-gray-700 hover:border-[#0AF7D3]'
                }`}
              >
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-[#0AF7D3] to-blue-500 rounded-full flex items-center justify-center">
                    <Upload className="h-12 w-12 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#0AF7D3]">
                    {isDragOver ? 'Drop your resume here!' : 'Upload Your Resume'}
                  </h3>
                  <p className="text-gray-300 mb-8 text-lg">
                    Drag and drop your PDF or TXT file, or click to browse
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="inline-flex items-center space-x-2 bg-[#0AF7D3] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_30px_#0AF7D3] hover:scale-105 cursor-pointer"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Choose File</span>
                    </label>
                    
                    <p className="text-sm text-gray-500">
                      Supported formats: PDF, TXT (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {interviewData.resume && uploadProgress === 0 && (
              <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-[#0AF7D3]" />
                    <div>
                      <p className="font-semibold">{interviewData.resume.name}</p>
                      <p className="text-sm text-gray-400">{(interviewData.resume.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInterviewData({ ...interviewData, resume: null })}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentSection('setup')}
                className="flex-1 border-2 border-gray-700 text-gray-300 px-6 py-4 rounded-xl font-semibold hover:border-[#0AF7D3] hover:text-[#0AF7D3] transition-all duration-300"
              >
                Back
              </button>
              <button
                onClick={startInterview}
                className="flex-1 bg-[#0AF7D3] text-black px-6 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_30px_#0AF7D3] hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Skip & Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Interview Section */}
      {currentSection === 'interview' && questions.length > 0 && (
        <div className="min-h-screen flex flex-col p-6">
          {/* Interview Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0AF7D3] shadow-[0_0_20px_#0AF7D3]">
                <img 
                  src="/public/interview/Interview Avatarjpg.jpg" 
                  alt="AI Interviewer" 
                  className={`w-full h-full object-cover object-top transition-all duration-1000 ${showAvatarPulse ? 'scale-110' : 'scale-100'}`}
                />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-[#0AF7D3]">AI Interviewer</h2>
                <p className="text-gray-400">Conducting interview for {interviewData.jobRole}</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Question Progress</span>
                <span className="text-[#0AF7D3] font-semibold">{currentQuestionIndex + 1} / {questions.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-[#0AF7D3] to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 max-w-4xl mx-auto w-full">
            <div className="space-y-6">
              {/* AI Question */}
              <div className="chat-bubble-ai">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#0AF7D3] flex-shrink-0">
                    <img 
                      src="/public/interview/Interview Avatarjpg.jpg" 
                      alt="AI" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl rounded-tl-sm p-6 max-w-2xl border border-gray-700">
                    <p className="text-lg leading-relaxed">{questions[currentQuestionIndex]?.text}</p>
                  </div>
                </div>
              </div>

              {/* User Answer (if exists) */}
              {currentAnswer && (
                <div className="chat-bubble-user">
                  <div className="flex items-start space-x-4 justify-end">
                    <div className="bg-gradient-to-r from-[#0AF7D3] to-blue-500 rounded-2xl rounded-tr-sm p-6 max-w-2xl text-black">
                      <p className="text-lg leading-relaxed">{currentAnswer}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#0AF7D3] flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recording Interface */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-900 rounded-full p-6 border border-gray-800 shadow-2xl">
                <div className="flex items-center space-x-6">
                  {/* Recording Animation */}
                  {isRecording && (
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-8 bg-[#0AF7D3] rounded-full wave-animation"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Microphone Button */}
                  <button
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_red]'
                        : 'bg-[#0AF7D3] hover:bg-opacity-80 shadow-[0_0_30px_#0AF7D3] hover:scale-110'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-8 w-8 text-white" />
                    ) : (
                      <Mic className="h-8 w-8 text-black" />
                    )}
                  </button>

                  {/* Recording Status */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#0AF7D3]">
                      {isRecording ? 'Recording...' : 'Click to Record'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isRecording ? 'Speak clearly' : 'Press and hold to answer'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {currentSection === 'results' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-4xl w-full animate-fade-in">
            <div className="text-center mb-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#0AF7D3] to-blue-500 flex items-center justify-center">
                <Award className="h-12 w-12 text-black" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0AF7D3]">
                Interview Complete!
              </h2>
              <p className="text-xl text-gray-300">
                Here's your comprehensive role-fit analysis
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-[#0AF7D3] transition-all duration-300 hover:shadow-[0_0_30px_rgba(10,247,211,0.1)]">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-8 text-[#0AF7D3]">Role-Fit Score</h3>
                  
                  {/* Circular Progress */}
                  <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="2"
                      />
                      <path
                        d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                        fill="none"
                        stroke="#0AF7D3"
                        strokeWidth="2"
                        strokeDasharray={`${roleScore}, 100`}
                        className="transition-all duration-1000 ease-out"
                        style={{
                          filter: 'drop-shadow(0 0 8px #0AF7D3)'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-[#0AF7D3] mb-2">{roleScore}%</div>
                        <div className="text-sm text-gray-400">Match Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">Excellent</div>
                      <div className="text-sm text-gray-400">Overall Rating</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <div className="text-lg font-bold text-white">High</div>
                      <div className="text-sm text-gray-400">Potential</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-4 text-[#0AF7D3] flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6" />
                    <span>Strengths</span>
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#0AF7D3] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Excellent communication skills and clear articulation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#0AF7D3] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Strong technical knowledge relevant to the role</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#0AF7D3] rounded-full mt-2 flex-shrink-0"></div>
                      <span>Demonstrated problem-solving abilities</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-4 text-yellow-500 flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6" />
                    <span>Areas for Improvement</span>
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Provide more specific examples from past experience</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Elaborate on leadership and teamwork experiences</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-4 text-[#0AF7D3] flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Recommendation</span>
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-[#0AF7D3]">Highly Recommended:</strong> The candidate demonstrates 
                    excellent fit for this role with strong technical skills and communication abilities. 
                    Consider proceeding to the next interview stage.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <button
                onClick={() => setCurrentSection('landing')}
                className="bg-[#0AF7D3] text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all duration-300 hover:shadow-[0_0_30px_#0AF7D3] hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start New Interview</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-[#0AF7D3] text-[#0AF7D3] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0AF7D3] hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_#0AF7D3] hover:scale-105">
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;