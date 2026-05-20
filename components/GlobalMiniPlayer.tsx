
import React from 'react';
import { PlayIcon, PauseIcon, XIcon, RadioIcon, WifiIcon } from './Icons';
import { AudioTrack } from '../hooks/useGlobalAudio';

interface GlobalMiniPlayerProps {
    track: AudioTrack | null;
    isPlaying: boolean;
    isBuffering: boolean;
    onTogglePlay: () => void;
    onStop: () => void;
    onNavigateToSource: () => void;
}

const GlobalMiniPlayer: React.FC<GlobalMiniPlayerProps> = ({ track, isPlaying, isBuffering, onTogglePlay, onStop, onNavigateToSource }) => {
    if (!track) return null;

    return (
        <div className="fixed bottom-32 md:bottom-8 right-4 z-[100] animate-slide-in-from-bottom">
            <div className="relative group">
                {/* Close Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onStop(); }}
                    className="absolute -top-2 -right-2 z-20 bg-bg-primary border border-white/20 text-dun hover:text-white p-1 rounded-full shadow-lg w-6 h-6 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                    aria-label="Close Player"
                >
                    <XIcon className="w-3 h-3" />
                </button>

                {/* Main Player Bubble */}
                <div 
                    onClick={onNavigateToSource}
                    className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative cursor-pointer hover:scale-105 transition-transform bg-bg-primary"
                    style={{ boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' }}
                >
                    {/* Artwork Background */}
                    <div className="absolute inset-0">
                         {track.artwork ? (
                            <img src={track.artwork} alt="art" className="w-full h-full object-cover opacity-90" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                <RadioIcon className="w-8 h-8 text-white/20" />
                            </div>
                        )}
                    </div>
                    
                    {/* Dark Overlay & Controls */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center hover:bg-black/30 transition-colors">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                            className="text-white drop-shadow-md hover:scale-110 transition-transform active:scale-95"
                        >
                            {isBuffering ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : isPlaying ? (
                                <PauseIcon className="w-8 h-8 fill-current" />
                            ) : (
                                <PlayIcon className="w-8 h-8 fill-current ml-1" />
                            )}
                        </button>
                    </div>

                    {/* Active State Border/Glow */}
                    {isPlaying && (
                        <div className="absolute inset-0 border-2 border-accent/50 rounded-2xl animate-pulse pointer-events-none"></div>
                    )}
                    
                    {/* Live Badge */}
                    {track.isLive && (
                        <div className="absolute bottom-1 right-1 pointer-events-none">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalMiniPlayer;
