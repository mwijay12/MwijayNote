
export const markdownToHtml = (text: string): string => {
    if (!text) return '';

    // Convert markdown to a basic HTML structure
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/^\s*[\-\*] (.*)/gm, '<li>$1</li>')
        .replace(/^\s*\d+\. (.*)/gm, '<li>$1</li>');
        
    // Wrap list items in <ul> or <ol>
    html = html.replace(/((<li>.*<\/li>\s*)+)/g, (match) => {
        if (match.includes('1.')) { 
            return `<ol>${match.replace(/^\s*\d+\. /gm, '')}</ol>`;
        }
        return `<ul>${match}</ul>`;
    });

    return html.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return ''; 
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li') || trimmed.startsWith('<p')) {
            return trimmed;
        }
        return `<p>${trimmed}</p>`;
    }).join('');
};

export const cleanAiResponse = (text: string): string => {
    if (!text) return "";
    // Remove bold/header markers but keep the text content
    return text
        .replace(/\*\*/g, "")   // Remove bold **
        .replace(/##/g, "")     // Remove header ##
        .replace(/__/g, "")     // Remove italic __
        .replace(/\{.*?\}/g, "") // Remove JSON like objects if leaked
        .trim();
};
