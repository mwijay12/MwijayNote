
import React, { useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, SparklesIcon, Volume2Icon, TagIcon } from './Icons';
import { generateMoodPlaylist } from '../services/geminiService';

interface MoodMapScreenProps {
  journals: JournalEntry[];
  onBack: () => void;
  onPreviewJournal: (journal: JournalEntry) => void;
}

const moodColors: { [key: number]: string } = {
  1: 'bg-red-500/80',
  2: 'bg-orange-500/80',
  3: 'bg-dun/80',
  4: 'bg-accent/80',
  5: 'bg-green-500/80',
};

const moodNames: { [key: number]: string } = {
    1: 'Struggling',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Great'
};

const MoodMapScreen: React.FC<MoodMapScreenProps> = ({ journals, onBack, onPreviewJournal }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [playlist, setPlaylist] = useState<string[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const moodData = useMemo(() => {
      const data = new Map<string, number>();
      journals.forEach(j => {
          if(j.mood) data.set(new Date(j.date).toDateString(), j.mood);
      });
      return data;
  }, [journals]);

  // Insights Logic: Correlate tags with average mood
  const insights = useMemo(() => {
      const tagMoodMap: Record<string, { total: number, count: number }> = {};
      journals.forEach(j => {
          if (j.mood && j.tags) {
              j.tags.forEach(tag => {
                  if (!tagMoodMap[tag]) tagMoodMap[tag] = { total: 0, count: 0 };
                  tagMoodMap[tag].total += j.mood!;
                  tagMoodMap[tag].count += 1;
              });
          }
      });

      const correlatedTags = Object.entries(tagMoodMap)
          .filter(([_, data]) => data.count >= 2) // Minimum 2 entries to be relevant
          .map(([tag, data]) => ({ tag, avg: data.total / data.count }))
          .sort((a, b) => b.avg - a.avg);

      const topMoodTag = correlatedTags[0];
      const lowMoodTag = correlatedTags[correlatedTags.length - 1];

      return { top: topMoodTag, low: lowMoodTag };
  }, [journals]);

  const recentAverageMood = useMemo(() => {
      const recent = journals.slice(0, 5).filter(j => j.mood);
      if (recent.length === 0) return 3;
      const sum = recent.reduce((acc, j) => acc + (j.mood || 3), 0);
      return Math.round(sum / recent.length);
  }, [journals]);

  // Generate weeks for heatmap (Year in Pixels style)
  const weeks = useMemo(() => {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31);
      const weeksArr = [];
      let currentWeek: { date: Date; mood?: number }[] = [];
      
      // Padding for start
      for (let i = 0; i < start.getDay(); i++) {
          currentWeek.push({ date: new Date(start.getTime() - (start.getDay() - i) * 86400000) }); // dummy dates
      }

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateObj = new Date(d);
          currentWeek.push({
              date: dateObj,
              mood: moodData.get(dateObj.toDateString())
          });
          if (currentWeek.length === 7) {
              weeksArr.push(currentWeek);
              currentWeek = [];
          }
      }
      if (currentWeek.length > 0) weeksArr.push(currentWeek);
      return weeksArr;
  }, [currentYear, moodData]);

  const handleGeneratePlaylist = async () => {
      setIsGenerating(true);
      try {
          const moodStr = moodNames[recentAverageMood] || 'Neutral';
          const songs = await generateMoodPlaylist(moodStr);
          setPlaylist(songs);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-jet relative">
      {playlist && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in" onClick={() => setPlaylist(null)}>
              <div className="bg-card w-full max-w-sm p-6 rounded-3xl border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPlaylist(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                  <div className="flex items-center gap-3 mb-4 text-accent">
                      <Volume2Icon className="w-6 h-6"/>
                      <h3 className="text-xl font-serif">Mood Playlist</h3>
                  </div>
                  <p className="text-sm text-dun mb-4">Songs for when you feel <strong>{moodNames[recentAverageMood]}</strong>.</p>
                  <div className="space-y-3">
                      {playlist.map((song, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-jet rounded-xl">
                              <span className="text-dun font-mono text-xs">{i+1}</span>
                              <span className="text-isabelline text-sm font-medium">{song}</span>
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`} target="_blank" className="ml-auto text-accent text-xs font-bold hover:underline">Play</a>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <header className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentYear(y => y - 1)} className="p-1 rounded-full hover:bg-white/10"><ChevronLeftIcon className="w-5 h-5"/></button>
          <h2 className="text-xl font-serif">{currentYear} Year in Pixels</h2>
          <button onClick={() => setCurrentYear(y => y + 1)} className="p-1 rounded-full hover:bg-white/10"><ChevronRightIcon className="w-5 h-5"/></button>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 min-h-[120px]">
          <div className="inline-flex gap-1 h-full">
              {weeks.map((week, i) => (
                  <div key={i} className="flex flex-col gap-1">
                      {week.map((day, j) => (
                          <div 
                            key={j} 
                            className={`w-4 h-4 rounded-sm transition-all ${day.mood ? moodColors[day.mood] : 'bg-white/5'} hover:scale-125`}
                            title={day.date.toDateString()}
                          ></div>
                      ))}
                  </div>
              ))}
          </div>
      </div>
      
      {/* Correlation Insights */}
      {insights.top && (
          <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-card p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-green-400">
                      <SparklesIcon className="w-4 h-4"/>
                      <span className="text-xs font-bold uppercase">Mood Booster</span>
                  </div>
                  <p className="text-sm text-dun">You tend to feel better when tagging:</p>
                  <p className="text-lg font-bold text-isabelline mt-1 flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-accent"/> #{insights.top.tag}
                  </p>
                  <span className="text-xs text-dun/50">Avg Mood: {insights.top.avg.toFixed(1)}/5</span>
              </div>
              
              {insights.low && insights.low.avg < 3 && (
                  <div className="bg-card p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-accent">
                          <span className="text-xs font-bold uppercase">Pattern Spot</span>
                      </div>
                      <p className="text-sm text-dun">Lower moods are often correlated with:</p>
                      <p className="text-lg font-bold text-isabelline mt-1 flex items-center gap-2">
                          <TagIcon className="w-4 h-4 text-dun"/> #{insights.low.tag}
                      </p>
                      <span className="text-xs text-dun/50">Avg Mood: {insights.low.avg.toFixed(1)}/5</span>
                  </div>
              )}
          </div>
      )}

      <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex justify-center gap-4">
              {[1,2,3,4,5].map(m => (
                  <div key={m} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-sm ${moodColors[m]}`}></div>
                  </div>
              ))}
          </div>

          <button 
            onClick={handleGeneratePlaylist} 
            disabled={isGenerating}
            className="w-full max-w-sm py-3 bg-card border border-accent/30 text-accent font-bold rounded-xl hover:bg-accent/10 transition-colors flex items-center justify-center gap-2"
          >
              {isGenerating ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
              Generate Mood Playlist
          </button>
      </div>
    </div>
  );
};

export default MoodMapScreen;
