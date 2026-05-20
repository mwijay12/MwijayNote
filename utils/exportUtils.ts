
import { Expense, JournalEntry, Habit, UserData } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QwZExQ4z7v7OAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEZklEQVR42u2bW0wUVxTH/3d2FhZYFhC2CAiC4iMibS0+6oOoT6YxMdGk0Zq+2KTSB9O+mDZN+qBJ05iY+GCiT6YxEo1PE60vRRO1PlJtq4iACIqyVxEszcLusjP9MGyX3ZmdmVk2C/snk8zMnOuc35177rlzZ0BFCEE2/C8j4CgQJ0AcR6QZgAhw+Y3382LL6tIcywM817I8x7a3ea7b79hum+e6/nwD3bFjx44dO3a/sWXlykpP9/2+QO83LWu/ZVsHbNs56DjuQV3XD7qu26XrepcuqD2KolYVRekSRekURekURekURkkihJSFKVPUZQeRVEUulVRlE5FUTopihJ+K77/3LlzZ86cOXO/sf/y/X7Htu2Dtm3v93zf77mu2+f7/gHP8w94ntvn+37fW26/o91+x/37993Vq1fduXPn3IULF9y5c+fcpUUX";

export const saveFile = async (blob: Blob, filename: string) => {
    let isMobile = false;
    try {
        const info = await Device.getInfo();
        isMobile = info.platform === 'android' || info.platform === 'ios';
    } catch (e) {
        // If Device plugin fails (web environment), treat as web
        isMobile = false;
    }

    if (isMobile) {
        try {
            // Convert blob → base64 string (WITHOUT the data:… prefix)
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Strip 'data:…;base64,' prefix
                    const b64 = result.includes(',') ? result.split(',')[1] : result;
                    resolve(b64);
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });

            // Write to the Documents directory
            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: Directory.Documents,
                // No Encoding – we are writing binary (base64)
            });

            // Let user save / share via native sheet
            await Share.share({
                title: filename,
                text: 'Exported from Mwijay Note',
                url: savedFile.uri,
                dialogTitle: 'Save or Share File',
            });
        } catch (e: any) {
            console.error('Mobile save failed:', e);
            // Fallback: data-URL download via anchor tag
            try {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch {
                alert(`Export failed: ${e?.message || 'Unknown error'}. Please check storage permissions.`);
            }
        }
    } else {
        // Web / desktop: standard anchor download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};


export const exportAsPdf = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) { alert('Could not find content to export.'); return; }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        const pdfOutput = pdf.output('blob');
        await saveFile(pdfOutput, `${filename}.pdf`);
    } catch (error: any) {
        console.error('PDF Export failed:', error);
        // Fallback: generate plain text PDF
        try {
            const doc = new jsPDF();
            const text = element.innerText || element.textContent || 'No content';
            const lines = doc.splitTextToSize(text, 170);
            let y = 20;
            lines.forEach((line: string) => {
                if (y > 275) { doc.addPage(); y = 20; }
                doc.text(line, 15, y);
                y += 7;
            });
            const pdfOutput = doc.output('blob');
            await saveFile(pdfOutput, `${filename}.pdf`);
        } catch (fallbackErr) {
            alert('PDF export failed. Please try the Word (.doc) export instead.');
        }
    }
};

export const exportAllNotesToPdf = async (journals: JournalEntry[], userData?: UserData | null) => {
    const doc = new jsPDF();
    let y = 20;

    // Title Page
    doc.setFontSize(22);
    doc.setTextColor(255, 188, 45); // Amber
    doc.text("Mwijay Note: Digital Archive", 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
    y += 10;

    if (userData?.name) {
        doc.text(`User: ${userData.name}`, 105, y, { align: 'center' });
        y += 20;
    }

    doc.setDrawColor(255, 188, 45);
    doc.line(20, y, 190, y);
    y += 20;

    // Content
    journals.forEach((j, index) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        // Section Title with Background
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y - 5, 180, 10, 'F');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`${index + 1}. ${j.title}`, 20, y + 2);
        y += 10;

        // Meta Info
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`${new Date(j.date).toLocaleDateString()} | Category: ${j.type} | Topic: ${j.topic}`, 20, y);
        y += 8;

        // Main Content - Simple HTML to Text with line breaks
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85); // slate-700
        
        // Better HTML stripping: replace common tags with newlines
        const cleanContent = j.content
            .replace(/<\/p>/g, '\n\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<li>/g, '• ')
            .replace(/<\/li>/g, '\n')
            .replace(/<[^>]+>/g, '');
            
        const splitText = doc.splitTextToSize(cleanContent.trim(), 170);
        
        // Handle page overflow during text drawing
        splitText.forEach((line: string) => {
            if (y > 275) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += 6;
        });
        
        y += 15; // Space between entries
    });

    const pdfOutput = doc.output('blob');
    await saveFile(pdfOutput, `Mwijay_Notes_Archive_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Fix: Added dataURLToBlob utility function to support image downloads from data URLs
export const dataURLToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

export const exportAsDoc = (filename: string, content: string, title: string, userData?: UserData | null) => {
    const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${title}</title>
            <style>
                body { font-family: 'Georgia', serif; margin: 50px; color: #1a1a1a; line-height: 1.8; }
                .letterhead { text-align: center; border-bottom: 3px solid #FFBC2D; padding-bottom: 25px; margin-bottom: 50px; }
                .letterhead h1 { font-size: 28pt; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 4px; font-weight: 900; }
                .letterhead p { color: #64748b; font-size: 11pt; margin-top: 8px; font-family: Arial, sans-serif; font-style: italic; }
                .section-title { font-size: 20pt; font-weight: bold; color: #0f172a; border-left: 6px solid #FFBC2D; padding-left: 20px; margin: 40px 0 20px 0; }
                .content-body { font-size: 12pt; text-align: justify; }
                .meta { color: #94a3b8; font-size: 10pt; margin-bottom: 10px; font-family: Arial, sans-serif; }
                .footer { margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10pt; color: #94a3b8; font-family: Arial, sans-serif; }
            </style>
        </head>
        <body>
            <div class="letterhead">
                <h1>${title}</h1>
                ${userData ? `<p>Compiled for <strong>${userData.name}</strong></p>` : ''}
                <p>Digital Archive generated by Mwijay Note | ${new Date().toLocaleDateString('en-GB', { dateStyle: 'full' })}</p>
            </div>
            <div class="content-body">
                ${content}
            </div>
            <div class="footer">
                MWIJAY NOTE SECURE EXPORT | ${new Date().getFullYear()}
            </div>
        </body>
        </html>
    `;
    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    saveFile(blob, `${filename}.doc`);
};

export const exportAsTxt = (filename: string, content: string) => {
    const text = content.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
    const blob = new Blob([text], { type: 'text/plain' });
    saveFile(blob, `${filename}.txt`);
};

export const exportTransactionsAsCsv = (filename: string, expenses: Expense[]) => {
    const header = "Date,Name,Category,Type,Amount\n";
    const rows = expenses.map(e => {
        const date = new Date(e.date).toLocaleDateString();
        const name = `"${(e.name || 'Unnamed').replace(/"/g, '""')}"`;
        const category = `"${(e.category || 'General').replace(/"/g, '""')}"`;
        const type = e.type;
        const amount = e.amount;
        return `${date},${name},${category},${type},${amount}`;
    }).join('\n');
    
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    saveFile(blob, `${filename}.csv`);
};

export const generateGeneralReportHtml = (journals: JournalEntry[], expenses: Expense[], habits: Habit[], userData?: UserData | null) => {
    const incomeTotal = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenseTotal = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

    return `
        <div id="general-report-content" style="font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; max-width: 900px; margin: 0 auto; background: #fff;">
            <div style="text-align: center; border-bottom: 3px solid #FFBC2D; padding-bottom: 25px; margin-bottom: 40px;">
                <h1 style="color: #000; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">Comprehensive Life OS Report</h1>
                ${userData ? `<p style="margin: 10px 0; font-size: 14pt; color: #444;">Portfolio: <strong>${userData.name}</strong></p>` : ''}
                <p style="color: #888; font-size: 11px; font-family: Arial;">TIMESTAMP: ${new Date().toLocaleString()}</p>
            </div>
            
            <h2 style="color: #222; border-left: 6px solid #FFBC2D; padding-left: 15px; margin-bottom: 20px; font-size: 20px;">Financial Accountability Audit</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px; border: 1px solid #eee;">
                <tr style="background: #fafafa;">
                    <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold;">Metric</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right;">Amount (TZS)</td>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">Gross Revenue</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee; color: #2e7d32; font-weight: bold; text-align: right;">${incomeTotal.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid #eee;">Total Expenditure</td>
                    <td style="padding: 15px; border-bottom: 1px solid #eee; color: #c62828; font-weight: bold; text-align: right;">${expenseTotal.toLocaleString()}</td>
                </tr>
                <tr style="background: #fffdf5;">
                    <td style="padding: 15px; border-top: 2px solid #FFBC2D; font-weight: bold; font-size: 14pt;">Net Capital</td>
                    <td style="padding: 15px; border-top: 2px solid #FFBC2D; font-weight: bold; font-size: 14pt; text-align: right;">${(incomeTotal - expenseTotal).toLocaleString()}</td>
                </tr>
            </table>
            
            <h2 style="color: #222; border-left: 6px solid #FFBC2D; padding-left: 15px; margin-bottom: 20px; font-size: 20px;">Executive Summary of Reflections</h2>
            ${journals.slice(0, 8).map(j => `
                <div style="margin-bottom: 20px; padding: 20px; background: #fff; border: 1px solid #f0f0f0; border-radius: 4px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #000;">${j.title}</h3>
                    <p style="font-size: 10px; color: #999; margin: 0 0 12px 0; font-family: Arial;">${new Date(j.date).toLocaleDateString()} | LOG TYPE: ${j.type.toUpperCase()}</p>
                    <div style="font-size: 12px; color: #333; line-height: 1.7; text-align: justify;">${j.content.replace(/<[^>]+>/g, '').substring(0, 400)}${j.content.length > 400 ? '...' : ''}</div>
                </div>
            `).join('')}
            
            <div style="margin-top: 60px; text-align: center; color: #ccc; font-size: 9px; border-top: 1px solid #eee; padding-top: 20px; font-family: Arial;">
                Mwijay Note Unified Export v3.0 | Secure Offline Database Engine
            </div>
        </div>
    `;
};

export const exportAsDocx = async (filename: string, title: string, contentHtml: string, userData?: UserData | null) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    
    const docParagraphs: Paragraph[] = [];

    // Title Block
    docParagraphs.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: 36,
                    color: "0F172A",
                    font: "Arial",
                }),
            ],
        })
    );

    if (userData?.name) {
        docParagraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: `Compiled for ${userData.name}`,
                        italics: true,
                        size: 20,
                        color: "64748B",
                        font: "Arial",
                    }),
                ],
            })
        );
    }

    docParagraphs.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
                new TextRun({
                    text: "—".repeat(40),
                    color: "FFBC2D",
                    bold: true,
                }),
            ],
        })
    );

    const children = Array.from(tempDiv.childNodes);
    children.forEach(node => {
        const text = node.textContent?.trim() || "";
        if (!text) return;

        if (node.nodeName === 'H1' || node.nodeName === 'H2') {
            docParagraphs.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 100 },
                    children: [
                        new TextRun({
                            text: text,
                            bold: true,
                            size: 26,
                            color: "0F172A",
                            font: "Arial",
                        }),
                    ],
                })
            );
        } else if (node.nodeName === 'H3' || node.nodeName === 'H4') {
            docParagraphs.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                    children: [
                        new TextRun({
                            text: text,
                            bold: true,
                            size: 20,
                            color: "334155",
                            font: "Arial",
                        }),
                    ],
                })
            );
        } else if (node.nodeName === 'BLOCKQUOTE') {
            docParagraphs.push(
                new Paragraph({
                    spacing: { before: 150, after: 150 },
                    indent: { left: 720 },
                    children: [
                        new TextRun({
                            text: text,
                            italics: true,
                            size: 22,
                            color: "475569",
                            font: "Georgia",
                        }),
                    ],
                })
            );
        } else {
            docParagraphs.push(
                new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                        new TextRun({
                            text: text,
                            size: 22, // ~11pt
                            color: "334155",
                            font: "Georgia",
                        }),
                    ],
                })
            );
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: docParagraphs,
        }],
    });

    const blob = await Packer.toBlob(doc);
    await saveFile(blob, `${filename}.docx`);
};

export const exportAsPptx = async (filename: string, title: string, contentHtml: string) => {
    const pptx = new pptxgen();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    // Slide 1: Title Slide
    let slide1 = pptx.addSlide();
    slide1.background = { fill: "1E1E2E" };
    slide1.addText(title, { x: 1, y: 2.2, w: 8, h: 1.5, fontSize: 32, bold: true, color: "FFBC2D", fontFace: "Arial", align: "center" });
    slide1.addText("Generated by Mwijay Life OS", { x: 1, y: 3.8, w: 8, h: 0.5, fontSize: 13, color: "BAC2DE", fontFace: "Arial", align: "center", italic: true });

    // Extract bullet points or paragraph lines
    const paragraphs = textContent.split('\n').map(p => p.trim()).filter(p => p.length > 25);
    
    if (paragraphs.length > 0) {
        // Build dynamic content slides
        for (let i = 0; i < paragraphs.length; i += 2) {
            let slide = pptx.addSlide();
            slide.background = { fill: "F5F5F7" };
            
            // Slide Title
            slide.addText(title, { x: 0.6, y: 0.4, w: 8.8, h: 0.6, fontSize: 20, bold: true, color: "11111B", fontFace: "Arial" });
            slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.0, w: 8.8, h: 0.03, fill: { color: "FFBC2D" } });

            const text1 = paragraphs[i];
            const text2 = paragraphs[i+1] || "";

            slide.addText(text1, { x: 0.6, y: 1.5, w: 8.8, h: 2.0, fontSize: 13, color: "334155", fontFace: "Georgia", lineSpacing: 22 });
            if (text2) {
                slide.addText(text2, { x: 0.6, y: 3.8, w: 8.8, h: 2.0, fontSize: 13, color: "334155", fontFace: "Georgia", lineSpacing: 22 });
            }
        }
    } else {
        let slide = pptx.addSlide();
        slide.addText("Empty Slide Deck", { x: 1, y: 3, w: 8, h: 1, fontSize: 16, color: "333333", align: "center" });
    }

    const blob = await pptx.write({ outputType: "blob" }) as Blob;
    await saveFile(blob, `${filename}.pptx`);
};

export const exportAsMarkdown = async (filename: string, contentHtml: string, title: string) => {
    // Basic HTML to Markdown converter
    let md = `# ${title}\n\n`;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    
    const children = Array.from(tempDiv.childNodes);
    children.forEach(node => {
        const text = node.textContent?.trim() || "";
        if (!text) return;

        if (node.nodeName === 'H1') {
            md += `# ${text}\n\n`;
        } else if (node.nodeName === 'H2') {
            md += `## ${text}\n\n`;
        } else if (node.nodeName === 'H3') {
            md += `### ${text}\n\n`;
        } else if (node.nodeName === 'BLOCKQUOTE') {
            md += `> ${text}\n\n`;
        } else if (node.nodeName === 'UL') {
            md += `* ${text}\n\n`;
        } else if (node.nodeName === 'OL') {
            md += `1. ${text}\n\n`;
        } else {
            md += `${text}\n\n`;
        }
    });

    const blob = new Blob([md.trim()], { type: 'text/markdown;charset=utf-8;' });
    await saveFile(blob, `${filename}.md`);
};
