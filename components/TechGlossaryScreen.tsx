
import React, { useState } from 'react';
import { ArrowLeftIcon, SearchIcon, BookMarkedIcon } from './Icons';

const terms = [
    { term: 'API', def: 'Application Programming Interface. Allows two applications to talk to each other.' },
    { term: 'ROI', def: 'Return on Investment. A ratio used to calculate the profitability of an investment.' },
    { term: 'SaaS', def: 'Software as a Service. Software licensed on a subscription basis and centrally hosted.' },
    { term: 'MVP', def: 'Minimum Viable Product. A product with just enough features to satisfy early customers.' },
    { term: 'SQL', def: 'Structured Query Language. Used for managing data held in a relational database.' },
    { term: 'Agile', def: 'An iterative approach to project management and software development.' },
    { term: 'GAAP', def: 'Generally Accepted Accounting Principles. Standard accounting rules.' },
    { term: 'Cloud Computing', def: 'Delivery of computing services over the Internet ("the cloud").' },
    { term: 'ERP', def: 'Enterprise Resource Planning. Software to manage day-to-day business activities.' },
    { term: 'B2B', def: 'Business-to-Business. Exchange of products/services between businesses.' },
];

const TechGlossaryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [search, setSearch] = useState('');
    const filtered = terms.filter(t => t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-bg-primary">
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                <h2 className="text-xl font-serif ml-4">Tech Glossary</h2>
            </header>
            <div className="relative mb-6">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dun"/>
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search terms..." 
                    className="w-full bg-card pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-amber"
                />
            </div>
            <div className="flex-grow overflow-y-auto space-y-3">
                {filtered.map((item, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border-l-4 border-accent hover:bg-white/5 transition-colors">
                        <h3 className="font-bold text-isabelline">{item.term}</h3>
                        <p className="text-sm text-dun mt-1">{item.def}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TechGlossaryScreen;
