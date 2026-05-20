
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, NewspaperIcon, RefreshCwIcon, XIcon, SparklesIcon, FeatherIcon, GlobeIcon, SearchIcon, FilterIcon } from './Icons';
import { NewsArticle, JournalTopic } from '../types';
import { getNewsFeed, summarizeUrlContent } from '../services/geminiService';
import { useJournal } from '../hooks/useJournal';

interface NewsScreenProps {
  onBack: () => void;
}

// ── RSS Sources ───────────────────────────────────────────────────────────────

const RSS_FEEDS = [
    { label: 'Tech Africa', url: 'https://techafricanews.com/feed/', category: 'Africa' },
    { label: 'AllAfrica', url: 'https://allafrica.com/tools/headlines/rdf/africa/headlines.rdf', category: 'Africa' },
    { label: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
    { label: 'BBC Africa', url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', category: 'Africa' },
    { label: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
    { label: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
];

const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

const fetchRssFeed = async (feedUrl: string, sourceName: string): Promise<NewsArticle[]> => {
    try {
        const res = await fetch(`${RSS_TO_JSON_API}${encodeURIComponent(feedUrl)}&count=8`);
        if (!res.ok) return [];
        const data = await res.json();
        if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
        return data.items.slice(0, 8).map((item: any) => ({
            title: item.title || 'No title',
            url: item.link || '#',
            snippet: item.description
                ? item.description.replace(/<[^>]+>/g, '').substring(0, 200)
                : item.content?.replace(/<[^>]+>/g, '').substring(0, 200) || 'No description.',
            source: sourceName,
        }));
    } catch {
        return [];
    }
};

// ── Article Preview Modal ─────────────────────────────────────────────────────

const ArticlePreviewModal: React.FC<{ article: NewsArticle; onClose: () => void; onSave: (article: NewsArticle) => void; }> = ({ article, onClose, onSave }) => {
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleSummarize = async () => {
        setIsSummarizing(true);
        const result = await summarizeUrlContent(article.url);
        setSummary(result);
        setIsSummarizing(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] text-accent font-bold uppercase bg-accent/10 px-2 py-1 rounded">{article.source}</span>
                            <h2 className="text-xl font-serif text-isabelline mt-2">{article.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 -mt-2 hover:bg-white/10 rounded-full"><XIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    <p className="text-sm text-dun italic">{article.snippet}</p>
                    {isSummarizing ? (
                        <div className="text-center text-dun py-4"><SparklesIcon className="w-6 h-6 mx-auto animate-pulse text-accent"/></div>
                    ) : summary ? (
                        <div className="bg-card/40 p-4 rounded-xl border border-border-subtle">
                            <h4 className="text-xs font-bold text-accent uppercase mb-2">AI Summary</h4>
                            <p className="text-sm text-isabelline/90 whitespace-pre-wrap">{summary}</p>
                        </div>
                    ) : (
                        <button onClick={handleSummarize} className="w-full py-2 bg-card border border-border-subtle rounded-lg text-sm font-bold text-accent hover:bg-accent/10 flex items-center justify-center gap-2">
                            <SparklesIcon className="w-4 h-4"/> Get AI Summary
                        </button>
                    )}
                </div>
                <div className="p-4 border-t border-white/10 flex gap-4">
                    <button onClick={() => onSave(article)} className="flex-1 py-3 text-sm font-bold bg-card border border-border-subtle rounded-xl hover:bg-white/10 flex items-center justify-center gap-2">
                        <FeatherIcon className="w-4 h-4"/> Save Note
                    </button>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 text-sm font-bold bg-accent text-cafe rounded-xl hover:opacity-90 flex items-center justify-center gap-2 text-center">
                        Read Full Story <GlobeIcon className="w-4 h-4"/>
                    </a>
                </div>
            </div>
        </div>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Africa', 'Tech', 'AI'];

const NewsScreen: React.FC<NewsScreenProps> = ({ onBack }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadingSource, setLoadingSource] = useState('');
  
  const { addJournal } = useJournal();

  const fetchNews = async () => {
    setIsLoading(true);
    setArticles([]);
    const all: NewsArticle[] = [];

    // Fetch AI-generated news first (fast)
    try {
        const aiArticles = await getNewsFeed();
        if (Array.isArray(aiArticles) && aiArticles.length > 0) {
            const tagged = aiArticles.map((a: NewsArticle) => ({ ...a, source: a.source || 'AI-Generated' }));
            all.push(...tagged);
            setArticles([...all]);
        }
    } catch {}

    // Fetch RSS feeds in parallel
    const feedsToFetch = activeCategory === 'All'
        ? RSS_FEEDS
        : RSS_FEEDS.filter(f => f.category === activeCategory);

    await Promise.allSettled(feedsToFetch.map(async (feed) => {
        setLoadingSource(feed.label);
        const items = await fetchRssFeed(feed.url, feed.label);
        if (items.length > 0) {
            all.push(...items);
            // Deduplicate by title
            const seen = new Set<string>();
            const deduped = all.filter(a => {
                if (seen.has(a.title)) return false;
                seen.add(a.title);
                return true;
            });
            setArticles([...deduped]);
        }
    }));

    setLoadingSource('');
    setIsLoading(false);
  };

  useEffect(() => { fetchNews(); }, [activeCategory]);

  const handleSaveArticle = (article: NewsArticle) => {
      addJournal({
          title: `News: ${article.title}`,
          content: `<p><strong>Source: ${article.source}</strong></p><p><a href="${article.url}">Read Original</a></p><hr/><p>${article.snippet}</p>`,
          type: 'Engineering Log',
          topic: JournalTopic.ENGINEERING,
          date: new Date().toISOString(),
          tags: ['News', 'Tech']
      });
      alert("Article saved to your journal!");
  };

  const filteredArticles = Array.isArray(articles) ? articles.filter(a => {
      const matchSearch = !search || 
          a.title.toLowerCase().includes(search.toLowerCase()) || 
          a.snippet.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || a.source === activeCategory ||
          (activeCategory === 'Tech' && ['TechCrunch', 'The Verge', 'Hacker News', 'AI-Generated'].includes(a.source)) ||
          (activeCategory === 'Africa' && ['Tech Africa', 'AllAfrica', 'BBC Africa'].includes(a.source)) ||
          (activeCategory === 'AI' && a.source === 'AI-Generated');
      return matchSearch && matchCat;
  }) : [];

  return (
    <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary relative">
      {selectedArticle && <ArticlePreviewModal article={selectedArticle} onClose={() => setSelectedArticle(null)} onSave={handleSaveArticle} />}

      <header className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
            <div className="ml-4">
                <h2 className="text-xl font-brand text-isabelline tracking-wider">News Hub</h2>
                <p className="text-[10px] text-dun/50 font-bold uppercase tracking-widest">
                    {isLoading ? `Loading ${loadingSource || '...'}` : `${filteredArticles.length} stories`}
                </p>
            </div>
        </div>
        <button onClick={fetchNews} className="p-2 hover:bg-white/10 rounded-full"><RefreshCwIcon className={`w-5 h-5 ${isLoading?'animate-spin':''}`}/></button>
      </header>

      {/* Search */}
      <div className="relative mb-3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dun"/>
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search across all sources..."
            className="w-full bg-card rounded-xl pl-10 pr-4 py-2 text-sm text-isabelline outline-none focus:ring-1 focus:ring-amber"
          />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-accent text-cafe' : 'bg-card text-dun border border-white/5 hover:border-accent/20'}`}>
                  {cat}
              </button>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[9px] text-dun/40 font-bold whitespace-nowrap">
              <GlobeIcon className="w-3 h-3"/>
              {RSS_FEEDS.length + 1} sources
          </div>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-4 pb-32 no-scrollbar">
        {isLoading && articles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-dun">
                <SparklesIcon className="w-8 h-8 text-accent animate-pulse"/>
                <p>Pulling from {RSS_FEEDS.length + 1} news sources...</p>
            </div>
        )}

        {filteredArticles.length === 0 && !isLoading && (
            <div className="text-center text-dun py-10">
                <p>No news found for this category.</p>
                <button onClick={fetchNews} className="mt-4 text-accent hover:underline">Retry</button>
            </div>
        )}
        
        {/* Featured / Breaking */}
        {!search && filteredArticles.length > 0 && (
            <div className="bg-gradient-to-r from-amber/20 to-orange-500/20 p-5 rounded-2xl border border-accent/30 relative overflow-hidden mb-6 shadow-lg cursor-pointer hover:border-accent/50" onClick={() => setSelectedArticle(filteredArticles[0])}>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase rounded animate-pulse">Breaking</div>
                <span className="text-[10px] text-accent/70 font-bold uppercase">{filteredArticles[0].source}</span>
                <h3 className="font-serif text-xl font-bold text-isabelline mt-1">{filteredArticles[0].title}</h3>
                <p className="text-sm text-dun mt-2 line-clamp-2">{filteredArticles[0].snippet}</p>
                <div className="mt-3">
                    <span className="text-xs text-accent font-bold hover:underline">READ MORE →</span>
                </div>
            </div>
        )}
        
        {filteredArticles.slice(search ? 0 : 1).map((article, index) => (
            <button key={index} onClick={() => setSelectedArticle(article)} className="w-full text-left bg-card p-5 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors animate-slide-in-from-bottom" style={{animationDelay: `${index * 60}ms`}}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-accent font-bold uppercase bg-accent/10 px-2 py-1 rounded">{article.source}</span>
                    <GlobeIcon className="w-4 h-4 text-dun"/>
                </div>
                <h3 className="font-bold text-isabelline text-sm leading-tight mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-xs text-dun leading-relaxed line-clamp-2">{article.snippet}</p>
            </button>
        ))}

        {isLoading && articles.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-4 text-dun text-xs">
                <RefreshCwIcon className="w-3 h-3 animate-spin text-accent"/>
                Loading {loadingSource}...
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsScreen;
