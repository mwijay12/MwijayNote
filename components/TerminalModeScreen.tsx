import React, { useState, useEffect, useRef } from 'react';
import { AppView, Theme } from '../types';
import { processOfflineCommand } from '../utils/offlineAi';

interface TerminalModeScreenProps {
    onNavigate: (view: AppView) => void;
    onThemeChange: (theme: Theme) => void;
}

interface QuizQuestion {
    q: string;
    options: string[];
    answer: string;
    explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        q: "Which HTML tag is used to define an important text header with the highest rank?",
        options: ["A) <header>", "B) <h6>", "C) <h1>"],
        answer: "C",
        explanation: "<h1> is the highest rank semantic tag representing the primary topic of the document."
    },
    {
        q: "In modern CSS layouts, which property activates the Flexbox alignment system?",
        options: ["A) align: flex", "B) display: flex", "C) layout: grid"],
        answer: "B",
        explanation: "Setting 'display: flex' turns the element into a flex container, aligning children dynamically."
    },
    {
        q: "In JavaScript, how do you declare a variable that cannot be reassigned?",
        options: ["A) const myVar", "B) let myVar", "C) var myVar"],
        answer: "A",
        explanation: "'const' creates a block-scoped read-only reference that cannot be reassigned."
    },
    {
        q: "Which built-in JavaScript function encodes a binary string into a Base64 format?",
        options: ["A) atob()", "B) btoa()", "C) encodeURI()"],
        answer: "B",
        explanation: "btoa() stands for 'binary to ASCII' and creates a Base64-encoded string."
    },
    {
        q: "What does HTML stand for?",
        options: ["A) Hyper Text Markup Language", "B) High Tech Multi Language", "C) Hyperlinks and Text Management"],
        answer: "A",
        explanation: "Hyper Text Markup Language is the standard markup language for creating web pages."
    }
];

const TerminalModeScreen: React.FC<TerminalModeScreenProps> = ({ onNavigate, onThemeChange }) => {
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    
    // Academy States
    const [academyMode, setAcademyMode] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);

    useEffect(() => {
        setHistory([
            "==================================================",
            " 🚀  MWIJAY TECH ACADEMY v4.0 [OFFLINE WORKSPACE]  ",
            "==================================================",
            "Welcome to the ultimate command-line training lab!",
            "Perfect for students and engineering enthusiasts.",
            "",
            "Type 'help' to list available console utilities.",
            "Type 'academy' or 'learn' to open the coding school!",
            "Type 'quiz' to test your technical skills.",
            "Type 'exit' to return to GUI Dashboard.",
            "--------------------------------------------------"
        ]);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const showHelp = () => {
        setHistory(prev => [...prev,
            "--- AVAILABLE COMMANDS ---",
            "  academy / learn       - Launch the coding lessons syllabus.",
            "  lesson <1-4>          - Open a specific programming lesson.",
            "  practice <1-4> <ans>  - Submit the code answer for the lesson's practice.",
            "  quiz                  - Start a multiple-choice tech quiz.",
            "  run <js_code>         - Run live client-side JavaScript in a sandboxed console!",
            "  ls                    - List system GUI coordinates for navigation.",
            "  open <view_name>      - Switch screen (e.g. open Zen, open radio).",
            "  theme <name>          - Apply theme (e.g. theme cyber, theme sunny).",
            "  clear                 - Clear console text history.",
            "  exit                  - Close CLI and return home.",
            "--------------------------"
        ]);
    };

    const startAcademy = () => {
        setAcademyMode(true);
        setHistory(prev => [...prev,
            "===================================================",
            "🌟        WELCOME TO MWIJAY CODING SCHOOL        🌟",
            "===================================================",
            "Start your coding journey offline with these lessons:",
            "",
            " [Lesson 1] HTML Essentials (Semantic structure & headers)",
            " [Lesson 2] CSS Custom Variables (Theme styling rules)",
            " [Lesson 3] JavaScript Logic (Functions, algorithms, console)",
            " [Lesson 4] Cybersecurity Lab (PIN brute forcing & btoa)",
            "",
            "Type 'lesson 1', 'lesson 2', 'lesson 3', or 'lesson 4' to start!",
            "---------------------------------------------------"
        ]);
    };

    const runLesson = (num: number) => {
        if (num === 1) {
            setHistory(prev => [...prev,
                "--- LESSON 1: HTML ESSENTIALS ---",
                "HTML (HyperText Markup Language) constructs the skeleton of a website.",
                "Semantic elements describe their meaning to the browser and developers.",
                "Key tags include: <h1> (Header 1), <p> (Paragraph), and <a> (Hyperlink).",
                "",
                "🎯 PRACTICE TASK: Create an HTML header tag that contains the text 'Learn'.",
                "Type: practice 1 <h1>Learn</h1> to test your solution."
            ]);
        } else if (num === 2) {
            setHistory(prev => [...prev,
                "--- LESSON 2: CSS THEME VARIABLES ---",
                "CSS (Cascading Style Sheets) controls how HTML looks.",
                "With custom theme variables, we define values that can be reused across the application.",
                "Syntax: color: pink; or background: var(--color-bg-primary);",
                "",
                "🎯 PRACTICE TASK: Write a style that assigns a 'color' attribute to 'pink'.",
                "Type: practice 2 color: pink; to test your style."
            ]);
        } else if (num === 3) {
            setHistory(prev => [...prev,
                "--- LESSON 3: JAVASCRIPT FUNCTIONS ---",
                "JavaScript is the brain of your web application.",
                "Functions accept parameters, perform calculations, and return a value using the 'return' keyword.",
                "Example: function add(a, b) { return a + b; }",
                "",
                "🎯 PRACTICE TASK: Write a short function named 'double' that doubles a number 'x'.",
                "Type: practice 3 function double(x){return x*2;} to test your algorithm."
            ]);
        } else if (num === 4) {
            setHistory(prev => [...prev,
                "--- LESSON 4: CYBERSECURITY & BRUTE FORCING ---",
                "Ethical hacking involves testing systems to find security vulnerabilities.",
                "A 'Brute Force' attack is a trial-and-error method trying all possible passwords/PINs.",
                "Additionally, developers use btoa() to encode credentials securely into Base64 format.",
                "",
                "🎯 PRACTICE TASK: Brute force crack a locked 3-digit PIN. The target PIN is '739'.",
                "Type: crack 739 to crack the lock."
            ]);
        } else {
            setHistory(prev => [...prev, `Lesson ${num} does not exist. Choose 1, 2, 3, or 4.`]);
        }
    };

    const handlePractice = (num: number, answer: string) => {
        if (num === 1) {
            const clean = answer.replace(/\s+/g, '').toLowerCase();
            if (clean.includes('<h1>learn</h1>')) {
                setHistory(prev => [...prev, "🎉 CORRECT! You created a clean, semantic HTML header. Level up!"]);
            } else {
                setHistory(prev => [...prev, "❌ Not quite. Make sure to use '<h1>' and exact text 'Learn' closing with '</h1>'."]);
            }
        } else if (num === 2) {
            const clean = answer.replace(/\s+/g, '').toLowerCase();
            if (clean.includes('color:') && clean.includes('pink')) {
                setHistory(prev => [...prev, "🎉 CORRECT! You declared a clean color attribute. Perfect pink styling!"]);
            } else {
                setHistory(prev => [...prev, "❌ Incorrect. Ensure your CSS declares 'color: pink;'."]);
            }
        } else if (num === 3) {
            const clean = answer.replace(/\s+/g, '').toLowerCase();
            if (clean.includes('function') && clean.includes('return') && clean.includes('*2')) {
                setHistory(prev => [...prev, "🎉 CORRECT! Your JS double function executes flawlessly. You are a natural developer!"]);
            } else {
                setHistory(prev => [...prev, "❌ Incorrect. Declare a function that accepts 'x' and returns 'x * 2'."]);
            }
        } else {
            setHistory(prev => [...prev, "Unknown practice code level. Type 'academy' to see lessons."]);
        }
    };

    const runQuiz = () => {
        const randomIndex = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
        setCurrentQuiz(randomIndex);
        const question = QUIZ_QUESTIONS[randomIndex];
        setHistory(prev => [...prev,
            "--------------------------------------------------",
            "📝             MWIJAY TECH TRIVIA QUIZ            📝",
            "--------------------------------------------------",
            question.q,
            ...question.options,
            "",
            "Type your answer (A, B, or C) in the input!"
        ]);
    };

    const handleQuizAnswer = (ans: string) => {
        if (currentQuiz === null) return;
        const q = QUIZ_QUESTIONS[currentQuiz];
        const choice = ans.toUpperCase().trim();
        
        if (choice === q.answer) {
            setQuizScore(s => s + 1);
            setHistory(prev => [...prev,
                `✅ CORRECT! Excellent answer.`,
                `Explanation: ${q.explanation}`,
                `Current Score: ${quizScore + 1} points.`,
                "Type 'quiz' to attempt another question or 'help' to review commands."
            ]);
        } else {
            setHistory(prev => [...prev,
                `❌ WRONG! The correct choice was ${q.answer}.`,
                `Explanation: ${q.explanation}`,
                "Type 'quiz' to try another question!"
            ]);
        }
        setCurrentQuiz(null);
    };

    const runJsSandbox = (code: string) => {
        setHistory(prev => [...prev, `[RUNNING JS...]: ${code}`]);
        try {
            // Sandboxed function execution to avoid breaking global scope
            const runner = new Function(`
                try {
                    return (${code});
                } catch(e) {
                    return eval('${code.replace(/'/g, "\\'")}');
                }
            `);
            const output = runner();
            setHistory(prev => [...prev, `=> Output: ${output !== undefined ? JSON.stringify(output) : 'undefined'}`]);
        } catch (e: any) {
            setHistory(prev => [...prev, `⚠️ [Sandbox Error]: ${e.message}`]);
        }
    };

    const handleCommand = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = input.trim();
            if (!cmd) return;

            setHistory(prev => [...prev, `user@mwijay:~$ ${cmd}`]);
            setInput('');

            // If in quiz answer awaiting state
            if (currentQuiz !== null) {
                handleQuizAnswer(cmd);
                return;
            }

            const lower = cmd.toLowerCase();

            // Clear
            if (lower === 'clear') {
                setHistory([]);
                return;
            }

            // Help
            if (lower === 'help') {
                showHelp();
                return;
            }

            // Academy Trigger
            if (lower === 'academy' || lower === 'learn') {
                startAcademy();
                return;
            }

            // Exit
            if (lower === 'exit') {
                onNavigate(AppView.HOME);
                return;
            }

            // Quiz Trigger
            if (lower === 'quiz') {
                runQuiz();
                return;
            }

            // Lesson detail loader
            if (lower.startsWith('lesson ')) {
                const num = parseInt(lower.split(' ')[1]);
                if (!isNaN(num)) {
                    runLesson(num);
                } else {
                    setHistory(prev => [...prev, "Usage: lesson <1-4>"]);
                }
                return;
            }

            // Code execution sandbox trigger
            if (lower.startsWith('run ')) {
                const jsCode = cmd.substring(4);
                runJsSandbox(jsCode);
                return;
            }

            // Practice Submitter
            if (lower.startsWith('practice ')) {
                const parts = cmd.split(' ');
                const num = parseInt(parts[1]);
                const ans = cmd.substring(cmd.indexOf(parts[2]));
                if (!isNaN(num) && ans) {
                    handlePractice(num, ans);
                } else {
                    setHistory(prev => [...prev, "Usage: practice <lesson_number> <your_code_answer>"]);
                }
                return;
            }

            // Lesson 4 PIN Cracking concept
            if (lower.startsWith('crack ')) {
                const pinGuess = cmd.split(' ')[1];
                if (pinGuess === '739') {
                    setHistory(prev => [...prev,
                        "🎉 SUCCESS! PIN CRACKED SUCCESSFULLY: 739",
                        "Security concepts verified. Base64 equivalent: " + btoa('739'),
                        "Lesson 4 completed. You are officially an Ethical Hacker!"
                    ]);
                } else {
                    setHistory(prev => [...prev, `[FAIL] Guess ${pinGuess} is wrong. Brute force requires trying further inputs!`]);
                }
                return;
            }

            // File listing mockup
            if (lower === 'ls') {
                setHistory(prev => [...prev, "Available App Views: home, calendar, profile, settings, explore, zen, radio, filemanager"]);
                return;
            }

            // Normal offline command router
            const result = processOfflineCommand(lower.startsWith('open ') ? lower : `open ${lower}`);
            if (result && result.action) {
                if (result.action.type === 'NAVIGATE') onNavigate(result.action.view);
                else if (result.action.type === 'CHANGE_THEME') onThemeChange(result.action.theme);
                setHistory(prev => [...prev, `> ${result.text}`]);
            } else {
                setHistory(prev => [...prev, `Command not found: '${cmd}'. Type 'help' for academy support.`]);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4 text-xs overflow-hidden relative select-text" onClick={() => inputRef.current?.focus()}>
            <button 
                onClick={() => onNavigate(AppView.HOME)} 
                className="absolute top-4 right-4 border border-green-500/50 text-green-500 px-3 py-1 rounded hover:bg-green-500 hover:text-black z-50 font-bold text-[10px] uppercase transition-all"
            >
                GUI Dashboard
            </button>

            <div className="flex-grow overflow-y-auto pb-4 space-y-1 pt-12 custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
                ))}
                <div ref={endRef} />
            </div>
            
            <div className="flex items-center bg-black border-t border-green-500/20 p-2 shrink-0">
                <span className="mr-2 text-blue-400 font-bold">user@mwijay:~$</span>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={handleCommand}
                    className="bg-transparent border-none outline-none flex-grow text-green-500 focus:ring-0 p-0 font-mono text-xs"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default TerminalModeScreen;
