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
    const startupName = idea.split(' ').slice(0, 3).join(' ') || "Mwijay Venture";

    // Industry Classification Engine
    let industry: 'Agritech' | 'Fintech' | 'EdTech' | 'HealthTech' | 'LogiTech' | 'EnergyTech' = 'Fintech';
    if (text.includes('farm') || text.includes('crop') || text.includes('agri') || text.includes('food') || text.includes('irrigation') || text.includes('shamba') || text.includes('kilimo')) {
        industry = 'Agritech';
    } else if (text.includes('school') || text.includes('academy') || text.includes('learn') || text.includes('teach') || text.includes('code') || text.includes('study') || text.includes('education') || text.includes('somaji')) {
        industry = 'EdTech';
    } else if (text.includes('health') || text.includes('doctor') || text.includes('hospital') || text.includes('med') || text.includes('clinic') || text.includes('patient') || text.includes('afya')) {
        industry = 'HealthTech';
    } else if (text.includes('delivery') || text.includes('logistics') || text.includes('boda') || text.includes('cargo') || text.includes('courier') || text.includes('truck') || text.includes('transport')) {
        industry = 'LogiTech';
    } else if (text.includes('solar') || text.includes('energy') || text.includes('power') || text.includes('battery') || text.includes('grid') || text.includes('umeme')) {
        industry = 'EnergyTech';
    }

    if (type === 'bmc') {
        switch (industry) {
            case 'Agritech':
                return {
                    keyPartners: ["Tanzania Agricultural Research Institute (TARI)", "Buni Hub (COSTECH)", "Local smallholder cooperatives in Morogoro", "M-Pesa Tanzania", "SIDO"],
                    keyActivities: ["Smart drip irrigation hardware assembly", "Direct crop transport logistics", "Weekly agronomist consultancies", "SMS text weather schedules"],
                    valuePropositions: ["Increase harvest yields by 60% with low-cost solar drip kits", "Direct high-margin farm delivery to Dar es Salaam within 4 hours", "Stable transparent pricing bypassing exploitative middlemen"],
                    customerRelationships: ["High-trust farmer community circles", "WhatsApp Business advisory forums", "Kiswahili micro-training sessions"],
                    customerSegments: ["High-end salad bars and hotels in Dar", "Smallholder farmers in Morogoro & Arusha", "Eco-conscious urban household hubs"],
                    keyResources: ["East African soil & weather databases", "Centralized Morogoro cold storage", "Local agronomist advisor network"],
                    channels: ["Mwijay Note explore marketplace", "Direct mobile app ordering portal", "Weekly agricultural radio programs"],
                    costStructure: ["Hardware kit manufacturing & shipping", "Delivery BodaBoda fuel & vehicle maintenance", "Cold-chain warehouse leasing costs"],
                    revenueStreams: ["Solar irrigation kit direct sales & lease", "Weekly subscription vegetable boxes", "Professional agronomic consulting fees"]
                };
            case 'EdTech':
                return {
                    keyPartners: ["COSTECH (Science Commission)", "Sahara Ventures", "Local government high schools", "Tanzanian telecom network providers", "Hiring tech start-up networks"],
                    keyActivities: ["Interactive Swahili coding curriculum design", "Web-based browser execution sandbox engineering", "Weekly dev group mentorship meetings"],
                    valuePropositions: ["Offline-friendly programming bootcamps in Swahili", "Guaranteed local developer internships", "Gamified coding challenges with zero data fees"],
                    customerRelationships: ["P2P cohort study group forums", "Active local developer community discord", "Graduation alumni mentoring circles"],
                    customerSegments: ["Underemployed youth seeking coding skills", "Secondary school students in Arusha & Dar", "Career transitioners seeking remote roles"],
                    keyResources: ["Custom Swahili code curriculum syllabus", "Lightweight offline browser compiler sandbox", "Experienced regional coding mentors"],
                    channels: ["Mwijay Koding Street web directory", "School computer classroom guest presentations", "Buni Hub tech events"],
                    costStructure: ["Lesson publishing & video editing costs", "Minimal sandbox platform hosting fees", "Instructor & platform developer stipends"],
                    revenueStreams: ["Premium syllabus certification tracks", "Corporate tech hiring referral commissions", "Weekly private cohort mentorship fees"]
                };
            case 'HealthTech':
                return {
                    keyPartners: ["Muhimbili National Hospital", "Ministry of Health", "Medical Stores Department (MSD)", "Local community dispensaries", "Selcom Payment Gateway"],
                    keyActivities: ["Digital prescription routing", "Tele-consultation booking platform maintenance", "Local drug supply chain tracking"],
                    valuePropositions: ["Consult real Tanzanian doctors via USSD & mobile app", "Genuine local medication home delivery in 2 hours", "Affordable monthly family medical micro-insurance plans"],
                    customerRelationships: ["Secure patient-doctor portal", "Periodic chronic health SMS alerts in Swahili", "Dedicated customer WhatsApp line"],
                    customerSegments: ["Working-class families without health insurance", "Elderly patients with chronic conditions", "Rural clinics seeking expert consultations"],
                    keyResources: ["Registered physician roster", "Verified local pharmaceutical supplier database", "HIPAA-compliant hosting nodes"],
                    channels: ["Community health drives", "Pharmacy retail counters", "M-Pesa mini-apps"],
                    costStructure: ["Doctor payout disbursements", "Secure database storage & tele-server leasing", "Local courier drug deliveries"],
                    revenueStreams: ["15% tele-consultation transaction cut", "Medication delivery handling markup fees", "Dispensary software-as-a-service subscriptions"]
                };
            case 'LogiTech':
                return {
                    keyPartners: ["Tanzania Ports Authority (TPA)", "Local BodaBoda unions", "CRDB Bank (Asset financing)", "Airtel Tanzania", "Local fuel networks"],
                    keyActivities: ["Smart freight routing algorithms", "Driver identity & background screening", "Instant delivery payout processing"],
                    valuePropositions: ["Affordable bulk logistics booking for local businesses", "Real-time SMS tracking for cargo in transit", "Insulated cold transport securing produce value"],
                    customerRelationships: ["Dedicated corporate logistics consultants", "Driver welfare schemes & asset loans", "Transparent dispute resolution system"],
                    customerSegments: ["E-commerce retailers in Dar and Arusha", "Fresh produce agricultural traders", "FMCG manufacturers looking for mid-mile haulage"],
                    keyResources: ["Dynamic geofencing transit APIs", "Verified driver & vehicle ledger database", "Local dispatch staff networks"],
                    channels: ["LogiTech dispatch dashboard", "WhatsApp booking bots", "Direct corporate accounts team"],
                    costStructure: ["Transit driver payouts & commissions", "Cellular GPS mapping API charges", "Customer goods transit insurance"],
                    revenueStreams: ["18% standard delivery commission fee", "Insulated cold storage container rentals", "Enterprise logistics software subscriptions"]
                };
            case 'EnergyTech':
                return {
                    keyPartners: ["Tanzania Electric Supply Company (TANESCO)", "TIB Development Bank", "Solar component global manufacturers", "Local SACCOs"],
                    keyActivities: ["Mini-grid engineering & installation", "Pay-as-you-go (PAYG) platform management", "Battery recycle & collection logistics"],
                    valuePropositions: ["Reliable electricity connection for off-grid homes", "Affordable PAYG mobile money billing schedules", "High-efficiency home appliance bundles (TV, Fan, Lights)"],
                    customerRelationships: ["Local village technician networks", "Call center client care support", "Flexible default grace periods"],
                    customerSegments: ["Off-grid rural households in Dodoma & Shinyanga", "Peri-urban kiosk owners seeking backup power", "Small agricultural cold storage projects"],
                    keyResources: ["Proprietary PAYG micro-controller firmware", "Strategic local dealership networks", "Global solar component lines"],
                    channels: ["Local village agency brokers", "Weekly community market showcases", "Radio advertisements"],
                    costStructure: ["Solar panel hardware procurement", "Mini-grid civil installation works", "Local village sales team salaries"],
                    revenueStreams: ["Daily PAYG activation micro-payments", "Outright solar appliance sales", "Commercial battery replacement lease cycles"]
                };
            case 'Fintech':
            default:
                return {
                    keyPartners: ["CRDB Bank", "Selcom Pay", "Vodacom M-Pesa", "Airtel Money", "Tanzania Revenue Authority (TRA)"],
                    keyActivities: ["Real-time transaction clearing", "AML/KYC regulatory checks", "Offline USSD gateway connections"],
                    valuePropositions: ["Instant local vendor payments with low transaction fees", "Collateral-free micro-loans based on M-Pesa statements", "Unified local bookkeeping directly inside Mwijay Note"],
                    customerRelationships: ["Direct localized client support", "User transactional loyalty cashbacks", "Interactive app financial coaches"],
                    customerSegments: ["SME retail merchants (Vibanda)", "Freelance university student builders", "Informal savings groups (Vikoba)"],
                    keyResources: ["Secure encrypted transaction ledger", "USSD telco provider gateway routes", "Local micro-finance credit scores"],
                    channels: ["Buni Hub developer showcases", "TRA local registration kiosks", "Social media brand ambassadors"],
                    costStructure: ["Telco USSD gateway connection charges", "Payment clearing settlement fees", "Regulatory security license audits"],
                    revenueStreams: ["0.8% standard vendor payment cut", "Vikoba group financial statement fees", "Premium instant business loan interests"]
                };
        }
    }

    if (type === 'swot') {
        switch (industry) {
            case 'Agritech':
                return {
                    strengths: ["Highly fertile arable land in Morogoro & Arusha", "Bespoke drip irrigation reducing water waste by 60%", "Direct farm-to-table delivery model bypassing agents"],
                    weaknesses: ["High initial manufacturing capital for solar kits", "Transport challenges on unpaved agricultural roads", "Low technical comfort among rural older farmers"],
                    opportunities: ["COSTECH innovation grants (up to TZS 50M)", "Cross-border expansion into Kenya & Uganda markets", "Direct integrations with mobile money automatic micro-loans"],
                    threats: ["Unpredictable climate shifts and extreme weather", "Inexpensive low-quality imported agricultural items", "Unreliable internet connectivity in peri-urban zones (Morogoro, Tabora)"]
                };
            case 'EdTech':
                return {
                    strengths: ["Completely localized Swahili code training program", "Extremely low-bandwidth application usage profile", "High current regional market demand for tech skills"],
                    weaknesses: ["Low personal PC ownership among students", "Reluctance to pay for digital educational tracks online", "Scarcity of certified local technical mentors"],
                    opportunities: ["Direct corporate-sponsored scholarship campaigns", "Telecom zero-rated student internet data packages", "National youth digital literacy campaigns"],
                    threats: ["Traditional educational credential preferences", "High cost of private cellular internet packages", "Limited angel investor ecosystem outside Dar es Salaam"]
                };
            case 'HealthTech':
                return {
                    strengths: ["Instant USSD connectivity working on all basic phones", "Direct partnerships withMuhimbili medical experts", "Low flat monthly patient subscription plans"],
                    weaknesses: ["Cannot replace physical emergency hospital facilities", "Requires robust secure medical data protection", "Slow initial trust building in rural communities"],
                    opportunities: ["Integrating direct Selcom pharmacy delivery nodes", "National universal health coverage support drives", "Corporate employee wellness sponsorships"],
                    threats: ["Strict regional health sector regulatory shifts", "Unreliable internet connectivity in peri-urban zones (Morogoro, Tabora)", "Prevalence of self-medication trends"]
                };
            case 'LogiTech':
                return {
                    strengths: ["Integrated BodaBoda delivery routes for quick mid-mile", "Full cargo transit guarantee insurance coverages", "Dynamic automated Kiswahili dispatch tools"],
                    weaknesses: ["Highly volatile local diesel & petrol pricing", "Unpaved transport networks slowing rainy transits", "High driver onboarding turnover rates"],
                    opportunities: ["E-commerce parcel delivery booms in East Africa", "M-Pesa API integration potential (40M+ subscribers)", "EAC digital market expansion (Uganda, Kenya, Rwanda)"],
                    threats: ["Sudden regional city center traffic restrictions", "Import duty on hardware components (EAC tariff schedule)", "Aggressive low-pricing strategies by global players"]
                };
            case 'EnergyTech':
                return {
                    strengths: ["Flexible Pay-As-You-Go daily cellular activations", "High-efficiency tier-1 solar system components", "Highly skilled local village repair networks"],
                    weaknesses: ["Long client payback durations delaying cashflow", "Expensive shipping of heavy backup battery packs", "Low user financial security in remote villages"],
                    opportunities: ["Universal off-grid electrification subsidies", "Direct micro-finance asset credit partnerships", "Productive use energy equipment leases (Pumps, Fans)"],
                    threats: ["Import duty on hardware components (EAC tariff schedule)", "Sudden national grid extension to target villages", "Unpredictable client defaults due to dry crop seasons"]
                };
            case 'Fintech':
            default:
                return {
                    strengths: ["Instant localized bookkeeping within Mwijay Note", "Lowest vendor commission percentages (0.8%)", "Offline ledger system working without active connection"],
                    weaknesses: ["Requires active integration partnerships with major banks", "Initial regional merchant trust acquisition curves", "Low credit limit limits during initial deployments"],
                    opportunities: ["Unified merchant payment booms in East African markets", "Vikoba digital empowerment programs", "M-Pesa API integration potential (40M+ subscribers)"],
                    threats: ["Strict mobile money regulatory compliance changes", "Aggressive competitive price wars by tier-1 banks", "Limited angel investor ecosystem outside Dar es Salaam"]
                };
        }
    }

    if (type === 'validate') {
        switch (industry) {
            case 'Agritech':
                return {
                    strengths: "Improves regional food security. Drip irrigation reduces drought vulnerability. Direct logistics increases farmer earnings by 40%.",
                    weaknesses: "High capital requirements for hardware can delay scaling. Rural transit logistics faces road and weather bottlenecks.",
                    verdict: "Highly Viable! Agriculture is the absolute core driver of East Africa's economy. Solar water automation and cold logistics produce massive high-margin value."
                };
            case 'EdTech':
                return {
                    strengths: "Swahili curriculum breaks language barriers. Low data usage makes it affordable. Browser sandbox operates smoothly on entry-level devices.",
                    weaknesses: "Demands high user persistence to complete offline coding targets. Monetization requires creative micro-payment installment plans.",
                    verdict: "Outstanding Opportunity! The tech skills demand in Tanzania is booming. Accessible, localized, data-light programming academies enjoy a massive market advantage."
                };
            case 'HealthTech':
                return {
                    strengths: "USSD access opens up tele-health to all feature phones. Partnering with top hospitals establishes solid clinical trust.",
                    weaknesses: "Requires expensive initial doctor consult payout balances. High regulatory data compliance overheads.",
                    verdict: "Extremely Viable! Digital health access solves a huge regional challenge. Affordable tele-advisory and quick home deliveries create rapid user retention."
                };
            case 'LogiTech':
                return {
                    strengths: "Optimized regional BodaBoda networks lower the cost of last-mile delivery. Full transit insurance secures merchant values.",
                    weaknesses: "Fuel price volatility cuts deeply into operator margins. Extreme weather blocks rural logistics paths.",
                    verdict: "Highly Profitable! Moving physical products is the absolute backbone of commerce. Safe, tracked, and insured freight options scale rapidly."
                };
            case 'EnergyTech':
                return {
                    strengths: "Flexible PAYG mobile money billing matches volatile off-grid village cashflows. Custom solar bundles increase living standards.",
                    weaknesses: "High initial procurement costs. Extended client micro-loan default risks.",
                    verdict: "Solid long-term viability! Reliable energy is a core foundation. Off-grid smart microgrids and clean cooking hubs enjoy strong public support."
                };
            case 'Fintech':
            default:
                return {
                    strengths: "Lowest retail vendor commission fees in the ecosystem. Unified local Vikoba bookkeeping builds rapid network effects.",
                    weaknesses: "Demands strict security audits. Subject to high competition from established mobile networks.",
                    verdict: "Very high potential! Financial access is a massive regional sector. Instant micro-loans and secure offline bookkeeping drive incredible growth."
                };
        }
    }

    if (type === 'pitch') {
        const standardSlides = [
            { title: "1. The Vision", content: `Scaling Tanzanian digital economic value through "${startupName}" — built on top of high-performance localized mobile money networks.` },
            { title: "2. The Problem", content: "Existing systems are complex, require high-end expensive smartphones, cost significant cellular data fees, and lack Swahili-centric support systems." },
            { title: "3. Our Solution", content: "An offline-first, data-optimized prestige platform providing direct micro-service dashboards, local business tools, and mobile money sync." },
            { title: "4. The Market Size", content: "Tanzania's digital economy is projected to reach $2.1B by 2027, driven by 40M+ active mobile connections and Buni Hub initiatives." },
            { title: "5. Competitive Advantage", content: "Complete offline capabilities, zero-rated data portals, lowest micro-transaction vendor fees, and direct Kiswahili customer channels." },
            { title: "6. Competitive Landscape", content: "Competitors like global SaaS packages require expensive cards, while our app integrates directly with CRDB Bank and M-Pesa." },
            { title: "7. Business Model", content: "A high-margin pay-as-you-go micro-transaction model alongside tailored premium custom business templates." },
            { title: "8. Execution Team", content: "Led by highly skilled regional developers, agronomy engineers, and local startup ecosystem mentors out of Sahara Ventures." },
            { title: "9. Financial Highlights", content: "Projecting positive EBITDA in Year 1 with highly optimized customer acquisition and low variable server overhead costs." },
            { title: "10. The Ask & Next Steps", content: "Seeking TZS 120,000,000 (approx. USD 46,000) seed capital to launch our first 200 local pilot operations in Dar es Salaam." }
        ];

        switch (industry) {
            case 'Agritech':
                standardSlides[0].content = `Scaling Tanzanian agricultural food yields with solar drip irrigation and direct-to-consumer delivery via "${startupName}".`;
                standardSlides[1].content = "Farming in East Africa is rain-dependent, creating highly volatile yields. Intermediaries squeeze smallholders' profits, retaining up to 85% of values.";
                standardSlides[2].content = "A low-cost solar drip kit bundled with an SMS soil monitoring dashboard and direct cold-transit BodaBoda routing to urban restaurants.";
                standardSlides[4].content = "Successfully piloted with 12 smallholder cooperatives, leading to a 2.5x crop output increase and 40% reduction in irrigation costs.";
                standardSlides[9].content = "Seeking partnerships with local agricultural savings co-ops to finance our first 100 customer irrigation hardware leases.";
                break;
            case 'EdTech':
                standardSlides[0].content = `Empowering East African junior developers with zero-rated Swahili coding courses and job placements via "${startupName}".`;
                standardSlides[1].content = "Existing tutorials are high-bandwidth, require expensive PCs, are taught in English, and lack pathways into local tech hiring pools.";
                standardSlides[2].content = "An interactive Swahili programming application featuring offline compiler playgrounds, zero-rated data lists, and industry placement matchmaking.";
                standardSlides[4].content = "Over 450 active students on the training suite with 8 junior engineers successfully hired by top startups in Dar es Salaam.";
                standardSlides[9].content = "Seeking local telecom connections to zero-rate educational domain data so low-income students study completely for free.";
                break;
            case 'HealthTech':
                standardSlides[0].content = `Democratizing primary healthcare access across Tanzania using low-cost telemedicine routing and fast pharmacy delivery.`;
                standardSlides[1].content = "Over 60% of rural families reside >10km from the nearest clinic, facing expensive travel times and counterfeit medicine risks.";
                standardSlides[2].content = "A secure telemedicine gateway connecting patients to certified doctors via USSD, combined with verified home pharmaceutical deliveries.";
                standardSlides[4].content = "Partnership signed with Muhimbili National Hospital specialists; completed 120 successful online consultations.";
                standardSlides[9].content = "Seeking TZS 150,000,000 seed funds to establish Selcom micro-payment lines and scale pharmacy coverage.";
                break;
            case 'LogiTech':
                standardSlides[0].content = `Optimizing mid-mile and last-mile freight logistics across Tanzania with smart geofenced driver networks.`;
                standardSlides[1].content = "Local SME traders lose billions to delayed transits, vehicle breakdowns, lack of tracking, and high un-insured cargo risks.";
                standardSlides[2].content = "A unified Kiswahili freight dispatcher allocating nearby verified cargo drivers, showing dynamic tracking, and providing full transit safety insurance.";
                standardSlides[4].content = "Over 80 registered logistics drivers on our network, executing 400+ secured cargo runs across Dar and Arusha.";
                standardSlides[9].content = "Seeking asset financing deals to equip our first 50 dedicated logistics partners with secure insulated cargo boxes.";
                break;
            case 'EnergyTech':
                standardSlides[0].content = `Electrifying rural off-grid villages in Tanzania using smart PAYG solar minigrids and high-efficiency home bundles.`;
                standardSlides[1].content = "Millions of off-grid households rely on expensive and dangerous kerosene lighting, spending up to 20% of income on energy.";
                standardSlides[2].content = "Smart microgrids combined with modular solar kit leases paid in daily mobile money installments under TZS 1,200/day.";
                standardSlides[4].content = "Successfully electrified 2 remote villages in Shinyanga; 98% of users maintain consistent PAYG payment patterns.";
                standardSlides[9].content = "Seeking international solar micro-loan credits to finance equipment purchase cycles for 500 off-grid families.";
                break;
        }
        return standardSlides;
    }

    if (type === 'ideas') {
        switch (industry) {
            case 'Agritech':
                return [
                    { title: "1. Solar Agricultural Advisor", description: "An automated Kiswahili SMS/voice advisory channel connecting smallholders with real-time soil metrics and solar irrigation schedules.", required_skills: "Basic Agronomy, SMS Gateway APIs, Kiswahili Communications", potential_income: "TZS 1,200,000 / month average" },
                    { title: "2. Offline EdTech Content Hubs", description: "Publishing zero-rated coding syllabi and pre-configured micro-SD cards containing high-value tech academies for secondary schools.", required_skills: "Curriculum Design, Android Filesystems, School Outreach", potential_income: "TZS 1,800,000 / month average" },
                    { title: "3. Direct BodaBoda Cold Courier", description: "Insulated motorcycle-safe cold transport delivering fresh organic poultry and produce directly from rural farms to urban city kitchens.", required_skills: "Logistics Routing, Food Safety Standards, Customer Relations", potential_income: "TZS 2,500,000 / month average" }
                ];
            case 'EdTech':
                return [
                    { title: "1. Swahili Mobile Coding Academy", description: "An offline-friendly, interactive code teaching app with custom programming modules explained in pure Swahili.", required_skills: "Software Development, Swahili translation, Curriculum Engineering", potential_income: "TZS 2,000,000 / month average" },
                    { title: "2. Schools Computer Classroom OS", description: "A pre-configured lightweight Linux image packed with offline coding sandboxes, Wikipedia, and study guides for local secondary schools.", required_skills: "System Administration, Linux, Academic Content gathering", potential_income: "TZS 3,500,000 / school average" },
                    { title: "3. Dev Placement & Matchmaking", description: "A specialized agency matching high-performing self-taught developers from local tech bootcamps with international remote startups.", required_skills: "Tech Recruiting, Business Development, Mentoring", potential_income: "TZS 4,000,000 / placement average" }
                ];
            case 'HealthTech':
                return [
                    { title: "1. USSD Doctor Advisory", description: "A simple micro-consultation platform allowing patients to submit basic health symptoms over USSD and receive advice from verified doctors.", required_skills: "USSD Gateways, Medical Roster setup, Tele-medicine regulation", potential_income: "TZS 3,000,000 / month average" },
                    { title: "2. Selcom Pharmaceutical Courier", description: "A premium localized courier service picking up and delivering chronic patient medications from centralized city dispensaries.", required_skills: "Medical Logistics, Cold-chain handling, Customer Support", potential_income: "TZS 2,200,000 / month average" },
                    { title: "3. Vikoba Micro-Insurance Pools", description: "A unified system enabling traditional village savings groups to pool emergency health micro-insurance credits on secure ledgers.", required_skills: "Vikoba structures, Actuarial models, Smart databases", potential_income: "TZS 4,500,000 / group pool" }
                ];
            case 'LogiTech':
                return [
                    { title: "1. BodaBoda Freight Dispatcher", description: "A smart matching app routing parcel deliveries to nearby underemployed motorcycle riders in Dar and Arusha.", required_skills: "Geofencing, Android SDK, Dispatch algorithms", potential_income: "TZS 2,800,000 / month average" },
                    { title: "2. AgriCold Transit boxes", description: "Manufacturing and leasing high-efficiency insulated transport boxes for local motorcycle couriers to safely carry fresh organic foods.", required_skills: "Thermal engineering, Local fabrication, Leasing models", potential_income: "TZS 1,500,000 / box lease / month" },
                    { title: "3. Mid-Mile Heavy Dispatcher", description: "A unified platform connecting local manufacturing warehouses with independent cargo truck operators for bulk freight transport.", required_skills: "Corporate Logistics, Trucking operations, Financial settlements", potential_income: "TZS 6,000,000 / month average" }
                ];
            case 'EnergyTech':
                return [
                    { title: "1. Kiosk Solar Backup Kits", description: "Modular solar solar-charged lithium batteries leased to peri-urban kiosk owners to maintain power during regular grid outages.", required_skills: "Electrical engineering, Battery assemblies, Micro-leasing", potential_income: "TZS 1,600,000 / month average" },
                    { title: "2. Clean Biogas Cooking Hubs", description: "Setting up small-scale community biogas digesters in peri-urban villages to lease clean gas burner cylinders for domestic kitchen uses.", required_skills: "Biogas engineering, Cylinder logistics, Communal outreach", potential_income: "TZS 2,400,000 / month average" },
                    { title: "3. PAYG Solar Irrigation leases", description: "Leasing automated solar-powered irrigation pumps to smallholder farms with flexible pay-as-you-go mobile money payments.", required_skills: "Solar pumps, PAYG micro-control firmware, Sales drives", potential_income: "TZS 3,800,000 / pump deployment" }
                ];
            case 'Fintech':
            default:
                return [
                    { title: "1. Kibanda QR Invoicing", description: "A simple unified QR code payment portal enabling small retail shops (vibanda) to accept all mobile money networks under one code.", required_skills: "QR codes, Payment APIs, Merchant onboarding", potential_income: "TZS 3,500,000 / month average" },
                    { title: "2. Vikoba Digital Ledger", description: "A secure digital bookkeeping app replacing traditional paper books for village informal savings groups with automatic SMS status alerts.", required_skills: "Bookkeeping math, SMS gateway integrations, Local marketing", potential_income: "TZS 1,500,000 / group / year" },
                    { title: "3. Statement Credit Scoring", description: "A smart API analyzer parsing a merchant's mobile money statements to instantly verify creditworthiness for secure short-term micro-loans.", required_skills: "Credit modeling, Regex parsers, Bank API routing", potential_income: "TZS 5,000,000 / month average" }
                ];
        }
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