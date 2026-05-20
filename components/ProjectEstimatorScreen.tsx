
import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, DollarSignIcon, PlusIcon, TrashIcon, PieChartIcon } from './Icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface CostItem {
    id: string;
    role: string;
    rate: number; // Hourly or Unit rate
    quantity: number; // Hours or Units
    type: 'Labor' | 'Infrastructure' | 'Software';
}

const ProjectEstimatorScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [items, setItems] = useState<CostItem[]>([
        { id: '1', role: 'Senior Developer', rate: 50, quantity: 160, type: 'Labor' },
        { id: '2', role: 'Cloud Server (AWS)', rate: 100, quantity: 1, type: 'Infrastructure' }
    ]);
    const [newItem, setNewItem] = useState<Partial<CostItem>>({ type: 'Labor' });

    const addItem = () => {
        if (newItem.role && newItem.rate && newItem.quantity) {
            setItems([...items, { ...newItem, id: Date.now().toString() } as CostItem]);
            setNewItem({ type: 'Labor', role: '', rate: 0, quantity: 0 });
        }
    };

    const deleteItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const totals = useMemo(() => {
        const total = items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
        const byType = { Labor: 0, Infrastructure: 0, Software: 0 };
        items.forEach(i => byType[i.type] += (i.rate * i.quantity));
        return { total, byType };
    }, [items]);

    const chartData = [
        { name: 'Labor', value: totals.byType.Labor },
        { name: 'Infra', value: totals.byType.Infrastructure },
        { name: 'Soft', value: totals.byType.Software },
    ].filter(d => d.value > 0);

    return (
        <div className="flex flex-col h-full bg-jet p-4 pt-16 animate-fade-in">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4 text-isabelline">Cost Estimator</h2>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-900/20 p-6 rounded-3xl border border-green-500/30">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">Total Estimate</p>
                    <h1 className="text-4xl font-mono font-bold text-white">${totals.total.toLocaleString()}</h1>
                    <p className="text-xs text-dun mt-2">Based on {items.length} line items</p>
                </div>
                {chartData.length > 0 && (
                    <div className="bg-card p-4 rounded-3xl border border-white/5 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{left: 0, right: 20}}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Labor' ? '#fbbf24' : entry.name === 'Infra' ? '#f472b6' : '#60a5fa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="bg-card p-4 rounded-2xl border border-white/5 mb-4">
                <div className="grid grid-cols-4 gap-2 mb-2">
                    <input placeholder="Resource Name" value={newItem.role || ''} onChange={e => setNewItem({...newItem, role: e.target.value})} className="col-span-2 bg-jet p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber"/>
                    <input type="number" placeholder="Rate ($)" value={newItem.rate || ''} onChange={e => setNewItem({...newItem, rate: parseFloat(e.target.value)})} className="bg-jet p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber"/>
                    <input type="number" placeholder="Qty" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value)})} className="bg-jet p-2 rounded text-sm outline-none focus:ring-1 focus:ring-amber"/>
                </div>
                <div className="flex gap-2">
                    <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})} className="flex-1 bg-jet p-2 rounded text-sm outline-none">
                        <option>Labor</option><option>Infrastructure</option><option>Software</option>
                    </select>
                    <button onClick={addItem} className="flex-1 bg-accent text-cafe font-bold rounded text-sm py-2 hover:opacity-90">Add Item</button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pb-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-card/50 rounded-xl border border-white/5">
                        <div>
                            <p className="font-bold text-sm text-isabelline">{item.role}</p>
                            <p className="text-xs text-dun">{item.type} • {item.quantity} x ${item.rate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-green-400">${(item.rate * item.quantity).toLocaleString()}</span>
                            <button onClick={() => deleteItem(item.id)} className="text-dun hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectEstimatorScreen;
