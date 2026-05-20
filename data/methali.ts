
export interface Methali {
    text: string;        // The proverb itself
    origin: string;      // e.g., "Japanese", "Zambian"
    meaning: string;     // The motivation/application
    translation?: string; // Optional translation
}

export const methaliData: Methali[] = [
    // --- SWAHILI ---
    { 
        text: "Kuteleza sio kuanguka.", 
        origin: "Swahili", 
        meaning: "Slipping is not falling. A mistake is not a failure unless you refuse to get up." 
    },
    { 
        text: "Mavi ya kale hayanuki.", 
        origin: "Swahili", 
        meaning: "Old poop doesn't stink. Don't dwell on past mistakes; they are gone." 
    },
    { 
        text: "Haba na haba, hujaza kibaba.", 
        origin: "Swahili", 
        meaning: "Little by little, the pot fills. Consistency wins." 
    },
    { 
        text: "Njia ya mwongo ni fupi.", 
        origin: "Swahili", 
        meaning: "The path of a liar is short. Honesty is sustainable." 
    },
    
    // --- AFRICAN (Specific Countries) ---
    { 
        text: "When you run alone, you run fast. When you run together, you run far.", 
        origin: "Zambian", 
        meaning: "Collaboration builds legacy. Solo work builds speed." 
    },
    { 
        text: "However long the night, the dawn will break.", 
        origin: "Hausa", 
        meaning: "No bad situation lasts forever." 
    },
    { 
        text: "Smooth seas do not make skillful sailors.", 
        origin: "African Proverb", 
        meaning: "Difficult challenges are what make you an expert." 
    },
    { 
        text: "The axe forgets; the tree remembers.", 
        origin: "Zimbabwean", 
        meaning: "Be mindful of how you treat people. They remember how you made them feel." 
    },
    
    // --- ASIAN / GLOBAL ---
    { 
        text: "Fall seven times, stand up eight.", 
        origin: "Japanese", 
        meaning: "Resilience is about getting back up one more time." 
    },
    { 
        text: "A journey of a thousand miles begins with a single step.", 
        origin: "Chinese", 
        meaning: "Don't be overwhelmed. Just start." 
    },
    { 
        text: "The best time to plant a tree was 20 years ago. The second best time is now.", 
        origin: "Chinese", 
        meaning: "It is never too late to start." 
    },
    { 
        text: "This too shall pass.", 
        origin: "Persian", 
        meaning: "Bad times are temporary. Good times are precious." 
    }
];
