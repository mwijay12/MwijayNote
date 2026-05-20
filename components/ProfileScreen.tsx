
import React from 'react';
import { ChevronRightIcon, AwardIcon, CardsIcon, DollarSignIcon, BookMarkedIcon, UserIcon, ArrowLeftIcon, HeartIcon, FeatherIcon, SettingsIcon } from './Icons';
import { AppView, UserData } from '../types';
import { useUser } from '../hooks/useUser';

interface ProfileScreenProps {
    userData: UserData | null;
    onNavigate: (view: AppView) => void;
    initialCategory?: any; // Kept for type compatibility but unused
}

const ProfileAvatar: React.FC<{ profilePicture?: string }> = ({ profilePicture }) => {
    if (!profilePicture) return <UserIcon className="w-12 h-12 text-dun" />;
    if (profilePicture.startsWith('data:image')) {
        return <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />;
    }
    return <span className="text-5xl">{profilePicture}</span>;
}

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-card/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
        <div className={`p-2 rounded-full bg-opacity-20 ${color} text-white`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-isabelline">{value}</h3>
        <p className="text-xs text-dun uppercase tracking-wide">{label}</p>
    </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userData, onNavigate }) => {
    const { addGrowthPoints, updateUserAccountDetails } = useUser();

    const { name, profilePicture, growthPoints = 0, streakFreezes = 0 } = userData || { name: 'User', profilePicture: '🧘', growthPoints: 0, streakFreezes: 0 };
    
    // Level Logic
    const levels = [
        { name: 'Novice', min: 0 }, { name: 'Apprentice', min: 100 }, { name: 'Adept', min: 250 },
        { name: 'Journeyman', min: 500 }, { name: 'Expert', min: 1000 }, { name: 'Master', min: 2000 },
        { name: 'Sage', min: 5000 }
    ];
    const currentLevel = [...levels].reverse().find(l => growthPoints >= l.min) || levels[0];
    const nextLevel = levels.find(l => l.min > growthPoints);
    const progressPercent = nextLevel ? ((growthPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

    const buyFreeze = () => {
        if (growthPoints >= 500) {
            addGrowthPoints(-500);
            updateUserAccountDetails({ streakFreezes: streakFreezes + 1 });
        } else {
            alert("Not enough Growth Points (500 required)");
        }
    };

    return (
        <div className="h-full flex flex-col animate-slide-in-from-bottom bg-transparent overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-28">
                <div className="max-w-3xl mx-auto w-full">
                    
                    {/* Header / Identity */}
                    <header className="text-center mb-8 relative">
                        <div className="w-28 h-28 rounded-full bg-card/60 backdrop-blur-lg mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-accent/50 shadow-xl relative group">
                            <ProfileAvatar profilePicture={profilePicture} />
                            <button onClick={() => onNavigate(AppView.ACCOUNT)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <SettingsIcon className="w-6 h-6 text-white"/>
                            </button>
                        </div>
                        <h1 className="text-3xl font-brand font-bold text-isabelline">{name}</h1>
                        <p className="text-sm text-accent font-semibold uppercase tracking-widest mt-1">{currentLevel.name} • Level {Math.floor(growthPoints / 100) + 1}</p>
                    </header>

                    {/* Progress Bar */}
                    <div className="mb-8 px-4">
                        <div className="flex justify-between text-xs text-dun font-semibold mb-2">
                            <span>{growthPoints} GP</span>
                            <span>Next: {nextLevel ? nextLevel.min : 'Max'}</span>
                        </div>
                        <div className="w-full bg-jet/50 rounded-full h-3 border border-white/5 relative overflow-hidden">
                            <div className="bg-gradient-to-r from-amber to-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => onNavigate(AppView.ACHIEVEMENTS)} className="hover:scale-[1.02] transition-transform">
                            <StatCard label="Achievements" value="View" icon={<AwardIcon className="w-6 h-6"/>} color="bg-yellow-500" />
                        </button>
                        <button onClick={buyFreeze} className="hover:scale-[1.02] transition-transform">
                            <StatCard label="Streak Freezes" value={streakFreezes} icon={<span className="text-xl">❄️</span>} color="bg-blue-500" />
                        </button>
                    </div>

                    {/* Personal Tools */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-2 mb-2">My Identity</h3>
                        
                        <button onClick={() => onNavigate(AppView.BUSINESS_CARD)} className="w-full bg-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 border border-white/5 transition-colors group">
                            <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                                <CardsIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left flex-grow">
                                <h4 className="font-bold text-isabelline">Digital Business Card</h4>
                                <p className="text-xs text-dun">Share your contact info.</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-dun"/>
                        </button>

                        <button onClick={() => onNavigate(AppView.HANGUL_CANVAS)} className="w-full bg-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 border border-white/5 transition-colors group">
                            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                <FeatherIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left flex-grow">
                                <h4 className="font-bold text-isabelline">My Signature</h4>
                                <p className="text-xs text-dun">Practice or save your e-signature.</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-dun"/>
                        </button>
                    </div>

                    <div className="space-y-3 mt-6">
                        <h3 className="text-xs font-bold text-dun uppercase tracking-widest px-2 mb-2">Saved Data</h3>
                        
                        <button onClick={() => onNavigate(AppView.SAVED_CONTENT)} className="w-full bg-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 border border-white/5 transition-colors group">
                            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                                <BookMarkedIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left flex-grow">
                                <h4 className="font-bold text-isabelline">Saved Content</h4>
                                <p className="text-xs text-dun">Quotes, prompts, and notes.</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-dun"/>
                        </button>

                        <button onClick={() => onNavigate(AppView.PRAYER_TIMELINE)} className="w-full bg-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 border border-white/5 transition-colors group">
                            <div className="p-2 bg-red-500/20 rounded-xl text-red-400">
                                <HeartIcon className="w-6 h-6"/>
                            </div>
                            <div className="text-left flex-grow">
                                <h4 className="font-bold text-isabelline">Prayer Timeline</h4>
                                <p className="text-xs text-dun">Spiritual journey log.</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-dun"/>
                        </button>
                    </div>

                    <div className="mt-8">
                        <button onClick={() => onNavigate(AppView.SETTINGS)} className="w-full py-3 bg-jet border border-white/10 rounded-xl text-sm font-bold text-dun hover:text-white transition-colors">
                            App Settings
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileScreen;
