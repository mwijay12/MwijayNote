import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/db';
import { ManagedFile, JournalEntry, Expense, UserData } from '../types';
import { 
    ArrowLeftIcon, DownloadIcon, XIcon, SearchIcon, UploadIcon, 
    FileTextIcon, FilePdfIcon, TrashIcon, ShareIcon, 
    GridIcon, ListIcon, SparklesIcon, CodeIcon, CheckIcon
} from './Icons';
import { saveFile, exportAsDocx, exportAsPptx, exportAsMarkdown, exportTransactionsAsCsv, exportAllNotesToPdf } from '../utils/exportUtils';
import { Device } from '@capacitor/device';
import { Share } from '@capacitor/share';

interface FileManagerScreenProps {
    onBack: () => void;
    journals: JournalEntry[];
    expenses: Expense[];
    userData: UserData | null;
}

export const FileManagerScreen: React.FC<FileManagerScreenProps> = ({ onBack, journals, expenses, userData }) => {
    const [files, setFiles] = useState<ManagedFile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'All' | 'Documents' | 'Images' | 'Audio' | 'Presentations'>('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [previewFile, setPreviewFile] = useState<ManagedFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const list = await db.getAll('files');
            // Sort by date added desc
            list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
            setFiles(list);
        } catch (e) {
            console.error('Failed to load files from IndexedDB', e);
        }
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setIsUploading(true);
        const filesArray = Array.from(e.target.files);

        for (const file of filesArray) {
            try {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                });

                const newFile: ManagedFile = {
                    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    dateAdded: new Date().toISOString(),
                    data: base64
                };

                await db.put('files', newFile);
            } catch (err) {
                console.error('File read failed', err);
            }
        }

        await loadFiles();
        setIsUploading(false);
        showNotification(`${filesArray.length} file(s) imported successfully!`);
    };

    const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this file? This cannot be undone.')) {
            await db.delete('files', id);
            await loadFiles();
            showNotification('File deleted successfully.');
        }
    };

    const handleShareFile = async (file: ManagedFile, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            let isMobile = false;
            try {
                const info = await Device.getInfo();
                isMobile = info.platform === 'android' || info.platform === 'ios';
            } catch {
                isMobile = false;
            }

            if (isMobile) {
                // Convert DataURL to Blob and download first
                const parts = file.data.split(',');
                const base64Data = parts[1];
                
                // Write to native file path
                const savedFile = await import('@capacitor/filesystem').then(fs => fs.Filesystem.writeFile({
                    path: file.name,
                    data: base64Data,
                    directory: import('@capacitor/filesystem').then(fs => fs.Directory.Documents) as any
                }));

                await Share.share({
                    title: file.name,
                    url: savedFile.uri,
                    dialogTitle: 'Share Document'
                });
            } else {
                // Browser Share or download fallback
                const response = await fetch(file.data);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showNotification('Document download triggered.');
            }
        } catch (err) {
            console.error('Share failed', err);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FilePdfIcon className="w-8 h-8 text-rose-400 shrink-0" />;
        if (type.includes('word') || type.includes('officedocument.wordprocessingml') || type.includes('msword')) {
            return <FileTextIcon className="w-8 h-8 text-blue-400 shrink-0" />;
        }
        if (type.includes('presentation') || type.includes('powerpoint') || type.includes('officedocument.presentationml')) {
            return <FileTextIcon className="w-8 h-8 text-amber shrink-0" />;
        }
        if (type.includes('image')) return <FileTextIcon className="w-8 h-8 text-emerald-400 shrink-0" />;
        if (type.includes('audio')) return <CodeIcon className="w-8 h-8 text-purple-400 shrink-0" />;
        return <FileTextIcon className="w-8 h-8 text-dun/50 shrink-0" />;
    };

    const filteredFiles = files.filter(f => {
        const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedTab === 'All') return matchesQuery;
        if (selectedTab === 'Documents') {
            return matchesQuery && (f.type.includes('pdf') || f.type.includes('word') || f.type.includes('officedocument.word') || f.type.includes('text') || f.type.includes('markdown'));
        }
        if (selectedTab === 'Images') {
            return matchesQuery && f.type.includes('image');
        }
        if (selectedTab === 'Audio') {
            return matchesQuery && f.type.includes('audio');
        }
        if (selectedTab === 'Presentations') {
            return matchesQuery && (f.type.includes('presentation') || f.type.includes('powerpoint') || f.type.includes('officedocument.presentationml'));
        }
        return matchesQuery;
    });

    // Bulk actions
    const triggerBackupNotesPdf = async () => {
        await exportAllNotesToPdf(journals, userData);
        showNotification('Notes PDF archive export triggered.');
    };

    const triggerBackupExpensesCsv = () => {
        exportTransactionsAsCsv(`Mwijay_Finance_Report_${new Date().toISOString().split('T')[0]}`, expenses);
        showNotification('Expenses CSV ledger downloaded.');
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary text-isabelline animate-fade-in overflow-hidden relative">
            {/* Ambient Background Blur */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 px-6 pt-12 pb-4 flex justify-between items-center bg-bg-primary/50 backdrop-blur-md border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2.5 rounded-xl bg-card border border-white/10 text-isabelline hover:text-accent hover:border-accent/40 transition-all">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
                            Unified File Manager <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
                        </h2>
                        <p className="text-[10px] text-dun/50 font-bold uppercase tracking-wider">Workspace Vault & Document Center</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider bg-accent text-cafe rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        <UploadIcon className="w-4 h-4" /> Import File
                    </button>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        multiple 
                        className="hidden" 
                        onChange={handleFileUpload} 
                    />
                </div>
            </header>

            {/* Main content split */}
            <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6 relative z-10 no-scrollbar pb-32">
                {/* Notification toast */}
                {notification && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 border border-emerald-500 text-white rounded-2xl shadow-2xl animate-pop-in">
                        <CheckIcon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">{notification}</span>
                    </div>
                )}

                {/* Upload Status Card */}
                {isUploading && (
                    <div className="flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl animate-pulse">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs font-bold text-accent uppercase tracking-widest">Reading & Storing Documents in DB...</p>
                    </div>
                )}

                {/* Grid of Work Backup Actions */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-dun tracking-[0.2em]">Quick Workspace Backups</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-card/40 border border-white/5 rounded-3xl flex justify-between items-center hover:border-accent/20 transition-all group">
                            <div>
                                <h4 className="text-xs font-black text-isabelline">All Notes PDF Archive</h4>
                                <p className="text-[9px] text-dun/50 font-bold mt-1">Export a single combined document of all entries</p>
                            </div>
                            <button onClick={triggerBackupNotesPdf} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-accent hover:text-cafe hover:border-accent transition-all">
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-card/40 border border-white/5 rounded-3xl flex justify-between items-center hover:border-accent/20 transition-all group">
                            <div>
                                <h4 className="text-xs font-black text-isabelline">Expenses Financial Ledger</h4>
                                <p className="text-[9px] text-dun/50 font-bold mt-1">Download complete transactional tracking spreadsheet (.csv)</p>
                            </div>
                            <button onClick={triggerBackupExpensesCsv} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-accent hover:text-cafe hover:border-accent transition-all">
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Search and Filters panel */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search input */}
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-dun/40" />
                            <input 
                                type="text" 
                                placeholder="Search workspace files by name..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-card/40 border border-white/5 rounded-2xl text-xs text-isabelline placeholder-dun/30 focus:outline-none focus:border-accent/40"
                            />
                        </div>

                        {/* Mode toggles */}
                        <div className="flex bg-card/40 rounded-2xl p-1 border border-white/5 shrink-0 self-end sm:self-auto">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-accent' : 'text-dun/50 hover:text-isabelline'}`}
                            >
                                <GridIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-accent' : 'text-dun/50 hover:text-isabelline'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Categories Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {(['All', 'Documents', 'Images', 'Audio', 'Presentations'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 transition-all ${selectedTab === tab ? 'bg-accent/15 border-accent text-accent' : 'bg-card/25 border-white/5 text-dun/50 hover:text-isabelline hover:border-white/10'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Files presentation container */}
                {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-card/20 border border-white/5 border-dashed rounded-[2rem] text-center">
                        <FileTextIcon className="w-12 h-12 text-dun/20 mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-dun/60">No Files Found</h4>
                        <p className="text-[10px] text-dun/30 mt-1 uppercase tracking-wider font-bold">Import a file or check another query tag</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredFiles.map(file => (
                            <div 
                                key={file.id}
                                onClick={() => setPreviewFile(file)}
                                className="group relative bg-card/30 border border-white/5 rounded-3xl p-4 flex flex-col items-center text-center cursor-pointer hover:bg-card/50 hover:border-white/10 transition-all select-none shadow-sm"
                            >
                                {/* format badge */}
                                <div className="absolute top-2 right-2 text-[8px] font-extrabold uppercase bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md text-dun/60">
                                    {file.name.split('.').pop() || 'file'}
                                </div>

                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                                    {getFileIcon(file.type)}
                                </div>

                                <h4 className="text-xs font-black text-isabelline w-full truncate px-1" title={file.name}>
                                    {file.name}
                                </h4>

                                <p className="text-[9px] font-bold text-dun/40 mt-1">
                                    {formatBytes(file.size)}
                                </p>

                                {/* Action bar */}
                                <div className="flex gap-1.5 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleShareFile(file, e)}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-dun hover:text-accent hover:border-accent/40 transition-all"
                                        title="Download or Share"
                                    >
                                        <ShareIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteFile(file.id, e)}
                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-dun hover:text-rose-400 hover:border-rose-400/40 transition-all"
                                        title="Delete File"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="bg-card/30 border border-white/5 rounded-3xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5 text-[9px] uppercase tracking-widest text-dun/50 font-black">
                                    <th className="p-4">Name</th>
                                    <th className="p-4 hidden sm:table-cell">Size</th>
                                    <th className="p-4 hidden md:table-cell">Date Added</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map(file => (
                                    <tr 
                                        key={file.id}
                                        onClick={() => setPreviewFile(file)}
                                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all group"
                                    >
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                {getFileIcon(file.type)}
                                            </div>
                                            <span className="font-bold text-isabelline truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell text-dun/60 font-medium">
                                            {formatBytes(file.size)}
                                        </td>
                                        <td className="p-4 hidden md:table-cell text-dun/40 font-mono">
                                            {new Date(file.dateAdded).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-1.5 justify-end">
                                                <button 
                                                    onClick={(e) => handleShareFile(file, e)}
                                                    className="p-2 rounded-lg bg-white/5 border border-white/5 text-dun hover:text-accent transition-all"
                                                >
                                                    <ShareIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDeleteFile(file.id, e)}
                                                    className="p-2 rounded-lg bg-white/5 border border-white/5 text-dun hover:text-rose-400 transition-all"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PREVIEW MODAL */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in">
                    <header className="flex justify-between items-center p-4 bg-bg-primary text-isabelline shrink-0 border-b border-white/10 pt-12">
                        <div className="flex items-center gap-3">
                            {getFileIcon(previewFile.type)}
                            <div className="min-w-0">
                                <h3 className="font-black text-xs truncate max-w-[200px] sm:max-w-md">{previewFile.name}</h3>
                                <p className="text-[9px] text-dun/50 font-bold mt-0.5">{formatBytes(previewFile.size)} &bull; {new Date(previewFile.dateAdded).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => handleShareFile(previewFile, e)}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-isabelline hover:text-accent hover:border-accent transition-all"
                                title="Download"
                            >
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setPreviewFile(null)} 
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-dun hover:text-white transition-all"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </header>
                    <div className="flex-grow w-full h-full overflow-auto flex items-center justify-center p-6 bg-jet/20">
                        {previewFile.type.startsWith('image') ? (
                            <img src={previewFile.data} alt={previewFile.name} className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl object-contain border border-white/10" />
                        ) : previewFile.type.includes('pdf') ? (
                            <iframe src={previewFile.data} className="w-full h-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-white/10" title="PDF Preview" />
                        ) : previewFile.type.includes('text') || previewFile.type.includes('markdown') ? (
                            <div className="w-full max-w-3xl p-6 bg-card border border-white/5 rounded-2xl text-xs leading-relaxed max-h-[70vh] overflow-y-auto font-mono whitespace-pre-wrap">
                                {atob(previewFile.data.split(',')[1])}
                            </div>
                        ) : (
                            <div className="text-center p-8 bg-card border border-white/5 rounded-3xl max-w-xs shadow-2xl">
                                <FileTextIcon className="w-16 h-16 text-accent mx-auto mb-4 animate-pulse" />
                                <h4 className="text-sm font-black text-isabelline uppercase tracking-wider">Preview Unavailable</h4>
                                <p className="text-[10px] text-dun/50 font-bold mt-2 uppercase tracking-wide">Download or share this document to view it on your device.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
