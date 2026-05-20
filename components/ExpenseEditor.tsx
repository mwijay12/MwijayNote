
import React, { useState, useRef, useEffect } from 'react';
import { Expense, FileData } from '../types';
import { ArrowLeftIcon, PaperclipIcon, XIcon, FileImageIcon, FileAudioIcon, FileTextIcon, CameraIcon } from './Icons';
import { extractDetailsFromReceipt } from '../services/geminiService';

interface ExpenseEditorProps {
  expense: Partial<Expense>;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Groceries', 'Savings', 'Other'];
const incomeCategories = ['Salary', 'Investment', 'Gift', 'Freelance', 'Other'];

// Simple keyword map for auto-categorization
const categoryKeywords: Record<string, string[]> = {
    'Food': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'lunch', 'dinner', 'kfc'],
    'Transport': ['uber', 'bolt', 'taxi', 'bus', 'fuel', 'gas', 'ticket', 'train', 'flight'],
    'Groceries': ['supermarket', 'market', 'whole foods', 'walmart', 'store', 'fruit', 'veg'],
    'Bills': ['rent', 'electricity', 'water', 'internet', 'subscription', 'netflix', 'spotify'],
    'Health': ['pharmacy', 'doctor', 'hospital', 'gym', 'medicine'],
    'Shopping': ['clothes', 'shoes', 'amazon', 'ebay', 'electronics'],
    'Entertainment': ['movie', 'cinema', 'game', 'concert']
};

const FilePreview: React.FC<{ file: FileData, onRemove: () => void }> = ({ file, onRemove }) => {
    const getFileIcon = () => {
        if (file.type.startsWith('image/')) return <FileImageIcon className="w-6 h-6 text-dun" />;
        if (file.type.startsWith('audio/')) return <FileAudioIcon className="w-6 h-6 text-dun" />;
        return <FileTextIcon className="w-6 h-6 text-dun" />;
    };

    return (
        <div className="flex items-center gap-3 p-2 bg-card/50 rounded-lg">
            {getFileIcon()}
            <span className="text-sm text-isabelline truncate flex-grow">{file.name}</span>
            <button onClick={onRemove} className="p-1 text-dun hover:text-white rounded-full"><XIcon className="w-4 h-4" /></button>
        </div>
    );
};

const ExpenseEditor: React.FC<ExpenseEditorProps> = ({ expense, onSave, onCancel }) => {
  const [name, setName] = useState(expense.name || '');
  const [amount, setAmount] = useState(expense.amount?.toString() || '');
  const [date, setDate] = useState(expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>(expense.type || 'expense');
  const [category, setCategory] = useState(expense.category || '');
  const [files, setFiles] = useState<FileData[]>(expense.files || []);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Categorization Effect
  useEffect(() => {
      if (type === 'expense' && name.length > 2 && !expense.id) { // Only auto-categorize new expenses
          const lowerName = name.toLowerCase();
          for (const [cat, keywords] of Object.entries(categoryKeywords)) {
              if (keywords.some(k => lowerName.includes(k))) {
                  setCategory(cat);
                  return;
              }
          }
      }
  }, [name, type, expense.id]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (name.trim() && !isNaN(parsedAmount) && parsedAmount > 0) {
      onSave({
        name: name.trim(),
        amount: parsedAmount,
        date: new Date(date).toISOString(),
        type: type,
        category: category.trim() || (type === 'expense' ? 'General' : 'General'),
        files: files,
        goalId: expense.goalId,
      });
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(''); // Reset category when type changes
  };
  
  const currentCategoryList = type === 'expense' ? expenseCategories : incomeCategories;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                if(loadEvent.target?.result) {
                    const newFile: FileData = {
                        name: file.name,
                        type: file.type,
                        data: loadEvent.target.result as string,
                    };
                    setFiles(prev => [...prev, newFile]);
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleScanReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsScanning(true);
        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
            if (loadEvent.target?.result) {
                const newFile: FileData = {
                    name: file.name,
                    type: file.type,
                    data: loadEvent.target.result as string,
                };
                
                try {
                    const details = await extractDetailsFromReceipt(newFile) as any;
                    if (details) {
                        setName(details.vendor);
                        setAmount(details.total.toString());
                        if (details.date) {
                            setDate(details.date);
                        }
                        if (details.category) {
                            setCategory(details.category);
                        }
                    }
                    setFiles(prev => [...prev, newFile]);
                } catch (error) {
                    console.error("Receipt scan failed", error);
                } finally {
                    setIsScanning(false);
                }
            } else {
              setIsScanning(false);
            }
        };
        reader.readAsDataURL(file);
    }
  };


  return (
    <div className="flex flex-col h-full animate-slide-in-from-bottom p-4 pt-16 bg-jet">
      <header className="flex justify-between items-center mb-8">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-serif">New Transaction</h2>
        <button 
            onClick={handleSave} 
            disabled={!name.trim() || !amount.trim() || isNaN(parseFloat(amount))}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Save
        </button>
      </header>
      
       <div className="flex justify-center gap-2 mb-8 p-1 bg-card rounded-full">
            <button onClick={() => handleTypeChange('expense')} className={`px-4 py-2 text-sm font-semibold rounded-full w-full ${type === 'expense' ? 'bg-accent text-cafe' : 'text-dun'}`}>
                Expense
            </button>
            <button onClick={() => handleTypeChange('income')} className={`px-4 py-2 text-sm font-semibold rounded-full w-full ${type === 'income' ? 'bg-green-500 text-white' : 'text-dun'}`}>
                Income
            </button>
        </div>

      <div className="flex-grow flex flex-col gap-6 overflow-y-auto">
        <div>
            <label htmlFor="expense-name" className="text-sm font-medium text-dun ml-2">Name</label>
            <input
              id="expense-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Coffee, Salary"
              className="w-full bg-transparent text-2xl p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
            />
        </div>
         <div>
            <label htmlFor="expense-amount" className="text-sm font-medium text-dun ml-2">Amount</label>
            <input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-2xl p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
            />
        </div>
        <div>
            <label htmlFor="expense-date" className="text-sm font-medium text-dun ml-2">Date</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-lg p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
            />
        </div>
        <div>
            <label htmlFor="expense-category" className="text-sm font-medium text-dun ml-2">Category</label>
            <input
              id="expense-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Food, Salary"
              list="category-suggestions"
              className="w-full bg-transparent text-2xl p-2 focus:outline-none border-b-2 border-white/20 focus:border-accent transition-colors"
            />
            <datalist id="category-suggestions">
                {currentCategoryList.map(cat => <option key={cat} value={cat} />)}
            </datalist>
        </div>
        <div>
            <h3 className="text-sm font-medium text-dun ml-2 mb-2">Attachments</h3>
            <div className="space-y-2">
                {files.map((file, index) => (
                    <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                ))}
            </div>
            <button
                onClick={() => scanFileInputRef.current?.click()}
                disabled={isScanning}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors disabled:opacity-50"
            >
                {isScanning ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scanning...</span>
                    </>
                ) : (
                    <>
                        <CameraIcon className="w-5 h-5"/>
                        <span>Scan Receipt with AI</span>
                    </>
                )}
            </button>
            <input type="file" accept="image/*" ref={scanFileInputRef} onChange={handleScanReceipt} className="hidden" />

            <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-dun/50 hover:border-accent text-dun hover:text-accent transition-colors"
            >
                <PaperclipIcon className="w-5 h-5"/>
                <span>Attach File Manually</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseEditor;
