export const OFFLINE_TECH_EVENTS = [
    {
        id: 1,
        title: "Dar es Salaam Tech Week 2026",
        date: "October 12-16, 2026",
        loc: "Dar es Salaam, Tanzania",
        tag: "Tech & Innovation",
        url: "https://example.com/dar-tech-week"
    },
    {
        id: 2,
        title: "Sahara Sparks Innovation Summit",
        date: "August 5-7, 2026",
        loc: "Mlimani City, Dar es Salaam",
        tag: "Startup Ecosystem",
        url: "https://saharasparks.com"
    },
    {
        id: 3,
        title: "FinTech East Africa Conference",
        date: "November 20-21, 2026",
        loc: "Nairobi, Kenya (Virtual Access TZ)",
        tag: "FinTech",
        url: "https://example.com/fintech-ea"
    },
    {
        id: 4,
        title: "Tanzania AI & Data Science Meetup",
        date: "September 15, 2026",
        loc: "Buni Hub, Dar es Salaam",
        tag: "Artificial Intelligence",
        url: "https://example.com/tz-ai"
    },
    {
        id: 5,
        title: "Women in Tech Africa Summit TZ",
        date: "December 4-5, 2026",
        loc: "Serena Hotel, Dar es Salaam",
        tag: "Diversity & Tech",
        url: "https://example.com/women-in-tech"
    }
];

export const OFFLINE_INTERVIEW_KNOWLEDGE = {
    "entry-level": [
        "Welcome to the interview! Can you start by telling me a little bit about yourself and your background?",
        "What motivated you to apply for this role?",
        "Can you describe a time when you had to learn a new skill quickly?",
        "How do you handle working in a team environment?",
        "Where do you see yourself in 3 years within the tech industry?"
    ],
    "mid-level": [
        "Welcome. Could you walk me through a recent project you're proud of and your specific contributions?",
        "Describe a situation where you had a conflict with a team member. How did you resolve it?",
        "How do you ensure your code or work is of high quality?",
        "Can you explain a complex technical concept to a non-technical stakeholder?",
        "How do you balance feature development with technical debt?"
    ],
    "senior": [
        "Welcome. Tell me about a time you led a project from conception to launch. What were the main challenges?",
        "How do you approach mentoring junior team members?",
        "Describe a time when a project was failing. How did you pivot or recover?",
        "What is your approach to system architecture and ensuring scalability?",
        "How do you stay updated with industry trends and decide which new technologies to adopt?"
    ],
    "manager": [
        "Welcome. Could you share your philosophy on building and managing high-performing teams?",
        "How do you handle an underperforming employee?",
        "Describe a time you had to deliver bad news to stakeholders. How did you manage it?",
        "How do you align your team's technical goals with the broader business objectives?",
        "What metrics do you use to measure the success of your engineering team?"
    ]
};

export const getOfflineInterviewReply = (history: any[]) => {
    // Basic offline logic to progress the interview
    const turnCount = history.filter(m => m.sender === 'You').length;
    
    if (turnCount === 1) {
        return {
            reply: "That's a great start. Tell me, what do you consider to be your greatest strength and your greatest weakness?",
            feedback: "Good introduction. Make sure to highlight specific achievements."
        };
    } else if (turnCount === 2) {
        return {
            reply: "Interesting. Can you describe a challenging project you worked on and how you overcame the obstacles?",
            feedback: "Self-awareness is key. You communicated your strengths well."
        };
    } else if (turnCount === 3) {
        return {
            reply: "Thank you for sharing that. How do you handle tight deadlines and working under pressure?",
            feedback: "Great use of the STAR method (Situation, Task, Action, Result) if applied, but keep it concise."
        };
    } else if (turnCount === 4) {
        return {
            reply: "I see. Do you have any questions for me about the role or the company?",
            feedback: "Solid answer. Always tie your stress management back to clear communication and prioritization."
        };
    } else {
        return {
            reply: "Thank you for your time today! We will be in touch regarding the next steps.",
            feedback: "Always prepare 2-3 thoughtful questions to ask the interviewer at the end. Great job overall!"
        };
    }
};
