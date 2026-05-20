
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Expense, UserData } from '../types';
import { ArrowLeftIcon, DownloadIcon, PaperclipIcon, XIcon, FilePdfIcon, CsvFileIcon } from './Icons';
import { exportTransactionsAsCsv, saveFile } from '../utils/exportUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExpensesListProps {
  expenses: Expense[];
  onBack: () => void;
  userData: UserData | null;
}

type FilterType = 'week' | 'month' | 'year' | 'all' | 'custom';

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, onBack, userData }) => {
    const [filter, setFilter] = useState<FilterType>('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const container = scrollableContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const currentScrollY = container.scrollTop;
            
            if (Math.abs(currentScrollY - lastScrollY.current) < 20) return;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                if (isFooterVisible) setIsFooterVisible(false);
            } else {
                if (!isFooterVisible) setIsFooterVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isFooterVisible]);

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        if (filter === 'custom') {
            if (!startDate || !endDate) return [];
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return expenses.filter(e => {
                const eDate = new Date(e.date);
                return eDate >= start && eDate <= end;
            });
        }

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() + 6) % 7);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        switch (filter) {
            case 'week': return expenses.filter(e => new Date(e.date) >= startOfWeek);
            case 'month': return expenses.filter(e => new Date(e.date) >= startOfMonth);
            case 'year': return expenses.filter(e => new Date(e.date) >= startOfYear);
            default: return expenses;
        }
    }, [expenses, filter, startDate, endDate]);

    const { totalIncome, totalExpense, net } = useMemo(() => {
        const income = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
        const expense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        return { totalIncome: income, totalExpense: expense, net: income - expense };
    }, [filteredExpenses]);
    
    const getFilterTitle = () => {
        switch (filter) {
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            case 'all': return 'All Time';
            case 'custom':
                if (startDate && endDate) {
                    const start = new Date(startDate).toLocaleDateString();
                    const end = new Date(endDate).toLocaleDateString();
                    return `${start} - ${end}`;
                }
                return 'Custom Range';
            default: return '';
        }
    };

    const generateReportHTML = () => {
        const filterTitle = getFilterTitle();
        const logoSvg = `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FFBC2D" />
                    <stop offset="100%" stop-color="#BEBAAC" />
                </linearGradient>
            </defs>
            <path fill="url(#logoGrad)" d="M50 0L61.8 24.4L88.2 29.2L69.1 47.6L73.6 74L50 61.2L26.4 74L30.9 47.6L11.8 29.2L38.2 24.4L50 0Z" />
            <path fill="#302F2B" d="M50 15L57.5 34.5L78.5 37.8L63.2 52.4L66.7 72L50 62.5L33.3 72L36.8 52.4L21.5 37.8L42.5 34.5L50 15Z" />
            <circle cx="50" cy="50" r="12" fill="url(#logoGrad)" />
        </svg>`;
        const logoBase64 = userData?.customLogo || `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(logoSvg)))}`;
    
        return `
            <div style="font-family: Arial, sans-serif; color: #333; margin: 0 auto; padding: 40px; width: 210mm; box-sizing: border-box; background-color: #f7f7f7;">
                <table style="width: 100%; border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px;">
                    <tr>
                        <td style="width: 64px;">
                            <img src="${logoBase64}" alt="Logo" style="width: 64px; height: 64px; object-fit: contain;">
                        </td>
                        <td style="text-align: right;">
                            <h1 style="margin: 0; color: #111; font-size: 28px; font-weight: bold;">Mwijay Note</h1>
                            <p style="margin: 5px 0 0; color: #555; font-size: 14px;">Transaction Report${userData?.name ? ` for ${userData.name}` : ''}</p>
                        </td>
                    </tr>
                </table>
                
                <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 20px; margin-bottom: 20px;">Summary for: ${filterTitle}</h2>
                
                <table style="width: 100%; margin-bottom: 30px; font-size: 14px; border-spacing: 10px; border-collapse: separate;">
                    <tr>
                        <td style="padding: 15px; background-color: #e8f5e9; border-radius: 8px; text-align: center; width: 33%;">
                            <p style="margin: 0; font-size: 12px; color: #388e3c;">Total Income</p>
                            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #388e3c;">TSh ${totalIncome.toLocaleString()}</p>
                        </td>
                        <td style="padding: 15px; background-color: #fff3e0; border-radius: 8px; text-align: center; width: 33%;">
                            <p style="margin: 0; font-size: 12px; color: #f57c00;">Total Expense</p>
                            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #f57c00;">TSh ${totalExpense.toLocaleString()}</p>
                        </td>
                        <td style="padding: 15px; background-color: #e3f2fd; border-radius: 8px; text-align: center; width: 33%;">
                            <p style="margin: 0; font-size: 12px; color: #1976d2;">Net Balance</p>
                            <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: ${net >= 0 ? '#1976d2' : '#d32f2f'};">TSh ${net.toLocaleString()}</p>
                        </td>
                    </tr>
                </table>
    
                <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 20px; margin-bottom: 20px;">All Transactions</h2>
    
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <thead style="background-color: #424242; color: #fff;">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Date</th>
                            <th style="padding: 12px; text-align: left;">Name</th>
                            <th style="padding: 12px; text-align: left;">Category</th>
                            <th style="padding: 12px; text-align: left;">Type</th>
                            <th style="padding: 12px; text-align: right;">Amount (TSh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredExpenses.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 20px; border: 1px solid #ddd;">No transactions for this period.</td></tr>` : 
                        filteredExpenses.map((e, index) => `
                            <tr style="background-color: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};">
                                <td style="border-bottom: 1px solid #ddd; padding: 10px;">${new Date(e.date).toLocaleDateString()}</td>
                                <td style="border-bottom: 1px solid #ddd; padding: 10px;">${e.name}</td>
                                <td style="border-bottom: 1px solid #ddd; padding: 10px;">${e.category || ''}</td>
                                <td style="border-bottom: 1px solid #ddd; padding: 10px; text-transform: capitalize;">${e.type}</td>
                                <td style="border-bottom: 1px solid #ddd; padding: 10px; font-weight: bold; text-align: right; color: ${e.type === 'income' ? '#28a745' : '#d32f2f'};">${e.type === 'income' ? '+' : '-'}${e.amount.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #999;">
                    <p>Report generated by Mwijay Note on ${new Date().toLocaleString()}</p>
                </div>
            </div>`;
    };
    
    const handleExportAsPdf = async () => {
        setExportModalOpen(false);
        const reportHtml = generateReportHTML();
        const reportContainer = document.createElement('div');
        reportContainer.style.position = 'absolute';
        reportContainer.style.left = '-2999px';
        reportContainer.innerHTML = reportHtml;
        document.body.appendChild(reportContainer);
    
        try {
            const canvas = await html2canvas(reportContainer.firstElementChild as HTMLElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const pdfHeight = pdfWidth / ratio;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Use unified saveFile for robust mobile support
            saveFile(pdf.output('blob'), `transactions_${filter}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            document.body.removeChild(reportContainer);
        }
    };

    const handleExportAsCsv = () => {
        setExportModalOpen(false);
        exportTransactionsAsCsv(`transactions_${filter}`, filteredExpenses);
    };


    return (
        <div className="flex flex-col h-full animate-fade-in bg-jet relative overflow-hidden">
             {isExportModalOpen && (
                 <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setExportModalOpen(false)}>
                    <div className="bg-card w-full max-w-sm p-6 rounded-2xl animate-pop-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Choose Export Format</h3>
                        <div className="space-y-3">
                            <button onClick={handleExportAsPdf} className="w-full text-left p-3 bg-jet rounded-lg hover:bg-white/10 flex items-center gap-3"><FilePdfIcon className="w-5 h-5 text-accent"/> Export as PDF</button>
                            <button onClick={handleExportAsCsv} className="w-full text-left p-3 bg-jet rounded-lg hover:bg-white/10 flex items-center gap-3"><CsvFileIcon className="w-5 h-5 text-accent"/> Export as Excel (CSV)</button>
                        </div>
                         <button onClick={() => setExportModalOpen(false)} className="w-full mt-4 py-2.5 bg-card/50 rounded-full font-semibold text-sm hover:bg-white/10">Cancel</button>
                    </div>
                 </div>
             )}
             <div className="px-4 pt-16 shrink-0">
                <header className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <h2 className="text-xl font-serif">My Transactions</h2>
                    <div className="w-10"></div>
                </header>
                <div className="flex justify-center gap-1 mb-4 p-1 bg-card rounded-full flex-wrap">
                    {(['week', 'month', 'year', 'all', 'custom'] as FilterType[]).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full capitalize flex-grow ${filter === f ? 'bg-accent text-cafe' : 'text-dun'}`}>
                            {f === 'week' ? 'This Week' : f}
                        </button>
                    ))}
                </div>
                {filter === 'custom' && (
                    <div className="flex gap-2 items-center justify-center mb-4 p-2 bg-card/50 rounded-lg">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-jet text-isabelline border-dun/50 rounded-md p-1.5 text-sm w-full focus:ring-amber focus:border-accent"/>
                        <span className="text-dun">to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-jet text-isabelline border-dun/50 rounded-md p-1.5 text-sm w-full focus:ring-amber focus:border-accent"/>
                    </div>
                )}
            </div>

            <div ref={scrollableContainerRef} className="flex-grow overflow-y-auto space-y-2 px-4 pb-40">
                {filteredExpenses.length === 0 ? (
                    <div className="text-center pt-20"><p className="text-dun">No transactions recorded for this period.</p></div>
                ) : (
                    filteredExpenses.map((expense, index) => (
                        <div key={expense.id} className="flex justify-between items-center p-3 bg-card/50 rounded-lg animate-stagger-in" style={{ animationDelay: `${index * 50}ms`}}>
                            <div>
                                <p className="font-semibold text-isabelline flex items-center gap-2">
                                    {expense.name}
                                    {expense.files && expense.files.length > 0 && <PaperclipIcon className="w-4 h-4 text-dun" />}
                                </p>
                                <p className="text-xs text-dun">{new Date(expense.date).toLocaleDateString()} &bull; {expense.category || 'General'}</p>
                            </div>
                            <p className={`font-semibold text-lg ${expense.type === 'income' ? 'text-green-400' : 'text-accent'}`}>
                                {expense.type === 'income' ? '+' : '-'}TSh {expense.amount.toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
            
            <footer className={`absolute bottom-24 left-0 right-0 p-4 bg-jet/80 backdrop-blur-sm border-t border-white/10 space-y-3 transform transition-transform duration-300 ease-in-out ${isFooterVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                 <div className="text-sm space-y-1">
                    <div className="flex justify-between items-center"><span className="font-semibold text-dun">Total Income:</span><span className="font-bold text-green-400">+TSh {totalIncome.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="font-semibold text-dun">Total Expense:</span><span className="font-bold text-accent">-TSh {totalExpense.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-base pt-2 mt-1 border-t border-white/10"><span className="font-semibold text-isabelline">Net Balance:</span><span className="font-bold text-isabelline">TSh {net.toLocaleString()}</span></div>
                 </div>
                 <button onClick={() => setExportModalOpen(true)} className="w-full text-center py-3 text-sm font-semibold rounded-full bg-card hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <DownloadIcon className="w-4 h-4" /> Export Report
                 </button>
            </footer>
        </div>
    );
};

export default ExpensesList;
