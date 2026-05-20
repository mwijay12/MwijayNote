
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, CodeIcon, PlusIcon, TrashIcon, BookIcon, PlayIcon, BugIcon, CheckIcon, ChevronRightIcon } from './Icons';
import { CodeSnippet } from '../types';
import { debugCode, callGemini } from '../services/geminiService';

interface KodingStreetScreenProps {
  snippets: CodeSnippet[];
  onBack: () => void;
  onNewSnippet: () => void;
  onEditSnippet: (snippet: CodeSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

// ── Web Course Data ────────────────────────────────────────────────────────────

const WEB_COURSE = [
    {
        id: 'html-basics', title: 'HTML Basics', icon: '🏗️', color: '#e34c26',
        lessons: [
            { title: 'What is HTML?', explanation: 'HTML (HyperText Markup Language) is the skeleton of every website. It defines the structure using <strong>tags</strong> like &lt;h1&gt;, &lt;p&gt;, &lt;div&gt;.', starter: '<!DOCTYPE html>\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Hello World!</h1>\n    <p>This is my first webpage.</p>\n  </body>\n</html>' },
            { title: 'Headings & Paragraphs', explanation: 'Headings go from &lt;h1&gt; (biggest) to &lt;h6&gt; (smallest). Use &lt;p&gt; for paragraphs.', starter: '<h1>Main Title</h1>\n<h2>Sub Title</h2>\n<h3>Section</h3>\n<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>' },
            { title: 'Links & Images', explanation: 'Use &lt;a href="url"&gt; for links and &lt;img src="url" alt="text"&gt; for images.', starter: '<a href="https://google.com" target="_blank">Visit Google</a>\n<br><br>\n<img src="https://via.placeholder.com/200" alt="Placeholder image">' },
            { title: 'Lists', explanation: '&lt;ul&gt; = unordered (bullets). &lt;ol&gt; = ordered (numbers). &lt;li&gt; = each item.', starter: '<h2>My Skills</h2>\n<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>\n<h2>Steps</h2>\n<ol>\n  <li>Learn HTML</li>\n  <li>Learn CSS</li>\n  <li>Build a project</li>\n</ol>' },
            { title: 'Forms & Inputs', explanation: 'Forms collect user input. Use &lt;form&gt;, &lt;input&gt;, &lt;button&gt;, &lt;textarea&gt;.', starter: '<form>\n  <label>Name:</label><br>\n  <input type="text" placeholder="Your name"><br><br>\n  <label>Email:</label><br>\n  <input type="email" placeholder="email@example.com"><br><br>\n  <button type="submit">Submit</button>\n</form>' },
        ]
    },
    {
        id: 'css-styling', title: 'CSS Styling', icon: '🎨', color: '#264de4',
        lessons: [
            { title: 'What is CSS?', explanation: 'CSS (Cascading Style Sheets) adds colour, fonts, and layout to HTML. Select elements and apply rules: <code>selector { property: value; }</code>', starter: '<style>\n  h1 { color: #f59e0b; font-family: Arial; }\n  p { color: #94a3b8; font-size: 16px; }\n  body { background: #0f172a; padding: 20px; }\n</style>\n<h1>Styled Title!</h1>\n<p>This paragraph is styled too.</p>' },
            { title: 'Box Model', explanation: 'Every element is a box: content → padding → border → margin.', starter: '<style>\n  .box {\n    width: 200px;\n    padding: 20px;\n    border: 3px solid #f59e0b;\n    margin: 20px;\n    background: #1e293b;\n    color: white;\n    border-radius: 12px;\n  }\n</style>\n<div class="box">I am a box!</div>' },
            { title: 'Flexbox', explanation: 'Flexbox makes layout easy. Add <code>display: flex</code> to a container to align children.', starter: '<style>\n  .container {\n    display: flex;\n    gap: 10px;\n    background: #0f172a;\n    padding: 20px;\n  }\n  .card {\n    background: #1e293b;\n    color: white;\n    padding: 20px;\n    border-radius: 8px;\n    flex: 1;\n    text-align: center;\n  }\n</style>\n<div class="container">\n  <div class="card">Card 1</div>\n  <div class="card">Card 2</div>\n  <div class="card">Card 3</div>\n</div>' },
            { title: 'Colours & Gradients', explanation: 'Use hex (#ff0000), rgb(), hsl(), or named colours. Gradients use <code>linear-gradient()</code>.', starter: '<style>\n  .grad { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 40px; border-radius: 16px; text-align: center; }\n  .amber { color: #f59e0b; font-size: 24px; font-weight: bold; }\n</style>\n<div class="grad">\n  <p class="amber">Gradient Background!</p>\n  <p>Beautiful colours make great UI.</p>\n</div>' },
        ]
    },
    {
        id: 'js-fundamentals', title: 'JavaScript', icon: '⚡', color: '#f7df1e',
        lessons: [
            { title: 'Variables & Console', explanation: 'JavaScript adds interactivity. Use <code>let</code>, <code>const</code> for variables. <code>console.log()</code> prints to the browser console.', starter: '<script>\n  let name = "Mwijay";\n  const year = 2025;\n  let message = "Hello, " + name + "! Year: " + year;\n  document.write("<h2>" + message + "</h2>");\n</script>' },
            { title: 'If / Else Logic', explanation: 'Use <code>if</code> / <code>else</code> to make decisions in your code.', starter: '<script>\n  let score = 85;\n  let grade;\n  if (score >= 90) {\n    grade = "A";\n  } else if (score >= 75) {\n    grade = "B";\n  } else {\n    grade = "C";\n  }\n  document.write("<h2>Score: " + score + " → Grade: " + grade + "</h2>");\n</script>' },
            { title: 'Functions', explanation: 'Functions are reusable blocks of code. Define with <code>function name() {}</code> and call with <code>name()</code>.', starter: '<script>\n  function greet(person) {\n    return "Habari, " + person + "! 🇹🇿";\n  }\n  function addNumbers(a, b) {\n    return a + b;\n  }\n  document.write("<p>" + greet("Mwijay") + "</p>");\n  document.write("<p>5 + 3 = " + addNumbers(5, 3) + "</p>");\n</script>' },
            { title: 'DOM Manipulation', explanation: 'The DOM lets JavaScript interact with HTML. Use <code>document.getElementById()</code> to select elements and change them.', starter: '<h2 id="title">Click the button!</h2>\n<button onclick="changeText()">Click Me!</button>\n<script>\n  let count = 0;\n  function changeText() {\n    count++;\n    document.getElementById("title").innerText = "Clicked " + count + " times!";\n    document.getElementById("title").style.color = "#f59e0b";\n  }\n</script>' },
            { title: 'Arrays & Loops', explanation: 'Arrays store multiple values. Loops repeat code. Together they power lists and data.', starter: '<script>\n  let fruits = ["Mango", "Banana", "Pineapple", "Coconut"];\n  let html = "<ul>";\n  for (let i = 0; i < fruits.length; i++) {\n    html += "<li>🍎 " + fruits[i] + "</li>";\n  }\n  html += "</ul>";\n  document.write("<h2>Tanzanian Fruits:</h2>" + html);\n</script>' },
        ]
    },
];

// ── Live Preview Editor ────────────────────────────────────────────────────────

const LiveEditor: React.FC<{ starter: string }> = ({ starter }) => {
    const [code, setCode] = useState(starter);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => { setCode(starter); }, [starter]);

    const run = () => {
        if (iframeRef.current) {
            iframeRef.current.srcdoc = code;
        }
    };

    return (
        <div className="space-y-2">
            <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-36 bg-black/80 text-green-400 font-mono text-xs p-3 rounded-xl border border-green-500/20 resize-none outline-none focus:border-green-400/50"
                spellCheck={false}
            />
            <button onClick={run} className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-500 flex items-center justify-center gap-2">
                <PlayIcon className="w-3 h-3 fill-current"/> Run Code
            </button>
            <iframe ref={iframeRef} className="w-full h-40 bg-white rounded-xl border border-white/10" title="preview" sandbox="allow-scripts"/>
        </div>
    );
};

// ── AI Debugger ────────────────────────────────────────────────────────────────

const AiDebugger: React.FC = () => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDebug = async () => {
        if (!code.trim()) return;
        setIsLoading(true);
        const res = await debugCode(code, 'HTML/CSS/JS or C/C++', 'Find bugs, simplify logic, and explain fixes.');
        setResult(res);
        setIsLoading(false);
    };

    return (
        <div className="bg-card p-4 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold text-accent mb-2 flex items-center gap-2"><BugIcon className="w-4 h-4"/> AI Code Doctor</h3>
            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste buggy code here..." className="w-full bg-bg-primary p-3 rounded-xl text-xs font-mono h-24 mb-2 focus:ring-1 focus:ring-amber outline-none resize-none border border-border-subtle"/>
            <button onClick={handleDebug} disabled={isLoading} className="w-full bg-accent text-cafe py-2 rounded-lg font-bold text-xs hover:opacity-90">
                {isLoading ? 'Thinking...' : 'Debug & Fix'}
            </button>
            {result && <div className="mt-3 p-3 bg-card/40 rounded-lg text-xs font-mono text-green-300 whitespace-pre-wrap border border-green-500/20">{result}</div>}
        </div>
    );
};

// ── Web Course UI ──────────────────────────────────────────────────────────────

const PROGRESS_KEY = 'koding_street_progress';

const WebCourse: React.FC = () => {
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<number>(0);
    const [aiAnswer, setAiAnswer] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
        try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]')); } catch { return new Set(); }
    });

    const markComplete = (chapterIdx: number, lessonIdx: number) => {
        const key = `${chapterIdx}-${lessonIdx}`;
        const next = new Set(completedLessons);
        next.add(key);
        setCompletedLessons(next);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify([...next]));
    };

    const isComplete = (ci: number, li: number) => completedLessons.has(`${ci}-${li}`);
    const totalLessons = WEB_COURSE.reduce((s, c) => s + c.lessons.length, 0);
    const progress = Math.round((completedLessons.size / totalLessons) * 100);

    const askAi = async () => {
        if (!aiQuestion.trim() || selectedChapter === null) return;
        setIsAiLoading(true);
        const chapter = WEB_COURSE[selectedChapter];
        const lesson = chapter.lessons[selectedLesson];
        const res = await callGemini(`You are a friendly coding tutor teaching ${chapter.title} to a beginner. Lesson: "${lesson.title}". Student asks: "${aiQuestion}". Give a short, clear, encouraging answer with a code example if helpful.`);
        setAiAnswer(res);
        setIsAiLoading(false);
    };

    if (selectedChapter === null) {
        return (
            <div className="space-y-4">
                {/* Progress */}
                <div className="bg-card rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-dun">Overall Progress</span>
                        <span className="text-xs font-black text-accent">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
                    </div>
                    <p className="text-[10px] text-dun/50 mt-1">{completedLessons.size}/{totalLessons} lessons completed</p>
                </div>

                {WEB_COURSE.map((chapter, ci) => {
                    const done = chapter.lessons.filter((_, li) => isComplete(ci, li)).length;
                    return (
                        <button key={chapter.id} onClick={() => { setSelectedChapter(ci); setSelectedLesson(0); }} className="w-full flex items-center gap-4 bg-card p-5 rounded-2xl border border-white/5 hover:border-white/20 text-left transition-all">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: chapter.color + '20', border: `2px solid ${chapter.color}40` }}>
                                {chapter.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-isabelline text-sm">{chapter.title}</h3>
                                <p className="text-[10px] text-dun/50">{chapter.lessons.length} lessons • {done}/{chapter.lessons.length} done</p>
                                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${(done/chapter.lessons.length)*100}%`, background: chapter.color }}/>
                                </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 text-dun/40 shrink-0"/>
                        </button>
                    );
                })}
            </div>
        );
    }

    const chapter = WEB_COURSE[selectedChapter];
    const lesson = chapter.lessons[selectedLesson];

    return (
        <div className="space-y-4">
            {/* Header */}
            <button onClick={() => setSelectedChapter(null)} className="flex items-center gap-2 text-accent text-xs font-bold hover:opacity-80">
                ← Back to Chapters
            </button>
            {/* Lesson tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {chapter.lessons.map((l, li) => (
                    <button key={li} onClick={() => { setSelectedLesson(li); setAiAnswer(''); setAiQuestion(''); }}
                        className={`px-3 py-2 text-[10px] font-black uppercase rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${selectedLesson === li ? 'text-cafe' : 'bg-card text-dun border border-white/5'}`}
                        style={selectedLesson === li ? { background: chapter.color } : {}}>
                        {isComplete(selectedChapter, li) && <CheckIcon className="w-3 h-3"/>}
                        {li + 1}
                    </button>
                ))}
            </div>

            {/* Lesson content */}
            <div className="bg-card rounded-2xl p-4 border border-white/5 space-y-3">
                <h3 className="font-black text-isabelline" style={{ color: chapter.color }}>{lesson.title}</h3>
                <p className="text-xs text-dun leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.explanation }}/>
                <LiveEditor starter={lesson.starter} />
                <button onClick={() => markComplete(selectedChapter, selectedLesson)}
                    className={`w-full py-2 text-xs font-bold rounded-xl transition-all ${isComplete(selectedChapter, selectedLesson) ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-card border border-white/10 text-dun hover:border-accent/30 hover:text-accent'}`}>
                    {isComplete(selectedChapter, selectedLesson) ? '✅ Completed!' : 'Mark as Complete'}
                </button>
            </div>

            {/* AI Tutor */}
            <div className="bg-card rounded-2xl p-4 border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-accent flex items-center gap-1">✨ Ask AI Tutor</h4>
                <input value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAi()} placeholder={`Ask about ${lesson.title}...`} className="w-full bg-bg-primary px-3 py-2 text-xs rounded-xl border border-border-subtle outline-none focus:ring-1 focus:ring-amber text-isabelline"/>
                <button onClick={askAi} disabled={isAiLoading} className="w-full py-2 bg-accent text-cafe text-xs font-bold rounded-xl hover:opacity-90">
                    {isAiLoading ? 'Thinking...' : 'Ask Tutor'}
                </button>
                {aiAnswer && <div className="p-3 bg-black/30 rounded-xl text-xs text-isabelline/90 whitespace-pre-wrap border border-accent/20 leading-relaxed">{aiAnswer}</div>}
            </div>

            {/* Next lesson */}
            {selectedLesson < chapter.lessons.length - 1 && (
                <button onClick={() => { setSelectedLesson(s => s + 1); setAiAnswer(''); setAiQuestion(''); }} className="w-full py-3 bg-card border border-white/5 rounded-2xl text-xs font-black text-dun hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2">
                    Next Lesson <ChevronRightIcon className="w-4 h-4"/>
                </button>
            )}
        </div>
    );
};

// ── C Language Cheatsheet ─────────────────────────────────────────────────────

const CCheatSheet: React.FC = () => (
    <div className="space-y-2 font-mono text-xs">
        {[
            { label: '#include <stdio.h>', desc: 'Standard Input/Output library.' },
            { label: 'printf("Format", vars);', desc: '%d (int), %f (float), %c (char), %s (string)' },
            { label: 'Pointers (*) vs Address (&)', desc: '*ptr = Value at address; &var = Address of var.' },
            { label: 'malloc(size)', desc: "Allocates memory. Don't forget free()!" },
            { label: 'struct MyStruct { int x; };', desc: 'Group related data into a structure.' },
        ].map((item, i) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg border border-blue-500/20">
                <span className="text-blue-400 font-bold block mb-1">{item.label}</span>
                <span className="text-dun">{item.desc}</span>
            </div>
        ))}
    </div>
);

// ── Main Screen ────────────────────────────────────────────────────────────────

const KodingStreetScreen: React.FC<KodingStreetScreenProps> = ({ snippets, onBack, onNewSnippet, onEditSnippet, onDeleteSnippet }) => {
  const [activeTab, setActiveTab] = useState<'web' | 'snippets' | 'c_lang' | 'tools'>('web');

  const tabs = [
      { id: 'web', label: '🌐 Web', color: 'bg-orange-500 text-white' },
      { id: 'snippets', label: '📋 Snippets', color: 'bg-accent text-cafe' },
      { id: 'c_lang', label: '⚙️ C/C++', color: 'bg-blue-500 text-white' },
      { id: 'tools', label: '🔧 Tools', color: 'bg-green-500 text-black' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
            <div className="ml-2">
                <h2 className="text-xl font-brand text-isabelline">Koding Street</h2>
                <p className="text-[10px] text-dun/50 uppercase font-bold">Learn. Build. Ship.</p>
            </div>
        </div>
        {activeTab === 'snippets' && <button onClick={onNewSnippet} className="p-2 rounded-full hover:bg-white/10"><PlusIcon className="w-6 h-6" /></button>}
      </header>

      <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-2 text-[10px] font-black uppercase rounded-xl whitespace-nowrap transition-all ${activeTab === t.id ? t.color : 'bg-card text-dun border border-white/5'}`}>
                  {t.label}
              </button>
          ))}
      </div>

      <div className="flex-grow overflow-y-auto space-y-4 pb-4 no-scrollbar">
        {activeTab === 'web' && <WebCourse />}

        {activeTab === 'snippets' && (
            snippets.length === 0 ? (
                <div className="text-center py-16 text-dun">
                    <p className="text-2xl mb-2">📋</p>
                    <p className="font-bold text-isabelline">No snippets yet</p>
                    <p className="text-xs mt-1">Tap + to save your first code snippet</p>
                </div>
            ) : snippets.map(snippet => (
                <div key={snippet.id} className="bg-card p-4 rounded-2xl group border border-white/5 cursor-pointer" onClick={() => onEditSnippet(snippet)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono bg-white/10 text-dun px-2 py-0.5 rounded uppercase">{snippet.language}</span>
                                <h3 className="font-semibold text-isabelline text-sm">{snippet.title}</h3>
                            </div>
                            <p className="text-xs text-dun mt-2 font-mono truncate opacity-70">{snippet.code.substring(0, 40)}...</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteSnippet(snippet.id); }} className="text-dun hover:text-red-400 p-1 opacity-50 group-hover:opacity-100">
                            <TrashIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            ))
        )}
        
        {activeTab === 'c_lang' && (
            <div className="space-y-6 animate-fade-in">
                <AiDebugger />
                <div>
                    <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><BookIcon className="w-4 h-4"/> C Reference</h3>
                    <CCheatSheet />
                </div>
            </div>
        )}
        
        {activeTab === 'tools' && (
            <div className="space-y-4 animate-fade-in">
                <AiDebugger />
                <div className="bg-card p-4 rounded-2xl border border-white/5 text-center text-dun">
                    <p className="text-2xl mb-2">🛠️</p>
                    <p className="text-sm font-bold text-isabelline">More tools coming soon</p>
                    <p className="text-xs mt-1">Algorithm Visualizer, Linux Cheatsheet, and more</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default KodingStreetScreen;
