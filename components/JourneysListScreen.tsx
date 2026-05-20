
import React from 'react';
import { journeys } from '../data/journeys';
import { UserData, Journey } from '../types';
import { ArrowLeftIcon, BookOpenIcon, ChevronRightIcon } from './Icons';

interface JourneysListScreenProps {
    userData: UserData | null;
    onBack: () => void;
    onNavigateToJourney: (journeyId: string) => void;
}

const GuidedJourneyCard: React.FC<{ journey: Journey, progress: number, onNavigate: () => void }> = ({ journey, progress, onNavigate }) => {
    const progressPercent = (progress / journey.steps.length) * 100;
    
    return (
        <button onClick={onNavigate} className="w-full text-left bg-card backdrop-blur-lg p-4 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-isabelline">{journey.title}</h3>
                    <p className="text-xs text-dun mt-1">{journey.description}</p>
                </div>
                 <div className="flex items-center gap-1 text-sm font-semibold text-accent shrink-0 ml-2">
                    {progress > 0 && progress < journey.steps.length ? 'Continue' : 'Start'} <ChevronRightIcon className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-xs text-dun mb-1">
                    <span>Progress</span>
                    <span>Day {progress > journey.steps.length ? journey.steps.length : progress} of {journey.steps.length}</span>
                </div>
                <div className="w-full bg-bg-primary rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </button>
    );
};

const JourneysListScreen: React.FC<JourneysListScreenProps> = ({ userData, onBack, onNavigateToJourney }) => {
    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/> Guided Journeys</h2>
                <div className="w-10"></div>
            </header>
            
            <p className="text-center text-dun mb-6">Embark on a structured path of reflection and growth. Select a journey to begin.</p>
            
            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
                {journeys.map(journey => (
                    <GuidedJourneyCard 
                        key={journey.id}
                        journey={journey}
                        progress={userData?.journeyProgress?.[journey.id] || 0}
                        onNavigate={() => onNavigateToJourney(journey.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default JourneysListScreen;
