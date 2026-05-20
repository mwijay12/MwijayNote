
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { JournalEntry, FileData, AiSettings, UserData } from '../types';
import { ArrowLeftIcon, DownloadIcon, XIcon, FilePdfIcon, FileTextIcon, MoodIcon, SparklesIcon, Volume2Icon, StopCircleIcon, PinIcon, MoonStarIcon, CopyIcon, ShareIcon } from './Icons';
import { summarizeJournalEntry, interpretDream } from '../services/geminiService';
import { exportAsDoc, exportAsTxt, saveFile, LOGO_BASE64, exportAsDocx, exportAsPptx, exportAsMarkdown } from '../utils/exportUtils';
import useGenerativeText from '../hooks/useGenerativeText';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface JournalPreviewProps {
  journal: JournalEntry;
  onClose: () => void;
  onEdit: (journal: JournalEntry) => void;
  onUpdate: (journal: JournalEntry) => void;
  aiSettings: AiSettings;
  onNavigateToJournalByTitle: (title: string) => void;
  onSpeak: (text: string) => void;
  userData: UserData | null;
}

const PdfViewer: React.FC<{file: FileData, onClose: () => void}> = ({ file, onClose }) => (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-zoom-in">
        <header className="flex justify-between items-center p-4 bg-bg-primary text-isabelline shrink-0 border-b border-white/10">
            <span className="font-semibold truncate pr-4">{file.name}</span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 bg-white/5">
                <XIcon className="w-6 h-6" />
            </button>
        </header>
        <div className="flex-grow w-full h-full bg-white">
             <iframe src={file.data} className="w-full h-full border-none" title="PDF Viewer" />
        </div>
    </div>
);

const AiSummaryModal: React.FC<{ content: string, onClose: () => void }> = ({ content, onClose }) => {
    const displayedSummary = useGenerativeText(content);
    return (
        <div className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-card w-full max-w-md p-6 rounded-2xl animate-pop-in border border-accent/30" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-accent"><SparklesIcon className="w-5 h-5"/> AI Summary</h3>
                <p className="text-isabelline/90 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: displayedSummary.replace(/\n/g, '<br/>') }} />
                <button onClick={onClose} className="w-full mt-4 py-2.5 bg-bg-primary rounded-full font-semibold text-sm hover:bg-white/10">Close</button>
            </div>
        </div>
    );
};


const JournalPreview: React.FC<JournalPreviewProps> = ({ journal, onClose, onEdit, onUpdate, aiSettings, onNavigateToJournalByTitle, onSpeak, userData }) => {
  const [viewingPdf, setViewingPdf] = useState<FileData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const pdfFiles = journal.files?.filter(f => f.type === 'application/pdf') || [];
  
  const { wordCount, readingTime } = useMemo(() => {
    const text = new DOMParser().parseFromString(journal.content, "text/html").documentElement.textContent || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const time = Math.ceil(words / 200); // Average reading speed
    return { wordCount: words, readingTime: time };
  }, [journal.content]);

  const processedContent = useMemo(() => {
    if (!journal.content) return '';
    
    let content = journal.content;

    // Remove AI artifacts
    content = content.replace(/^```html\s*/i, '').replace(/```$/i, '');

    // Link journal titles
    content = content.replace(
        /\[\[([^\]]+)\]\]/g,
        (match, title) => `<span class="journal-link" data-title="${title.trim()}">${title}</span>`
    );

    return content;
  }, [journal.content]);

  // Safe Date Parsing
  const dateObj = useMemo(() => {
      const d = new Date(journal.date);
      return isNaN(d.getTime()) ? new Date() : d;
  }, [journal.date]);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('journal-link')) {
            const title = target.dataset.title;
            if (title) {
                onNavigateToJournalByTitle(title);
            }
        }
    };
    contentEl.addEventListener('click', handleClick);
    return () => contentEl.removeEventListener('click', handleClick);
  }, [onNavigateToJournalByTitle, processedContent]);
  
  const handleExportAsPdf = async () => {
    setExportModalOpen(false);
    
    const authorName = userData?.name || "Mwijay User";
    const logoSrc = (userData && userData.customLogo && userData.customLogo.trim().startsWith('data:image')) 
        ? userData.customLogo 
        : LOGO_BASE64;

    // Create a temporary container off-screen
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'fixed';
    pdfContainer.style.top = '-10000px';
    pdfContainer.style.left = '-10000px';
    pdfContainer.style.width = '595px'; // A4 width at 72 DPI (approx)
    pdfContainer.style.backgroundColor = '#ffffff';
    pdfContainer.style.color = '#000000';
    pdfContainer.style.zIndex = '9999';

    const contentHtml = `
        <style>
            * { box-sizing: border-box; }
            body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; background: #fff; }
            h1 { font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0; line-height: 1.2; }
            h2 { font-size: 22px; font-weight: bold; color: #333; margin: 24px 0 8px 0; padding: 6px 14px; background: #FFF8DC; border-radius: 6px; display: inline-block; }
            h3 { font-size: 17px; font-weight: bold; color: #444; margin: 18px 0 6px 0; padding: 4px 12px; background: #FFF3CD; border-radius: 4px; display: inline-block; }
            p { margin: 8px 0; line-height: 1.7; font-size: 13px; }
            blockquote {
                border-left: 5px solid #D4AF37;
                background: #FFFBEA;
                padding: 12px 18px;
                margin: 16px 0;
                border-radius: 0 8px 8px 0;
                font-style: italic;
                color: #555;
                font-size: 14px;
            }
            strong, b { font-weight: 700; color: #111; }
            em, i { font-style: italic; }
            ul { list-style: disc; padding-left: 24px; margin: 8px 0; }
            ol { list-style: decimal; padding-left: 24px; margin: 8px 0; }
            li { margin: 4px 0; line-height: 1.6; font-size: 13px; }
            a { color: #D4AF37; text-decoration: underline; }
            img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
            .pdf-header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .pdf-brand { font-family: Arial, sans-serif; color: #D4AF37; font-size: 9pt; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }
            .pdf-meta { font-size: 10pt; color: #888; margin-bottom: 28px; }
            .pdf-footer { margin-top: 50px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 8pt; color: #bbb; }
        </style>
        <div style="width: 595px; padding: 40px; background-color: #ffffff; box-sizing: border-box;">
            <div class="pdf-header">
                ${logoSrc ? `<img src="${logoSrc}" style="height: 55px; margin-bottom: 8px;" />` : ''}
                <div class="pdf-brand">Mwijay Note</div>
            </div>

            <h1>${journal.title}</h1>
            <p class="pdf-meta">${dateObj.toLocaleDateString(undefined, { dateStyle: 'full' })} &bull; By ${authorName}</p>

            <div style="font-size: 13px; line-height: 1.7;">
                ${processedContent}
            </div>

            <div class="pdf-footer">Generated by Mwijay Note &mdash; ${new Date().getFullYear()}</div>
        </div>
    `;

    pdfContainer.innerHTML = contentHtml;
    document.body.appendChild(pdfContainer);

    try {
        // Ensure images inside content load
        const images = pdfContainer.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { 
                img.onload = resolve; 
                img.onerror = resolve; // Continue even if image fails
            });
        }));

        const canvas = await html2canvas(pdfContainer, { 
            scale: 2, // Retain quality
            useCORS: true, // Crucial for external images
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfImgHeight;
        let page = 0;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfImgHeight);
        heightLeft -= pdfHeight;
        page++;

        while (heightLeft > 0) {
            pdf.addPage();
            // offset image upward by one page-height per page
            pdf.addImage(imgData, 'JPEG', 0, -(page * pdfHeight), pdfWidth, pdfImgHeight);
            heightLeft -= pdfHeight;
            page++;
        }

        saveFile(pdf.output('blob'), `${journal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 20)}.pdf`);

    } catch (err) {
        console.error('PDF Generation Error:', err);
        alert("Failed to generate PDF. If using external images, this may be due to security restrictions.");
    } finally {
        document.body.removeChild(pdfContainer);
    }
  };

  const handleExportAsDoc = () => {
    setExportModalOpen(false);
    const filename = journal.title.replace(/\s/g, '_') || 'journal_entry';
    exportAsDoc(filename, processedContent, journal.title, userData);
  };

  const handleExportAsDocx = () => {
    setExportModalOpen(false);
    const filename = journal.title.replace(/\s/g, '_') || 'journal_entry';
    exportAsDocx(filename, journal.title, processedContent, userData);
  };

  const handleExportAsPptx = () => {
    setExportModalOpen(false);
    const filename = journal.title.replace(/\s/g, '_') || 'journal_entry';
    exportAsPptx(filename, journal.title, processedContent);
  };

  const handleExportAsMarkdown = () => {
    setExportModalOpen(false);
    const filename = journal.title.replace(/\s/g, '_') || 'journal_entry';
    exportAsMarkdown(filename, processedContent, journal.title);
  };
  
  const handleExportAsTxt = () => {
    setExportModalOpen(false);
    const filename = journal.title.replace(/\s/g, '_') || 'journal_entry';
    exportAsTxt(filename, processedContent);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary(null); 
    const summaryText = await summarizeJournalEntry(journal.title, journal.content);
    setSummary(summaryText);
    setIsSummarizing(false);
    if (aiSettings.readAloud) {
        onSpeak(summaryText);
    }
  };

  const handleReadAloud = () => {
    if (!aiSettings.readAloud) {
        alert("Enable 'Read Aloud' in AI Settings first.");
        return;
    }
    const plainText = new DOMParser().parseFromString(journal.content, "text/html").documentElement.textContent || "";
    const fullTextToRead = `${journal.title}. ${plainText}`;
    onSpeak(fullTextToRead);
  };

  const handleInterpretDream = async () => {
    setIsInterpreting(true);
    setInterpretation(null);
    const result = await interpretDream(journal.content);
    setInterpretation(result);
    setIsInterpreting(false);
    if (aiSettings.readAloud) {
        onSpeak(result);
    }
  };

  const handleCopy = () => {
      const plainText = new DOMParser().parseFromString(journal.content, "text/html").documentElement.textContent || "";
      navigator.clipboard.writeText(plainText).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      });
  };


  return (
    <div className="flex flex-col h-full animate-zoom-in bg-bg-primary">
       {viewingPdf && <PdfViewer file={viewingPdf} onClose={() => setViewingPdf(null)} />}
       {summary && <AiSummaryModal content={summary} onClose={() => setSummary(null)} />}
        {interpretation && (
            <div className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setInterpretation(null)}>
                <div className="bg-card w-full max-w-md p-6 rounded-2xl animate-pop-in border border-white/10" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-accent"><MoonStarIcon className="w-5 h-5"/> Dream Interpretation</h3>
                    <p className="text-isabelline/90 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">{interpretation}</p>
                    <button onClick={() => setInterpretation(null)} className="w-full mt-4 py-2.5 bg-bg-primary rounded-full font-semibold text-sm hover:bg-white/10">Close</button>
                </div>
            </div>
        )}
        {isExportModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setExportModalOpen(false)}>
                <div className="bg-card w-full max-w-sm p-6 rounded-2xl animate-pop-in border border-white/10" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold mb-4 text-isabelline">Choose Export Format</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                        <button onClick={handleExportAsPdf} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FilePdfIcon className="w-5 h-5 text-accent"/> Export as PDF (Print)</button>
                        <button onClick={handleExportAsDocx} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FileTextIcon className="w-5 h-5 text-emerald-400"/> Export as Word Document (.docx)</button>
                        <button onClick={handleExportAsPptx} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FileTextIcon className="w-5 h-5 text-amber"/> Export as PowerPoint Slides (.pptx)</button>
                        <button onClick={handleExportAsMarkdown} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FileTextIcon className="w-5 h-5 text-purple-400"/> Export as Markdown (.md)</button>
                        <button onClick={handleExportAsDoc} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FileTextIcon className="w-5 h-5 text-dun/50"/> Export as Rich Document (.doc)</button>
                        <button onClick={handleExportAsTxt} className="w-full text-left p-3 bg-bg-primary rounded-lg hover:bg-white/10 flex items-center gap-3 text-isabelline"><FileTextIcon className="w-5 h-5 text-dun/30"/> Export as Plain Text (.txt)</button>
                    </div>
                     <button onClick={() => setExportModalOpen(false)} className="w-full mt-4 py-2.5 bg-card/50 rounded-full font-semibold text-sm text-dun hover:text-white">Cancel</button>
                </div>
            </div>
        )}
       <div className="p-4 pt-16 flex flex-col h-full">
            
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 -ml-2 text-isabelline">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center flex flex-col items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                            {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            <span className="w-1 h-1 rounded-full bg-dun"></span>
                            {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <p className="text-[10px] text-dun mt-0.5">~{readingTime} min read</p>
                    </div>

                    <button onClick={() => onUpdate({ ...journal, isPinned: !journal.isPinned })} className="p-2 rounded-full hover:bg-white/10" aria-label="Pin entry">
                        <PinIcon className={`w-5 h-5 transition-colors ${journal.isPinned ? 'text-accent' : 'text-isabelline'}`} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-card/50 backdrop-blur-md rounded-xl p-2 flex justify-between items-center border border-white/5 shadow-sm overflow-x-auto no-scrollbar">
                     <button onClick={handleReadAloud} className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-accent transition-colors shrink-0" title="Read Aloud">
                        <Volume2Icon className="w-5 h-5"/>
                    </button>
                    <button onClick={handleSummarize} disabled={isSummarizing} className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-accent transition-colors disabled:opacity-50 shrink-0" title="AI Summary">
                        {isSummarizing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    </button>
                    {journal.type === 'Lucid Dream Log' && (
                        <button onClick={handleInterpretDream} disabled={isInterpreting} className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-purple-400 transition-colors disabled:opacity-50 shrink-0" title="Interpret Dream">
                            {isInterpreting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <MoonStarIcon className="w-5 h-5" />}
                        </button>
                    )}
                    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-green-400 transition-colors shrink-0" title="Copy Text">
                        {isCopied ? <span className="text-xs font-bold text-green-400">Copied!</span> : <CopyIcon className="w-5 h-5" />}
                    </button>
                    {/* Native Share button */}
                    <button
                        onClick={async () => {
                            const plainText = new DOMParser().parseFromString(journal.content, 'text/html').documentElement.textContent || '';
                            const shareData = {
                                title: journal.title,
                                text: `${journal.title}\n\n${plainText.substring(0, 300)}${plainText.length > 300 ? '...' : ''}\n\n— via Mwijay Note`,
                                url: window.location.href,
                            };
                            try {
                                if (navigator.share) {
                                    await navigator.share(shareData);
                                } else {
                                    await navigator.clipboard.writeText(`${shareData.title}\n\n${plainText}`);
                                    alert('Copied to clipboard! Paste to share.');
                                }
                            } catch (e) { /* user cancelled */ }
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-rose-400 transition-colors shrink-0"
                        title="Share"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setExportModalOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-isabelline hover:text-blue-400 transition-colors shrink-0" title="Export">
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onEdit(journal)} className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg bg-accent text-cafe hover:opacity-90 transition-opacity shrink-0 ml-2">
                        Edit
                    </button>
                </div>
            </div>

            <div className={`flex-grow overflow-y-auto printable-area journal-preview-content ${journal.background ? `journal-bg-${journal.background}` : ''} relative`}>
                <div className="min-h-full pb-20">
                    <div className="flex items-center gap-2 mb-4">
                        {journal.mood && <MoodIcon mood={journal.mood} className="w-6 h-6 text-accent" />}
                        <span className="text-xs font-bold text-dun uppercase border border-white/10 px-2 py-1 rounded">{journal.type}</span>
                    </div>
                    
                    <h1 className="text-3xl sm:text-4xl font-serif mb-6 leading-tight text-isabelline">{journal.title}</h1>
                    
                    <div 
                        ref={contentRef}
                        className="prose prose-p:text-isabelline/90 prose-headings:text-isabelline prose-strong:text-isabelline prose-a:text-accent font-sans editor-content text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: processedContent }} 
                    />
                    

                    {/* Media Gallery */}
                    {journal.files && journal.files.filter(f => f.type.startsWith('image')).length > 0 && (
                        <div className="mt-12 border-t border-white/5 pt-8">
                            <h3 className="text-sm font-black text-accent uppercase tracking-[0.2em] mb-4">Media Archive</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {journal.files.filter(f => f.type.startsWith('image')).map((file, index) => (
                                    <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-jet group relative">
                                        <img 
                                            src={file.url || file.data} 
                                            alt={file.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onClick={() => window.open(file.url || file.data, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">View Full</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {pdfFiles.length > 0 && (
                        <div className="mt-8 border-t border-white/10 pt-4">
                            <h3 className="font-semibold text-lg mb-2 text-isabelline">Attachments</h3>
                            <div className="space-y-2">
                            {pdfFiles.map((file, index) => (
                                <button key={index} onClick={() => setViewingPdf(file)} className="w-full text-left flex items-center gap-3 p-3 bg-card/50 rounded-lg hover:bg-card transition-colors border border-white/5">
                                    <FilePdfIcon className="w-6 h-6 text-accent shrink-0"/>
                                    <span className="font-medium truncate text-isabelline">{file.name}</span>
                                </button>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </div>
  );
};

export default JournalPreview;
