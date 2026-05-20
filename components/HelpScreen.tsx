
import React from 'react';
import { ArrowLeftIcon } from './Icons';

const helpTopics = [
    {
        question: "What is Mwijay Note?",
        answer: "Mwijay Note is an AI-powered digital journal designed for self-reflection, personal growth, and organizing your life. It combines a private diary with tools for tracking finances, habits, reminders, and more."
    },
    {
        question: "How do I use the Exam Countdown?",
        answer: "To add a new exam, tap the main '+' button at the bottom of the screen and select 'Add Exam'. The countdown widget will appear on your Home Screen once you have upcoming exams."
    },
    {
        question: "How do I use the AI Chat?",
        answer: "Navigate to the AI screen to chat with your personal assistant. You can ask it to summarize your entries, analyze your spending, find information on the web, or even help you brainstorm ideas. Just type your query and send!"
    },
    {
        question: "What kind of news can I find?",
        answer: "The News Hub is curated specifically for BBIT students. It features Business news from Tanzania, global tech trends (AI, Cloud), and financial market updates."
    },
    {
        question: "How does AI Summary work?",
        answer: "When viewing a journal entry, tap the sparkle icon in the header to generate a summary. Our AI will read the entry and provide a short, concise summary, which is great for quickly recalling the main points of longer entries."
    },
    {
        question: "What is Receipt Scanning?",
        answer: "When creating a new expense, you can use the 'Scan Receipt with AI' option. Just take a picture of your receipt, and the AI will automatically extract the vendor, total amount, and date, saving you time."
    },
    {
        question: "How does Voice Journaling work?",
        answer: "From the 'Create New' menu, select 'Voice Journal'. Simply start talking, and the AI will transcribe your speech into text in real-time. It's a great hands-free way to capture your thoughts."
    },
     {
        question: "How do I enable the AI features?",
        answer: "To use the AI-powered features like chat, summarization, and receipt scanning, you need to provide your own Gemini API key. You can enter your key in the 'Privacy & Security' section of the Profile tab. Your key is stored securely on your device."
    },
    {
        question: "Is my data private and secure?",
        answer: "Yes. All your data is stored locally on your device. We do not have access to your entries. You can set a PIN for extra security and export your data for backup at any time from the Privacy & Security settings."
    }
];

const HelpScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Help & Support</h2>
                <div className="w-10"></div>
            </header>
            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
                {helpTopics.map(topic => (
                    <details key={topic.question} className="bg-card p-4 rounded-2xl group transition-all duration-300 open:bg-card/70">
                        <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            {topic.question}
                            <div className="w-5 h-5 text-dun group-open:rotate-90 transition-transform flex-shrink-0">&#9656;</div>
                        </summary>
                        <p className="text-dun mt-2 text-sm animate-fade-in">{topic.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default HelpScreen;
