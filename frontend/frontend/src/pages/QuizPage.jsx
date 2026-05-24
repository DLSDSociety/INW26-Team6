import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

// ─── QUIZ DATA ────────────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: "db",
    name: "Database Management",
    icon: "🗄️",
    color: "#4f46e5",
    shadowRgb: "79, 70, 229",
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
    shadowRgb: "245, 158, 11",
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
    shadowRgb: "239, 68, 68",
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
    shadowRgb: "16, 185, 129",
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
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: "📈",
    color: "#0ea5e9",
    shadowRgb: "14, 165, 233",
    questions: [
      { q: "What does ROI stand for?", options: ["Return on Investment", "Rate of Interest", "Risk of Inflation", "Ratio of Income"], answer: 0 },
      { q: "Which financial statement shows assets and liabilities?", options: ["Income Statement", "Balance Sheet", "Cash Flow Statement", "Retained Earnings"], answer: 1 },
      { q: "What is the accounting equation?", options: ["Assets = Liabilities - Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity"], answer: 1 },
      { q: "What does GDP stand for?", options: ["Gross Domestic Product", "General Debt Percentage", "Gross Deposit Profit", "Government Development Plan"], answer: 0 },
      { q: "Which term refers to the cost of borrowing money?", options: ["Principal", "Dividend", "Interest", "Collateral"], answer: 2 },
      { q: "What is inflation?", options: ["Decrease in prices", "Increase in the purchasing power of money", "General increase in prices and fall in purchasing value of money", "Stability of market value"], answer: 2 },
      { q: "What is a bull market?", options: ["A market with declining stock prices", "A market with rising stock prices", "A highly regulated market", "A stagnant market"], answer: 1 },
      { q: "What does CPA stand for in finance/accounting?", options: ["Certified Public Accountant", "Chief Port Analyst", "Corporate Profit Association", "Cash Payment Account"], answer: 0 },
      { q: "What is liquidity?", options: ["How quickly an asset can be converted into cash", "The total debt of a company", "The tax rate applied to earnings", "The volume of stock traded"], answer: 0 },
      { q: "Which document represents ownership in a corporation?", options: ["Bond", "Stock Share", "Invoice", "Promissory Note"], answer: 1 },
    ],
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    icon: "📢",
    color: "#f43f5e",
    shadowRgb: "244, 63, 94",
    questions: [
      { q: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Engagement Option", "Site Effectiveness Outline", "System Engine Operation"], answer: 0 },
      { q: "Which metric measures the percentage of clicks per impressions?", options: ["CTR (Click-Through Rate)", "CPC (Cost Per Click)", "ROI (Return on Investment)", "CPA (Cost Per Acquisition)"], answer: 0 },
      { q: "What does PPC stand for in online advertising?", options: ["Pay Per Click", "Price Per Customer", "Product Promotion Cost", "Pixel Position Control"], answer: 0 },
      { q: "Which platform is best suited for B2B professional networking?", options: ["Instagram", "LinkedIn", "TikTok", "Pinterest"], answer: 1 },
      { q: "What is a bounce rate?", options: ["The speed of page loading", "Percentage of visitors who leave after viewing only one page", "The rate of return purchases", "The frequency of email replies"], answer: 1 },
      { q: "What is email marketing segmentation?", options: ["Dividing an email list into smaller targeted groups", "Deleting inactive email accounts", "Translating emails into multiple languages", "Sending identical emails to everyone"], answer: 0 },
      { q: "What does CTA stand for on a landing page?", options: ["Call to Action", "Click to Analyze", "Customer Tracking Agent", "Content Topic Association"], answer: 0 },
      { q: "Which tool is commonly used to track website traffic and user behavior?", options: ["Google Analytics", "Adobe Photoshop", "Slack", "Visual Studio Code"], answer: 0 },
      { q: "What is viral marketing?", options: ["Marketing infected files", "A style that encourages people to pass on a marketing message to others", "Paying search engines for ads", "Creating long text-only newsletters"], answer: 1 },
      { q: "What is influencer marketing?", options: ["Using automated bots to spam links", "Partnering with popular social creators to promote products", "Cold-calling business executives", "Writing technical product documentation"], answer: 1 },
    ],
  },
  {
    id: "analytics",
    name: "Business Analytics",
    icon: "📊",
    color: "#f59e0b",
    shadowRgb: "245, 158, 11",
    questions: [
      { q: "What is the primary goal of business analytics?", options: ["Writing software applications", "Making data-driven decisions to optimize business processes", "Designing graphics", "Managing legal compliance"], answer: 1 },
      { q: "What is descriptive analytics?", options: ["Predicting future trends", "Summarizing historical data to understand what happened", "Recommending action steps", "Debugging computer code"], answer: 1 },
      { q: "Which chart is best for showing a trend over time?", options: ["Pie Chart", "Line Chart", "Scatter Plot", "Bar Chart"], answer: 1 },
      { q: "What is predictive analytics?", options: ["Analyzing past records only", "Using statistical models to forecast future outcomes", "Automating payroll", "Encrypting database tables"], answer: 1 },
      { q: "What does KPI stand for?", options: ["Key Performance Indicator", "Key Profit Interest", "Knowledge Process Integration", "Kernel Programming Interface"], answer: 0 },
      { q: "What is a pivot table used for?", options: ["Drawing animated vector lines", "Summarizing and analyzing large datasets", "Sending bulk emails", "Connecting network servers"], answer: 1 },
      { q: "What is prescriptive analytics?", options: ["Describing past events", "Recommending specific courses of action based on predictions", "Configuring operating systems", "Validating form fields"], answer: 1 },
      { q: "Which statistical measure represents the middle value in a sorted dataset?", options: ["Mean", "Median", "Mode", "Variance"], answer: 1 },
      { q: "What does ROI measure in business analytics?", options: ["Return on Investment efficiency", "Rate of Interest over time", "Ratio of Information input", "Role of Instructor interaction"], answer: 0 },
      { q: "What is data mining?", options: ["Deleting duplicate columns", "Discovering patterns in large datasets", "Backing up server storage", "Creating relational database keys"], answer: 1 },
    ],
  },
  {
    id: "leadership",
    name: "Leadership & Strategy",
    icon: "👑",
    color: "#8b5cf6",
    shadowRgb: "139, 92, 246",
    questions: [
      { q: "What is a SWOT analysis?", options: ["System Wide Operating Technology", "Strengths, Weaknesses, Opportunities, Threats", "Sales, Wealth, Organization, Taxes", "Service Work Order Tracking"], answer: 1 },
      { q: "Which leadership style is highly collaborative and involves team input?", options: ["Autocratic", "Democratic/Participative", "Laissez-faire", "Bureaucratic"], answer: 1 },
      { q: "What is organizational culture?", options: ["The server infrastructure of a company", "Shared values, beliefs, and behaviors within an organization", "The legal compliance document", "The salary payout system"], answer: 1 },
      { q: "What does IQ vs EQ mean in leadership?", options: ["EQ (Emotional Quotient) is often critical for understanding and leading people", "IQ measures emotional resilience", "Leaders only need high IQ", "EQ stands for Executive Quality"], answer: 0 },
      { q: "What is the primary difference between a manager and a leader?", options: ["Managers manage resources, leaders inspire and guide people", "Leaders only deal with finance", "Managers are always higher rank", "There is no difference"], answer: 0 },
      { q: "What is conflict resolution?", options: ["Firing anyone who disagrees", "Facilitating a peaceful solution to a disagreement", "Deleting log files", "Upgrading product licenses"], answer: 1 },
      { q: "What is strategic planning?", options: ["Day-to-day bug fixing", "Setting long-term goals and determining actions to achieve them", "Reviewing weekly payroll", "Sending cold emails"], answer: 1 },
      { q: "What is delegation in leadership?", options: ["Doing all the work yourself", "Assigning responsibility and authority to others", "Firing team members", "Reporting to stakeholders only"], answer: 1 },
      { q: "What does micro-management usually lead to?", options: ["High employee morale and productivity", "Reduced trust, stress, and lower employee morale", "Better code speed", "Free marketing"], answer: 1 },
      { q: "What is active listening?", options: ["Listening while running", "Fully concentrating, understanding, responding, and remembering what is said", "Ignoring team feedback", "Recording sound clips"], answer: 1 },
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
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(null);

  const startQuiz = async (subject) => {
    setLoadingQuiz(true);
    setQuizError(null);
    try {
      const res = await api.post("/api/assessments/generate-quiz/", { subject: subject.id });
      
      setActiveSubject({
        ...subject,
        questions: res.data.questions
      });
      setCurrentQ(0);
      setSelectedOption(null);
      setAnswered(false);
      setScore(0);
      setFinished(false);
    } catch (err) {
      console.error("Failed to generate AI quiz, falling back:", err);
      // Fallback offline mode
      setActiveSubject(subject);
      setCurrentQ(0);
      setSelectedOption(null);
      setAnswered(false);
      setScore(0);
      setFinished(false);
    } finally {
      setLoadingQuiz(false);
    }
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
          {/* ── AI Loading State ── */}
          {loadingQuiz && (
            <div className="q-loading-container q-fade-in">
              <div className="q-loading-card">
                <div className="q-loading-brain">🧠</div>
                <div className="q-loading-spinner-wrap">
                  <div className="q-loading-spinner"></div>
                </div>
                <h2>AI is Crafting Your Quiz...</h2>
                <p>Generating 10 fresh, highly relevant multiple-choice questions for you.</p>
                <div className="q-loading-hints">
                  <span className="q-hint-badge">⚡ Powered by OpenRouter AI</span>
                  <span className="q-hint-badge">🎯 Unique Questions Every Time</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Subject Selection ── */}
          {!loadingQuiz && !activeSubject && (
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
                    style={{ "--theme-color": s.color, "--theme-bg": s.color + "15", "--theme-shadow-rgb": s.shadowRgb }}
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
          {!loadingQuiz && activeSubject && !finished && (
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
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .q-wrapper {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    min-height: 100vh;
    background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%),
                #f8fafc;
    color: #0f172a;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  .q-fade-in { animation: qFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
  @keyframes qFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Navbar ── */
  .q-nav {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 48px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  }
  .q-brand { display: flex; align-items: center; gap: 10px; font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; cursor: pointer; letter-spacing: -0.5px; }
  .q-logo-icon { font-size: 26px; filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2)); }
  .q-nav-links { display: flex; gap: 16px; align-items: center; }
  
  .q-btn-ghost {
    background: transparent; color: #64748b; border: 1px solid transparent;
    padding: 8px 18px; border-radius: 10px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.25s ease; font-family: inherit;
  }
  .q-btn-ghost:hover { background-color: rgba(99, 102, 241, 0.08); color: #6366f1; border-color: rgba(99, 102, 241, 0.1); }
  
  .q-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px; border: 2px solid #ffffff;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
  }

  /* ── Main Container ── */
  .q-main { flex: 1; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; }

  /* ── Header ── */
  .q-header { text-align: center; margin-bottom: 54px; max-width: 600px; }
  
  .q-badge {
    display: inline-block; padding: 6px 16px; border-radius: 20px;
    background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1));
    color: #6366f1; border: 1px solid rgba(99,102,241,0.15);
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    margin-bottom: 20px;
  }
  
  .q-header h1 { font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800; color: #0f172a; letter-spacing: -1.5px; margin-bottom: 18px; line-height: 1.1; }
  .q-header p { font-size: 16px; color: #64748b; line-height: 1.6; }

  /* ── Subject Grid ── */
  .q-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
    gap: 28px; width: 100%; max-width: 1000px;
  }
  
  .q-subject-card {
    background-color: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 24px; padding: 36px;
    cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex; flex-direction: column; position: relative; overflow: hidden;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
  }
  
  .q-subject-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px -12px rgba(var(--theme-shadow-rgb), 0.15), 0 8px 16px -8px rgba(var(--theme-shadow-rgb), 0.1);
    border-color: var(--theme-color);
  }
  
  .q-subject-card::before {
    content: ''; position: absolute; top: 0; right: 0; width: 140px; height: 140px;
    background: radial-gradient(circle at top right, var(--theme-bg), transparent 75%);
    border-radius: 0 24px 0 100%; pointer-events: none;
  }
  
  .q-subject-icon-wrap {
    width: 68px; height: 68px; border-radius: 18px;
    background-color: var(--theme-bg); display: flex; align-items: center; justify-content: center;
    margin-bottom: 28px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(255, 255, 255, 0.6);
  }
  
  .q-subject-card:hover .q-subject-icon-wrap { transform: scale(1.1) rotate(-6deg); }
  .q-subject-icon { font-size: 34px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }
  .q-subject-title { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 10px; letter-spacing: -0.3px; }
  .q-subject-desc { font-size: 14px; color: #64748b; flex: 1; line-height: 1.5; }
  
  .q-subject-footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; }
  .q-start-link { font-size: 14px; font-weight: 700; color: var(--theme-color); transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 4px; }
  .q-subject-card:hover .q-start-link { gap: 8px; filter: brightness(0.9); }

  /* ── Active Quiz View ── */
  .q-active { width: 100%; max-width: 720px; margin: 0 auto; }
  
  .q-active-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
  
  .q-back-btn {
    background: #ffffff; border: 1px solid #e2e8f0; color: #475569;
    padding: 10px 20px; border-radius: 14px; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.25s; font-family: inherit;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .q-back-btn:hover { background: #f8fafc; color: #0f172a; transform: translateX(-3px); border-color: #cbd5e1; }
  
  .q-active-subject {
    font-size: 14px; font-weight: 700; display: flex; align-items: center;
    background: #ffffff; padding: 8px 18px; border-radius: 20px;
    border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .q-progress-container { margin-bottom: 36px; }
  .q-progress-stats { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #475569; margin-bottom: 12px; }
  .q-progress-pct { color: #0f172a; }
  
  .q-progress-bar { background-color: #e2e8f0; border-radius: 12px; height: 10px; overflow: hidden; padding: 1px; }
  .q-progress-fill { height: 100%; border-radius: 12px; transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1); }

  .q-question-card {
    background-color: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 30px; padding: 48px;
    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.01);
    margin-bottom: 28px;
  }
  
  .q-question-text { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.4; margin-bottom: 36px; letter-spacing: -0.5px; }

  .q-options-list { display: flex; flex-direction: column; gap: 14px; }
  
  .q-option {
    display: flex; align-items: center; padding: 18px 24px;
    background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 18px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
  }
  
  .q-option:hover:not(.disabled) { border-color: #6366f1; background-color: rgba(99,102,241,0.02); transform: translateX(4px); }
  
  .q-option.selected { border-color: #6366f1; background-color: #f5f3ff; }
  .q-option.selected .q-option-letter { background-color: #6366f1; color: #ffffff; border-color: #6366f1; }
  
  .q-option.correct { border-color: #10b981; background: linear-gradient(135deg, #f0fdf4, #d1fae5); }
  .q-option.correct .q-option-letter { background-color: #10b981; color: #ffffff; border-color: #10b981; }
  
  .q-option.wrong { border-color: #ef4444; background: linear-gradient(135deg, #fef2f2, #fee2e2); }
  .q-option.wrong .q-option-letter { background-color: #ef4444; color: #ffffff; border-color: #ef4444; }
  .q-option.disabled { cursor: default; }

  .q-option-letter {
    width: 38px; height: 38px; border-radius: 12px; border: 2px solid #cbd5e1;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; color: #64748b; margin-right: 18px;
    transition: all 0.2s; flex-shrink: 0; background-color: #ffffff;
  }
  
  .q-option-text { font-size: 16px; font-weight: 600; color: #334155; flex: 1; line-height: 1.5; }
  .q-option.correct .q-option-text { color: #065f46; }
  .q-option.wrong .q-option-text { color: #991b1b; }
  .q-option.selected .q-option-text { color: #4c1d95; }
  
  .q-option-icon {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: white;
  }
  .q-option.correct .q-option-icon { background-color: #10b981; content: '✓'; }
  .q-option.wrong .q-option-icon { background-color: #ef4444; content: '✕'; }

  .q-actions-bar {
    display: flex; justify-content: space-between; align-items: center;
    background: #ffffff; padding: 22px 32px; border-radius: 20px;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
  }
  
  .q-score-live { font-size: 15px; color: #64748b; font-weight: 500; }
  .q-score-live strong { color: #0f172a; font-size: 19px; margin-left: 6px; font-weight: 800; }
  
  .q-btn-primary {
    padding: 14px 32px; border-radius: 14px; border: none;
    color: #ffffff; font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.25s ease; font-family: inherit;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
  .q-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
  .q-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

  /* ── Results ── */
  .q-result { width: 100%; max-width: 520px; margin: 0 auto; }
  
  .q-result-card {
    background-color: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8);
    border-radius: 30px; padding: 54px 44px; text-align: center;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.06);
  }
  
  .q-result-icon { font-size: 80px; margin-bottom: 28px; animation: bounce 1s ease infinite alternate; }
  @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }
  
  .q-result-title { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
  .q-result-desc { font-size: 16px; color: #64748b; margin-bottom: 36px; line-height: 1.5; }
  .q-result-desc strong { color: #0f172a; }
  
  .q-score-circle {
    width: 170px; height: 170px; border-radius: 50%;
    border: 10px solid; margin: 0 auto 28px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: #ffffff; box-shadow: inset 0 4px 10px rgba(0,0,0,0.03), 0 10px 20px -5px rgba(0,0,0,0.05);
  }
  .q-score-number { font-family: 'Outfit', sans-serif; font-size: 60px; font-weight: 800; line-height: 1; letter-spacing: -2px; }
  .q-score-total { font-size: 13px; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 1.5px; }
  .q-result-pct { font-size: 19px; font-weight: 800; color: #0f172a; margin-bottom: 40px; }
  
  .q-result-actions { display: flex; flex-direction: column; gap: 14px; }
  .q-result-actions button { width: 100%; padding: 15px; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.25s; font-family: inherit; }

  /* 🧠 AI Loading Styles */
  .q-loading-container { display: flex; align-items: center; justify-content: center; min-height: 50vh; width: 100%; max-width: 500px; margin: 0 auto; }
  .q-loading-card { background: #ffffff; border: 1px solid rgba(226,232,240,0.8); border-radius: 30px; padding: 48px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.06); width: 100%; }
  
  .q-loading-brain { font-size: 72px; margin-bottom: 24px; animation: pulseBrain 1.5s infinite alternate ease-in-out; }
  @keyframes pulseBrain { from { transform: scale(1); filter: drop-shadow(0 0 0px rgba(99,102,241,0)); } to { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(99,102,241,0.3)); } }
  
  .q-loading-spinner-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
  .q-loading-spinner { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s infinite linear; }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  .q-loading-card h2 { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
  .q-loading-card p { font-size: 15px; color: #64748b; margin-bottom: 30px; line-height: 1.5; }
  
  .q-loading-hints { display: flex; flex-direction: column; gap: 10px; align-items: center; }
  .q-hint-badge { display: inline-block; padding: 6px 14px; border-radius: 12px; background: rgba(99,102,241,0.06); color: #6366f1; font-size: 12px; font-weight: 700; border: 1px solid rgba(99,102,241,0.1); }

  @media (max-width: 768px) {
    .q-nav { padding: 16px 24px; }
    .q-main { padding: 36px 16px; }
    .q-header h1 { font-size: 34px; }
    .q-subject-card { padding: 28px; }
    .q-question-card { padding: 28px; }
    .q-question-text { font-size: 22px; }
    .q-option { padding: 14px 20px; }
    .q-actions-bar { flex-direction: column; gap: 16px; text-align: center; }
    .q-actions-bar button { width: 100%; }
    .q-result-card { padding: 36px 24px; }
  }
`;
