import React from 'react';
import { ArrowLeftIcon, AwardIcon } from './Icons';
import { Achievement } from '../types';

interface AchievementsScreenProps {
  achievements: Achievement[];
  onBack: () => void;
}

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  return (
    <div className={`p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${achievement.isUnlocked ? 'bg-card' : 'bg-card/50 opacity-60'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${achievement.isUnlocked ? 'bg-accent/20 text-accent' : 'bg-bg-primary text-dun'}`}>
        {achievement.icon}
      </div>
      <h3 className={`font-semibold ${achievement.isUnlocked ? 'text-isabelline' : 'text-dun'}`}>{achievement.title}</h3>
      <p className="text-xs text-dun mt-1">{achievement.description}</p>
    </div>
  );
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements, onBack }) => {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif mx-auto">Achievements</h2>
        <div className="w-10"></div>
      </header>

      <div className="text-center mb-6">
        <AwardIcon className="w-12 h-12 mx-auto text-accent mb-2"/>
        <p className="font-semibold text-isabelline">You've unlocked {unlockedCount} of {totalCount} achievements.</p>
        <div className="w-full bg-bg-primary rounded-full h-2.5 mt-2">
            <div className="bg-accent h-2.5 rounded-full" style={{width: `${(unlockedCount/totalCount)*100}%`}}></div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;
