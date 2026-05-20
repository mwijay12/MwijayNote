
import React, { useState } from 'react';
import { ArrowLeftIcon, CodeIcon, PlusIcon, TrashIcon, LayoutIcon, ShareIcon } from './Icons';

interface Column {
    id: string;
    name: string;
    type: string;
    isPk: boolean;
    isFk: boolean;
}

interface Table {
    id: string;
    name: string;
    columns: Column[];
}

const ErdDesignerScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [tables, setTables] = useState<Table[]>([
        { 
            id: '1', 
            name: 'Users', 
            columns: [
                { id: 'c1', name: 'id', type: 'INT', isPk: true, isFk: false },
                { id: 'c2', name: 'username', type: 'VARCHAR(50)', isPk: false, isFk: false }
            ] 
        }
    ]);
    const [showSql, setShowSql] = useState(false);

    const addTable = () => {
        const id = Date.now().toString();
        setTables([...tables, { id, name: 'New_Table', columns: [{ id: id+'c', name: 'id', type: 'INT', isPk: true, isFk: false }] }]);
    };

    const deleteTable = (id: string) => {
        setTables(tables.filter(t => t.id !== id));
    };

    const updateTableName = (id: string, name: string) => {
        setTables(tables.map(t => t.id === id ? { ...t, name } : t));
    };

    const addColumn = (tableId: string) => {
        setTables(tables.map(t => {
            if (t.id !== tableId) return t;
            return {
                ...t,
                columns: [...t.columns, { id: Date.now().toString(), name: 'col', type: 'VARCHAR(255)', isPk: false, isFk: false }]
            };
        }));
    };

    const updateColumn = (tableId: string, colId: string, field: keyof Column, value: any) => {
        setTables(tables.map(t => {
            if (t.id !== tableId) return t;
            return {
                ...t,
                columns: t.columns.map(c => c.id === colId ? { ...c, [field]: value } : c)
            };
        }));
    };

    const deleteColumn = (tableId: string, colId: string) => {
        setTables(tables.map(t => {
            if (t.id !== tableId) return t;
            return { ...t, columns: t.columns.filter(c => c.id !== colId) };
        }));
    };

    const generateSql = () => {
        return tables.map(t => {
            const cols = t.columns.map(c => {
                let def = `  ${c.name} ${c.type}`;
                if (c.isPk) def += ' PRIMARY KEY';
                return def;
            }).join(',\n');
            return `CREATE TABLE ${t.name} (\n${cols}\n);`;
        }).join('\n\n');
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary p-4 pt-16 animate-fade-in">
            {showSql && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowSql(false)}>
                    <div className="bg-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-mono text-green-400 font-bold">Generated SQL</h3>
                            <button onClick={() => { navigator.clipboard.writeText(generateSql()); alert("Copied!"); }} className="text-xs flex items-center gap-1 text-dun hover:text-white">
                                <ShareIcon className="w-4 h-4"/> Copy
                            </button>
                        </div>
                        <pre className="bg-black p-4 rounded-xl text-xs text-green-300 font-mono overflow-auto max-h-[60vh]">{generateSql()}</pre>
                        <button onClick={() => setShowSql(false)} className="w-full mt-4 py-3 bg-bg-primary rounded-xl font-bold text-sm text-dun">Close</button>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6"/></button>
                    <h2 className="text-xl font-serif ml-4 flex items-center gap-2"><LayoutIcon className="w-6 h-6 text-blue-400"/> Database Architect</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={addTable} className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 shadow-lg"><PlusIcon className="w-5 h-5"/></button>
                    <button onClick={() => setShowSql(true)} className="p-2 bg-bg-primary border border-white/10 rounded-full text-green-400 hover:bg-white/5"><CodeIcon className="w-5 h-5"/></button>
                </div>
            </header>

            <div className="flex-grow overflow-auto pb-20 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                    {tables.map(table => (
                        <div key={table.id} className="bg-card border border-white/10 rounded-xl shadow-xl flex flex-col min-w-[280px]">
                            <div className="p-3 bg-blue-900/20 border-b border-white/10 rounded-t-xl flex justify-between items-center">
                                <input 
                                    value={table.name} 
                                    onChange={e => updateTableName(table.id, e.target.value)} 
                                    className="bg-transparent font-bold text-isabelline outline-none w-full focus:border-b focus:border-blue-400"
                                />
                                <button onClick={() => deleteTable(table.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                            <div className="p-3 space-y-2 flex-grow">
                                {table.columns.map(col => (
                                    <div key={col.id} className="flex gap-2 items-center group">
                                        <button 
                                            onClick={() => updateColumn(table.id, col.id, 'isPk', !col.isPk)} 
                                            className={`text-[10px] font-bold px-1 rounded ${col.isPk ? 'text-yellow-400 bg-yellow-400/10' : 'text-dun/30 hover:text-dun'}`}
                                        >
                                            PK
                                        </button>
                                        <input 
                                            value={col.name} 
                                            onChange={e => updateColumn(table.id, col.id, 'name', e.target.value)} 
                                            className="bg-transparent text-sm text-isabelline outline-none w-24 border-b border-transparent focus:border-white/20"
                                            placeholder="col_name"
                                        />
                                        <input 
                                            value={col.type} 
                                            onChange={e => updateColumn(table.id, col.id, 'type', e.target.value)} 
                                            className="bg-transparent text-xs text-blue-300 font-mono outline-none w-20 text-right border-b border-transparent focus:border-white/20"
                                            placeholder="TYPE"
                                        />
                                        <button onClick={() => deleteColumn(table.id, col.id)} className="text-dun/50 hover:text-red-400 opacity-0 group-hover:opacity-100"><TrashIcon className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addColumn(table.id)} className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs text-dun font-bold rounded-b-xl border-t border-white/5">+ Add Column</button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="fixed bottom-6 right-6 bg-bg-primary/90 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-xs text-dun shadow-lg pointer-events-none">
                {tables.length} Tables • {tables.reduce((acc, t) => acc + t.columns.length, 0)} Columns
            </div>
        </div>
    );
};

export default ErdDesignerScreen;
