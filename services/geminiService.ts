import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, FileData, ContentPlatform, Flashcard, AppView, Expense, JournalEntry, AiPersonality } from '../types';
import { markdownToHtml, cleanAiResponse } from '../utils/textUtils';
import { zenContent } from '../data/content';
import { OFFLINE_TECH_EVENTS, OFFLINE_INTERVIEW_KNOWLEDGE, getOfflineInterviewReply } from '../data/offlineKnowledge';
import { aiRouter } from './aiRouter';



const GEMINI_KEYS = [
  'AIzaSyChoQSjIelaNNgnIZrpfhugSt9_On-kuzQ',
  'AIzaSyA7WFeDV_aK--xVtbXclDkr2q1EQ6TecCc',
  'AIzaSyAZnBentKVIGKDyWtQ41dwIGeJEfiFmItY',
  'AIzaSyDM8zZLuG2AvIxQGL1Twoiw2iWiX51wMpw',
  'AIzaSyBRqaSPUyXfb68sG2GLXfbQpZBg-EQeKEQ',
  'AIzaSyBNfTqY6CjqliFLBM4GssDre1xyt71_sCY',
  'AIzaSyDeGJlwd6zKc1F90HsZweGZk7M-CaA8Ql4'
];

const GROQ_KEY = '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';
const OPENROUTER_KEY = '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';

let currentKeyIndex = 0;
let userApiKey: string | null = null;

export const setGlobalApiKey = (key: string | undefined) => {
    userApiKey = key || null;
};

const getNextKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    return GEMINI_KEYS[currentKeyIndex];
};

export const getCurrentKey = () => GEMINI_KEYS[currentKeyIndex];


/**
 * AI BRAIN v5 — Intelligent Multi-Provider Router
 * Delegates to aiRouter (Gemini → Groq → Cerebras → OpenRouter → Offline)
 * Backward-compatible drop-in; all existing calls continue to work.
 */
export const callGemini = async (prompt: string, _model: string = 'gemini-2.0-flash', file?: FileData, appContext?: any): Promise<string> => {
    // Files need direct Gemini call (only Gemini supports multimodal inline data)
    if (file) {
        const apiKey = userApiKey || GEMINI_KEYS[currentKeyIndex];
        const ai = new GoogleGenAI({ apiKey });
        try {
            const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
            const result = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: file.type } }] }]
            });
            return cleanAiResponse(result.text || '');
        } catch (e) {
            console.error('Multimodal Gemini failed:', e);
            return 'Failed to process the file. Please try again.';
        }
    }

    const finalPrompt = appContext
        ? `[CONTEXT: ${JSON.stringify(appContext).slice(0, 500)}]\n\n${prompt}`
        : prompt;

    const result = await aiRouter.call({ prompt: finalPrompt, context: 'chat' });
    return result.text || "I'm having trouble thinking right now. Please try again.";
};

// Fix: Exported callGeminiJson for external use.
export const callGeminiJson = async (prompt: string, model: string = 'gemini-3-flash-preview', file?: FileData): Promise<any> => {
    try {
        const text = await callGemini(prompt + "\n\nReturn valid JSON only. Do not wrap in markdown code blocks.", model, file);
        let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        if (!clean.trim()) return null; 
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return null; 
    }
};

// --- Archive.org ---
export const searchArchiveAudio = async (query: string = 'ambient meditation') => {
    try {
        const encodedQuery = encodeURIComponent(`(${query}) AND mediatype:audio`);
        const searchUrl = `https://archive.org/advancedsearch.php?q=${encodedQuery}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=downloads&sort[]=downloads+desc&rows=30&output=json`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (!data.response || !data.response.docs) return [];

        return data.response.docs.map((doc: any) => ({
            id: doc.identifier,
            title: doc.title || 'Untitled Collection', // Changed to title for consistency
            creator: doc.creator || 'Archive Contributor',
            year: doc.year,
            icon: '🏛️',
            category: 'Archive'
        }));
    } catch (e) {
        console.error("Archive Search Error", e);
        return [];
    }
};

export const fetchArchiveTrackUrl = async (id: string): Promise<string | null> => {
    try {
        const metadataUrl = `https://archive.org/metadata/${id}`;
        const response = await fetch(metadataUrl);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!data.files || !Array.isArray(data.files)) return null;

        // Prioritize VBR MP3, then standard MP3
        let playableFile = data.files.find((f: any) => f.format === 'VBR MP3');
        if (!playableFile) {
            playableFile = data.files.find((f: any) => f.format === 'MP3' || (f.name && f.name.endsWith('.mp3')));
        }

        if (!playableFile) return null;
        
        // Construct direct download URL
        // Note: Using https://archive.org/download/{identifier}/{filename}
        const encodedFilename = encodeURIComponent(playableFile.name).replace(/%2F/g, "/");
        return `https://archive.org/download/${id}/${encodedFilename}`;
    } catch (e) {
        console.error("Archive URL Fetch Error", e);
        return null;
    }
};

// --- Grounding Features ---
// Fix: Updated to use responseSchema and handle grounding metadata extraction for URLs as per guidelines.
export const searchScholarships = async (): Promise<any[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const prompt = `Find 5 REAL, active scholarships for African/Tanzanian students in Technology for the 2025-2026 academic year. Use Google Search.`;
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }], 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            deadline: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            link: { type: Type.STRING },
                            requirements: { type: Type.STRING }
                        },
                        required: ["name", "deadline", "amount", "link", "requirements"]
                    }
                }
            }
        });
        
        // Extract URLs from groundingChunks
        const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web?.uri)
            .filter(Boolean) || [];

        const scholarships = response.text ? JSON.parse(response.text) : [];
        // Map grounding URLs to links if they aren't provided in JSON
        return scholarships.map((s: any, i: number) => ({
            ...s,
            link: s.link || groundingUrls[i] || ""
        }));
    } catch (e) { return []; }
};

// Fix: Updated to use responseSchema and handle grounding metadata extraction for URLs as per guidelines.
export const fetchTechEvents = async (): Promise<any[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const prompt = `Find 4 upcoming Tech events in East Africa (Tanzania, Kenya) for late 2025/2026. Use Google Search.`;
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }], 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            date: { type: Type.STRING },
                            loc: { type: Type.STRING },
                            tag: { type: Type.STRING },
                            url: { type: Type.STRING }
                        },
                        required: ["id", "title", "date", "loc", "tag"]
                    }
                }
            }
        });
        
        const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((c: any) => c.web?.uri)
            .filter(Boolean) || [];

        const events = response.text ? JSON.parse(response.text) : [];
        const liveEvents = events.map((e: any, i: number) => ({
            ...e,
            url: e.url || groundingUrls[i] || ""
        }));
        
        // Merge offline Tanzanian tech events to guarantee premium localized content
        const combined = [...OFFLINE_TECH_EVENTS];
        liveEvents.forEach((le: any) => {
            if (!combined.some(ce => ce.title.toLowerCase() === le.title.toLowerCase())) {
                combined.push(le);
            }
        });
        return combined;
    } catch (e) { return OFFLINE_TECH_EVENTS; }
};

// --- Core Features ---
export const analyzeYouTubeVideo = async (url: string) => {
    const prompt = `Analyze this video: ${url}. Provide a structured summary.`;
    try { return markdownToHtml(await callGemini(prompt)); } catch { return "Analysis failed."; }
};

export const transcribePodcast = async (file: FileData) => {
    try {
        const transcript = await callGemini("Transcribe this audio.", 'gemini-3-flash-preview', file);
        return { summary: markdownToHtml(transcript), keyPoints: ["Transcript generated."] };
    } catch { return { summary: "Transcription failed.", keyPoints: [] }; }
};

export const analyzeDocument = async (file: FileData, mode: 'explain' | 'quiz' | 'solve') => {
    let prompt = mode === 'quiz' ? "Generate a quiz from this." : mode === 'solve' ? "Solve this problem." : "Explain this document.";
    try { return markdownToHtml(await callGemini(prompt, 'gemini-3-flash-preview', file)); } catch { return "Analysis failed."; }
};

export const generateContentScript = async (topic: string, platform: string, tone: string, niche: string) => {
    const prompt = `Write a ${tone} ${platform} post about ${topic} for the ${niche} niche.`;
    try { return markdownToHtml(await callGemini(prompt)); } catch { return "Generation failed."; }
};

export const generateResume = async (profileData: string) => {
    const prompt = `Create a resume from: ${profileData}`;
    try { return markdownToHtml(await callGemini(prompt)); } catch { return "Generation failed."; }
};

// Fix: Initialized ai instance with named parameter process.env.API_KEY.
export const generateImage = async (prompt: string): Promise<string | { error: string }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts[0]?.inlineData) {
            return `data:image/png;base64,${parts[0].inlineData.data}`;
        }
        return { error: "No image returned." };
    } catch (e: any) { 
        console.error("Image Gen Error:", e);
        return { error: "Image generation failed." }; 
    }
};

export const editImage = async (image: FileData, prompt: string): Promise<string | { error: string }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const base64Data = image.data.includes(',') ? image.data.split(',')[1] : image.data;
        
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ 
                role: 'user', 
                parts: [
                    { inlineData: { mimeType: image.type, data: base64Data } }, 
                    { text: prompt }
                ] 
            }],
        });
        
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts && parts[0]?.inlineData) {
            return `data:image/png;base64,${parts[0].inlineData.data}`;
        }
        return { error: "Edit failed." };
    } catch (e: any) { 
        console.error("Image Edit Error:", e);
        return { error: "Edit failed." }; 
    }
};

export const summarizeJournalEntry = async (title: string, content: string) => {
    try { return await callGemini(`Summarize: ${title}\n${content}`); } catch { return "Could not summarize."; }
};

export const interpretDream = async (content: string) => {
    try { return markdownToHtml(await callGemini(`Interpret dream: ${content}`)); } catch { return "Could not interpret."; }
};

export const getQuoteOfTheDay = async () => {
    try {
        const res = await callGemini("One inspiring quote: 'Quote - Author'");
        const [text, author] = res.split(' - ');
        return { text: text || "Keep going", author: author || "Mwijay" };
    } catch { return { text: "Keep pushing.", author: "Mwijay" }; }
};

export const getInsightsSummary = async (journals: any[], expenses: any[], language?: string, name?: string) => {
    const prompt = `Analyze these expenses for ${name || 'User'}: ${JSON.stringify(expenses.slice(0, 5))}. 
    Provide a short, helpful financial summary in English. 
    Do not use markdown code blocks like \`\`\`html or \`\`\`. 
    Use simple HTML tags (<b>, <p>, <br>) for formatting if needed.`;
    
    try { 
        const response = await callGemini(prompt);
        return { transactionAnalysis: cleanAiResponse(response) }; 
    } catch { 
        return { transactionAnalysis: "Analysis unavailable." }; 
    }
};

export const generateStudyFlashcards = async (topic: string, context: string): Promise<Flashcard[]> => {
    return (await callGeminiJson(`Create 5 flashcards on ${topic}: ${context}. Return JSON array [{front, back}]`)) || [];
};

export const reviewCode = async (code: string, language: string) => {
    try { return markdownToHtml(await callGemini(`Review ${language} code:\n${code}`)); } catch { return "Review failed."; }
};

export const voiceToCode = async (transcript: string) => {
    const res = await callGeminiJson(`Convert to code: "${transcript}". Return JSON {code, language}`);
    return res || { code: "// Failed", language: "text" };
};

export const getVocabularyWord = async (language: string) => {
    const res = await callGeminiJson(`One ${language} word for beginner. JSON {word, pronunciation, meaning, example}`);
    return res || { word: "Error", pronunciation: "", meaning: "", example: "" };
};

export const evaluatePronunciation = async (audioData: string, word: string) => {
    // Placeholder as audio analysis needs upload
    return { score: "Good", feedback: "Practice makes perfect." };
};

export const generateSystemDiagram = async (description: string) => {
    try { 
        const res = await callGemini(`Mermaid JS graph for: ${description}. Return ONLY code.`);
        return res.replace(/```mermaid|```/g, '').trim(); 
    } catch { return "graph TD; A[Error]-->B[Try Again];"; }
};

export const identifyComponent = async (imageData: string) => {
    try {
        const file = { name: 'comp.jpg', type: 'image/jpeg', data: imageData };
        const res = await callGemini("Identify electronic component. Return name, description, pinout.", 'gemini-3-flash-preview', file);
        return { name: "Component", description: res, pinout: "See description" };
    } catch { return { name: "Unknown", description: "Failed", pinout: "N/A" }; }
};

export const analyzeSystemDiagram = async (imageData: string) => {
    try {
        const file = { name: 'diag.png', type: 'image/png', data: imageData };
        return await callGemini("Analyze this diagram.", 'gemini-3-flash-preview', file);
    } catch { return "Analysis failed."; }
};

const getOfflineStartupFallback = (idea: string, type: 'swot' | 'bmc' | 'validate' | 'pitch' | 'ideas'): any => {
    const text = idea.toLowerCase();
    const isAgri = text.includes('farm') || text.includes('crop') || text.includes('agri') || text.includes('food') || text.includes('irrigation') || text.includes('delivery') || text.includes('market') || text.includes('boda') || text.includes('solar');
    const isEdtech = text.includes('school') || text.includes('academy') || text.includes('learn') || text.includes('teach') || text.includes('code') || text.includes('study') || text.includes('education') || text.includes('class');

    if (type === 'bmc') {
        if (isAgri) {
            return {
                keyPartners: ["Tanzania Agricultural Research Institute (TARI)", "Local smallholder farmer cooperatives", "Solar drip irrigation kit manufacturers", "Tigopesa/M-Pesa money networks"],
                keyActivities: ["Custom irrigation hardware design", "Crop sourcing from local Morogoro farms", "BodaBoda delivery fleet routing", "Agronomic advisory services"],
                valuePropositions: ["Increase harvest yields by 60% with solar drip kits", "Fresh farm produce delivered in urban Dar within 4 hours", "Fair trade pricing bypassing exploitative middlemen"],
                customerRelationships: ["High-trust farmer community circles", "Dedicated customer care on WhatsApp Business", "Bi-weekly agronomy SMS bulletins"],
                customerSegments: ["High-end salad bars and hotels in Dar", "Smallholder farmers in Morogoro & Arusha", "Eco-conscious urban household hubs"],
                keyResources: ["East African soil & weather databases", "Centralized Morogoro cold storage", "Local agronomist advisor network"],
                channels: ["Mwijay Note explore marketplace", "Direct mobile app ordering portal", "Weekly agricultural radio programs"],
                costStructure: ["Hardware kit manufacturing & shipping", "Delivery BodaBoda fuel & vehicle maintenance", "Cold-chain warehouse leasing costs"],
                revenueStreams: ["Solar irrigation kit direct sales & lease", "Weekly subscription vegetable boxes", "Professional agronomic consulting fees"]
            };
        } else if (isEdtech) {
            return {
                keyPartners: ["COSTECH (Science Commission)", "Local government high schools", "Tanzanian telecom network providers", "Hiring tech start-up networks"],
                keyActivities: ["Interactive Swahili coding curriculum design", "Web-based browser execution sandbox engineering", "Weekly dev group mentorship meetings"],
                valuePropositions: ["Offline-friendly programming bootcamps in Swahili", "Guaranteed local developer internships", "Gamified coding challenges with zero data fees"],
                customerRelationships: ["P2P cohort study group forums", "Active local developer community discord", "Graduation alumni mentoring circles"],
                customerSegments: ["Underemployed youth seeking coding skills", "Secondary school students in Arusha & Dar", "Career transitioners seeking remote roles"],
                keyResources: ["Custom Swahili code curriculum syllabus", "Lightweight offline browser compiler sandbox", "Experienced regional coding mentors"],
                channels: ["Mwijay Koding Street web directory", "School computer classroom guest presentations", "Buni Hub tech events"],
                costStructure: ["Lesson publishing & video editing costs", "Minimal sandbox platform hosting fees", "Instructor & platform developer stipends"],
                revenueStreams: ["Premium syllabus certification tracks", "Corporate tech hiring referral commissions", "Weekly private cohort mentorship fees"]
            };
        } else {
            const titleWord = idea.split(' ').slice(0, 3).join(' ') || "Your Enterprise";
            return {
                keyPartners: ["Local business development groups", "Tanzanian payment gateways (Selcom, Tigopesa)", "Youth economic empowerment funds", "Community digital advocates"],
                keyActivities: ["App software development & feature upgrades", "User support & customer success", "Digital advertising & community marketing"],
                valuePropositions: [`Customized localized utility for "${titleWord}"`, "Offline-first capability for stable usage in low-connectivity areas", "Highly competitive pay-as-you-go pricing"],
                customerRelationships: ["Direct localized chat feedback channels", "Customer loyalty incentives", "Interactive app coaching panels"],
                customerSegments: ["Young professionals in Dar & Arusha", "SMEs needing digital management utilities", "Mobile-first technology users"],
                keyResources: ["Proprietary platform software repository", "Customer feedback databases", "Dedicated local user support team"],
                channels: ["Direct digital application downloads", "Social media brand ambassador networks", "Word-of-mouth technology circles"],
                costStructure: ["Core software platform server maintenance", "Customer support & administration", "Digital ambassador rewards"],
                revenueStreams: ["Tiered monthly usage subscription plans", "Transaction processing commission fees", "Premium customization upgrades"]
            };
        }
    }

    if (type === 'swot') {
        if (isAgri) {
            return {
                strengths: ["Highly fertile arable land in Morogoro & Arusha", "Bespoke drip irrigation reducing water waste by 60%", "Direct farm-to-table delivery model"],
                weaknesses: ["High initial manufacturing capital for solar kits", "Transport challenges on unpaved agricultural roads", "Low technical comfort among rural older farmers"],
                opportunities: ["Tanzanian government agricultural grants for youth", "Cross-border expansion into Kenya & Uganda markets", "Direct integrations with mobile money automatic micro-loans"],
                threats: ["Unpredictable climate shifts and extreme weather", "Inexpensive low-quality imported food items", "Regional agricultural pest outbreaks"]
            };
        } else if (isEdtech) {
            return {
                strengths: ["Completely localized Swahili code training program", "Extremely low-bandwidth application usage profile", "High current regional market demand for tech skills"],
                weaknesses: ["Low personal PC ownership among students", "Reluctance to pay for digital educational tracks online", "Scarcity of certified local technical mentors"],
                opportunities: ["Direct corporate-sponsored scholarship campaigns", "Telecom zero-rated student internet data packages", "National youth digital literacy campaigns"],
                threats: ["Free international platforms like YouTube & Coursera", "High cost of private cellular internet packages", "Traditional educational credential preferences"]
            };
        } else {
            return {
                strengths: ["Highly personalized local user experience flow", "100% offline-first system functionality", "Excellent app responsiveness compared to generic sites"],
                weaknesses: ["Limited startup marketing and outreach funds", "High brand trust-building timeline in regional markets", "Dependency on third-party mobile frameworks"],
                opportunities: ["Rapid smartphone and mobile network adoption in East Africa", "First-mover advantage in premium local productivity tools", "Direct marketing partnerships with micro-influencers"],
                threats: ["Sudden local technology regulatory compliance shifts", "Aggressive competitive price cuts by global platforms", "Local currency inflation fluctuations"]
            };
        }
    }

    if (type === 'validate') {
        if (isAgri) {
            return {
                strengths: "Directly improves regional food security. Drip irrigation reduces drought vulnerability. Direct logistics increases farmer earnings by 40%.",
                weaknesses: "High capital requirements for hardware can delay scaling. Rural transit logistics faces road and weather bottlenecks.",
                verdict: "Highly Viable! Agriculture is the absolute core driver of East Africa's economy. Solar water automation and cold logistics produce massive high-margin value."
            };
        } else if (isEdtech) {
            return {
                strengths: "Swahili curriculum breaks language barriers. Low data usage makes it affordable. Browser sandbox operates smoothly on entry-level devices.",
                weaknesses: "Demands high user persistence to complete offline coding targets. Monetization requires creative micro-payment installment plans.",
                verdict: "Outstanding Opportunity! The tech skills demand in Tanzania is booming. Accessible, localized, data-light programming academies enjoy a massive market advantage."
            };
        } else {
            return {
                strengths: "Resolves a very specific operational friction. Scales rapidly with minimal variable costs once code is built.",
                weaknesses: "Subject to copycat competitors. User acquisition could require significant trust-building.",
                verdict: "Viable with Conditions! Keep operating costs extremely lean, highlight the offline capability, and establish high-trust customer channels early."
            };
        }
    }

    if (type === 'pitch') {
        const titleWord = idea.split(' ').slice(0, 3).join(' ') || "Your Enterprise";
        if (isAgri) {
            return [
                { title: "1. The Vision", content: `Scaling Tanzanian agricultural food yields with solar drip irrigation and direct-to-consumer delivery via "${titleWord}".` },
                { title: "2. The Problem", content: "Farming in East Africa is rain-dependent, creating highly volatile yields. Intermediaries squeeze smallholders' profits, retaining up to 85% of values." },
                { title: "3. Our Solution", content: "A low-cost solar drip kit bundled with an SMS soil monitoring dashboard and direct cold-transit BodaBoda routing to urban restaurants." },
                { title: "4. Traction & Market", content: "Successfully piloted with 12 smallholder cooperatives, leading to a 2.5x crop output increase and 40% reduction in irrigation costs." },
                { title: "5. The Ask & Next Steps", content: "Seeking partnerships with local agricultural savings co-ops to finance our first 100 customer irrigation hardware leases." }
            ];
        } else if (isEdtech) {
            return [
                { title: "1. The Vision", content: `Empowering East African junior developers with zero-rated Swahili coding courses and job placements via "${titleWord}".` },
                { title: "2. The Problem", content: "Existing tutorials are high-bandwidth, require expensive PCs, are taught in English, and lack pathways into local tech hiring pools." },
                { title: "3. Our Solution", content: "An interactive Swahili programming application featuring offline compiler playgrounds, zero-rated data lists, and industry placement matchmaking." },
                { title: "4. Traction & Market", content: "Over 450 active students on the training suite with 8 junior engineers successfully hired by top startups in Dar es Salaam." },
                { title: "5. The Ask & Next Steps", content: "Seeking local telecom connections to zero-rate educational domain data so low-income students study completely for free." }
            ];
        } else {
            return [
                { title: "1. The Vision", content: `Revolutionizing efficiency in East Africa through localized mobile productivity tools via "${titleWord}".` },
                { title: "2. The Problem", content: "Generic global tools are complex, expensive, lack offline support, and have no local support or mobile money payment options." },
                { title: "3. Our Solution", content: "A highly responsive, offline-first system integrated with native mobile money invoicing and dedicated local customer success teams." },
                { title: "4. Traction & Market", content: "Targeting the rapidly digitalizing SME and youth demographics in East Africa, a massive market with millions of active mobile connections." },
                { title: "5. The Ask & Next Steps", content: "Led by passionate regional tech leaders who know local pain points. Join us in scaling this ecosystem across East Africa." }
            ];
        }
    }

    if (type === 'ideas') {
        const loc = idea || "Tanzania";
        return [
            {
                title: "1. Solar Agricultural Advisor",
                description: `An automated Kiswahili SMS/voice advisory channel connecting smallholders in ${loc} with real-time crop metrics and solar water schedules.`,
                required_skills: "Basic Agronomy, SMS Gateway APIs, Kiswahili Communications",
                potential_income: "TZS 1,200,000 / month average"
            },
            {
                title: "2. Offline EdTech Content Hubs",
                description: "Publishing zero-rated coding syllabi and pre-configured micro-SD cards containing high-value tech academies for secondary schools.",
                required_skills: "Curriculum Design, Android Filesystems, School Outreach",
                potential_income: "TZS 1,800,000 / month average"
            },
            {
                title: "3. Direct BodaBoda Cold Courier",
                description: "Insulated motorcycle-safe cold transport delivering fresh organic poultry and produce directly from rural farms to urban city kitchens.",
                required_skills: "Logistics Routing, Food Safety Standards, Customer Relations",
                potential_income: "TZS 2,500,000 / month average"
            }
        ];
    }

    return null;
};

export const generateSwotAnalysis = async (idea: string) => {
    if (!navigator.onLine) {
        return getOfflineStartupFallback(idea, 'swot');
    }
    try {
        const res = await callGeminiJson(`SWOT analysis for: ${idea}. JSON {strengths:[], weaknesses:[], opportunities:[], threats:[]}`);
        return res || getOfflineStartupFallback(idea, 'swot');
    } catch {
        return getOfflineStartupFallback(idea, 'swot');
    }
};

export const generateBusinessModel = async (idea: string) => {
    if (!navigator.onLine) {
        return getOfflineStartupFallback(idea, 'bmc');
    }
    try {
        const res = await callGeminiJson(`Business Model Canvas for: ${idea}. JSON keys: keyPartners, keyActivities, valuePropositions, customerRelationships, customerSegments, keyResources, channels, costStructure, revenueStreams (all arrays of strings).`);
        return res || getOfflineStartupFallback(idea, 'bmc');
    } catch {
        return getOfflineStartupFallback(idea, 'bmc');
    }
};

export const executeSql = async (query: string) => {
    return await callGeminiJson(`Simulate SQL: ${query}. Return JSON {columns:[], rows:[[]]}`) || { columns: [], rows: [] };
};

export const validateStartupIdea = async (idea: string) => {
    if (!navigator.onLine) {
        return getOfflineStartupFallback(idea, 'validate');
    }
    try {
        const res = await callGeminiJson(`Validate idea: ${idea}. JSON {strengths, weaknesses, verdict}`);
        return res || getOfflineStartupFallback(idea, 'validate');
    } catch {
        return getOfflineStartupFallback(idea, 'validate');
    }
};

export const getBusinessIdeas = async (location: string) => {
    if (!navigator.onLine) {
        return getOfflineStartupFallback(location, 'ideas');
    }
    try {
        const res = await callGeminiJson(`3 startup ideas for ${location}. JSON array [{title, description, required_skills, potential_income}]`);
        return res || getOfflineStartupFallback(location, 'ideas');
    } catch {
        return getOfflineStartupFallback(location, 'ideas');
    }
};

export const checkAccountingEntry = async (entry: string) => {
    try { return await callGemini(`Check accounting entry: ${entry}`); } catch { return "Check failed."; }
};

export const generatePitchDeck = async (idea: string) => {
    if (!navigator.onLine) {
        return getOfflineStartupFallback(idea, 'pitch');
    }
    try {
        const res = await callGeminiJson(`5 slide pitch deck for ${idea}. JSON array [{title, content}]`);
        return res || getOfflineStartupFallback(idea, 'pitch');
    } catch {
        return getOfflineStartupFallback(idea, 'pitch');
    }
};

export const mapCareerPath = async (skills: string) => {
    return await callGeminiJson(`Career path for skills: ${skills}. JSON array [{role, description, salary, steps:[]}]`) || [];
};

export const generateSkillLesson = async (topic: string, level: string) => {
    return await callGeminiJson(`Lesson on ${topic} (${level}). JSON {title, content, action}`) || { title: "Error", content: "", action: "" };
};

export const continueInterview = async (history: any[], level: string = 'Entry-Level') => {
    try {
        if (!navigator.onLine) throw new Error("Offline");
        const lvlKey = level.toLowerCase() as keyof typeof OFFLINE_INTERVIEW_KNOWLEDGE;
        const questions = OFFLINE_INTERVIEW_KNOWLEDGE[lvlKey] || OFFLINE_INTERVIEW_KNOWLEDGE['entry-level'];
        const prompt = `Act as an expert technical hiring manager at an East African tech company. Continue the mock interview roleplay.
        History of conversation: ${JSON.stringify(history)}.
        Here is a syllabus of questions for inspiration: ${JSON.stringify(questions)}.
        Provide an evaluation of the candidate's last answer and naturally proceed to the next logical question or point.
        Return valid JSON in this exact format: { "reply": "Your next response or question", "feedback": "Detailed feedback on what was good or could be improved about their last answer" }`;
        
        const res = await callGeminiJson(prompt);
        if (!res) throw new Error("Failed to generate response");
        return res;
    } catch {
        return getOfflineInterviewReply(history);
    }
};

export const summarizeLecture = async (content: string) => {
    try { return markdownToHtml(await callGemini(`Summarize lecture notes: ${content}`)); } catch { return "Summary failed."; }
};

export const analyzePitch = async (pitch: string) => {
    return await callGeminiJson(`Analyze elevator pitch: "${pitch}". JSON {score (number), clarity, hook, advice}`) || { score: 0, clarity: "", hook: "", advice: "" };
};

export const getNewsFeed = async () => {
    try {
        const res = await callGeminiJson(`5 tech news headlines for East Africa. JSON array [{title, url, source, snippet}]`);
        return res || [];
    } catch { return []; }
};

export const getZenContent = async () => {
    try {
        const res = await callGeminiJson("Generate a short Zen/Stoic wisdom entry. Return JSON with keys: 'category' (e.g. Stoicism, Mindfulness, Nature), 'text' (the wisdom text, plain text only), 'author' (name).");
        return res || { category: "Mindfulness", text: "Peace comes from within. Do not seek it without.", author: "Buddha" };
    } catch {
        return { category: "Stoicism", text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" };
    }
};

export const generateMoodPlaylist = async (mood: string) => {
    try {
        const res = await callGemini(`Playlist for ${mood} mood. Return ONLY list of 5 songs, one per line.`);
        return res.split('\n').filter(s => s.trim().length > 0);
    } catch { return []; }
};

export const getSwahiliProverb = async () => {
    return await callGeminiJson("One Swahili proverb. JSON {swahili, english, application}") || {swahili: "", english: "", application: ""};
};

export const generateAnnualReview = async (year: number, journals: any[], expenses: any[], goals: any[], habits: any[]) => {
    const prompt = `Annual review for ${year}. Data: Journals=${journals.length}, Expenses=${expenses.length}. JSON {yearInANutshell, emotionalLandscape, keyThemes:[{theme, reflection}], financialJourney, quoteOfTheYear, photoHighlights:[]}`;
    return await callGeminiJson(prompt) || { yearInANutshell: "", emotionalLandscape: "", keyThemes: [], financialJourney: "", quoteOfTheYear: "", photoHighlights: [] };
};

export const getAiCoachingSuggestion = async (context: any) => {
    const prompt = `Coaching suggestion based on: ${JSON.stringify(context)}. JSON {suggestion, actionLabel, action}`;
    return await callGeminiJson(prompt) || { suggestion: "Keep focusing on your goals.", actionLabel: "View Goals", action: "FINANCIAL_GOALS" };
};

export const getAiCoachResponse = async (type: string, journals: any[]) => {
    try {
        const res = await callGemini(`Coach advice on ${type} based on journals.`);
        return { title: "Coach says:", content: markdownToHtml(res) };
    } catch { return { title: "Error", content: "Coach unavailable." }; }
};

export const scanImageToText = async (file: FileData) => {
    try { return await callGemini("Extract text.", 'gemini-3-flash-preview', file); } catch { return ""; }
};

export const generateJournalContentFromTitle = async (title: string) => {
    try { return markdownToHtml(await callGemini(`Write entry for: ${title}`)); } catch { return ""; }
};

export const extractDetailsFromReceipt = async (file: FileData) => {
    return await callGeminiJson("Extract receipt data. JSON {vendor, total, date, category}", 'gemini-3-flash-preview', file) || { vendor: "", total: 0, date: new Date().toISOString(), category: "Miscellaneous" };
};

export const transcribeAudio = async (file: FileData) => {
    try { return await callGemini("Transcribe.", 'gemini-3-flash-preview', file); } catch { return ""; }
};

export const verifyObjectHunt = async (imageData: string, targetName: string) => {
    const file = { name: 'hunt.jpg', type: 'image/jpeg', data: imageData };
    const res = await callGeminiJson(`Is this a ${targetName}? JSON {correct: boolean}`, 'gemini-3-flash-preview', file);
    return res?.correct || false;
};

export const textToSpeech = async (text: string, voice: string = 'Kore') => {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: { parts: [{ text }] },
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch(e) {
        console.error("TTS failed", e);
        return "";
    }
};

export const getDailyPrompt = async () => {
    try { return await callGemini("One journal prompt."); } catch { return "What are you grateful for?"; }
};


export const startInternshipSession = async (role: string, level: string = 'Entry-Level'): Promise<string> => {
    const lvlKey = level.toLowerCase() as keyof typeof OFFLINE_INTERVIEW_KNOWLEDGE;
    const questions = OFFLINE_INTERVIEW_KNOWLEDGE[lvlKey] || OFFLINE_INTERVIEW_KNOWLEDGE['entry-level'];
    const prompt = `Act as an expert technical hiring manager at a prominent East African tech company. 
    Start a mock interview session for a ${level} ${role}. Introduce yourself and ask the FIRST question.
    Here is a localized, professional syllabus of questions for inspiration: ${JSON.stringify(questions)}`;
    try { 
        if (!navigator.onLine) throw new Error("Offline");
        const res = await callGemini(prompt); 
        // If aiRouter falls back, it might not be a valid interview start. Let's check for fallback text if possible, but throwing on !navigator.onLine is safer.
        if (res.includes("I'm offline right now")) throw new Error("Offline router fallback");
        return res;
    } catch { 
        return questions[0] || "Welcome. Let's begin."; 
    }
};

export const replyToInternship = async(history: any[]) => {
    const prompt = `Continue the internship roleplay. Generate a realistic boss name if not established. Provide a reply and a task grade (e.g. A, B, C). History: ${JSON.stringify(history)}. Return JSON with "reply" and "grade" keys.`;
    return (await callGeminiJson(prompt)) || { reply: "Keep going.", grade: "N/A" };
};

export const suggestTitles = async (content: string): Promise<string[]> => {
    try {
        const res = await callGemini(`Suggest 3 titles for: ${content.substring(0, 100)}...`);
        return res.split('\n').filter(t => t.trim()).slice(0, 3);
    } catch { return ["Untitled"]; }
};

export const beautifyJournalContent = async (content: string) => {
    try { return await callGemini(`Improve writing: ${content}`); } catch { return content; }
};

export const solveAccountingProblem = async (problem: string): Promise<string> => {
    const prompt = `Act as an expert accounting tutor. Problem: "${problem}". 1. Identify accounts. 2. Show Double Entry. 3. Explain logic.`;
    return await callGemini(prompt);
};

export const debugCode = async (code: string, language: string, context: string): Promise<string> => {
    const prompt = `Debug this ${language} code: ${code}. Context: ${context}`;
    return await callGemini(prompt);
};

// Fix: Initialized ai instance with named parameter process.env.API_KEY.
export async function* getAiChatResponseStream(msg: string, journals: any[], expenses: any[], context: any) {
    try {
        const ai = new GoogleGenAI({ apiKey: getCurrentKey() });
        const systemInstruction = `You are Mwijay, a helpful AI assistant. Personality: ${context.personality || 'Friendly'}. 
        
        ### AUTOMATION CAPABILITIES
        You can control the application using these tags:
        1. Navigate: {{NAVIGATE:VIEW_NAME}} (e.g. HOME, SETTINGS, RADIO, ZEN_MODE, EDITOR)
        2. Change Theme: {{THEME:THEME_ID}} (e.g. default-dark, sunny, obsidian, moleskine, cyber, sakura, chocolate, coffee, terminal)
        3. Create Note: {{CREATE_NOTE:Title|Content}} (Use this to automatically save a note for the user)
        
        ### FORMATTING GUIDELINES
        - Use Markdown for structure (headers, lists, blockquotes).
        - Use italics (*text*) for emphasis.
        - Be concise and visually organized.`;

        const response = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: msg,
            config: { systemInstruction }
        });

        for await (const chunk of response) {
            yield { text: chunk.text || "" };
        }
    } catch (e: any) {
        console.error("AI Stream Error:", e);
        yield { text: "Sorry, I'm having trouble connecting right now." };
    }
}

export const getFreshFact = async (category: 'Psychology' | 'Fun Fact' | 'Life Hack'): Promise<string> => {
    const prompt = `Give me one interesting, unique, and verified ${category}. Keep it under 20 words. No intro or outro.`;
    try {
        return await callGemini(prompt);
    } catch {
        return ""; 
    }
};

export const getDailyWisdom = async () => {
    const prompt = `Give me ONE unique proverb from a random country/culture. 
    Rules:
    1. If the original language is Swahili or French, provide that text.
    2. If it is any other language, TRANSLATE IT TO ENGLISH as the main text.
    3. Return valid JSON: { "origin": "Country/Culture", "text": "The proverb text", "meaning": "Motivational application for a student/entrepreneur" }`;
    
    return await callGeminiJson(prompt) || { origin: "AI", text: "Keep pushing forward.", meaning: "Perseverance is key." };
};

/**
 * Summarizes a news article from its URL.
 * Since direct CORS fetch isn't possible, we ask the AI to summarize based on the URL and title context.
 */
export const summarizeUrlContent = async (url: string): Promise<string> => {
    try {
        const prompt = `You are a news summarizer. A user wants to read a summary of this article: ${url}
        
Based on the URL and your training knowledge, provide a concise 3-4 sentence summary of what this article likely covers. 
Focus on key facts, context, and why it matters.
If you don't have specific knowledge of this exact article, summarize what you know about this topic from that source.
Be honest if you're giving a general summary rather than the exact article.`;
        
        return await callGemini(prompt);
    } catch {
        return 'Could not generate a summary. Please read the full article.';
    }
};