import { useState, useEffect } from 'react';

const useGenerativeText = (htmlContent: string, speed = 40): string => {
  const [displayedHtml, setDisplayedHtml] = useState('');

  useEffect(() => {
    setDisplayedHtml('');
    if (!htmlContent) return;

    const allParts: string[] = [];
    // Split by tags, keeping the tags
    htmlContent.split(/(<[^>]+>)/).forEach(part => {
      if (part.startsWith('<')) {
        allParts.push(part); // Push tag as a single part
      } else {
        // Split text content by spaces, keeping the spaces
        allParts.push(...part.split(/(\s+)/));
      }
    });

    const filteredParts = allParts.filter(Boolean); // Remove empty strings
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      if (currentIndex >= filteredParts.length) {
        clearInterval(intervalId);
        setDisplayedHtml(htmlContent); // Ensure final content is perfect
        return;
      }
      // Set the content by joining the parts up to the current index
      setDisplayedHtml(filteredParts.slice(0, currentIndex + 1).join(''));
      currentIndex++;
    }, speed);

    return () => clearInterval(intervalId);
  }, [htmlContent, speed]);

  return displayedHtml;
};
export default useGenerativeText;