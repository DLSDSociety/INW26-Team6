import os
import json
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

# Standard fallback offline questions in case of API limits or outages
FALLBACK_QUIZZES = {
    "db": [
      { "q": "What does SQL stand for?", "options": ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], "answer": 0 },
      { "q": "Which SQL clause is used to filter records?", "options": ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], "answer": 2 },
      { "q": "What is a primary key?", "options": ["A key that can be null", "A unique identifier for a record", "A foreign reference", "An index column"], "answer": 1 },
      { "q": "Which normal form eliminates partial dependencies?", "options": ["1NF", "2NF", "3NF", "BCNF"], "answer": 1 },
      { "q": "What does ACID stand for in databases?", "options": ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Data", "Atomicity, Control, Isolation, Data", "Access, Consistency, Index, Durability"], "answer": 0 },
      { "q": "Which JOIN returns all rows from both tables?", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], "answer": 3 },
      { "q": "What is a foreign key?", "options": ["A primary key in another table", "A field that links to a primary key of another table", "An encrypted key", "A composite key"], "answer": 1 },
      { "q": "Which command is used to remove a table from a database?", "options": ["DELETE TABLE", "REMOVE TABLE", "DROP TABLE", "CLEAR TABLE"], "answer": 2 },
      { "q": "What is normalization in databases?", "options": ["Encrypting data", "Organizing data to reduce redundancy", "Backing up data", "Compressing data"], "answer": 1 },
      { "q": "Which SQL function returns the number of rows?", "options": ["SUM()", "COUNT()", "TOTAL()", "NUM()"], "answer": 1 }
    ],
    "ai": [
      { "q": "What is the Turing Test used to evaluate?", "options": ["Speed of a computer", "A machine's ability to exhibit intelligent behavior", "Memory capacity", "Network latency"], "answer": 1 },
      { "q": "Which algorithm is commonly used for classification problems?", "options": ["Linear Regression", "K-Means", "Decision Tree", "PCA"], "answer": 2 },
      { "q": "What does NLP stand for?", "options": ["New Language Processing", "Natural Language Processing", "Neural Logic Programming", "Network Layer Protocol"], "answer": 1 },
      { "q": "Which is NOT a type of machine learning?", "options": ["Supervised", "Unsupervised", "Reinforcement", "Compulsory"], "answer": 3 },
      { "q": "What is a neural network inspired by?", "options": ["Computer circuits", "The human brain", "Blockchain", "Cloud computing"], "answer": 1 },
      { "q": "What is overfitting in machine learning?", "options": ["Model performs well on training but poorly on new data", "Model is too simple", "Model runs too slowly", "Model uses too little data"], "answer": 0 },
      { "q": "What does CNN stand for in deep learning?", "options": ["Computer Neural Network", "Convolutional Neural Network", "Connected Node Network", "Centralized Neuron Network"], "answer": 1 },
      { "q": "Which is a popular Python library for machine learning?", "options": ["Django", "Flask", "scikit-learn", "Pygame"], "answer": 2 },
      { "q": "What is the purpose of an activation function?", "options": ["To store data", "To introduce non-linearity", "To connect to database", "To format output"], "answer": 1 },
      { "q": "What is reinforcement learning based on?", "options": ["Labeled data", "Reward and punishment", "Clustering", "Dimensionality reduction"], "answer": 1 }
    ],
    "java": [
      { "q": "Which keyword is used to create a class in Java?", "options": ["struct", "class", "object", "define"], "answer": 1 },
      { "q": "Java is a ___ language.", "options": ["Procedural", "Functional", "Object-Oriented", "Markup"], "answer": 2 },
      { "q": "Which method is the entry point of a Java program?", "options": ["start()", "init()", "main()", "run()"], "answer": 2 },
      { "q": "What is the default value of an int variable in Java?", "options": ["null", "0", "1", "undefined"], "answer": 1 },
      { "q": "Which keyword is used to inherit a class?", "options": ["implements", "inherits", "extends", "super"], "answer": 2 },
      { "q": "What is JVM?", "options": ["Java Virtual Machine", "Java Variable Manager", "Java Version Manager", "Java Visual Mode"], "answer": 0 },
      { "q": "Which collection does NOT allow duplicate elements?", "options": ["ArrayList", "LinkedList", "HashSet", "Vector"], "answer": 2 },
      { "q": "What is the size of an int in Java?", "options": ["2 bytes", "4 bytes", "8 bytes", "16 bytes"], "answer": 1 },
      { "q": "Which exception is thrown when dividing by zero?", "options": ["NullPointerException", "ArithmeticException", "IOException", "ClassNotFoundException"], "answer": 1 },
      { "q": "What does the 'final' keyword do in Java?", "options": ["Makes a variable constant", "Ends the program", "Closes a file", "Starts garbage collection"], "answer": 0 }
    ],
    "python": [
      { "q": "Which keyword is used to define a function in Python?", "options": ["func", "function", "def", "define"], "answer": 2 },
      { "q": "What is the output of print(type([]))?", "options": ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], "answer": 1 },
      { "q": "Which data structure uses key-value pairs?", "options": ["List", "Tuple", "Set", "Dictionary"], "answer": 3 },
      { "q": "How do you start a comment in Python?", "options": ["//", "/*", "#", "--"], "answer": 2 },
      { "q": "What is PEP 8?", "options": ["A Python library", "Python style guide", "A Python IDE", "A Python version"], "answer": 1 },
      { "q": "Which of these is immutable in Python?", "options": ["List", "Dictionary", "Set", "Tuple"], "answer": 3 },
      { "q": "What does 'len()' function do?", "options": ["Returns the type", "Returns the length", "Returns the last element", "Deletes an element"], "answer": 1 },
      { "q": "Which library is used for data analysis in Python?", "options": ["NumPy", "Pandas", "Both NumPy and Pandas", "Tkinter"], "answer": 2 },
      { "q": "What is a lambda function?", "options": ["A named function", "An anonymous function", "A recursive function", "A generator function"], "answer": 1 },
      { "q": "What does 'pip' stand for?", "options": ["Python Install Package", "Pip Installs Packages", "Python Index Program", "Package in Python"], "answer": 1 }
    ],
    "finance": [
      { "q": "What does ROI stand for?", "options": ["Return on Investment", "Rate of Interest", "Risk of Inflation", "Ratio of Income"], "answer": 0 },
      { "q": "Which financial statement shows assets and liabilities?", "options": ["Income Statement", "Balance Sheet", "Cash Flow Statement", "Retained Earnings"], "answer": 1 },
      { "q": "What is the accounting equation?", "options": ["Assets = Liabilities - Equity", "Assets = Liabilities + Equity", "Equity = Assets + Liabilities", "Liabilities = Assets + Equity"], "answer": 1 },
      { "q": "What does GDP stand for?", "options": ["Gross Domestic Product", "General Debt Percentage", "Gross Deposit Profit", "Government Development Plan"], "answer": 0 },
      { "q": "Which term refers to the cost of borrowing money?", "options": ["Principal", "Dividend", "Interest", "Collateral"], "answer": 2 },
      { "q": "What is inflation?", "options": ["Decrease in prices", "Increase in the purchasing power of money", "General increase in prices and fall in purchasing value of money", "Stability of market value"], "answer": 2 },
      { "q": "What is a bull market?", "options": ["A market with declining stock prices", "A market with rising stock prices", "A highly regulated market", "A stagnant market"], "answer": 1 },
      { "q": "What does CPA stand for in finance/accounting?", "options": ["Certified Public Accountant", "Chief Port Analyst", "Corporate Profit Association", "Cash Payment Account"], "answer": 0 },
      { "q": "What is liquidity?", "options": ["How quickly an asset can be converted into cash", "The total debt of a company", "The tax rate applied to earnings", "The volume of stock traded"], "answer": 0 },
      { "q": "Which document represents ownership in a corporation?", "options": ["Bond", "Stock Share", "Invoice", "Promissory Note"], "answer": 1 }
    ],
    "marketing": [
      { "q": "What does SEO stand for?", "options": ["Search Engine Optimization", "Social Engagement Option", "Site Effectiveness Outline", "System Engine Operation"], "answer": 0 },
      { "q": "Which metric measures the percentage of clicks per impressions?", "options": ["CTR (Click-Through Rate)", "CPC (Cost Per Click)", "ROI (Return on Investment)", "CPA (Cost Per Acquisition)"], "answer": 0 },
      { "q": "What does PPC stand for in online advertising?", "options": ["Pay Per Click", "Price Per Customer", "Product Promotion Cost", "Pixel Position Control"], "answer": 0 },
      { "q": "Which platform is best suited for B2B professional networking?", "options": ["Instagram", "LinkedIn", "TikTok", "Pinterest"], "answer": 1 },
      { "q": "What is a bounce rate?", "options": ["The speed of page loading", "Percentage of visitors who leave after viewing only one page", "The rate of return purchases", "The frequency of email replies"], "answer": 1 },
      { "q": "What is email marketing segmentation?", "options": ["Dividing an email list into smaller targeted groups", "Deleting inactive email accounts", "Translating emails into multiple languages", "Sending identical emails to everyone"], "answer": 0 },
      { "q": "What does CTA stand for on a landing page?", "options": ["Call to Action", "Click to Analyze", "Customer Tracking Agent", "Content Topic Association"], "answer": 0 },
      { "q": "Which tool is commonly used to track website traffic and user behavior?", "options": ["Google Analytics", "Adobe Photoshop", "Slack", "Visual Studio Code"], "answer": 0 },
      { "q": "What is viral marketing?", "options": ["Marketing infected files", "A style that encourages people to pass on a marketing message to others", "Paying search engines for ads", "Creating long text-only newsletters"], "answer": 1 },
      { "q": "What is influencer marketing?", "options": ["Using automated bots to spam links", "Partnering with popular social creators to promote products", "Cold-calling business executives", "Writing technical product documentation"], "answer": 1 }
    ],
    "analytics": [
      { "q": "What is the primary goal of business analytics?", "options": ["Writing software applications", "Making data-driven decisions to optimize business processes", "Designing graphics", "Managing legal compliance"], "answer": 1 },
      { "q": "What is descriptive analytics?", "options": ["Predicting future trends", "Summarizing historical data to understand what happened", "Recommending action steps", "Debugging computer code"], "answer": 1 },
      { "q": "Which chart is best for showing a trend over time?", "options": ["Pie Chart", "Line Chart", "Scatter Plot", "Bar Chart"], "answer": 1 },
      { "q": "What is predictive analytics?", "options": ["Analyzing past records only", "Using statistical models to forecast future outcomes", "Automating payroll", "Encrypting database tables"], "answer": 1 },
      { "q": "What does KPI stand for?", "options": ["Key Performance Indicator", "Key Profit Interest", "Knowledge Process Integration", "Kernel Programming Interface"], "answer": 0 },
      { "q": "What is a pivot table used for?", "options": ["Drawing animated vector lines", "Summarizing and analyzing large datasets", "Sending bulk emails", "Connecting network servers"], "answer": 1 },
      { "q": "What is prescriptive analytics?", "options": ["Describing past events", "Recommending specific courses of action based on predictions", "Configuring operating systems", "Validating form fields"], "answer": 1 },
      { "q": "Which statistical measure represents the middle value in a sorted dataset?", "options": ["Mean", "Median", "Mode", "Variance"], "answer": 1 },
      { "q": "What does ROI measure in business analytics?", "options": ["Return on Investment efficiency", "Rate of Interest over time", "Ratio of Information input", "Role of Instructor interaction"], "answer": 0 },
      { "q": "What is data mining?", "options": ["Deleting duplicate columns", "Discovering patterns in large datasets", "Backing up server storage", "Creating relational database keys"], "answer": 1 }
    ],
    "leadership": [
      { "q": "What is a SWOT analysis?", "options": ["System Wide Operating Technology", "Strengths, Weaknesses, Opportunities, Threats", "Sales, Wealth, Organization, Taxes", "Service Work Order Tracking"], "answer": 1 },
      { "q": "Which leadership style is highly collaborative and involves team input?", "options": ["Autocratic", "Democratic/Participative", "Laissez-faire", "Bureaucratic"], "answer": 1 },
      { "q": "What is organizational culture?", "options": ["The server infrastructure of a company", "Shared values, beliefs, and behaviors within an organization", "The legal compliance document", "The salary payout system"], "answer": 1 },
      { "q": "What does IQ vs EQ mean in leadership?", "options": ["EQ (Emotional Quotient) is often critical for understanding and leading people", "IQ measures emotional resilience", "Leaders only need high IQ", "EQ stands for Executive Quality"], "answer": 0 },
      { "q": "What is the primary difference between a manager and a leader?", "options": ["Managers manage resources, leaders inspire and guide people", "Leaders only deal with finance", "Managers are always higher rank", "There is no difference"], "answer": 0 },
      { "q": "What is conflict resolution?", "options": ["Firing anyone who disagrees", "Facilitating a peaceful solution to a disagreement", "Deleting log files", "Upgrading product licenses"], "answer": 1 },
      { "q": "What is strategic planning?", "options": ["Day-to-day bug fixing", "Setting long-term goals and determining actions to achieve them", "Reviewing weekly payroll", "Sending cold emails"], "answer": 1 },
      { "q": "What is delegation in leadership?", "options": ["Doing all the work yourself", "Assigning responsibility and authority to others", "Firing team members", "Reporting to stakeholders only"], "answer": 1 },
      { "q": "What does micro-management usually lead to?", "options": ["High employee morale and productivity", "Reduced trust, stress, and lower employee morale", "Better code speed", "Free marketing"], "answer": 1 },
      { "q": "What is active listening?", "options": ["Listening while running", "Fully concentrating, understanding, responding, and remembering what is said", "Ignoring team feedback", "Recording sound clips"], "answer": 1 }
    ]
}

SUBJECT_NAMES = {
    "db": "Database Management",
    "ai": "Artificial Intelligence",
    "java": "Java Programming",
    "python": "Python Programming",
    "finance": "Finance & Accounting",
    "marketing": "Digital Marketing",
    "analytics": "Business Analytics",
    "leadership": "Leadership & Strategy"
}


class GenerateQuizView(APIView):
    """
    POST /api/assessments/generate-quiz/
    Generates a dynamic multiple choice quiz via OpenRouter AI.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject_id = request.data.get("subject", "python").lower()
        subject_name = SUBJECT_NAMES.get(subject_id, subject_id.replace("-", " ").title())
        
        api_key = os.getenv("OPENROUTER_API_KEY")
        model = os.getenv("OPENROUTER_MODEL", "openrouter/auto")

        if not api_key:
            logger.warning("No OpenRouter API key configured. Falling back to offline questions.")
            return Response({
                "subject": subject_id,
                "name": subject_name,
                "questions": FALLBACK_QUIZZES.get(subject_id, FALLBACK_QUIZZES["python"]),
                "source": "fallback"
            })

        prompt = (
            f"You are an elite subject-matter expert and instructor. Generate a challenging 10-question multiple-choice quiz about: {subject_name}.\n"
            "Each question must have exactly 4 diverse and plausible options.\n"
            "Return the output STRICTLY as a JSON object containing a single key 'questions' which is an array of 10 question objects.\n"
            "Each question object MUST have exactly these fields:\n"
            "  - 'q': string, the clear and concise question text.\n"
            "  - 'options': a list of exactly 4 strings representing the options.\n"
            "  - 'answer': integer, the 0-indexed correct option index (0, 1, 2, or 3).\n\n"
            "Do NOT wrap the output in markdown, HTML tags, or ```json codeblocks. Return only the raw JSON string."
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "LearningHub",
            "Content-Type": "application/json"
        }

        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a machine-readable JSON generator. You output only raw, valid JSON. Never output markdown code blocks, text explanations, or surrounding formatting."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=25
            )
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content'].strip()
            
            # Defensive cleaning in case model wrapped it in codeblocks
            if content.startswith("```"):
                content = content.split("```", 2)[1]
                if content.lower().startswith("json"):
                    content = content[4:].strip()
            
            quiz_data = json.loads(content)
            
            # Simple structure validation
            if "questions" in quiz_data and isinstance(quiz_data["questions"], list) and len(quiz_data["questions"]) > 0:
                validated_questions = []
                for q in quiz_data["questions"]:
                    if "q" in q and "options" in q and "answer" in q and len(q["options"]) == 4:
                        # Ensure answer is safe integer bounds
                        ans = int(q["answer"])
                        if 0 <= ans <= 3:
                            validated_questions.append({
                                "q": q["q"],
                                "options": q["options"],
                                "answer": ans
                            })
                
                if len(validated_questions) == 10:
                    return Response({
                        "subject": subject_id,
                        "name": subject_name,
                        "questions": validated_questions,
                        "source": "ai"
                    })
            
            logger.warning("AI quiz response failed simple structure validation. Falling back to offline quiz.")
            
        except Exception as e:
            logger.error(f"OpenRouter quiz generation failed with error: {str(e)}. Falling back to offline quiz.")
            
        # Fallback to local static subjects
        return Response({
            "subject": subject_id,
            "name": subject_name,
            "questions": FALLBACK_QUIZZES.get(subject_id, FALLBACK_QUIZZES["python"]),
            "source": "fallback"
        })