import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: "db",
    name: "Database Management",
    icon: "🗄️",
    color: "#6c63ff",
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
    color: "#f39c12",
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
    color: "#e74c3c",
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
    color: "#27ae60",
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

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .quiz-page {
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #24243e 100%);
    color: #e4e8f0;
  }

  /* Navbar */
  .quiz-navbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 48px;
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .quiz-brand { font-size: 22px; font-weight: 800; color: #6c63ff; cursor: pointer; }
  .quiz-nav-links { display: flex; gap: 12px; align-items: center; }
  .quiz-nav-btn {
    background: transparent; color: #aaa; border: 1px solid rgba(255,255,255,0.1);
    padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .quiz-nav-btn:hover { border-color: #6c63ff; color: #fff; }

  /* Header */
  .quiz-header {
    text-align: center; padding: 48px 24px 32px;
  }
  .quiz-header h1 {
    font-size: 36px; font-weight: 800; margin-bottom: 8px;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .quiz-header p { color: #888; font-size: 16px; }

  /* Subject Grid */
  .quiz-subjects-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; max-width: 1100px; margin: 0 auto; padding: 0 48px 60px;
  }
  .quiz-subject-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 32px 24px;
    text-align: center; cursor: pointer;
    transition: all 0.25s ease;
    position: relative; overflow: hidden;
  }
  .quiz-subject-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, var(--card-color) 0%, transparent 70%);
    opacity: 0.08; transition: opacity 0.25s;
  }
  .quiz-subject-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4);
    border-color: rgba(255,255,255,0.15);
  }
  .quiz-subject-card:hover::before { opacity: 0.15; }
  .quiz-subject-icon { font-size: 48px; margin-bottom: 16px; }
  .quiz-subject-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .quiz-subject-info { font-size: 13px; color: #888; }
  .quiz-subject-badge {
    display: inline-block; margin-top: 16px;
    padding: 6px 16px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
    background: rgba(108,99,255,0.15); color: #6c63ff;
  }

  /* Quiz Active View */
  .quiz-active {
    max-width: 700px; margin: 0 auto; padding: 0 24px 60px;
  }
  .quiz-progress-bar {
    background: rgba(255,255,255,0.06);
    border-radius: 8px; height: 6px; margin-bottom: 32px; overflow: hidden;
  }
  .quiz-progress-fill {
    height: 100%; border-radius: 8px;
    background: linear-gradient(90deg, #6c63ff, #a855f7);
    transition: width 0.4s ease;
  }
  .quiz-question-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 32px;
    animation: qFadeIn 0.3s ease;
  }
  @keyframes qFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  .quiz-q-num { font-size: 12px; font-weight: 700; color: #6c63ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .quiz-q-text { font-size: 20px; font-weight: 700; color: #fff; line-height: 1.5; margin-bottom: 24px; }
  .quiz-options { display: flex; flex-direction: column; gap: 10px; }
  .quiz-option {
    display: flex; align-items: center; gap: 14px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 14px 18px;
    cursor: pointer; transition: all 0.2s; font-size: 15px; color: #ccc;
  }
  .quiz-option:hover:not(.disabled) { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.3); color: #fff; }
  .quiz-option.selected { background: rgba(108,99,255,0.15); border-color: #6c63ff; color: #fff; }
  .quiz-option.correct { background: rgba(39,174,96,0.15); border-color: #27ae60; color: #27ae60; }
  .quiz-option.wrong { background: rgba(231,76,60,0.15); border-color: #e74c3c; color: #e74c3c; }
  .quiz-option.disabled { cursor: default; opacity: 0.7; }
  .quiz-option-letter {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; flex-shrink: 0;
    background: rgba(255,255,255,0.06); color: #aaa;
  }
  .quiz-option.selected .quiz-option-letter { background: #6c63ff; color: #fff; }
  .quiz-option.correct .quiz-option-letter { background: #27ae60; color: #fff; }
  .quiz-option.wrong .quiz-option-letter { background: #e74c3c; color: #fff; }
  .quiz-actions {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 24px; gap: 12px;
  }
  .quiz-btn {
    padding: 10px 24px; border-radius: 10px; border: none;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .quiz-btn-primary { background: #6c63ff; color: #fff; }
  .quiz-btn-primary:hover { background: #5a52e0; }
  .quiz-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .quiz-btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #aaa; }
  .quiz-btn-ghost:hover { border-color: #6c63ff; color: #fff; }

  /* Result */
  .quiz-result {
    text-align: center;
    animation: qFadeIn 0.4s ease;
  }
  .quiz-result-icon { font-size: 64px; margin-bottom: 16px; }
  .quiz-result h2 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
  .quiz-result p { color: #888; font-size: 15px; margin-bottom: 8px; }
  .quiz-score-big {
    font-size: 56px; font-weight: 800; margin: 20px 0;
    background: linear-gradient(135deg, #6c63ff, #a855f7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .quiz-result-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }

  @media (max-width: 768px) {
    .quiz-navbar { padding: 14px 20px; }
    .quiz-header h1 { font-size: 26px; }
    .quiz-subjects-grid { padding: 0 20px 40px; grid-template-columns: 1fr; }
    .quiz-active { padding: 0 16px 40px; }
    .quiz-question-card { padding: 20px; }
    .quiz-q-text { font-size: 17px; }
  }
`;

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
      <div className="quiz-page">

        {/* Navbar */}
        <nav className="quiz-navbar">
          <div className="quiz-brand" onClick={() => navigate("/")}>Learning Hub</div>
          <div className="quiz-nav-links">
            <button className="quiz-nav-btn" onClick={() => navigate("/")}>Home</button>
            <button className="quiz-nav-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
          </div>
        </nav>

        {/* ── Subject Selection ── */}
        {!activeSubject && (
          <>
            <div className="quiz-header">
              <h1>🧠 Quiz Arena</h1>
              <p>Test your knowledge across popular IT subjects</p>
            </div>
            <div className="quiz-subjects-grid">
              {SUBJECTS.map((s) => (
                <div
                  key={s.id}
                  className="quiz-subject-card"
                  style={{ "--card-color": s.color }}
                  onClick={() => startQuiz(s)}
                >
                  <div className="quiz-subject-icon">{s.icon}</div>
                  <div className="quiz-subject-name">{s.name}</div>
                  <div className="quiz-subject-info">{s.questions.length} questions</div>
                  <div className="quiz-subject-badge">Start Quiz →</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Active Quiz ── */}
        {activeSubject && !finished && (
          <div className="quiz-active">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 12px" }}>
              <button className="quiz-btn quiz-btn-ghost" onClick={goBackToSubjects}>← Back</button>
              <span style={{ fontSize: "14px", color: "#888" }}>
                {activeSubject.icon} {activeSubject.name}
              </span>
              <span style={{ fontSize: "14px", color: "#6c63ff", fontWeight: 600 }}>
                {currentQ + 1} / {activeSubject.questions.length}
              </span>
            </div>

            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>

            <div className="quiz-question-card" key={currentQ}>
              <div className="quiz-q-num">Question {currentQ + 1}</div>
              <div className="quiz-q-text">{question.q}</div>

              <div className="quiz-options">
                {question.options.map((opt, i) => {
                  let cls = "quiz-option";
                  if (answered) cls += " disabled";
                  if (answered && i === question.answer) cls += " correct";
                  else if (answered && i === selectedOption && i !== question.answer) cls += " wrong";
                  else if (!answered && i === selectedOption) cls += " selected";
                  return (
                    <div key={i} className={cls} onClick={() => handleSelect(i)}>
                      <span className="quiz-option-letter">{letters[i]}</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              <div className="quiz-actions">
                <span style={{ fontSize: "14px", color: "#888" }}>
                  Score: {score} / {currentQ + (answered ? 1 : 0)}
                </span>
                <button
                  className="quiz-btn quiz-btn-primary"
                  disabled={!answered}
                  onClick={handleNext}
                >
                  {currentQ < activeSubject.questions.length - 1 ? "Next Question →" : "See Results"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {activeSubject && finished && (
          <div className="quiz-active">
            <div className="quiz-question-card quiz-result">
              <div className="quiz-result-icon">
                {score >= activeSubject.questions.length * 0.8 ? "🏆" : score >= activeSubject.questions.length * 0.5 ? "🎯" : "📚"}
              </div>
              <h2>
                {score >= activeSubject.questions.length * 0.8
                  ? "Excellent Work!"
                  : score >= activeSubject.questions.length * 0.5
                  ? "Good Job!"
                  : "Keep Practicing!"}
              </h2>
              <p>{activeSubject.icon} {activeSubject.name}</p>
              <div className="quiz-score-big">{score}/{activeSubject.questions.length}</div>
              <p>You scored {Math.round((score / activeSubject.questions.length) * 100)}%</p>
              <div className="quiz-result-actions">
                <button className="quiz-btn quiz-btn-ghost" onClick={goBackToSubjects}>All Quizzes</button>
                <button className="quiz-btn quiz-btn-primary" onClick={() => startQuiz(activeSubject)}>Retry Quiz</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
