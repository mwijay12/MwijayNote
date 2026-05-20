
import { Journey } from '../types';

export const journeys: Journey[] = [
    {
        id: 'gratitude-challenge-7-day',
        title: '7-Day Gratitude Challenge',
        description: 'Cultivate a deeper sense of appreciation and joy by focusing on gratitude for one week.',
        steps: [
            { day: 1, title: 'The Little Things', prompt: 'What are three small, everyday things that brought you a moment of joy today?' },
            { day: 2, title: 'A Person of Impact', prompt: 'Think of one person who has positively influenced your life. Write a short note of gratitude.' },
            { day: 3, title: 'Overcoming Challenges', prompt: 'Reflect on a past challenge. What strengths did you discover in yourself?' },
            { day: 4, title: 'Nature\'s Gift', prompt: 'Describe something beautiful you noticed in nature today.' },
            { day: 5, title: 'Your Strengths', prompt: 'What is one quality about yourself that you are proud of?' },
            { day: 6, title: 'Simple Pleasures', prompt: 'Focus on a simple pleasure you enjoyed today - a meal, a song, a quiet moment.' },
            { day: 7, title: 'Looking Forward', prompt: 'What is one thing you are looking forward to in the future?' }
        ]
    },
    {
        id: 'bbit-founder-path',
        title: 'The BBIT Founder\'s Path',
        description: 'A structured journey for tech students aspiring to build their own startups in Tanzania.',
        steps: [
            { day: 1, title: 'Identifying the Problem', prompt: 'Look around your local community in Tanzania. What is a recurring problem that technology could solve?' },
            { day: 2, title: 'Your Unique Advantage', prompt: 'As a BBIT student, you bridge Business and IT. How does this dual knowledge give you an edge over pure coders or pure business people?' },
            { day: 3, title: 'Market Validation', prompt: 'Who would actually pay for your solution? Describe your ideal customer avatar in Dar es Salaam or Arusha.' },
            { day: 4, title: 'The MVP Mindset', prompt: 'If you had to build a version of your idea in just 2 weeks, what features would you cut? Focus on the core value.' },
            { day: 5, title: 'Financial Reality', prompt: 'How will your idea make money? Subscription? Commission? Ads? Be realistic about the Tanzanian market.' }
        ]
    },
    {
        id: 'christian-techie',
        title: 'The Christian Techie',
        description: 'Reflections on balancing faith, technology, and purpose in the modern world.',
        steps: [
            { day: 1, title: 'Purpose in Code', prompt: 'Read Colossians 3:23. How can writing code or designing systems be an act of worship? How do you work "as unto the Lord"?' },
            { day: 2, title: 'Digital Discernment', prompt: 'Technology is a tool, not a master. In what ways does your phone or laptop distract you from God? How can you set boundaries?' },
            { day: 3, title: 'Serving Others', prompt: 'How can your IT skills be used to help your local church or community? Think of one practical idea.' },
            { day: 4, title: 'Ethics in Tech', prompt: 'As AI and automation grow, what Christian principles should guide your decisions as a future IT leader? (Truth, Justice, Mercy).' },
            { day: 5, title: 'Rest and Sabbath', prompt: 'God rested on the seventh day. Do you trust God enough to take a break from your studies and screens? Plan a digital sabbath.' }
        ]
    },
    {
        id: 'deep-work-mastery',
        title: 'Deep Work Mastery',
        description: 'Train your brain to focus intensely and produce high-quality work.',
        steps: [
            { day: 1, title: 'The Distraction Audit', prompt: 'Track your time today. What specific apps or habits broke your focus? Be honest.' },
            { day: 2, title: 'Embracing Boredom', prompt: 'Next time you wait in line or have a free moment, resist the urge to check your phone. What thoughts come to mind when you allow yourself to be bored?' },
            { day: 3, title: 'The 90-Minute Block', prompt: 'Plan a 90-minute block of pure, uninterrupted work for tomorrow. What specific task will you conquer?' },
            { day: 4, title: 'Rituals of Focus', prompt: 'What small ritual can you create to signal to your brain it\'s time to work? (e.g., A cup of coffee, a specific song, clearing your desk).' },
            { day: 5, title: 'Shutdown Ritual', prompt: 'At the end of the day, write down a plan for tomorrow and say "Shutdown Complete". How does this help you relax?' }
        ]
    },
    {
        id: 'stoic-developer',
        title: 'The Stoic Developer',
        description: 'Apply ancient Stoic wisdom to the modern challenges of software engineering.',
        steps: [
            { day: 1, title: 'Control vs. Chaos', prompt: 'In coding, you control the logic, but not the user or the server uptime. Reflect on a recent "bug" that was out of your control. How did you react?' },
            { day: 2, title: 'The View from Above', prompt: 'Zoom out. Your current coding error is one line in millions. How significant is this problem in the grand scheme of your career?' },
            { day: 3, title: 'Obstacle is the Way', prompt: 'Think of a technology or concept you are struggling to learn. How is this struggle actually making you a better engineer?' }
        ]
    },
    {
        id: 'financial-reset',
        title: '3-Day Financial Reset',
        description: 'Quickly realign your spending and financial goals.',
        steps: [
            { day: 1, title: 'The Audit', prompt: 'Open your Mwijay Note expenses. What is one category where you are leaking money? Be honest.' },
            { day: 2, title: 'The Goal', prompt: 'Why do you want money? Is it freedom? Security? Generosity? Define your "Why".' },
            { day: 3, title: 'The System', prompt: 'What is one automated rule you can set up today (e.g., auto-save 10%) to make your future self richer?' }
        ]
    },
    {
        id: 'imposter-syndrome',
        title: 'Imposter Syndrome Bootcamp',
        description: 'Overcome the feeling that you are a fraud in the tech industry.',
        steps: [
            { day: 1, title: 'Name the Feeling', prompt: 'Describe a recent situation where you felt like you didn\'t belong. What triggered it?' },
            { day: 2, title: 'Fact Checking', prompt: 'List 3 undeniable facts about your achievements or skills. (e.g., "I passed that exam", "I built that app").' },
            { day: 3, title: 'The Learning Curve', prompt: 'Realize that everyone Googles syntax. Not knowing is part of the job. Write down "I am a learner, not an imposter".' }
        ]
    }
];
