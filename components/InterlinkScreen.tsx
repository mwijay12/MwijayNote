import React, { useState } from 'react';
import { ArrowLeftIcon, SearchIcon, SendIcon, BellIcon, CalendarIcon, GlobeIcon, ShareIcon, ClockIcon } from './Icons';
import haptic from '../utils/haptics';

interface InterlinkScreenProps {
    onBack: () => void;
}

interface Hotline {
    name: string;
    number: string;
    description: string;
    category: 'Emergency' | 'Startup Hub' | 'Tech';
}

const TANZANIA_HOTLINES: Hotline[] = [
    { name: 'Police Emergency', number: '112', description: 'National Police assistance line', category: 'Emergency' },
    { name: 'Fire & Rescue', number: '115', description: 'Emergency firefighting response service', category: 'Emergency' },
    { name: 'Buni Hub Support', number: '+255222700745', description: 'COSTECH technology incubation center', category: 'Startup Hub' },
    { name: 'Sahara Ventures Sandbox', number: '+255768565556', description: 'Tanzanian startup accelerator and events', category: 'Startup Hub' },
    { name: 'Cyber Alert (TCRA)', number: '190', description: 'Tanzania Cyber Security incident report hotline', category: 'Tech' },
];

const InterlinkScreen: React.FC<InterlinkScreenProps> = ({ onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [smsNumber, setSmsNumber] = useState('');
    const [smsBody, setSmsBody] = useState('');
    
    // Gmail Compiler States
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // GChat Webhook Compiler States
    const [gchatTitle, setGchatTitle] = useState('');
    const [gchatText, setGchatText] = useState('');
    const [gchatWebhookResult, setGchatWebhookResult] = useState('');

    const handleGoogleSearch = () => {
        haptic.mediumTap();
        if (!searchQuery.trim()) return;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    };

    const handleWhatsApp = () => {
        haptic.mediumTap();
        if (!whatsappNumber.trim()) return;
        // Strip out non-numeric characters for safety
        const cleanNum = whatsappNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
    };

    const handleSMS = () => {
        haptic.mediumTap();
        if (!smsNumber.trim()) return;
        window.location.href = `sms:${smsNumber}?body=${encodeURIComponent(smsBody)}`;
    };

    const handleEmail = () => {
        haptic.mediumTap();
        if (!emailTo.trim()) return;
        window.location.href = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    };

    const generateGChatPayload = () => {
        haptic.mediumTap();
        const payloadObj = {
            cardsV2: [
                {
                    cardId: "mwijay_note_card",
                    card: {
                        header: {
                            title: gchatTitle || "Mwijay Note Dispatch",
                            subtitle: "Automated Webhook Sync",
                            imageUrl: "https://mwijay-note.web.app/logo.png",
                            imageType: "CIRCLE"
                        },
                        sections: [
                            {
                                header: "Message Body",
                                widgets: [
                                    {
                                        textParagraph: {
                                            text: gchatText || "Empty message body..."
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        };
        setGchatWebhookResult(JSON.stringify(payloadObj, null, 2));
    };

    const copyGChatPayload = () => {
        haptic.mediumTap();
        if (!gchatWebhookResult) return;
        navigator.clipboard.writeText(gchatWebhookResult);
        alert("Payload copied to clipboard!");
    };

    const handleCalendar = () => {
        haptic.lightTap();
        window.open('https://calendar.google.com/calendar/u/0/r', '_blank');
    };

    const handleClock = () => {
        haptic.lightTap();
        const intentUrl = "intent://com.android.deskclock.ALARM_ALERT#Intent;scheme=android-app;end";
        try {
            window.location.href = intentUrl;
            setTimeout(() => {
                alert("Could not trigger native Clock automatically. Opening standard Calendar instead.");
                handleCalendar();
            }, 1200);
        } catch(e) {
            alert("Native app triggers are only supported in mobile wrappers.");
        }
    };

    const handleShareApp = async () => {
        haptic.lightTap();
        if (navigator.share) {
            try {
                let urlToShare = window.location.href;
                if (!urlToShare.startsWith('http')) {
                    urlToShare = 'https://mwijay-note.web.app';
                }
                await navigator.share({
                    title: 'Mwijay Note',
                    text: 'Explore this beautiful AI-powered offline journal, budget tracker, and study studio!',
                    url: urlToShare
                });
            } catch (error) {
                console.warn('Error sharing:', error);
            }
        } else {
            alert("Native sharing is not supported on this browser context.");
        }
    };

    const handleGmailLink = () => {
        haptic.lightTap();
        window.open('https://gmail.com', '_blank');
    };

    const handleCallHotline = (num: string) => {
        haptic.heavyTap();
        window.location.href = `tel:${num}`;
    };

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary overflow-y-auto no-scrollbar pb-24">
            
            {/* Header */}
            <header className="flex items-center mb-6 justify-between shrink-0">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6 text-dun" />
                    </button>
                    <h2 className="text-xl font-brand font-black ml-4 text-isabelline uppercase tracking-wider">
                        Connect Hub
                    </h2>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping"></div>
            </header>

            {/* Quick Utility Actions grid */}
            <div className="grid grid-cols-4 gap-2 mb-6 shrink-0">
                <button onClick={handleCalendar} className="bg-card p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all gap-1">
                    <CalendarIcon className="w-5 h-5 text-accent"/>
                    <span className="text-[9px] font-black text-dun uppercase tracking-widest mt-1">Calendar</span>
                </button>
                <button onClick={handleClock} className="bg-card p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all gap-1">
                    <ClockIcon className="w-5 h-5 text-rose-400"/>
                    <span className="text-[9px] font-black text-dun uppercase tracking-widest mt-1">Clock</span>
                </button>
                <button onClick={handleShareApp} className="bg-card p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all gap-1">
                    <ShareIcon className="w-5 h-5 text-blue-400"/>
                    <span className="text-[9px] font-black text-dun uppercase tracking-widest mt-1">Share</span>
                </button>
                <button onClick={handleGmailLink} className="bg-card p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all gap-1">
                    <span className="text-lg">✉️</span>
                    <span className="text-[9px] font-black text-dun uppercase tracking-widest mt-1">Gmail</span>
                </button>
            </div>

            {/* Main Interactive Workspaces */}
            <div className="space-y-6">

                {/* 1. Quick Search */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-accent font-bold">
                        <GlobeIcon className="w-4 h-4"/>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">Google Smart Search</h3>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Type search terms..."
                            className="flex-1 bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-accent/40 text-sm text-white placeholder:text-dun/30"
                            onKeyDown={e => { if (e.key === 'Enter') handleGoogleSearch(); }}
                        />
                        <button onClick={handleGoogleSearch} className="bg-accent hover:bg-accent/80 text-black px-4 rounded-xl transition-all">
                            <SearchIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* 2. WhatsApp direct messaging compiling wrapper */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold">
                        <span className="text-base">💬</span>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">WhatsApp Waiver compiler</h3>
                    </div>
                    <p className="text-[10px] text-dun/50 mb-3 leading-relaxed">
                        Trigger pre-compiled chat dialogues targeting direct country cellular lines without saving local address files first.
                    </p>
                    <div className="space-y-3">
                        <input 
                            value={whatsappNumber}
                            onChange={e => setWhatsappNumber(e.target.value)}
                            placeholder="Enter phone with country code (e.g. 255768...)"
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-emerald-400/40 text-sm text-white placeholder:text-dun/30"
                        />
                        <textarea 
                            value={whatsappMessage}
                            onChange={e => setWhatsappMessage(e.target.value)}
                            placeholder="Message body content..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-emerald-400/40 text-sm text-white resize-none h-16 placeholder:text-dun/30"
                        />
                        <button onClick={handleWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2">
                            <SendIcon className="w-4 h-4"/> Dispatch WhatsApp Message
                        </button>
                    </div>
                </div>

                {/* 3. Direct SMS Dispatch */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold">
                        <span className="text-base">📱</span>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">Quick SMS Compiler</h3>
                    </div>
                    <div className="space-y-3">
                        <input 
                            value={smsNumber}
                            onChange={e => setSmsNumber(e.target.value)}
                            placeholder="Recipient phone number..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-amber-400/40 text-sm text-white placeholder:text-dun/30"
                        />
                        <textarea 
                            value={smsBody}
                            onChange={e => setSmsBody(e.target.value)}
                            placeholder="SMS body content..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-amber-400/40 text-sm text-white resize-none h-16 placeholder:text-dun/30"
                        />
                        <button onClick={handleSMS} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg">
                            Open in SMS App
                        </button>
                    </div>
                </div>

                {/* 4. Gmail workspace draft direct dispatcher */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold">
                        <span className="text-base">📬</span>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">Gmail Draft Compiler</h3>
                    </div>
                    <p className="text-[10px] text-dun/50 mb-3 leading-relaxed">
                        Compose structured outlines and draft emails to launch instantly inside your workspace email client.
                    </p>
                    <div className="space-y-3">
                        <input 
                            value={emailTo}
                            onChange={e => setEmailTo(e.target.value)}
                            placeholder="Recipient address (e.g. mwijaydavie@gmail.com)"
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400/40 text-sm text-white placeholder:text-dun/30"
                        />
                        <input 
                            value={emailSubject}
                            onChange={e => setEmailSubject(e.target.value)}
                            placeholder="Subject line..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400/40 text-sm text-white placeholder:text-dun/30"
                        />
                        <textarea 
                            value={emailBody}
                            onChange={e => setEmailBody(e.target.value)}
                            placeholder="Write message drafts here..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400/40 text-sm text-white resize-none h-20 placeholder:text-dun/30"
                        />
                        <button onClick={handleEmail} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg">
                            Dispatch to Gmail Client
                        </button>
                    </div>
                </div>

                {/* 5. Google Chat / webhook formatted code generator */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold">
                        <span className="text-base">🤖</span>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">G-Chat Webhook Builder</h3>
                    </div>
                    <p className="text-[10px] text-dun/50 mb-3 leading-relaxed">
                        Construct clean, structured CardsV2 payloads to dispatch announcements to Google Chat webhooks.
                    </p>
                    <div className="space-y-3">
                        <input 
                            value={gchatTitle}
                            onChange={e => setGchatTitle(e.target.value)}
                            placeholder="Card Header Title..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-400/40 text-sm text-white placeholder:text-dun/30"
                        />
                        <textarea 
                            value={gchatText}
                            onChange={e => setGchatText(e.target.value)}
                            placeholder="Announcement text content..."
                            className="w-full bg-black/40 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-400/40 text-sm text-white resize-none h-16 placeholder:text-dun/30"
                        />
                        <div className="flex gap-2">
                            <button onClick={generateGChatPayload} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all">
                                Compile Card
                            </button>
                            {gchatWebhookResult && (
                                <button onClick={copyGChatPayload} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 rounded-xl text-xs transition-all">
                                    Copy Code
                                </button>
                            )}
                        </div>
                        {gchatWebhookResult && (
                            <pre className="bg-black/60 p-3 rounded-xl text-[10px] text-emerald-400 overflow-x-auto max-h-40 border border-white/5 font-mono">
                                {gchatWebhookResult}
                            </pre>
                        )}
                    </div>
                </div>

                {/* 6. Tanzania Tech & Emergency Speed Dials */}
                <div className="bg-card p-4 rounded-2xl border border-white/5 shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-rose-500 font-bold">
                        <span className="text-base">🇹🇿</span>
                        <h3 className="text-xs uppercase tracking-widest font-black text-white">TZ Speed Dials & Hubs</h3>
                    </div>
                    <div className="space-y-2">
                        {TANZANIA_HOTLINES.map((h, idx) => (
                            <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-accent/10 text-accent font-black uppercase px-2 py-0.5 rounded">
                                            {h.category}
                                        </span>
                                        <h4 className="text-xs font-bold text-white">{h.name}</h4>
                                    </div>
                                    <p className="text-[10px] text-dun/50 mt-1">{h.description}</p>
                                </div>
                                <button 
                                    onClick={() => handleCallHotline(h.number)}
                                    className="bg-accent hover:bg-accent/80 text-black px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                                >
                                    📞 Call
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InterlinkScreen;
