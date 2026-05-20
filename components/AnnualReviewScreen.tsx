
import React, { useState, useMemo } from 'react';
import { JournalEntry, Expense, Goal, Habit, UserData } from '../types';
import { ArrowLeftIcon, SparklesIcon, DownloadIcon } from './Icons';
import { generateAnnualReview } from '../services/geminiService';
import useGenerativeText from '../hooks/useGenerativeText';
import { saveFile } from '../utils/exportUtils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AnnualReviewScreenProps {
  journals: JournalEntry[];
  expenses: Expense[];
  goals: Goal[];
  habits: Habit[];
  userData: UserData | null;
  onBack: () => void;
}

const AnnualReviewScreen: React.FC<AnnualReviewScreenProps> = ({ journals, expenses, goals, habits, userData, onBack }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set(journals.map(j => new Date(j.date).getFullYear()));
    // FIX: Explicitly cast `a` and `b` to Number to resolve a TypeScript error where their types were not being inferred as numbers.
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [journals]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setReviewData(null);
    try {
      const data = await generateAnnualReview(selectedYear, journals, expenses, goals, habits);
      if (!data) {
        setError(`No journal entries found for ${selectedYear}.`);
      } else {
        setReviewData(data);
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    const reportElement = document.getElementById('annual-review-pdf-content');
    if (!reportElement) return;

    reportElement.style.display = 'block';

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
            doc.querySelectorAll('img').forEach(img => {
                if (img.src.startsWith('data:image')) {
                    // Already a data URL
                }
            });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      const imgHeightOnPdf = pdfWidth / ratio;
      let heightLeft = imgHeightOnPdf;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = - (imgHeightOnPdf - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
        heightLeft -= pdfHeight;
      }
      
      // Use robust saveFile
      saveFile(pdf.output('blob'), `Mwijay_Note_Annual_Review_${selectedYear}.pdf`);

    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Sorry, there was an error exporting your review as a PDF.");
    } finally {
      reportElement.style.display = 'none';
    }
  };


  const GenerativeSection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const generativeContent = useGenerativeText(content, 20);
    return (
      <div className="bg-card/50 p-4 rounded-xl">
        <h3 className="font-serif text-lg text-accent mb-2">{title}</h3>
        <p className="whitespace-pre-wrap text-sm text-dun leading-relaxed">{generativeContent}</p>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full animate-slide-in-from-right p-4 pt-16 bg-bg-primary">
        <header className="flex items-center mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 -ml-2">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-serif mx-auto">The Annual Review</h2>
          <div className="w-10"></div>
        </header>

        <div className="flex gap-2 mb-4">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="w-full bg-card p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber appearance-none"
            disabled={isLoading}
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => <option key={year} value={year}>{year}</option>)
            ) : (
              <option>{new Date().getFullYear()}</option>
            )}
          </select>
          <button onClick={handleGenerate} disabled={isLoading} className="px-5 py-2 font-semibold rounded-lg bg-accent text-cafe hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
            {isLoading ? <div className="w-5 h-5 border-2 border-cafe border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
            <span>Generate</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 pb-4">
          {isLoading && (
            <div className="text-center text-dun py-20 flex flex-col items-center">
              <SparklesIcon className="w-12 h-12 text-accent animate-pulse mb-4"/>
              <h3 className="font-semibold text-lg text-isabelline">Reflecting on your year...</h3>
              <p>This may take a moment.</p>
            </div>
          )}
          {error && <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>}
          {reviewData && (
            <div className="space-y-4 animate-fade-in">
              <GenerativeSection title="A Year in a Nutshell" content={reviewData.yearInANutshell} />
              {reviewData.photoHighlights && reviewData.photoHighlights.length > 0 && (
                <div className="bg-card/50 p-4 rounded-xl">
                    <h3 className="font-serif text-lg text-accent mb-2">Photo Highlights</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {reviewData.photoHighlights.map((photo: any, index: number) => (
                            <figure key={index}>
                                <img src={photo.src} alt={photo.caption} className="w-full aspect-square object-cover rounded-lg"/>
                                <figcaption className="text-xs text-dun italic mt-1 text-center">{photo.caption}</figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
              )}
              <GenerativeSection title="Emotional Landscape" content={reviewData.emotionalLandscape} />
              <div className="bg-card/50 p-4 rounded-xl">
                <h3 className="font-serif text-lg text-accent mb-2">Key Themes</h3>
                <div className="space-y-3">
                  {reviewData.keyThemes.map((theme: any, index: number) => (
                    <details key={index} className="bg-bg-primary/50 p-3 rounded-lg group">
                      <summary className="font-semibold text-isabelline cursor-pointer list-none flex justify-between items-center">
                        {theme.theme}
                        <div className="w-4 h-4 text-dun group-open:rotate-90 transition-transform flex-shrink-0">&#9656;</div>
                      </summary>
                      <p className="text-sm text-dun mt-2 whitespace-pre-wrap">{theme.reflection}</p>
                    </details>
                  ))}
                </div>
              </div>
              <GenerativeSection title="Financial Journey" content={reviewData.financialJourney} />
              <div className="bg-card/50 p-4 rounded-xl text-center">
                <h3 className="font-serif text-lg text-accent mb-2">Quote of the Year</h3>
                <blockquote className="text-lg italic text-isabelline font-serif">"{reviewData.quoteOfTheYear}"</blockquote>
              </div>
              <button onClick={handleExportPdf} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-card hover:opacity-90 transition-opacity">
                <DownloadIcon className="w-5 h-5 text-accent"/>
                <span className="font-semibold text-dun">Export as a Digital Book (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <div id="annual-review-pdf-content" className="annual-review-printable-area">
        {reviewData && (
            <>
                <div className="annual-review-cover">
                    <h1>My {selectedYear} Review</h1>
                    <h2>A Year of Reflection with Mwijay Note</h2>
                    <p style={{marginTop: '20px', color: '#777'}}>Generated for {userData?.name}</p>
                </div>
                <div className="annual-review-page">
                    <h2>A Year in a Nutshell</h2>
                    <p>{reviewData.yearInANutshell}</p>
                </div>
                 <div className="annual-review-page">
                    <h2>Emotional Landscape</h2>
                    <p>{reviewData.emotionalLandscape}</p>
                </div>
                {reviewData.photoHighlights && reviewData.photoHighlights.length > 0 && (
                    <div className="annual-review-page">
                        <h2>Photo Highlights</h2>
                        <div className="photo-highlights-grid">
                            {reviewData.photoHighlights.map((photo: any, index: number) => (
                                <figure key={index}>
                                    <img src={photo.src} alt={photo.caption} />
                                    <figcaption>{photo.caption}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                )}
                <div className="annual-review-page">
                    <h2>Key Themes</h2>
                    {reviewData.keyThemes.map((theme: any, index: number) => (
                        <div key={index} style={{marginBottom: '20px'}}>
                            <h3 style={{fontFamily: 'Playfair Display, serif', fontSize: '16pt'}}>{theme.theme}</h3>
                            <p>{theme.reflection}</p>
                        </div>
                    ))}
                </div>
                <div className="annual-review-page">
                    <h2>Financial Journey</h2>
                    <p>{reviewData.financialJourney}</p>
                </div>
                <div className="annual-review-page">
                    <h2>Quote of the Year</h2>
                    <blockquote>"{reviewData.quoteOfTheYear}"</blockquote>
                </div>
            </>
        )}
      </div>
    </>
  );
};

export default AnnualReviewScreen;
