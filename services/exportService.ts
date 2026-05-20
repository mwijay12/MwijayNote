
import { jsPDF } from 'jspdf';
import { JournalEntry } from '../types';

export const exportJournalToPdf = async (journals: JournalEntry[], title: string = "Mwijay Note Archive") => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 30;

    // Title Page
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 50, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });
    doc.text(`Total Entries: ${journals.length}`, pageWidth / 2, 70, { align: 'center' });

    journals.forEach((entry, index) => {
        doc.addPage();
        y = 30;

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(entry.title || "Untitled Entry", margin, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(new Date(entry.date).toLocaleString(), margin, y);
        y += 15;

        // Content
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        const splitContent = doc.splitTextToSize(entry.content || "", pageWidth - (margin * 2));
        
        splitContent.forEach((line: string) => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = 30;
            }
            doc.text(line, margin, y);
            y += 7;
        });

        // Mood/Topic Tags
        if (y > pageHeight - 30) {
            doc.addPage();
            y = 30;
        }
        y += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Topic: ${entry.topic} | Type: ${entry.type}`, margin, y);
    });

    doc.save(`mwijay_notes_${new Date().getTime()}.pdf`);
};

export const exportSingleEntryToPdf = async (entry: JournalEntry) => {
    await exportJournalToPdf([entry], entry.title || "Note Export");
};
