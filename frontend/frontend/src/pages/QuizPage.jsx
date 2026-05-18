import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: "db",
    name: "Database Management",
    icon: "🗄️",
    color: "#4f46e5",
    questions: [
      { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0 },
      { q: "Which SQL clause is used to filter records?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], answer: 2 },
      { q: "What is a primary key?", options: ["A key that can be null", "A unique identifier for a record", "A foreign reference", "An index column"], answer: 1 },
      { q: "Which normal form eliminates partial dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 1 },
      { q: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Data", "Atomicity, Control, Isolation, Data", "Access, Consistency, Index, Durability"], answer: 0 },
      { q: "Which JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: 3 },
      { q: "What is a foreign key?", options: ["A primary key in another table", "A field that links to a primary key of another table", "An encrypted key", "A composite key"], answer: 1 },
      { q: "Which command is used to remove a table from a database?", options: ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "CLEAR TABLE"], answer: 2 },
      { q: "What is normalization in databases?", options: ["Encrypting data", "Organizing data to reduce redundancy", "Backing up data", "Compressing data"], answer: 1 },
      { q: "Which SQL function returns the number of rows?", options: ["SUM()", "COUNT()", "TOTAL()", "NUM()"], answer: 1 },
    ],
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    icon: "🤖",
    color: "#f59e0b",
    questions: [
      { q: "What is the Turing Test used to evaluate?", options: ["Speed of a computer", "A machine's ability to exhibit intelligent behavior", "Memory capacity", "Network latency"], answer: 1 },
      { q: "Which algorithm is commonly used for classification problems?", options: ["Linear Regression", "K-Means", "Decision Tree", "PCA"], answer: 2 },
      { q: "What does NLP stand for?", options: ["New Language Processing", "Natural Language Processing", "Neural Logic Programming", "Network Layer Protocol"], answer: 1 },
      { q: "Which is NOT a type of machine learning?", options: ["Supervised", "Unsupervised", "Reinforcement", "Compulsory"], answer: 3 },
      { q: "What is a neural network inspired by?", options: ["Computer circuits", "The human brain", "Blockchain", "Cloud computing"], answer: 1 },
      { q: "What is overfitting in machine learning?", options: ["Model performs well on training but poorly on new data", "Model is too simple", "Model runs too slowly", "Model uses too little data"], answer: 0 },
      { q: "What does CNN stand for in deep learning?", options: ["Computer Neural Network", "Convolutional Neural Network", "Connected Node Network", "Centralized Neuron Network"], answer: 1 },
      { q: "Which is a popular Python library for machine learning?", options: ["Django", "Flask", "scikit-learn", "Pygame"], answer: 2 },
      { q: "What is the purpose of an activation function?", options: ["To store data", "To introduce non-linearity", "To connect to database", "To format output"], answer: 1 },
      { q: "What is reinforcement learning based on?", options: ["Labeled data", "Reward and punishment", "Clustering", "Dimensionality reduction"], answer: 1 },
    ],
  },
  {
    id: "java",
    name: "Java Programming",
    icon: "☕",
    color: "#ef4444",
    questions: [
      { q: "Which keyword is used to create a class in Java?", options: ["struct", "class", "object", "define"], answer: 1 },
      { q: "Java is a ___ language.", options: ["Procedural", "Functional", "Object-Oriented", "Markup"], answer: 2 },
      { q: "Which method is the entry point of a Java program?", options: ["start()", "init()", "main()", "run()"], answer: 2 },
      { q: "What is the default value of an int variable in Java?", options: ["null", "0", "1", "undefined"], answer: 1 },
      { q: "Which keyword is used to inherit a class?", options: ["implements", "inherits", "extends", "super"], answer: 2 },
      { q: "What is JVM?", options: ["Java Virtual Machine", "Java Variable Manager", "Java Version Manager", "Java Visual Mode"], answer: 0 },
      { q: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], answer: 2 },
      { q: "What is the size of an int in Java?", options: ["2 bytes", "4 bytes", "8 bytes", "16 bytes"], answer: 1 },
      { q: "Which exception is thrown when dividing by zero?", options: ["NullPointerException", "ArithmeticException", "IOException", "ClassNotFoundException"], answer: 1 },
      { q: "What does the 'final' keyword do in Java?", options: ["Makes a variable constant", "Ends the program", "Closes a file", "Starts garbage collection"], answer: 0 },
    ],
  },
  {
    id: "python",
    name: "Python Programming",
    icon: "🐍",
    color: "#10b981",
    questions: [
      { q: "Which keyword is used to define a function in Python?", options: ["func", "function", "def", "define"], answer: 2 },
      { q: "What is the output of print(type([]))?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], answer: 1 },
      { q: "Which data structure uses key-value pairs?", options: ["List", "Tuple", "Set", "Dictionary"], answer: 3 },
      { q: "How do you start a comment in Python?", options: ["//", "/*", "#", "--"], answer: 2 },
      { q: "What is PEP 8?", options: ["A Python library", "Python style guide", "A Python IDE", "A Python version"], answer: 1 },
      { q: "Which of these is immutable in Python?", options: ["List", "Dictionary", "Set", "Tuple"], answer: 3 },
      { q: "What does 'len()' function do?", options: ["Returns the type", "Returns the length", "Returns the last element", "Deletes an element"], answer: 1 },
      { q: "Which library is used for data analysis in Python?", options: ["NumPy", "Pandas", "Both NumPy and Pandas", "Tkinter"], answer: 2 },
      { q: "What is a lambda function?", options: ["A named function", "An anonymous function", "A recursive function", "A generator function"], answer: 1 },
      { q: "What does 'pip' stand for?", options: ["Python Install Package", "Pip Installs Packages", "Python Index Program", "Package in Python"], answer: 1 },
    ],
  },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();
  const { username } = useContext(AuthContext);

  const [activeSubject, setActiveSubject] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = (subject) => {
    setActiveSubject(subject);
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  const handleSelect = (index) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);
    if (index === activeSubject.questions[currentQ].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < activeSubject.questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const goBackToSubjects = () => {
    setActiveSubject(null);
    setFinished(false);
  };

  const question = activeSubject ? activeSubject.questions[currentQ] : null;
  const progressPct = activeSubject ? Math.round(((currentQ + (answered ? 1 : 0)) / activeSubject.questions.length) * 100) : 0;
  const letters = ["A", "B", "C", "D"];

  return (
    <>
      <style>{CSS}</style>
      <div className="q-wrapper">
        
        {/* Navbar */}
        <nav className="q-nav">
          <div className="q-brand" onClick={() => navigate("/")}>
            <span className="q-logo-icon">🎯</span> Learning Hub
          </div>
          <div className="q-nav-links">
            <button className="q-btn-ghost" onClick={() => navigate("/")}>Home</button>
            <button className="q-btn-ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <div className="q-avatar">{(username || "U")[0].toUpperCase()}</div>
          </div>
        </nav>

        <main className="q-main">
          {/* ── Subject Selection ── */}
          {!activeSubject && (
            <div className="q-fade-in">
              <header className="q-header">
                <div className="q-badge">Knowledge Check</div>
                <h1>Select a Quiz Topic</h1>
                <p>Challenge yourself and solidify your understanding of core IT subjects.</p>
              </header>

              <div className="q-grid">
                {SUBJECTS.map((s) => (
                  <div
                    key={s.id}
                    className="q-subject-card"
                    style={{ "--theme-color": s.color, "--theme-bg": s.color + "15" }}
                    onClick={() => startQuiz(s)}
                  >
                    <div className="q-subject-icon-wrap">
                      <span className="q-subject-icon">{s.icon}</span>
                    </div>
                    <h3 className="q-subject-title">{s.name}</h3>
                    <p className="q-subject-desc">{s.questions.length} questions to test your skills</p>
                    <div className="q-subject-footer">
                      <span className="q-start-link">Start Challenge →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Active Quiz ── */}
          {activeSubject && !finished && (
            <div className="q-active q-fade-in">
              <div className="q-active-header">
                <button className="q-back-btn" onClick={goBackToSubjects}>
                  <span className="q-back-icon">←</span> Exit Quiz
                </button>
                <div className="q-active-subject" style={{ color: activeSubject.color }}>
                  {activeSubject.icon} <span style={{ marginLeft: 6 }}>{activeSubject.name}</span>
                </div>
              </div>

              <div className="q-progress-container">
                <div className="q-progress-stats">
                  <span className="q-progress-text">Question {currentQ + 1} of {activeSubject.questions.length}</span>
                  <span className="q-progress-pct">{progressPct}%</span>
                </div>
                <div className="q-progress-bar">
                  <div className="q-progress-fill" style={{ width: `${progressPct}%`, backgroundColor: activeSubject.color }} />
                </div>
              </div>

              <div className="q-question-card">
                <h2 className="q-question-text">{question.q}</h2>

                <div className="q-options-list">
                  {question.options.map((opt, i) => {
                    let cls = "q-option";
                    if (answered) cls += " disabled";
                    if (answered && i === question.answer) cls += " correct";
                    else if (answered && i === selectedOption && i !== question.answer) cls += " wrong";
                    else if (!answered && i === selectedOption) cls += " selected";
                    
                    return (
                      <div key={i} className={cls} onClick={() => handleSelect(i)}>
                        <div className="q-option-letter">{letters[i]}</div>
                        <div className="q-option-text">{opt}</div>
                        {answered && i === question.answer && <div className="q-option-icon">✓</div>}
                        {answered && i === selectedOption && i !== question.answer && <div className="q-option-icon">✕</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="q-actions-bar">
                <div className="q-score-live">Current Score: <strong>{score}</strong></div>
                <button
                  className="q-btn-primary"
                  disabled={!answered}
                  onClick={handleNext}
                  style={{ backgroundColor: answered ? activeSubject.color : "#cbd5e1" }}
                >
                  {currentQ < activeSubject.questions.length - 1 ? "Next Question" : "Finish Quiz"} →
                </button>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {activeSubject && finished && (
            <div className="q-result q-fade-in">
              <div className="q-result-card">
                <div className="q-result-icon">
                  {score >= activeSubject.questions.length * 0.8 ? "🏆" : score >= activeSubject.questions.length * 0.5 ? "⭐" : "📚"}
                </div>
                <div className="q-badge" style={{ margin: "0 auto 16px" }}>Quiz Complete</div>
                <h2 className="q-result-title">
                  {score >= activeSubject.questions.length * 0.8
                    ? "Outstanding Performance!"
                    : score >= activeSubject.questions.length * 0.5
                    ? "Good Effort!"
                    : "Room for Improvement"}
                </h2>
                <p className="q-result-desc">You completed the <strong>{activeSubject.name}</strong> quiz.</p>
                
                <div className="q-score-circle" style={{ borderColor: activeSubject.color }}>
                  <div className="q-score-number" style={{ color: activeSubject.color }}>{score}</div>
                  <div className="q-score-total">out of {activeSubject.questions.length}</div>
                </div>
                
                <p className="q-result-pct">Accuracy: {Math.round((score / activeSubject.questions.length) * 100)}%</p>
                
                <div className="q-result-actions">
                  <button className="q-btn-ghost" onClick={goBackToSubjects} style={{ border: "1px solid #e2e8f0" }}>
                    ← Browse Quizzes
                  </button>
                  <button className="q-btn-primary" onClick={() => startQuiz(activeSubject)} style={{ backgroundColor: activeSubject.color }}>
                    Try Again ↻
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .q-wrapper {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    min-height: 100vh;
    background-color: #f8fafc;
    color: #0f172a;
    display: flex;
    flex-direction: column;
  }

  .q-fade-in { animation: qFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes qFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Navbar */
  .q-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 48px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 100;
  }
  .q-brand { display: flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 800; color: #0f172a; cursor: pointer; letter-spacing: -0.5px; }
  .q-logo-icon { font-size: 24px; }
  .q-nav-links { display: flex; gap: 16px; align-items: center; }
  .q-btn-ghost {
    background: transparent; color: #64748b; border: none;
    padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
  }
  .q-btn-ghost:hover { background-color: #f1f5f9; color: #0f172a; }
  .q-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px;
  }

  /* Main Container */
  .q-main { flex: 1; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; }

  /* Header */
  .q-header { text-align: center; margin-bottom: 48px; max-width: 600px; }
  .q-badge {
    display: inline-block; padding: 6px 14px; border-radius: 20px;
    background-color: #e0e7ff; color: #4f46e5;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .q-header h1 { font-size: 40px; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
  .q-header p { font-size: 16px; color: #64748b; line-height: 1.6; }

  /* Subject Grid */
  .q-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px; width: 100%; max-width: 1000px;
  }
  .q-subject-card {
    background-color: #ffffff; border: 1px solid #e2e8f0;
    border-radius: 20px; padding: 32px;
    cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex; flex-direction: column; position: relative; overflow: hidden;
  }
  .q-subject-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08); border-color: var(--theme-color); }
  .q-subject-card::before {
    content: ''; position: absolute; top: 0; right: 0; width: 120px; height: 120px;
    background: radial-gradient(circle at top right, var(--theme-bg), transparent 70%);
    border-radius: 0 20px 0 100%; pointer-events: none;
  }
  .q-subject-icon-wrap {
    width: 64px; height: 64px; border-radius: 16px;
    background-color: var(--theme-bg); display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px; transition: transform 0.3s;
  }
  .q-subject-card:hover .q-subject-icon-wrap { transform: scale(1.05) rotate(-5deg); }
  .q-subject-icon { font-size: 32px; }
  .q-subject-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.3px; }
  .q-subject-desc { font-size: 14px; color: #64748b; flex: 1; }
  .q-subject-footer { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
  .q-start-link { font-size: 14px; font-weight: 700; color: var(--theme-color); transition: padding 0.2s; }
  .q-subject-card:hover .q-start-link { padding-left: 4px; }

  /* Active Quiz View */
  .q-active { width: 100%; max-width: 720px; margin: 0 auto; }
  
  .q-active-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
  .q-back-btn {
    background: #ffffff; border: 1px solid #e2e8f0; color: #475569;
    padding: 8px 16px; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: inherit;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .q-back-btn:hover { background: #f8fafc; color: #0f172a; transform: translateX(-2px); }
  .q-active-subject { font-size: 15px; font-weight: 700; display: flex; align-items: center; background: #ffffff; padding: 6px 16px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

  .q-progress-container { margin-bottom: 32px; }
  .q-progress-stats { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 12px; }
  .q-progress-pct { color: #0f172a; }
  .q-progress-bar { background-color: #e2e8f0; border-radius: 8px; height: 8px; overflow: hidden; }
  .q-progress-fill { height: 100%; border-radius: 8px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

  .q-question-card {
    background-color: #ffffff; border: 1px solid #e2e8f0;
    border-radius: 24px; padding: 40px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    margin-bottom: 24px;
  }
  .q-question-text { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.4; margin-bottom: 32px; letter-spacing: -0.5px; }

  .q-options-list { display: flex; flex-direction: column; gap: 12px; }
  .q-option {
    display: flex; align-items: center; padding: 16px 20px;
    background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px;
    cursor: pointer; transition: all 0.2s; position: relative;
  }
  .q-option:hover:not(.disabled) { border-color: #cbd5e1; background-color: #f8fafc; }
  .q-option.selected { border-color: #6366f1; background-color: #e0e7ff; }
  .q-option.selected .q-option-letter { background-color: #6366f1; color: #ffffff; border-color: #6366f1; }
  .q-option.correct { border-color: #10b981; background-color: #d1fae5; }
  .q-option.correct .q-option-letter { background-color: #10b981; color: #ffffff; border-color: #10b981; }
  .q-option.wrong { border-color: #ef4444; background-color: #fee2e2; }
  .q-option.wrong .q-option-letter { background-color: #ef4444; color: #ffffff; border-color: #ef4444; }
  .q-option.disabled { cursor: default; }

  .q-option-letter {
    width: 36px; height: 36px; border-radius: 10px; border: 1px solid #cbd5e1;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #64748b; margin-right: 16px;
    transition: all 0.2s; flex-shrink: 0; background-color: #ffffff;
  }
  .q-option-text { font-size: 16px; font-weight: 600; color: #334155; flex: 1; line-height: 1.5; }
  .q-option.correct .q-option-text { color: #065f46; }
  .q-option.wrong .q-option-text { color: #991b1b; }
  .q-option.selected .q-option-text { color: #3730a3; }
  
  .q-option-icon { font-size: 20px; font-weight: 800; }
  .q-option.correct .q-option-icon { color: #10b981; }
  .q-option.wrong .q-option-icon { color: #ef4444; }

  .q-actions-bar {
    display: flex; justify-content: space-between; align-items: center;
    background: #ffffff; padding: 20px 24px; border-radius: 16px;
    border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .q-score-live { font-size: 15px; color: #64748b; }
  .q-score-live strong { color: #0f172a; font-size: 18px; margin-left: 4px; }
  
  .q-btn-primary {
    padding: 14px 28px; border-radius: 12px; border: none;
    color: #ffffff; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; font-family: inherit;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .q-btn-primary:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  .q-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; box-shadow: none; }

  /* Results */
  .q-result { width: 100%; max-width: 500px; margin: 0 auto; }
  .q-result-card {
    background-color: #ffffff; border: 1px solid #e2e8f0;
    border-radius: 24px; padding: 48px 40px; text-align: center;
    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
  }
  .q-result-icon { font-size: 72px; margin-bottom: 24px; animation: bounce 1s ease; }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .q-result-title { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
  .q-result-desc { font-size: 16px; color: #64748b; margin-bottom: 32px; line-height: 1.5; }
  .q-result-desc strong { color: #0f172a; }
  
  .q-score-circle {
    width: 160px; height: 160px; border-radius: 50%;
    border: 8px solid; margin: 0 auto 24px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #ffffff; box-shadow: inset 0 4px 6px rgba(0,0,0,0.05);
  }
  .q-score-number { font-size: 56px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
  .q-score-total { font-size: 14px; font-weight: 600; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .q-result-pct { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 40px; }
  
  .q-result-actions { display: flex; flex-direction: column; gap: 12px; }
  .q-result-actions button { width: 100%; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }

  @media (max-width: 768px) {
    .q-nav { padding: 16px 20px; }
    .q-main { padding: 32px 16px; }
    .q-header h1 { font-size: 32px; }
    .q-subject-card { padding: 24px; }
    .q-question-card { padding: 24px; }
    .q-question-text { font-size: 20px; }
    .q-option { padding: 12px 16px; }
    .q-actions-bar { flex-direction: column; gap: 16px; text-align: center; }
    .q-actions-bar button { width: 100%; }
    .q-result-card { padding: 32px 24px; }
  }
`;
