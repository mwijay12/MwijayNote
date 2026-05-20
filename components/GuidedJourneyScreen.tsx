
import React from 'react';
import { journeys } from '../data/journeys';
import { UserData, AppView, JournalTopic } from '../types';
import { ArrowLeftIcon, BookOpenIcon, CheckIcon } from './Icons';

interface GuidedJourneyScreenProps {
    journeyId: string;
    userData: UserData | null;
    onBack: () => void;
    onStartJournal: (type: 'Guided Journey', topic: JournalTopic.GUIDED, date: string, fromView: AppView, journeyContext: { journeyId: string, stepIndex: number }, title: string) => void;
}

const GuidedJourneyScreen: React.FC<GuidedJourneyScreenProps> = ({ journeyId, userData, onBack, onStartJournal }) => {
    const journey = journeys.find(j => j.id === journeyId);
    if (!journey) {
        return <div className="p-4 pt-16 text-center">Journey not found.</div>;
    }

    const progress = userData?.journeyProgress?.[journey.id] || 0;

    const handleStartStep = (stepIndex: number) => {
        const step = journey.steps[stepIndex];
        onStartJournal(
            'Guided Journey',
            JournalTopic.GUIDED,
            new Date().toISOString(),
            AppView.GUIDED_JOURNEY,
            { journeyId: journey.id, stepIndex: stepIndex + 1 },
            `${step.title} (Day ${step.day})`
        );
    };

    return (
        <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet">
            <header className="flex items-center mb-6 text-center">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/> Guided Journey</h2>
                <div className="w-10"></div>
            </header>
            
            <div className="p-4 bg-card backdrop-blur-lg rounded-2xl mb-6 text-center">
                <h1 className="text-2xl font-serif text-accent">{journey.title}</h1>
                <p className="text-sm text-dun mt-2">{journey.description}</p>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pb-40 no-scrollbar">
                {journey.steps.map((step, index) => {
                    const isCompleted = index < progress;
                    const isCurrent = index === progress;
                    
                    return (
                        <div key={step.day} className={`p-4 rounded-2xl flex items-start gap-4 transition-all ${isCurrent ? 'bg-card border border-accent/30 shadow-lg' : 'bg-card/50'} ${!isCurrent && !isCompleted ? 'opacity-60' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isCompleted ? 'bg-accent text-cafe' : 'bg-jet border border-white/10'}`}>
                                {isCompleted ? <CheckIcon className="w-5 h-5"/> : <span className="font-bold">{step.day}</span>}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-isabelline text-lg">{step.title}</h3>
                                <p className="text-sm text-dun mt-2 leading-relaxed">{step.prompt}</p>
                                {isCurrent && (
                                     <button onClick={() => handleStartStep(index)} className="mt-4 px-6 py-3 text-sm font-bold uppercase tracking-wide rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity shadow-md">
                                        Start Journaling
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default GuidedJourneyScreen;
