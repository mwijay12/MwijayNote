
import React, { useMemo } from 'react';
import { ArrowLeftIcon, RepeatIcon, TrendingUpIcon } from './Icons';
import { RecurringTransaction } from '../types';

interface SubscriptionManagerProps {
    recurringTransactions: RecurringTransaction[];
    onBack: () => void;
    onManage: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ recurringTransactions, onBack, onManage }) => {
    const subscriptions = useMemo(() => recurringTransactions.filter(t => t.type === 'expense'), [recurringTransactions]);
    
    const monthlyBurnRate = useMemo(() => {
        return subscriptions.reduce((total, sub) => {
            let monthlyCost = sub.amount;
            if (sub.frequency === 'weekly') monthlyCost *= 4.33;
            if (sub.frequency === 'daily') monthlyCost *= 30;
            if (sub.frequency === 'yearly') monthlyCost /= 12;
            return total + monthlyCost;
        }, 0);
    }, [subscriptions]);

    return (
        <div className="flex flex-col h-full animate-fade-in p-4 pt-16 bg-jet">
            <header className="flex items-center mb-8">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-serif mx-auto">Subscriptions</h2>
                <div className="w-10"></div>
            </header>

            <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 p-6 rounded-3xl border border-red-500/30 text-center mb-8">
                <p className="text-sm text-red-200 uppercase tracking-wider font-bold mb-1">Monthly Burn Rate</p>
                <h1 className="text-4xl font-mono font-bold text-white">TSh {monthlyBurnRate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                <p className="text-xs text-dun mt-2 opacity-80">Estimated recurring costs</p>
            </div>

            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-isabelline">Active Subscriptions ({subscriptions.length})</h3>
                <button onClick={onManage} className="text-xs text-accent hover:underline">Manage All</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
                {subscriptions.length === 0 ? (
                    <div className="text-center text-dun py-10">
                        <RepeatIcon className="w-12 h-12 mx-auto mb-3 text-dun/30"/>
                        <p>No subscriptions tracked.</p>
                    </div>
                ) : (
                    subscriptions.map(sub => (
                        <div key={sub.id} className="bg-card p-4 rounded-2xl flex justify-between items-center border border-white/5">
                            <div>
                                <h4 className="font-semibold text-isabelline">{sub.name}</h4>
                                <p className="text-xs text-dun capitalize">{sub.frequency} &bull; {sub.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-isabelline">TSh {sub.amount.toLocaleString()}</p>
                                <p className="text-[10px] text-dun">per {sub.frequency.replace('ly', '')}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SubscriptionManager;
